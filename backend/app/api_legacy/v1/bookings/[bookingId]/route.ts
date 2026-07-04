import { bookingController } from '@/src/modules/booking/booking.routes';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ bookingId: string }> }
) {
  const params = await context.params;
  return bookingController.handleUpdateBooking(request, params.bookingId);
}
