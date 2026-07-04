import { Vendor } from '@prisma/client';

export interface VendorRepository {
  findById(id: string): Promise<Vendor | null>;
  findByUserId(userId: string): Promise<Vendor | null>;
  create(data: {
    userId: string;
    kycStatus?: string;
    kycDocsUrl?: string;
  }): Promise<Vendor>;
  update(id: string, data: Partial<Vendor>): Promise<Vendor>;
  deleteSoft(id: string, deletedBy: string): Promise<Vendor>;
}
