import { vendorController } from '@/src/modules/vendor/vendor.routes';

export async function POST(request: Request, { params }: { params: { reviewId: string } }) {
  return vendorController.handleReplyReview(request, params.reviewId);
}

export async function PUT(request: Request, { params }: { params: { reviewId: string } }) {
  return vendorController.handleReplyReview(request, params.reviewId);
}
