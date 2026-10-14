import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/admin-auth';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const params = await context.params;
    const vendorId = params.id;
    const body = await request.json().catch(() => ({}));
    const reason = body.reason?.trim() || 'Documents submitted do not meet verification criteria';

    // Update vendor kycStatus to rejected and store rejection reason
    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        kycStatus: 'rejected',
        emergencyStatus: reason, // Store reason in status note so mobile app displays it
      },
    });

    // Create an audit log entry
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'REJECT_VENDOR_KYC',
        entityName: 'Vendor',
        entityId: vendorId,
        newValues: JSON.stringify({ kycStatus: 'rejected', reason }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Vendor KYC marked as rejected',
      vendor,
    });
  } catch (error: any) {
    console.error('Reject Vendor Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
