import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signAdminToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Phone/Email and password are required' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();

    // Find admin user by phone or email
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanIdentifier },
          { email: cleanIdentifier }
        ],
        role: 'admin',
      },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Invalid admin credentials or account does not exist' },
        { status: 401 }
      );
    }

    if (!adminUser.isActive) {
      return NextResponse.json(
        { error: 'Admin account has been deactivated' },
        { status: 403 }
      );
    }

    // Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, adminUser.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    // Sign admin JWT
    const token = signAdminToken({
      userId: adminUser.id,
      phone: adminUser.phone,
      email: adminUser.email,
      name: adminUser.name,
      role: 'admin',
    });

    // Create response and set secure cookie
    const response = NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
      user: {
        id: adminUser.id,
        name: adminUser.name,
        phone: adminUser.phone,
        email: adminUser.email,
        role: adminUser.role,
      },
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Admin Login Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
