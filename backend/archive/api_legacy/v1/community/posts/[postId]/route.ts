import { communityController } from '@/src/modules/community/community.routes';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const params = await context.params;
  return communityController.handleDeletePost(request, params.postId);
}
