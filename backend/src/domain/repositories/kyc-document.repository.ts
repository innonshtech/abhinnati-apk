import { KycDocument } from '@prisma/client';

export interface KycDocumentRepository {
  findById(id: string): Promise<KycDocument | null>;
  findByVendorId(vendorId: string): Promise<KycDocument[]>;
  findByVendorIdAndType(vendorId: string, documentType: string): Promise<KycDocument | null>;
  upsert(data: {
    vendorId: string;
    documentType: string;
    documentUrl: string;
    status?: string;
  }): Promise<KycDocument>;
  updateStatus(id: string, status: string, rejectionReason?: string): Promise<KycDocument>;
  deleteSoft(id: string, deletedBy: string): Promise<KycDocument>;
}
