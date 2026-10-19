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

    const { id } = await context.params;
    const body = await request.json();
    const nameEn = body.nameEn !== undefined ? String(body.nameEn).trim() : undefined;
    const nameMr = body.nameMr !== undefined ? String(body.nameMr).trim() : undefined;

    const updated = await prisma.area.update({
      where: { id },
      data: {
        ...(nameEn !== undefined && { name: nameEn, nameEn }),
        ...(nameMr !== undefined && { nameMr }),
        ...(body.pincode !== undefined && { pincode: body.pincode }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.district !== undefined && { district: body.district }),
        ...(body.state !== undefined && { state: body.state }),
        ...(body.latitude !== undefined && { latitude: Number(body.latitude) }),
        ...(body.longitude !== undefined && { longitude: Number(body.longitude) }),
        ...(body.radiusKm !== undefined && { radiusKm: Number(body.radiusKm) }),
        ...(body.isActive !== undefined && { isActive: !!body.isActive }),
      },
      include: { aliases: true },
    });

    return NextResponse.json({ success: true, area: updated });
  } catch (error: any) {
    console.error('Update Area Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { id } = await context.params;
    await prisma.area.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete Area Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
