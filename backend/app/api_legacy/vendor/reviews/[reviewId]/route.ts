import { vendorController } from '@/src/modules/vendor/vendor.routes';

export async function GET(request: Request, { params }: { params: Promise<{ reviewId: string }> }) {
  const { reviewId } = await params;
  return vendorController.handleGetReviewById(request, reviewId);
}
