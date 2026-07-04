import { vendorController } from '@/src/modules/vendor/vendor.routes';

export async function POST(request: Request) {
  return vendorController.handleBlockDate(request);
}

export async function DELETE(request: Request) {
  return vendorController.handleUnblockDate(request);
}
