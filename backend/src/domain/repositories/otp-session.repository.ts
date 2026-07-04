import { OtpSession } from '@prisma/client';

export interface OtpSessionRepository {
  findById(id: string): Promise<OtpSession | null>;
  create(data: {
    phone: string;
    code: string;
    expiresAt: Date;
  }): Promise<OtpSession>;
  delete(id: string): Promise<void>;
}
