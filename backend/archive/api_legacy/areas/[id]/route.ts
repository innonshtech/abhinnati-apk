import { areaController } from '@/src/modules/area/area.routes';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return areaController.handleGetDetails(request, id);
}
