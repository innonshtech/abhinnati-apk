import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(request: Request) {
  try {
    const user = await verifyAuth(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { isFullyBooked } = body;

    if (typeof isFullyBooked !== 'boolean') {
      return NextResponse.json({ error: 'isFullyBooked boolean field is required' }, { status: 400 });
    }

    const updatedVendor = await prisma.vendor.update({
      where: { userId: user.id },
      data: { isFullyBooked },
    });

    return NextResponse.json(updatedVendor);
  } catch (error) {
    console.error('Update Vendor Vacation Mode Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
