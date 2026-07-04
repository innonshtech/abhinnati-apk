import { NextRequest } from 'next/server';
import { VendorController } from '../../../../../../src/presentation/controllers/vendor.controller';
import { ApiResponse, BadRequestError } from '../../../../../../src/presentation/utils/response';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.has('latitude') && searchParams.has('longitude')) {
    if (searchParams.has('search')) {
      return VendorController.searchNearby(req);
    }
    return VendorController.reverseGeocode(req);
  }
  return VendorController.getBusinessLocation(req);
}

export async function POST(req: NextRequest) {
  return VendorController.updateLocation(req);
}
