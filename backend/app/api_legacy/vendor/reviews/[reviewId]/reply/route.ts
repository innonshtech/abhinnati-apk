import { vendorController } from '@/src/modules/vendor/vendor.routes';

export async function POST(request: Request, { params }: { params: Promise<{ reviewId: string }> }) {
  const { reviewId } = await params;
  return vendorController.handleReplyReview(request, reviewId);
}

export async function PUT(request: Request, { params }: { params: Promise<{ reviewId: string }> }) {
  const { reviewId } = await params;
  return vendorController.handleReplyReview(request, reviewId);
}
