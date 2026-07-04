import { UserRepository } from '../../../domain/repositories/user.repository';
import { VendorRepository } from '../../../domain/repositories/vendor.repository';
import { BusinessRepository } from '../../../domain/repositories/business.repository';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { AuditLogRepository } from '../../../domain/repositories/audit-log.repository';
import { RegisterVendorRequest } from '../../dtos/auth.dto';
import { PasswordService } from '../../../infrastructure/security/password.service';
import { JwtService } from '../../../infrastructure/security/jwt.service';

export class RegisterVendorUseCase {
  constructor(
    private userRepo: UserRepository,
    private vendorRepo: VendorRepository,
    private businessRepo: BusinessRepository,
    private tokenRepo: RefreshTokenRepository,
    private auditRepo: AuditLogRepository
  ) {}

  async execute(dto: RegisterVendorRequest, ipAddress?: string, userAgent?: string) {
    // 1. Check if user already exists
    const existingUser = await this.userRepo.findByPhone(dto.phone);
    if (existingUser) {
      throw new Error('User with this phone number already exists');
    }

    if (dto.email) {
      const existingEmail = await this.userRepo.findByEmail(dto.email);
      if (existingEmail) {
        throw new Error('User with this email already exists');
      }
    }

    // 2. Hash password
    const passwordHash = await PasswordService.hash(dto.password);

    // 3. Create User record with role 'vendor'
    const user = await this.userRepo.create({
      phone: dto.phone,
      email: dto.email || undefined,
      passwordHash,
      name: dto.name,
      role: 'vendor',
    });

    // 4. Create Vendor record
    const vendor = await this.vendorRepo.create({
      userId: user.id,
      kycDocsUrl: dto.kycDocsUrl || undefined,
      kycStatus: 'pending',
    });

    // 5. Create Business record linked to vendor
    const business = await this.businessRepo.create({
      vendorId: vendor.id,
      nameMr: dto.businessNameMr,
      nameEn: dto.businessNameEn,
      descriptionMr: dto.descriptionMr,
      descriptionEn: dto.descriptionEn,
      whatsappNumber: dto.phone,
      email: dto.email || undefined,
      serviceRadius: '5 km',
    });

    // 6. Log transaction audit log
    await this.auditRepo.create({
      userId: user.id,
      action: 'REGISTER_VENDOR',
      entityName: 'User',
      entityId: user.id,
      newValues: JSON.stringify({ userId: user.id, vendorId: vendor.id, businessId: business.id }),
      ipAddress,
      userAgent,
    });

    // 7. Generate JWT access and refresh tokens
    const tokenPayload = {
      userId: user.id,
      phone: user.phone,
      role: user.role,
    };

    const accessToken = JwtService.signAccessToken(tokenPayload);
    const refreshTokenString = JwtService.signRefreshToken(tokenPayload);

    // 8. Save refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const refreshToken = await this.tokenRepo.create({
      token: refreshTokenString,
      userId: user.id,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        language: user.language,
      },
      tokens: {
        accessToken,
        refreshToken: refreshToken.token,
      },
    };
  }
}
