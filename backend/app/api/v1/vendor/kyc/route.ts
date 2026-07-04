import { NextRequest } from 'next/server';
import { VendorController } from '../../../../../src/presentation/controllers/vendor.controller';

export async function GET(req: NextRequest) {
  return VendorController.getKycStatus(req);
}

export async function POST(req: NextRequest) {
  return VendorController.uploadKycDocument(req);
}

export async function PATCH(req: NextRequest) {
  return VendorController.updateKycStatus(req);
}
