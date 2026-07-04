import { vendorController } from '@/src/modules/vendor/vendor.routes';

export async function PUT(request: Request) {
  return vendorController.handleUpdateVacation(request);
}
