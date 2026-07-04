import { Location } from '@prisma/client';

export interface LocationRepository {
  findById(id: string): Promise<Location | null>;
  findByBusinessId(businessId: string): Promise<Location[]>;
  create(data: {
    businessId: string;
    latitude: number;
    longitude: number;
    formattedAddress: string;
    city: string;
    state: string;
    pincode: string;
    area: string;
  }): Promise<Location>;
  update(id: string, data: Partial<Location>): Promise<Location>;
  deleteSoft(id: string, deletedBy: string): Promise<Location>;
}
