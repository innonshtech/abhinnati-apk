import { NextRequest } from 'next/server';
import { VendorController } from '../../../../src/presentation/controllers/vendor.controller';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return VendorController.getMarketplaceVendors(req);
}
