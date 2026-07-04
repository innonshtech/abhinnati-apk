import { OtpSessionRepository } from '../../domain/repositories/otp-session.repository';
import { OtpSession } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export class PrismaOtpSessionRepository implements OtpSessionRepository {
  async findById(id: string): Promise<OtpSession | null> {
    return prisma.otpSession.findUnique({
      where: { id },
    });
  }

  async create(data: {
    phone: string;
    code: string;
    expiresAt: Date;
  }): Promise<OtpSession> {
    return prisma.otpSession.create({
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.otpSession.delete({
      where: { id },
    }).catch(() => {});
  }
}
