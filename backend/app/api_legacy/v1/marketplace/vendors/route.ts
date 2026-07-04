import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get('area_id');
    const categorySlug = searchParams.get('category');

    if (!areaId) {
      return NextResponse.json({ error: 'area_id query parameter is required' }, { status: 400 });
    }

    const vendors = await prisma.vendor.findMany({
      where: {
        areaId: areaId,
        categorySlug: categorySlug || undefined,
        kycStatus: 'approved',
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        services: true,
        reviews: true,
      },
    });

    return NextResponse.json(vendors);
  } catch (error) {
    console.error('Fetch Vendors Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
