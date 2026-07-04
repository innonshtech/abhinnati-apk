import { NextRequest } from 'next/server';
import { VendorController } from '../../../../../../src/presentation/controllers/vendor.controller';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;
  return VendorController.updateService(req, serviceId);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;
  return VendorController.deleteService(req, serviceId);
}
