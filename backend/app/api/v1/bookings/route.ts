import { NextResponse } from 'next/server';

import { prisma } from '../../../../lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const vendorId = searchParams.get('vendor_id');

  try {
    const query: any = {};
    if (userId) query.userId = userId;
    if (vendorId) query.vendorId = vendorId;

    const bookings = await prisma.booking.findMany({
      where: query,
      include: {
        vendor: {
          include: { business: true }
        },
        user: true,
        service: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const mappedBookings = bookings.map(b => ({
      id: b.id,
      userId: b.userId || '',
      userName: b.user?.name || 'Customer',
      userPhone: b.user?.phone || '',
      vendorId: b.vendorId,
      vendorName: b.vendor?.business?.nameMr || b.vendor?.business?.nameEn || 'Vendor',
      serviceId: b.serviceId || '',
      serviceName: b.service?.nameMr || b.service?.nameEn || 'Custom Service',
      price: b.price || 0,
      bookingDate: b.bookingDate,
      bookingTime: b.bookingTime,
      notes: b.notes || undefined,
      status: b.status,
      paymentStatus: b.paymentStatus,
      paymentMethod: b.paymentMethod,
      transactionId: b.transactionId || undefined,
      createdAt: b.createdAt.toISOString(),
      cancelUntil: b.cancelUntil?.toISOString(),
      trackingStatus: b.trackingStatus
    }));

    return NextResponse.json({ success: true, data: mappedBookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, vendorId, serviceId, price, bookingDate, bookingTime, notes, paymentMethod } = body;

    const newBooking = await prisma.booking.create({
      data: {
        userId,
        vendorId,
        serviceId,
        price: Number(price),
        bookingDate,
        bookingTime,
        notes,
        paymentMethod: paymentMethod || 'cod',
        status: 'pending',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        trackingStatus: 'ordered',
        cancelUntil: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      },
      include: {
        vendor: { include: { business: true } },
        user: true,
        service: true
      }
    });

    const mappedBooking = {
      id: newBooking.id,
      userId: newBooking.userId || '',
      userName: newBooking.user?.name || 'Customer',
      userPhone: newBooking.user?.phone || '',
      vendorId: newBooking.vendorId,
      vendorName: newBooking.vendor?.business?.nameMr || newBooking.vendor?.business?.nameEn || 'Vendor',
      serviceId: newBooking.serviceId || '',
      serviceName: newBooking.service?.nameMr || newBooking.service?.nameEn || 'Custom Service',
      price: newBooking.price || 0,
      bookingDate: newBooking.bookingDate,
      bookingTime: newBooking.bookingTime,
      notes: newBooking.notes || undefined,
      status: newBooking.status,
      paymentStatus: newBooking.paymentStatus,
      paymentMethod: newBooking.paymentMethod,
      transactionId: newBooking.transactionId || undefined,
      createdAt: newBooking.createdAt.toISOString(),
      cancelUntil: newBooking.cancelUntil?.toISOString(),
      trackingStatus: newBooking.trackingStatus
    };

    return NextResponse.json({ success: true, data: mappedBooking });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 });
  }
}
