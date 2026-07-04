import { BusinessHoursRepository } from '../../domain/repositories/business-hours.repository';
import { BusinessHours } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export class PrismaBusinessHoursRepository implements BusinessHoursRepository {
  async findByBusinessId(businessId: string): Promise<BusinessHours[]> {
    return prisma.businessHours.findMany({
      where: { businessId, deletedAt: null },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async findByBusinessIdAndDay(businessId: string, dayOfWeek: number): Promise<BusinessHours | null> {
    return prisma.businessHours.findFirst({
      where: { businessId, dayOfWeek, deletedAt: null },
    });
  }

  async upsert(data: {
    businessId: string;
    dayOfWeek: number;
    openTime?: string | null;
    closeTime?: string | null;
    isClosed?: boolean;
  }): Promise<BusinessHours> {
    const existing = await this.findByBusinessIdAndDay(data.businessId, data.dayOfWeek);

    if (existing) {
      return prisma.businessHours.update({
        where: { id: existing.id },
        data: {
          openTime: data.openTime,
          closeTime: data.closeTime,
          isClosed: data.isClosed ?? false,
        },
      });
    }

    return prisma.businessHours.create({
      data: {
        businessId: data.businessId,
        dayOfWeek: data.dayOfWeek,
        openTime: data.openTime || null,
        closeTime: data.closeTime || null,
        isClosed: data.isClosed ?? false,
      },
    });
  }

  async deleteByBusinessId(businessId: string): Promise<void> {
    await prisma.businessHours.deleteMany({
      where: { businessId },
    });
  }
}
