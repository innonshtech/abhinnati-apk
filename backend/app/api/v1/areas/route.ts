import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { toClientArea } from '../../../../lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    try {
      const areaDelegate = (prisma as any).area;
      if (!areaDelegate?.findMany) {
        throw new Error('Area model is not available on Prisma client');
      }
      const areas = await areaDelegate.findMany({
        where: { isActive: true },
        orderBy: { nameEn: 'asc' },
        include: { aliases: true },
      });

      if (areas.length > 0) {
        return NextResponse.json({
          success: true,
          data: areas.map((area: any) => ({
            ...toClientArea(area),
            aliases: area.aliases.map((alias: any) => alias.aliasName),
          })),
        });
      }
    } catch (error: any) {
      console.warn('[API v1 /areas] Area table unavailable, using location fallback:', error?.message);
    }

    const locations = await prisma.location.findMany({
      where: {
        deletedAt: null,
        NOT: { area: '' },
      },
      distinct: ['area'],
      select: {
        area: true,
        city: true,
        latitude: true,
        longitude: true,
        pincode: true,
      },
    });

    const fromLocations = locations
      .filter((location: any) => location.area?.trim())
      .map((location: any) => ({
        id: location.area,
        name_en: location.area,
        name_mr: location.area,
        latitude: location.latitude,
        longitude: location.longitude,
        radius_km: 5,
        locality: location.area,
        city: location.city || '',
        pincode: location.pincode || '',
        slug: location.area,
        aliases: [],
      }));

    return NextResponse.json({ success: true, data: fromLocations });
  } catch (error: any) {
    console.error('[API v1 /areas] Error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}
