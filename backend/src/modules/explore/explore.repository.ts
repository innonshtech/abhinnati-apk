import { prisma } from '@/lib/prisma';

export class ExploreRepository {
  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        activeArea: true,
      },
    });
  }

  async findAreaById(id: string) {
    return prisma.area.findUnique({
      where: { id },
    });
  }

  async findAllCategories() {
    return prisma.category.findMany({
      orderBy: { slug: 'asc' },
    });
  }

  async countVendorsInCategory(categorySlug: string) {
    return prisma.vendor.count({
      where: {
        categorySlug,
        kycStatus: 'approved',
      },
    });
  }

  async findApprovedVendors() {
    return prisma.vendor.findMany({
      where: {
        kycStatus: 'approved',
      },
      include: {
        services: true,
        reviews: true,
      },
    });
  }

  async findVendorById(id: string) {
    return prisma.vendor.findUnique({
      where: { id },
      include: {
        services: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                displayName: true,
                profileImage: true,
              },
            },
          },
        },
        user: {
          select: {
            phone: true,
            fullName: true,
            displayName: true,
          },
        },
      },
    });
  }

  async updateUserArea(userId: string, areaId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { activeAreaId: areaId },
      include: { activeArea: true },
    });
  }
}
