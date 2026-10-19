import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    const vendor = await prisma.vendor.update({
      where: { id },
      data: { kycStatus: 'approved' },
    });

    await prisma.user.update({
      where: { id: vendor.userId },
      data: { role: 'vendor' },
    }).catch(() => {});

    return NextResponse.json({ success: true, vendor });
  } catch (error: any) {
    console.error('Test Admin Approve Vendor Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
