import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { mapVendorsForClient, vendorPublicInclude } from '../../../../lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { displayOrder: 'asc' },
    });

    const vendors = await prisma.vendor.findMany({
      where: { deletedAt: null, kycStatus: { in: ['approved', 'APPROVED'] } },
      include: vendorPublicInclude,
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const popularBusinesses = (await mapVendorsForClient(vendors)).sort(
      (a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0)
    );

    return NextResponse.json({
      success: true,
      data: {
        categories: categories.map((category: any) => ({
          id: category.id,
          slug: category.slug,
          name_mr: category.nameMr,
          name_en: category.nameEn,
          iconName: category.iconName,
          requiresFssai: category.requiresFssai,
        })),
        popularBusinesses,
      },
    });
  } catch (error) {
    console.error('GET /explore failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch explore' }, { status: 500 });
  }
}
