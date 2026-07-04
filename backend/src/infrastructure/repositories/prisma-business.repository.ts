import { BusinessRepository } from '../../domain/repositories/business.repository';
import { Business } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export class PrismaBusinessRepository implements BusinessRepository {
  async findById(id: string): Promise<Business | null> {
    return prisma.business.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByVendorId(vendorId: string): Promise<Business | null> {
    return prisma.business.findFirst({
      where: { vendorId, deletedAt: null },
    });
  }

  async create(data: {
    vendorId: string;
    nameMr: string;
    nameEn: string;
    descriptionMr: string;
    descriptionEn: string;
    logoUrl?: string;
    coverPhotoUrl?: string;
    whatsappNumber?: string;
    email?: string;
    serviceRadius?: string;
  }): Promise<Business> {
    return prisma.business.create({
      data: {
        vendorId: data.vendorId,
        nameMr: data.nameMr,
        nameEn: data.nameEn,
        descriptionMr: data.descriptionMr,
        descriptionEn: data.descriptionEn,
        logoUrl: data.logoUrl,
        coverPhotoUrl: data.coverPhotoUrl,
        whatsappNumber: data.whatsappNumber,
        email: data.email,
        serviceRadius: data.serviceRadius || '5 km',
      },
    });
  }

  async update(id: string, data: Partial<Business>): Promise<Business> {
    return prisma.business.update({
      where: { id },
      data,
    });
  }

  async deleteSoft(id: string, deletedBy: string): Promise<Business> {
    return prisma.business.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }
}
