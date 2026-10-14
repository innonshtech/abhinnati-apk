import { areaController } from '@/src/modules/area/area.routes';

export async function GET(request: Request) {
  return areaController.handleGetAllActive(request);
}
