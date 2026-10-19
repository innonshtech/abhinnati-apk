import { NextResponse } from 'next/server';

import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    });
    const mapped = categories.map((c: any) => ({
      ...c,
      name_en: c.nameEn,
      name_mr: c.nameMr,
      requireFssai: c.requiresFssai,
      requiresFssai: c.requiresFssai,
    }));
    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
  }
}

