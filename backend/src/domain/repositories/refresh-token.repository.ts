import { RefreshToken } from '@prisma/client';

export interface RefreshTokenRepository {
  findByToken(token: string): Promise<RefreshToken | null>;
  create(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }): Promise<RefreshToken>;
  deleteByToken(token: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}
