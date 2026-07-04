import { vendorController } from '@/src/modules/vendor/vendor.routes';

export async function POST(request: Request) {
  return vendorController.handleSkipSetup(request);
}
