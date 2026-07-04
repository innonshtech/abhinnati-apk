import { UserRepository } from '../../../domain/repositories/user.repository';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { AuditLogRepository } from '../../../domain/repositories/audit-log.repository';
import { LoginRequest } from '../../dtos/auth.dto';
import { PasswordService } from '../../../infrastructure/security/password.service';
import { JwtService } from '../../../infrastructure/security/jwt.service';

export class LoginUseCase {
  constructor(
    private userRepo: UserRepository,
    private tokenRepo: RefreshTokenRepository,
    private auditRepo: AuditLogRepository
  ) {}

  async execute(dto: LoginRequest, ipAddress?: string, userAgent?: string) {
    // 1. Fetch user by phone
    const user = await this.userRepo.findByPhone(dto.phone);
    if (!user) {
      throw new Error('Invalid phone number or password');
    }

    // 2. Validate password hashes
    const passwordMatch = await PasswordService.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new Error('Invalid phone number or password');
    }

    // 3. Log audit action
    await this.auditRepo.create({
      userId: user.id,
      action: 'LOGIN',
      entityName: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    // 4. Issue access and refresh tokens
    const tokenPayload = {
      userId: user.id,
      phone: user.phone,
      role: user.role,
    };

    const accessToken = JwtService.signAccessToken(tokenPayload);
    const refreshTokenString = JwtService.signRefreshToken(tokenPayload);

    // 5. Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

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
