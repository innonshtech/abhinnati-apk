import { ServiceRepository } from '../../domain/repositories/service.repository';
import { VendorService } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export class PrismaServiceRepository implements ServiceRepository {
  async findById(id: string): Promise<VendorService | null> {
    return prisma.vendorService.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByBusinessId(businessId: string): Promise<VendorService[]> {
    return prisma.vendorService.findMany({
      where: { businessId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    businessId: string;
    nameMr: string;
    nameEn: string;
    price: number;
    durationMins: number;
    descriptionMr: string;
    descriptionEn: string;
    isActive?: boolean;
  }): Promise<VendorService> {
    return prisma.vendorService.create({
      data: {
        businessId: data.businessId,
        nameMr: data.nameMr,
        nameEn: data.nameEn,
        price: data.price,
        durationMins: data.durationMins,
        descriptionMr: data.descriptionMr,
        descriptionEn: data.descriptionEn,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(id: string, data: Partial<VendorService>): Promise<VendorService> {
    return prisma.vendorService.update({
      where: { id },
      data,
    });
  }

  async deleteSoft(id: string, deletedBy: string): Promise<VendorService> {
    return prisma.vendorService.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }
}
