import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { config } from '@/lib/config';
import { logger } from '@/lib/logger';
import { ValidationError } from '@/lib/errors';
import crypto from 'crypto';

export class AuthService {
  /**
   * Generates a 6-digit verification code, stores the session in the database,
   * and logs the session details.
   */
  async requestOtp(phoneNumber: string) {
    // Generate code: '123456' for dev/testing, random 6-digits for production
    const otpCode = config.NODE_ENV === 'production'
      ? crypto.randomInt(100000, 1000000).toString()
      : '123456';

    const expiryMins = config.OTP_EXPIRY_MINS || 5;
    const expiresAt = new Date(Date.now() + expiryMins * 60 * 1000);

    // Save OtpSession to database
    const otpSession = await prisma.otpSession.create({
      data: {
        phone: phoneNumber,
        code: otpCode,
        expiresAt,
      },
    });

    logger.info(`[AuthService] OTP Request - Phone: ${phoneNumber}, Code: ${otpCode}, Session ID: ${otpSession.id}`);

    return {
      success: true,
      sessionId: otpSession.id,
    };
  }

  /**
   * Verifies the OTP session.
   * If valid: logs/creates the user, issues JWT and rotated refresh tokens, and deletes the session.
   */
  async verifyOtp(sessionId: string, code: string) {
    // 1. Fetch OTP Session from DB
    const otpSession = await prisma.otpSession.findUnique({
      where: { id: sessionId },
    });

    if (!otpSession) {
      throw new ValidationError('Invalid or expired OTP session');
    }

    // 2. Validate Expiry
    if (otpSession.expiresAt < new Date()) {
      await prisma.otpSession.delete({ where: { id: sessionId } }).catch(() => {});
      throw new ValidationError('OTP has expired');
    }

    // 3. Validate Code
    // Allow '123456' bypass in dev/test node environments
    const isDevMockBypass = config.NODE_ENV !== 'production' && code === '123456';
    if (otpSession.code !== code && !isDevMockBypass) {
      throw new ValidationError('Incorrect OTP Code');
    }

    const phone = otpSession.phone;

    // 4. Delete used OTP session from database to prevent replay attacks
    await prisma.otpSession.delete({
      where: { id: sessionId },
    });

    // 5. Query user by phone, or create new user
    let user = await prisma.user.findUnique({
      where: { phone },
      include: { vendorProfile: true },
    });

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          phone,
          name: '',
          role: 'resident',
          language: 'mr',
          onboardingStep: 'name_select',
        },
        include: { vendorProfile: true },
      });
      logger.info(`[AuthService] Created new user: ID=${user.id}, Phone=${phone}`);
    } else {
      logger.info(`[AuthService] Existing user logged in: ID=${user.id}, Phone=${phone}`);
    }

    // 6. Generate Access Token (1h expiry)
    const token = signToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });

    // 7. Generate Rotated Refresh Token (30d expiry)
    const refreshTokenString = crypto.randomUUID();
    const refreshToken = await prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      success: true,
      token,
      refreshToken: refreshToken.token,
      isNewUser,
      role: user.role,
    };
  }

  /**
   * Regenerates an access token and rotates the refresh token.
   */
  async refreshAccessToken(token: string) {
    // 1. Look up refresh token
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken) {
      throw new ValidationError('Invalid refresh token');
    }

    // 2. Validate Expiry
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } }).catch(() => {});
      throw new ValidationError('Refresh token has expired');
    }

    // 3. Delete old token to prevent token reuse attacks (rotation)
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    // 4. Generate new Access Token (1h expiry)
    const newAccessToken = signToken({
      userId: storedToken.user.id,
      phone: storedToken.user.phone,
      role: storedToken.user.role,
    });

    // 5. Generate new Rotated Refresh Token (30d expiry)
    const newRefreshTokenString = crypto.randomUUID();
    const newRefreshToken = await prisma.refreshToken.create({
      data: {
        token: newRefreshTokenString,
        userId: storedToken.user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    logger.info(`[AuthService] Rotated refresh token for user: ID=${storedToken.user.id}`);

    return {
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken.token,
    };
  }
}
