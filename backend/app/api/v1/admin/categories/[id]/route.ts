import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/admin-auth';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const params = await context.params;
    const categoryId = params.id;
    const body = await request.json();
    const { nameMr, nameEn, iconName, isActive, displayOrder } = body;

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(nameMr !== undefined && { nameMr }),
        ...(nameEn !== undefined && { nameEn }),
        ...(iconName !== undefined && { iconName }),
        ...(isActive !== undefined && { isActive }),
        ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: updated,
    });
  } catch (error: any) {
    console.error('Update Category Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
