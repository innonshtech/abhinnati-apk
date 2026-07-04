import { NextRequest } from 'next/server';
import { VendorController } from '../../../../../src/presentation/controllers/vendor.controller';

export async function GET(req: NextRequest) {
  return VendorController.getProfile(req);
}

export async function PATCH(req: NextRequest) {
  return VendorController.updateProfile(req);
}

export async function POST(req: NextRequest) {
  return VendorController.uploadProfilePicture(req);
}

export async function DELETE(req: NextRequest) {
  return VendorController.deleteProfilePicture(req);
}
