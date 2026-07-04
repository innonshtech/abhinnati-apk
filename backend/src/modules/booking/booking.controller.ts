import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { BookingService } from './booking.service';
import { createBookingSchema, updateBookingSchema, createReviewSchema } from './booking.validation';

export class BookingController {
  private bookingService = new BookingService();

  async handleGetBookings(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const vendorId = searchParams.get('vendor_id');
      const userId = searchParams.get('user_id');

      const data = await this.bookingService.getBookings(user.id, vendorId, userId);
      return NextResponse.json(data);
    } catch (error: any) {
      console.error('[BookingController] getBookings error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async handleCreateBooking(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const result = createBookingSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ error: 'Invalid booking data', details: result.error.issues }, { status: 400 });
      }

      const data = await this.bookingService.createBooking(user.id, user.name, user.phone, result.data);
      return NextResponse.json(data);
    } catch (error: any) {
      console.error('[BookingController] createBooking error:', error);
      return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
  }

  async handleUpdateBooking(request: Request, bookingId: string) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const result = updateBookingSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ error: 'Invalid update parameters', details: result.error.issues }, { status: 400 });
      }

      const data = await this.bookingService.updateBooking(user.id, bookingId, result.data);
      return NextResponse.json(data);
    } catch (error: any) {
      console.error('[BookingController] updateBooking error:', error);
      const message = error?.message || '';
      const status = message.includes('not found') ? 404 : 500;
      return NextResponse.json({ error: message || 'Internal Server Error' }, { status });
    }
  }

  async handleCreateReview(request: Request, bookingId: string) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const result = createReviewSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ error: 'Invalid review parameters', details: result.error.issues }, { status: 400 });
      }

      const data = await this.bookingService.createReview(user.id, user.name, bookingId, result.data);
      return NextResponse.json(data);
    } catch (error: any) {
      console.error('[BookingController] createReview error:', error);
      const message = error?.message || '';
      const status = message.includes('not found') ? 404 : 500;
      return NextResponse.json({ error: message || 'Internal Server Error' }, { status });
    }
  }
}
