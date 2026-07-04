import { communityController } from '@/src/modules/community/community.routes';

export async function GET(request: Request) {
  return communityController.handleEmptyFeed(request);
}
