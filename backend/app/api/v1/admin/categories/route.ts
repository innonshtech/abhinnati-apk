import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/admin-auth';

// Helper to generate a clean URL-friendly slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

// GET /api/v1/admin/categories
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        subCategories: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    console.error('Fetch Categories Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/v1/admin/categories (Add New Category)
export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await request.json();
    const { nameEn, nameMr, iconName, displayOrder, requiresFssai } = body;

    if (!nameEn?.trim() || !nameMr?.trim()) {
      return NextResponse.json(
        { error: 'Both English name and Marathi name are required' },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = slugify(nameEn);
    if (!baseSlug) {
      baseSlug = `cat-${Date.now()}`;
    }

    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.category.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Determine order
    let orderNum = 0;
    if (displayOrder !== undefined && displayOrder !== null && displayOrder !== '') {
      orderNum = Number(displayOrder) || 0;
    } else {
      const highest = await prisma.category.findFirst({
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true },
      });
      orderNum = (highest?.displayOrder ?? 0) + 1;
    }

    // Create Category with default general subcategory
    const newCategory = await prisma.category.create({
      data: {
        slug: finalSlug,
        nameEn: nameEn.trim(),
        nameMr: nameMr.trim(),
        iconName: iconName?.trim() || 'Sparkles',
        displayOrder: orderNum,
        isActive: true,
        requiresFssai: !!requiresFssai,
        createdBy: admin.id,
        subCategories: {
          create: {
            slug: `${finalSlug}-general`,
            nameEn: `General ${nameEn.trim()}`,
            nameMr: `सर्वसाधारण ${nameMr.trim()}`,
            displayOrder: 0,
            isActive: true,
            createdBy: admin.id,
          },
        },
      },
      include: {
        subCategories: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Category created successfully',
        category: newCategory,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create Category Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
