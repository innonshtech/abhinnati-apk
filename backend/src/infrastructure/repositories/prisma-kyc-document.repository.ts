import { KycDocumentRepository } from '../../domain/repositories/kyc-document.repository';
import { KycDocument } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export class PrismaKycDocumentRepository implements KycDocumentRepository {
  async findById(id: string): Promise<KycDocument | null> {
    return prisma.kycDocument.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByVendorId(vendorId: string): Promise<KycDocument[]> {
    return prisma.kycDocument.findMany({
      where: { vendorId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByVendorIdAndType(vendorId: string, documentType: string): Promise<KycDocument | null> {
    return prisma.kycDocument.findFirst({
      where: { vendorId, documentType, deletedAt: null },
    });
  }

  async upsert(data: {
    vendorId: string;
    documentType: string;
    documentUrl: string;
    status?: string;
  }): Promise<KycDocument> {
    const existing = await this.findByVendorIdAndType(data.vendorId, data.documentType);

    if (existing) {
      return prisma.kycDocument.update({
        where: { id: existing.id },
        data: {
          documentUrl: data.documentUrl,
          status: data.status || 'pending',
          rejectionReason: null, // clear rejection reason on resubmission
        },
      });
    }

    return prisma.kycDocument.create({
      data: {
        vendorId: data.vendorId,
        documentType: data.documentType,
        documentUrl: data.documentUrl,
        status: data.status || 'pending',
      },
    });
  }

  async updateStatus(id: string, status: string, rejectionReason?: string): Promise<KycDocument> {
    return prisma.kycDocument.update({
      where: { id },
      data: {
        status,
        rejectionReason: rejectionReason || null,
      },
    });
  }

  async deleteSoft(id: string, deletedBy: string): Promise<KycDocument> {
    return prisma.kycDocument.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }
}
