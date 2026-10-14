import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/admin-auth';

// GET /api/v1/admin/vendors/[id]/profile
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const params = await context.params;
    const identifier = params.id;

    // 1. Find vendor by vendorId or by userId
    let vendor = await prisma.vendor.findFirst({
      where: {
        OR: [{ id: identifier }, { userId: identifier }],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: true,
            language: true,
            isActive: true,
            createdAt: true,
          },
        },
        business: {
          include: {
            services: {
              where: { deletedAt: null },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        bookings: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          include: {
            service: {
              select: {
                id: true,
                nameEn: true,
                nameMr: true,
                price: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    // 2. Compute performance analytics
    const bookings = vendor.bookings || [];
    const totalRequests = bookings.length;
    const acceptedCount = bookings.filter((b) => b.status === 'accepted' || b.status === 'completed').length;
    const declinedCount = bookings.filter((b) => b.status === 'declined').length;
    const completedCount = bookings.filter((b) => b.status === 'completed').length;
    const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;
    const pendingCount = bookings.filter((b) => b.status === 'pending').length;

    const totalDecisions = acceptedCount + declinedCount;
    const acceptanceRate =
      totalDecisions > 0
        ? Math.round((acceptedCount / totalDecisions) * 100)
        : totalRequests > 0
        ? 100
        : 0;

    const declineRate =
      totalDecisions > 0
        ? Math.round((declinedCount / totalDecisions) * 100)
        : 0;

    const totalGMV = bookings
      .filter((b) => b.status === 'completed' || b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (Number(b.price) || 0), 0);

    const analytics = {
      totalRequests,
      acceptedCount,
      declinedCount,
      completedCount,
      cancelledCount,
      pendingCount,
      acceptanceRate,
      declineRate,
      totalGMV,
    };

    return NextResponse.json({
      success: true,
      vendor: {
        id: vendor.id,
        userId: vendor.userId,
        kycStatus: vendor.kycStatus,
        kycDocsUrl: vendor.kycDocsUrl,
        user: vendor.user,
        business: vendor.business,
      },
      services: vendor.business?.services || [],
      recentBookings: bookings.slice(0, 10),
      analytics,
    });
  } catch (error: any) {
    console.error('Fetch Vendor Profile Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
