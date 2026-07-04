import { LikeController } from '@/src/modules/like/like.controller';

const controller = new LikeController();

export async function POST(
  request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const params = await context.params;
  return controller.handleLike(request, params.postId);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const params = await context.params;
  return controller.handleUnlike(request, params.postId);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const params = await context.params;
  return controller.handleGetLikes(request, params.postId);
}
