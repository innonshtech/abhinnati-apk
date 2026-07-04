import { exploreController } from '@/src/modules/explore/explore.routes';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return exploreController.handleGetCategoryBusinesses(request, id);
}
