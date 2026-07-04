import { communityController } from '@/src/modules/community/community.routes';

export async function POST(request: Request) {
  return communityController.handleCreatePost(request);
}
