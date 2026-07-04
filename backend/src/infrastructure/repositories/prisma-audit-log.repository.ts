import { AuditLogRepository } from '../../domain/repositories/audit-log.repository';
import { AuditLog } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export class PrismaAuditLogRepository implements AuditLogRepository {
  async create(data: {
    userId?: string | null;
    action: string;
    entityName: string;
    entityId?: string | null;
    oldValues?: string | null;
    newValues?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): Promise<AuditLog> {
    return prisma.auditLog.create({
      data: {
        userId: data.userId || null,
        action: data.action,
        entityName: data.entityName,
        entityId: data.entityId || null,
        oldValues: data.oldValues || null,
        newValues: data.newValues || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    });
  }

  async findManyByUserId(userId: string): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
