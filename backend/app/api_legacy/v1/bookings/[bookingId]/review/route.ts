import { bookingController } from '@/src/modules/booking/booking.routes';

export async function POST(
  request: Request,
  context: { params: Promise<{ bookingId: string }> }
) {
  const params = await context.params;
  return bookingController.handleCreateReview(request, params.bookingId);
}
