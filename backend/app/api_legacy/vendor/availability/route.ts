import { vendorController } from '@/src/modules/vendor/vendor.routes';

export async function GET(request: Request) {
  return vendorController.handleGetAvailability(request);
}

export async function PUT(request: Request) {
  return vendorController.handleUpdateAvailability(request);
}
