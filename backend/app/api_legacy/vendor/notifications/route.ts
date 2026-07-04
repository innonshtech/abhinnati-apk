import { vendorController } from '@/src/modules/vendor/vendor.routes';

export async function GET(request: Request) {
  return vendorController.handleGetNotifications(request);
}
