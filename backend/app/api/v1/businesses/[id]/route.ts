import { NextRequest } from 'next/server';
import { VendorController } from '../../../../../src/presentation/controllers/vendor.controller';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return VendorController.getPublicVendorProfile(req, { params });
}
