import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { mapVendorsForClient, vendorPublicInclude } from '../../../../../lib/catalog';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get('area_id');

    const vendors = await prisma.vendor.findMany({
      where: {
        kycStatus: { in: ['approved', 'APPROVED'] },
        deletedAt: null,
      },
      include: vendorPublicInclude,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    let mapped = await mapVendorsForClient(vendors);
    if (areaId) {
      const areaMatches = mapped.filter((vendor) => vendor.areaId === areaId);
      if (areaMatches.length > 0) {
        mapped = areaMatches;
      }
    }

    return NextResponse.json({
      success: true,
      data: mapped,
      businesses: mapped,
    });
  } catch (error) {
    console.error('[empty-feed] Error:', error);
    return NextResponse.json({ success: true, message: 'No posts yet', data: [] });
  }
}
