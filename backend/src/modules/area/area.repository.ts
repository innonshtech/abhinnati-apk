import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class AreaRepository {
  async findMany(options?: {
    where?: Prisma.AreaWhereInput;
    orderBy?: Prisma.AreaOrderByWithRelationInput | Prisma.AreaOrderByWithRelationInput[];
    take?: number;
  }) {
    return prisma.area.findMany({
      where: options?.where,
      orderBy: options?.orderBy,
      take: options?.take,
      include: {
        aliases: true,
      },
    });
  }

  async findCandidates(matchQuery: string) {
    return prisma.area.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: matchQuery, mode: 'insensitive' } },
          { pincode: { startsWith: matchQuery } },
          {
            aliases: {
              some: {
                aliasName: { contains: matchQuery, mode: 'insensitive' },
              },
            },
          },
        ],
      },
      include: {
        aliases: true,
      },
    });
  }

  async findInBoundingBox(minLat: number, maxLat: number, minLng: number, maxLng: number) {
    return prisma.area.findMany({
      where: {
        isActive: true,
        latitude: { gte: minLat, lte: maxLat },
        longitude: { gte: minLng, lte: maxLng },
      },
      include: {
        aliases: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.area.findUnique({
      where: { id },
      include: {
        aliases: true,
      },
    });
  }

  async incrementSearchCount(id: string) {
    return prisma.area.update({
      where: { id },
      data: {
        searchCount: {
          increment: 1,
        },
      },
    });
  }
}
