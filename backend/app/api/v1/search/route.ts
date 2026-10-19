import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { mapVendorsForClient, vendorPublicInclude } from '../../../../lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const categoryParam = searchParams.get('category') || searchParams.get('categorySlug');
    const areaId = searchParams.get('area_id') || searchParams.get('locality');
    const minRating = parseFloat(searchParams.get('rating') || '0');

    const vendorsDb = await prisma.vendor.findMany({
      where: {
        kycStatus: { in: ['approved', 'APPROVED'] },
        deletedAt: null,
      },
      include: vendorPublicInclude,
      orderBy: { createdAt: 'desc' },
    });

    let mappedVendors = await mapVendorsForClient(vendorsDb);

    if (query && query !== '*') {
      mappedVendors = mappedVendors.filter((vendor) => {
        const haystack = [
          vendor.businessNameEn,
          vendor.businessNameMr,
          vendor.descriptionEn,
          vendor.descriptionMr,
          vendor.categoryNameEn,
          vendor.categoryNameMr,
          ...vendor.services.map((service: any) => `${service.name_en} ${service.name_mr}`),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    if (categoryParam) {
      mappedVendors = mappedVendors.filter(
        (vendor) => vendor.categorySlug === categoryParam || vendor.categoryId === categoryParam
      );
    }

    if (areaId) {
      const areaMatches = mappedVendors.filter(
        (vendor) =>
          vendor.areaId === areaId ||
          vendor.areaId?.toLowerCase().includes(String(areaId).toLowerCase())
      );
      if (areaMatches.length > 0) {
        mappedVendors = areaMatches;
      }
    }

    if (minRating > 0) {
      mappedVendors = mappedVendors.filter((vendor) => vendor.ratingAvg >= minRating);
    }

    return NextResponse.json({
      success: true,
      data: mappedVendors,
      businesses: mappedVendors,
      total: mappedVendors.length,
    });
  } catch (error: any) {
    console.error('[API v1 /search] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search vendors' },
      { status: 500 }
    );
  }
}
