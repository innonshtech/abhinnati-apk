import { BusinessHours } from '@prisma/client';

export interface BusinessHoursRepository {
  findByBusinessId(businessId: string): Promise<BusinessHours[]>;
  findByBusinessIdAndDay(businessId: string, dayOfWeek: number): Promise<BusinessHours | null>;
  upsert(data: {
    businessId: string;
    dayOfWeek: number;
    openTime?: string | null;
    closeTime?: string | null;
    isClosed?: boolean;
  }): Promise<BusinessHours>;
  deleteByBusinessId(businessId: string): Promise<void>;
}
