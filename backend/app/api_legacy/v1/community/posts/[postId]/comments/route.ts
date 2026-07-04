import { communityController } from '@/src/modules/community/community.routes';

export async function GET(
  request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const params = await context.params;
  return communityController.handleGetComments(request, params.postId);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const params = await context.params;
  return communityController.handleCreateComment(request, params.postId);
}
