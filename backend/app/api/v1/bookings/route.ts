import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyAuth } from '../../../../lib/auth';
import { bookingDetailInclude, mapBookingForClient } from '../../../../lib/bookings';
import { createUserNotification } from '../../../../lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedUserId = searchParams.get('user_id');
  const requestedVendorId = searchParams.get('vendor_id');

  try {
    const authUser = await verifyAuth(request);
    const query: any = {};

    if (requestedUserId) {
      query.userId = requestedUserId;
    } else if (requestedVendorId) {
      query.vendorId = requestedVendorId;
    } else if (authUser) {
      query.userId = authUser.id;
    } else {
      return NextResponse.json({ success: true, data: [] });
    }

    const bookings = await prisma.booking.findMany({
      where: query,
      include: bookingDetailInclude,
      orderBy: { createdAt: 'desc' }
    });

    const mappedBookings = bookings.map((b: any) => mapBookingForClient(b));

    return NextResponse.json({ success: true, data: mappedBookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required to create a booking' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      vendorId: requestedVendorId,
      serviceId: requestedServiceId,
      price,
      bookingDate,
      bookingTime,
      notes,
    } = body;

    if (!requestedVendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    if (!bookingDate || !bookingTime) {
      return NextResponse.json(
        { success: false, error: 'Booking date and time are required' },
        { status: 400 }
      );
    }

    let vendor = await prisma.vendor.findUnique({
      where: { id: requestedVendorId },
      include: { business: true, user: true },
    });

    if (!vendor) {
      const business = await prisma.business.findUnique({
        where: { id: requestedVendorId },
        include: { vendor: { include: { business: true } } },
      });
      vendor = business?.vendor || null;
    }

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    const vendorId = vendor.id;
    let serviceId: string | null = requestedServiceId || null;
    if (serviceId) {
      const service = await prisma.vendorService.findUnique({ where: { id: serviceId } });
      if (!service || service.businessId !== vendor.business?.id) {
        serviceId = null;
      }
    }

    if (vendor.vacationMode || vendor.business?.vacationMode) {
      return NextResponse.json(
        { success: false, error: 'Vendor is currently on vacation or fully booked' },
        { status: 400 }
      );
    }

    // Blocked dates validation
    if (vendor.blockedDates) {
      try {
        const blockedDatesList = JSON.parse(vendor.blockedDates);
        if (Array.isArray(blockedDatesList)) {
          const isDateBlocked = blockedDatesList.some((item: any) => {
            const d = typeof item === 'string' ? item : item?.date;
            return d === bookingDate;
          });
          if (isDateBlocked) {
            return NextResponse.json(
              { success: false, error: 'The vendor is unavailable on this date (date blocked)' },
              { status: 400 }
            );
          }
        }
      } catch (e) {
        console.error('Error parsing vendor blockedDates:', e);
      }
    }

    // Blocked slots validation
    if (vendor.blockedSlots) {
      try {
        const blockedSlotsList = JSON.parse(vendor.blockedSlots);
        if (Array.isArray(blockedSlotsList)) {
          const parseMinutes = (tStr: string): number => {
            const clean = tStr.trim().toUpperCase();
            const isPm = clean.endsWith('PM');
            const isAm = clean.endsWith('AM');
            const timePart = clean.replace('AM', '').replace('PM', '').trim();
            const [h, m] = timePart.split(':').map(Number);
            let hour = h || 0;
            if (isPm && hour < 12) hour += 12;
            if (isAm && hour === 12) hour = 0;
            if (!isAm && !isPm && hour < 9) hour += 12;
            return hour * 60 + (m || 0);
          };

          const bookingMin = parseMinutes(bookingTime);
          const isSlotBlocked = blockedSlotsList.some((item: any) => {
            if (item.date !== bookingDate) return false;
            if (item.startTime && item.endTime) {
              const startMin = parseMinutes(item.startTime);
              const endMin = parseMinutes(item.endTime);
              return bookingMin >= startMin && bookingMin <= endMin;
            }
            return item.time === bookingTime || item.startTime === bookingTime;
          });

          if (isSlotBlocked) {
            return NextResponse.json(
              { success: false, error: 'The selected time slot has been blocked by the vendor' },
              { status: 400 }
            );
          }
        }
      } catch (e) {
        console.error('Error parsing vendor blockedSlots:', e);
      }
    }

    // Duplicate booking prevention: check for existing active booking at same slot
    const existingActiveBooking = await prisma.booking.findFirst({
      where: {
        userId: user.id,
        vendorId,
        bookingDate,
        bookingTime,
        status: { in: ['pending', 'accepted'] },
      },
    });

    if (existingActiveBooking) {
      return NextResponse.json(
        { success: false, error: 'Duplicate booking: You already have an active booking with this vendor at the selected slot' },
        { status: 400 }
      );
    }

    const newBooking = await prisma.booking.create({
      data: {
        userId: user.id,
        vendorId,
        serviceId: serviceId || null,
        price: Number(price) >= 0 ? Number(price) : 0,
        bookingDate,
        bookingTime,
        notes: notes || null,
        paymentMethod: 'none',
        paymentStatus: 'not_required',
        status: 'pending',
        trackingStatus: 'ordered',
        cancelUntil: new Date(Date.now() + 5 * 60 * 1000)
      },
      include: bookingDetailInclude
    });

    const mappedBooking = mapBookingForClient(newBooking, user);
    if (body.serviceName && (!newBooking.service || mappedBooking.serviceName === 'Service')) {
      mappedBooking.serviceName = body.serviceName;
      mappedBooking.serviceNameEn = body.serviceName;
      mappedBooking.serviceNameMr = body.serviceName;
    }
    if (body.vendorName && mappedBooking.vendorName === 'Vendor') {
      mappedBooking.vendorName = body.vendorName;
      mappedBooking.vendorNameEn = body.vendorName;
      mappedBooking.vendorNameMr = body.vendorName;
    }

    const serviceLabel = mappedBooking.serviceName || 'service';
    await createUserNotification({
      userId: vendor.userId,
      titleMr: 'नवीन बुकिंग विनंती',
      titleEn: 'New booking request',
      messageMr: `${user.name || 'रहिवासी'} यांनी ${serviceLabel} साठी ${bookingDate} ${bookingTime} ला विनंती केली आहे.`,
      messageEn: `${user.name || 'A resident'} requested ${serviceLabel} on ${bookingDate} at ${bookingTime}.`,
      type: 'booking',
    });

    return NextResponse.json({ success: true, data: mappedBooking }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create booking' }, { status: 500 });
  }
}
