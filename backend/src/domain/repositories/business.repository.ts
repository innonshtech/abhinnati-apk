import { Business } from '@prisma/client';

export interface BusinessRepository {
  findById(id: string): Promise<Business | null>;
  findByVendorId(vendorId: string): Promise<Business | null>;
  create(data: {
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
  }): Promise<Business>;
  update(id: string, data: Partial<Business>): Promise<Business>;
  deleteSoft(id: string, deletedBy: string): Promise<Business>;
}
