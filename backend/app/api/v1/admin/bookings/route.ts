import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/admin-auth';

// GET /api/v1/admin/bookings (Bookings Overview across Maharashtra)
export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search')?.trim().toLowerCase();
    const limit = Math.min(Number(searchParams.get('limit')) || 100, 200);

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      where.paymentStatus = paymentStatus;
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search } } },
        { vendor: { business: { nameEn: { contains: search, mode: 'insensitive' } } } },
        { vendor: { business: { nameMr: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
          vendor: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                },
              },
              business: {
                select: {
                  id: true,
                  nameEn: true,
                  nameMr: true,
                  whatsappNumber: true,
                  logoUrl: true,
                },
              },
            },
          },
          service: {
            select: {
              id: true,
              nameEn: true,
              nameMr: true,
              price: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      bookings,
      total,
    });
  } catch (error: any) {
    console.error('Fetch Bookings Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
