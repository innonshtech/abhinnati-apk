import { exploreController } from '@/src/modules/explore/explore.routes';

export async function PUT(request: Request) {
  return exploreController.handleUpdateUserArea(request);
}
