import { AuditLog } from '@prisma/client';

export interface AuditLogRepository {
  create(data: {
    userId?: string | null;
    action: string;
    entityName: string;
    entityId?: string | null;
    oldValues?: string | null;
    newValues?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): Promise<AuditLog>;
  findManyByUserId(userId: string): Promise<AuditLog[]>;
}
