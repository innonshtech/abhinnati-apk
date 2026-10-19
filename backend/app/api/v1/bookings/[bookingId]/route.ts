import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { BookingStatus } from '@prisma/client';
import { bookingDetailInclude, mapBookingForClient } from '@/lib/bookings';
import { createUserNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: bookingDetailInclude,
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mapBookingForClient(booking),
    });
  } catch (error: any) {
    console.error('[API v1 /bookings/:bookingId GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const user = await verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required to update booking' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { status, trackingStatus, paymentStatus } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        vendor: true,
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    const isCustomer = booking.userId === user.id;
    const isVendorOwner = booking.vendor.userId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isCustomer && !isVendorOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions to modify this booking' },
        { status: 403 }
      );
    }

    // Terminal statuses cannot be modified
    const terminalStatuses: BookingStatus[] = [
      BookingStatus.completed,
      BookingStatus.cancelled,
      BookingStatus.declined,
    ];

    if (terminalStatuses.includes(booking.status)) {
      return NextResponse.json(
        { success: false, error: `Cannot modify booking with terminal status: ${booking.status}` },
        { status: 400 }
      );
    }

    const updateData: any = {};

    // Validate and enforce valid status transitions
    if (status) {
      const validStatuses: BookingStatus[] = [
        BookingStatus.pending,
        BookingStatus.accepted,
        BookingStatus.completed,
        BookingStatus.cancelled,
        BookingStatus.declined,
      ];

      if (!validStatuses.includes(status as BookingStatus)) {
        return NextResponse.json(
          { success: false, error: `Invalid booking status: ${status}` },
          { status: 400 }
        );
      }

      // Customer permission rules: customers may only cancel
      if (isCustomer && !isVendorOwner && !isAdmin) {
        if (status !== BookingStatus.cancelled) {
          return NextResponse.json(
            { success: false, error: 'Customers can only cancel bookings, not accept or complete them' },
            { status: 403 }
          );
        }
      }

      // Vendor permission rules: vendor can accept, decline, complete, or cancel
      if (isVendorOwner && !isAdmin) {
        if (booking.status === BookingStatus.pending) {
          const allowed: BookingStatus[] = [BookingStatus.accepted, BookingStatus.declined, BookingStatus.cancelled];
          if (!allowed.includes(status as BookingStatus)) {
            return NextResponse.json(
              { success: false, error: 'Pending bookings can only be accepted, declined, or cancelled' },
              { status: 400 }
            );
          }
        } else if (booking.status === BookingStatus.accepted) {
          const allowed: BookingStatus[] = [BookingStatus.completed, BookingStatus.cancelled];
          if (!allowed.includes(status as BookingStatus)) {
            return NextResponse.json(
              { success: false, error: 'Accepted bookings can only be completed or cancelled' },
              { status: 400 }
            );
          }
        }
      }

      updateData.status = status as BookingStatus;
    }

    if (trackingStatus) {
      const validTracking = ['ordered', 'en_route', 'in_progress', 'completed'];
      if (!validTracking.includes(trackingStatus)) {
        return NextResponse.json(
          { success: false, error: `Invalid tracking status: ${trackingStatus}` },
          { status: 400 }
        );
      }
      updateData.trackingStatus = trackingStatus;
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: bookingDetailInclude,
    });

    const mapped = mapBookingForClient(updated);
    const vendorLabel = mapped.vendorName || 'Vendor';
    const serviceLabel = mapped.serviceName || 'service';

    if (status && status !== booking.status && booking.userId) {
      if (status === BookingStatus.accepted) {
        await createUserNotification({
          userId: booking.userId,
          titleMr: 'बुकिंग मंजूर',
          titleEn: 'Booking approved',
          messageMr: `${vendorLabel} यांनी तुमची ${serviceLabel} बुकिंग स्वीकारली आहे.`,
          messageEn: `${vendorLabel} approved your ${serviceLabel} booking.`,
          type: 'booking',
        });
      } else if (status === BookingStatus.declined) {
        await createUserNotification({
          userId: booking.userId,
          titleMr: 'बुकिंग नाकारली',
          titleEn: 'Booking declined',
          messageMr: `${vendorLabel} यांनी तुमची विनंती नाकारली. कृपया दुसरी सेवा निवडा.`,
          messageEn: `${vendorLabel} declined your request. You can choose another option.`,
          type: 'booking',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: mapped,
      message: 'Booking updated successfully',
    });
  } catch (error: any) {
    console.error('[API v1 /bookings/:bookingId PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
