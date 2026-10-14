import { bookingController } from '@/src/modules/booking/booking.routes';

export async function GET(request: Request) {
  return bookingController.handleGetBookings(request);
}

export async function POST(request: Request) {
  return bookingController.handleCreateBooking(request);
}
