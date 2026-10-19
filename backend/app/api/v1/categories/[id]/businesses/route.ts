import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mapVendorsForClient, vendorPublicInclude } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryIdOrSlug } = await params;
    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get('area_id');

    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id: categoryIdOrSlug }, { slug: categoryIdOrSlug }],
        isActive: true,
        deletedAt: null,
      },
    });

    const vendorsDb = await prisma.vendor.findMany({
      where: {
        kycStatus: { in: ['approved', 'APPROVED'] },
        deletedAt: null,
      },
      include: vendorPublicInclude,
      orderBy: { createdAt: 'desc' },
    });

    let mapped = await mapVendorsForClient(vendorsDb);
    const targetSlug = category?.slug || categoryIdOrSlug;
    const targetId = category?.id || categoryIdOrSlug;
    mapped = mapped.filter(
      (vendor) => vendor.categorySlug === targetSlug || vendor.categoryId === targetId
    );

    if (areaId) {
      const areaMatches = mapped.filter((vendor) => vendor.areaId === areaId);
      if (areaMatches.length > 0) {
        mapped = areaMatches;
      }
    }

    return NextResponse.json({
      success: true,
      category: category || null,
      data: mapped,
      businesses: mapped,
      total: mapped.length,
    });
  } catch (error: any) {
    console.error('[API v1 /categories/:id/businesses] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category businesses' },
      { status: 500 }
    );
  }
}
