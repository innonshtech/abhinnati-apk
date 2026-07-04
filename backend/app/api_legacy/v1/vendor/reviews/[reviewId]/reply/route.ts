import { vendorController } from '@/src/modules/vendor/vendor.routes';

export async function POST(
  request: Request,
  context: { params: Promise<{ reviewId: string }> }
) {
  const params = await context.params;
  return vendorController.handleReplyReview(request, params.reviewId);
}
