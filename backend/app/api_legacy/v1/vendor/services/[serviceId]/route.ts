import { vendorController } from '@/src/modules/vendor/vendor.routes';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ serviceId: string }> }
) {
  const params = await context.params;
  return vendorController.handleDeleteService(request, params.serviceId);
}
