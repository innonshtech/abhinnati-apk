import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/admin-auth';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const areaDelegate = (prisma as any).area;
    if (!areaDelegate?.findMany) {
      return NextResponse.json({
        success: true,
        areas: [],
        warning: 'Area model is not available. Run prisma generate and restart the server.',
      });
    }
    const areas = await areaDelegate.findMany({
      orderBy: { nameEn: 'asc' },
      include: { aliases: true },
    });

    return NextResponse.json({ success: true, areas });
  } catch (error: any) {
    console.error('Fetch Areas Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await request.json();
    const nameEn = (body.nameEn || body.name || '').trim();
    const nameMr = (body.nameMr || nameEn).trim();
    if (!nameEn) {
      return NextResponse.json({ error: 'English area name is required' }, { status: 400 });
    }

    let baseSlug = slugify(body.slug || nameEn) || `area-${Date.now()}`;
    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.area.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const aliases: string[] = Array.isArray(body.aliases)
      ? body.aliases
      : String(body.aliases || '')
          .split(',')
          .map((item: string) => item.trim())
          .filter(Boolean);

    const area = await prisma.area.create({
      data: {
        name: nameEn,
        nameEn,
        nameMr,
        slug: finalSlug,
        pincode: body.pincode || '',
        city: body.city || '',
        district: body.district || '',
        state: body.state || 'Maharashtra',
        country: body.country || 'India',
        latitude: Number(body.latitude) || 0,
        longitude: Number(body.longitude) || 0,
        radiusKm: Number(body.radiusKm) || 5,
        isActive: body.isActive !== false,
        aliases: {
          create: aliases.map((aliasName) => ({ aliasName })),
        },
      },
      include: { aliases: true },
    });

    return NextResponse.json({ success: true, area }, { status: 201 });
  } catch (error: any) {
    console.error('Create Area Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
