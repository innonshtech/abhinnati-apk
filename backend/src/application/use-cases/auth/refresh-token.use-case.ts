import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { JwtService } from '../../../infrastructure/security/jwt.service';

export class RefreshTokenUseCase {
  constructor(
    private tokenRepo: RefreshTokenRepository,
    private userRepo: UserRepository
  ) {}

  async execute(refreshTokenString: string) {
    // 1. Find token in DB
    const savedToken = await this.tokenRepo.findByToken(refreshTokenString);
    if (!savedToken) {
      throw new Error('Refresh token not found or already revoked');
    }

    // 2. Check expiry
    if (new Date() > savedToken.expiresAt) {
      await this.tokenRepo.deleteByToken(refreshTokenString);
      throw new Error('Refresh token expired');
    }

    // 3. Verify JWT signature
    const payload = JwtService.verifyToken(refreshTokenString);
    if (!payload || payload.userId !== savedToken.userId) {
      throw new Error('Invalid refresh token signature');
    }

    // 4. Fetch User
    const user = await this.userRepo.findById(savedToken.userId);
    if (!user || !user.isActive) {
      throw new Error('User inactive or not found');
    }

    // 5. Generate new access token
    const tokenPayload = {
      userId: user.id,
      phone: user.phone,
      role: user.role,
    };

    const accessToken = JwtService.signAccessToken(tokenPayload);

    return {
      accessToken,
    };
  }
}
