import { VendorService } from '@prisma/client';

export interface ServiceRepository {
  findById(id: string): Promise<VendorService | null>;
  findByBusinessId(businessId: string): Promise<VendorService[]>;
  create(data: {
    businessId: string;
    nameMr: string;
    nameEn: string;
    price: number;
    durationMins: number;
    descriptionMr: string;
    descriptionEn: string;
    isActive?: boolean;
  }): Promise<VendorService>;
  update(id: string, data: Partial<VendorService>): Promise<VendorService>;
  deleteSoft(id: string, deletedBy: string): Promise<VendorService>;
}
