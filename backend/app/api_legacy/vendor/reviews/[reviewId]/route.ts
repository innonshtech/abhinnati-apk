import { vendorController } from '@/src/modules/vendor/vendor.routes';

export async function GET(request: Request, { params }: { params: { reviewId: string } }) {
  return vendorController.handleGetReviewById(request, params.reviewId);
}
