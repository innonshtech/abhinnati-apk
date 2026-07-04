import { User } from '@prisma/client';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: {
    phone: string;
    email?: string;
    passwordHash: string;
    name: string;
    role: string;
    language?: string;
  }): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  deleteSoft(id: string, deletedBy: string): Promise<User>;
}
