import { exploreController } from '@/src/modules/explore/explore.routes';

export async function GET(request: Request) {
  return exploreController.handleGetExplore(request);
}
