import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { AuditLogRepository } from '../../../domain/repositories/audit-log.repository';

export class LogoutUseCase {
  constructor(
    private tokenRepo: RefreshTokenRepository,
    private auditRepo: AuditLogRepository
  ) {}

  async execute(refreshToken: string, userId?: string, ipAddress?: string, userAgent?: string) {
    // 1. Delete refresh token from database
    await this.tokenRepo.deleteByToken(refreshToken);

    // 2. Audit log
    if (userId) {
      await this.auditRepo.create({
        userId,
        action: 'LOGOUT',
        entityName: 'User',
        entityId: userId,
        ipAddress,
        userAgent,
      });
    }
  }
}
