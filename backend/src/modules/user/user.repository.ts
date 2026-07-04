import { prisma } from '@/lib/prisma';

export class UserRepository {
  async findAreaById(areaId: string) {
    return prisma.area.findUnique({
      where: { id: areaId },
    });
  }

  async createArea(data: any) {
    return prisma.area.create({
      data,
    });
  }

  async updateUser(userId: string, data: any) {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async updateOnboardingProfile(
    userId: string,
    data: { fullName: string; displayName: string; profileImage?: string; onboardingStep: string }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
