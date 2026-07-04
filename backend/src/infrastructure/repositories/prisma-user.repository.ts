import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { phone, deletedAt: null },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async create(data: {
    phone: string;
    email?: string;
    passwordHash: string;
    name: string;
    role: string;
    language?: string;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        phone: data.phone,
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role,
        language: data.language || 'mr',
      },
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteSoft(id: string, deletedBy: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }
}
