import { vendorController } from '@/src/modules/vendor/vendor.routes';

export async function POST(request: Request) {
  return vendorController.handleBlockSlot(request);
}

export async function DELETE(request: Request) {
  return vendorController.handleUnblockSlot(request);
}
