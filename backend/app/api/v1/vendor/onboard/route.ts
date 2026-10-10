import { NextResponse } from 'next/server';
import { AuthMiddleware } from '../../../../../src/presentation/middleware/auth.middleware';

import { prisma } from '../../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const userPayload = await AuthMiddleware.authenticate(req as any);
    const body = await req.json();

    // 1. Upgrade user role to vendor
    await prisma.user.update({
      where: { id: userPayload.userId },
      data: { role: 'vendor' }
    });

    // 2. Check if Vendor already exists
    let vendor = await prisma.vendor.findUnique({
      where: { userId: userPayload.userId }
    });

    if (!vendor) {
      vendor = await prisma.vendor.create({
        data: {
          userId: userPayload.userId,
          kycDocsUrl: body.kycDocsUrl || null,
          kycStatus: 'pending',
        }
      });
    }

    // 3. Check if Business already exists
    let business = await prisma.business.findUnique({
      where: { vendorId: vendor.id }
    });

    if (!business) {
      business = await prisma.business.create({
        data: {
          vendorId: vendor.id,
          nameMr: body.businessNameMr || body.businessNameEn,
          nameEn: body.businessNameEn || 'Unknown Business',
          descriptionMr: body.descriptionMr || '',
          descriptionEn: body.descriptionEn || '',
          whatsappNumber: userPayload.phone || '',
          email: body.email || null,
          serviceRadius: '5 km',
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Vendor onboarded successfully',
      data: {
        vendor,
        business
      }
    });

  } catch (error: any) {
    console.error('Error onboarding vendor:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to onboard vendor' }, { status: 400 });
  }
}
