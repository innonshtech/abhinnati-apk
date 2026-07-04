import { exploreController } from '@/src/modules/explore/explore.routes';

export async function GET(
  request: Request,
  context: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await context.params;
  return exploreController.handleGetBusinessDetail(request, businessId);
}
