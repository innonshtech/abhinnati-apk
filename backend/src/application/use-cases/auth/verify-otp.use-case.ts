import { OtpSessionRepository } from '../../../domain/repositories/otp-session.repository';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { PasswordService } from '../../../infrastructure/security/password.service';
import { JwtService } from '../../../infrastructure/security/jwt.service';
import crypto from 'crypto';

export class VerifyOtpUseCase {
  constructor(
    private otpSessionRepo: OtpSessionRepository,
    private userRepo: UserRepository,
    private tokenRepo: RefreshTokenRepository
  ) {}

  async execute(sessionId: string, code: string) {
    // 1. Fetch OTP Session from DB
    const otpSession = await this.otpSessionRepo.findById(sessionId);
    if (!otpSession) {
      throw new Error('Invalid or expired OTP session');
    }

    // 2. Validate Expiry
    if (otpSession.expiresAt < new Date()) {
      await this.otpSessionRepo.delete(sessionId);
      throw new Error('OTP has expired');
    }

    // 3. Validate Code (bypass '123456' in non-production nodes)
    const isDevMockBypass = process.env.NODE_ENV !== 'production' && code === '123456';
    if (otpSession.code !== code && !isDevMockBypass) {
      throw new Error('Incorrect OTP Code');
    }

    const phone = otpSession.phone;

    // 4. Delete used OTP session
    await this.otpSessionRepo.delete(sessionId);

    // 5. Query user by phone, or create new user
    let user = await this.userRepo.findByPhone(phone);
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // Since passwordHash is a required string in prisma, generate a random hash
      const randomPassword = crypto.randomUUID();
      const passwordHash = await PasswordService.hash(randomPassword);

      user = await this.userRepo.create({
        phone,
        name: '',
        role: 'resident',
        passwordHash,
      });
    }

    // 6. Generate Access Token (15m expiry in backend configuration)
    const token = JwtService.signAccessToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });

    // 7. Generate Rotated Refresh Token (30d expiry)
    const refreshTokenString = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days session persistence

    const refreshToken = await this.tokenRepo.create({
      token: refreshTokenString,
      userId: user.id,
      expiresAt,
    });

    return {
      success: true,
      token,
      refreshToken: refreshToken.token,
      isNewUser,
      role: user.role,
    };
  }
}
