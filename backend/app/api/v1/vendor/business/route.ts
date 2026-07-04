import { NextRequest } from 'next/server';
import { VendorController } from '../../../../../src/presentation/controllers/vendor.controller';

export async function GET(req: NextRequest) {
  return VendorController.getBusiness(req);
}

export async function POST(req: NextRequest) {
  return VendorController.createBusiness(req);
}

export async function PATCH(req: NextRequest) {
  return VendorController.updateBusiness(req);
}

export async function DELETE(req: NextRequest) {
  return VendorController.deleteBusiness(req);
}
