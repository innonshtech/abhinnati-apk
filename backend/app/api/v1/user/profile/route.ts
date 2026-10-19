import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { verifyAuth } from '../../../../../lib/auth';
import { CloudinaryService } from '../../../../../lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const vendorProfile = (user as any).vendorProfile;
    const business = vendorProfile?.business;
    const vendorData = vendorProfile ? {
      ...vendorProfile,
      businessNameEn: business?.nameEn || '',
      businessNameMr: business?.nameMr || '',
      business,
    } : null;

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        fullName: user.name,
        displayName: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        language: user.language,
        profileImage: user.profileImage,
        vendor: vendorData,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /user/profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // The frontend sends fullName and profileImage
    const name = body.fullName || body.name || '';
    let profileImage = body.profileImage || null;

    if (profileImage && (profileImage.startsWith('data:') || !profileImage.startsWith('http'))) {
      const uploadRes = await CloudinaryService.uploadProfilePhoto(profileImage, user.id);
      profileImage = uploadRes.secureUrl;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        ...(profileImage !== null ? { profileImage } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        displayName: updatedUser.name,
        fullName: updatedUser.name,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /user/profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update profile' },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.fullName !== undefined) updateData.name = body.fullName;
    if (body.profileImage !== undefined) {
      let profileImg = body.profileImage;
      if (profileImg && (profileImg.startsWith('data:') || !profileImg.startsWith('http'))) {
        const uploadRes = await CloudinaryService.uploadProfilePhoto(profileImg, user.id);
        profileImg = uploadRes.secureUrl;
      }
      updateData.profileImage = profileImg;
    }
    if (body.language !== undefined) updateData.language = body.language;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        displayName: updatedUser.name,
        fullName: updatedUser.name,
        profileImage: updatedUser.profileImage,
        language: updatedUser.language,
      },
    });
  } catch (error: any) {
    console.error('Error in PATCH /user/profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update profile' },
      { status: 400 }
    );
  }
}
