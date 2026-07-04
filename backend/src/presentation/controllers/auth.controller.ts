import { NextRequest } from 'next/server';
import { ApiResponse, BadRequestError } from '../utils/response';
import { LoginSchema, RegisterVendorSchema, RefreshTokenSchema, RequestOtpSchema, VerifyOtpSchema } from '../../application/dtos/auth.dto';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RegisterVendorUseCase } from '../../application/use-cases/auth/register-vendor.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { RequestOtpUseCase } from '../../application/use-cases/auth/request-otp.use-case';
import { VerifyOtpUseCase } from '../../application/use-cases/auth/verify-otp.use-case';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';
import { PrismaVendorRepository } from '../../infrastructure/repositories/prisma-vendor.repository';
import { PrismaBusinessRepository } from '../../infrastructure/repositories/prisma-business.repository';
import { PrismaRefreshTokenRepository } from '../../infrastructure/repositories/prisma-refresh-token.repository';
import { PrismaAuditLogRepository } from '../../infrastructure/repositories/prisma-audit-log.repository';
import { PrismaOtpSessionRepository } from '../../infrastructure/repositories/prisma-otp-session.repository';
import { AuthMiddleware } from '../middleware/auth.middleware';

export class AuthController {
  private static userRepo = new PrismaUserRepository();
  private static vendorRepo = new PrismaVendorRepository();
  private static businessRepo = new PrismaBusinessRepository();
  private static tokenRepo = new PrismaRefreshTokenRepository();
  private static auditRepo = new PrismaAuditLogRepository();
  private static otpRepo = new PrismaOtpSessionRepository();

  private static loginUseCase = new LoginUseCase(this.userRepo, this.tokenRepo, this.auditRepo);
  private static registerVendorUseCase = new RegisterVendorUseCase(
    this.userRepo,
    this.vendorRepo,
    this.businessRepo,
    this.tokenRepo,
    this.auditRepo
  );
  private static logoutUseCase = new LogoutUseCase(this.tokenRepo, this.auditRepo);
  private static refreshTokenUseCase = new RefreshTokenUseCase(this.tokenRepo, this.userRepo);
  private static requestOtpUseCase = new RequestOtpUseCase(this.otpRepo);
  private static verifyOtpUseCase = new VerifyOtpUseCase(this.otpRepo, this.userRepo, this.tokenRepo);

  static async registerVendor(req: NextRequest) {
    try {
      const body = await req.json();
      const validation = RegisterVendorSchema.safeParse(body);
      if (!validation.success) {
        throw new BadRequestError('Validation failed', validation.error.format());
      }

      const ipAddress = req.headers.get('x-forwarded-for') || undefined;
      const userAgent = req.headers.get('user-agent') || undefined;

      const result = await this.registerVendorUseCase.execute(validation.data, ipAddress, userAgent);
      return ApiResponse.success(result, 'Vendor registered successfully', 201);
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async login(req: NextRequest) {
    try {
      const body = await req.json();
      const validation = LoginSchema.safeParse(body);
      if (!validation.success) {
        throw new BadRequestError('Validation failed', validation.error.format());
      }

      const ipAddress = req.headers.get('x-forwarded-for') || undefined;
      const userAgent = req.headers.get('user-agent') || undefined;

      const result = await this.loginUseCase.execute(validation.data, ipAddress, userAgent);
      return ApiResponse.success(result, 'Logged in successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async logout(req: NextRequest) {
    try {
      const body = await req.json();
      const validation = RefreshTokenSchema.safeParse(body);
      if (!validation.success) {
        throw new BadRequestError('Validation failed', validation.error.format());
      }

      // Optional authentication check to retrieve userId for logs
      let userId: string | undefined;
      try {
        const userPayload = await AuthMiddleware.authenticate(req);
        userId = userPayload.userId;
      } catch {}

      const ipAddress = req.headers.get('x-forwarded-for') || undefined;
      const userAgent = req.headers.get('user-agent') || undefined;

      await this.logoutUseCase.execute(validation.data.refreshToken, userId, ipAddress, userAgent);
      return ApiResponse.success(null, 'Logged out successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async refresh(req: NextRequest) {
    try {
      const body = await req.json();
      const validation = RefreshTokenSchema.safeParse(body);
      if (!validation.success) {
        throw new BadRequestError('Validation failed', validation.error.format());
      }

      const result = await this.refreshTokenUseCase.execute(validation.data.refreshToken);
      return ApiResponse.success(result, 'Access token refreshed successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async getSession(req: NextRequest) {
    try {
      const userPayload = await AuthMiddleware.authenticate(req);
      return ApiResponse.success({ user: userPayload }, 'Session is valid');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async requestOtp(req: NextRequest) {
    try {
      const body = await req.json();
      const validation = RequestOtpSchema.safeParse(body);
      if (!validation.success) {
        throw new BadRequestError('Validation failed', validation.error.format());
      }
      const result = await this.requestOtpUseCase.execute(validation.data.phone_number);
      return ApiResponse.success(result, 'OTP sent successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async verifyOtp(req: NextRequest) {
    try {
      const body = await req.json();
      const validation = VerifyOtpSchema.safeParse(body);
      if (!validation.success) {
        throw new BadRequestError('Validation failed', validation.error.format());
      }
      const result = await this.verifyOtpUseCase.execute(
        validation.data.session_id,
        validation.data.code
      );
      return ApiResponse.success(result, 'OTP verified successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }
}
