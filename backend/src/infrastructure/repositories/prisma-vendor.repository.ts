import { VendorRepository } from '../../domain/repositories/vendor.repository';
import { Vendor } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export class PrismaVendorRepository implements VendorRepository {
  async findById(id: string): Promise<Vendor | null> {
    return prisma.vendor.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByUserId(userId: string): Promise<Vendor | null> {
    return prisma.vendor.findFirst({
      where: { userId, deletedAt: null },
    });
  }

  async create(data: {
    userId: string;
    kycDocsUrl?: string;
    kycStatus?: string;
  }): Promise<Vendor> {
    return prisma.vendor.create({
      data: {
        userId: data.userId,
        kycDocsUrl: data.kycDocsUrl || '',
        kycStatus: data.kycStatus || 'pending',
      },
    });
  }

  async update(id: string, data: Partial<Vendor>): Promise<Vendor> {
    return prisma.vendor.update({
      where: { id },
      data,
    });
  }

  async deleteSoft(id: string, deletedBy: string): Promise<Vendor> {
    return prisma.vendor.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }
}
