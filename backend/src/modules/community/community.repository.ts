import { prisma } from '@/lib/prisma';

export class CommunityRepository {
  async findAreaById(id: string) {
    const area = await prisma.area.findUnique({
      where: { id },
    });
    if (area) return area;

    // Fallback for mock IDs
    const normalized = id.toLowerCase();
    if (normalized.includes('bandra') && normalized.includes('west')) {
      const matched = await prisma.area.findFirst({ where: { slug: 'bandra-west' } });
      if (matched) return matched;
    }
    if (normalized.includes('bandra') && normalized.includes('east')) {
      const matched = await prisma.area.findFirst({ where: { slug: 'bandra-east' } });
      if (matched) return matched;
    }
    if (normalized.includes('baner')) {
      const matched = await prisma.area.findFirst({ where: { slug: 'baner' } });
      if (matched) return matched;
    }
    if (normalized.startsWith('area-')) {
      const cleanSlug = id.replace('area-', '');
      const matched = await prisma.area.findFirst({ where: { slug: cleanSlug } });
      if (matched) return matched;
    }

    return prisma.area.findFirst();
  }

  async findAllApprovedVendors() {
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

  async countPostsByAreaId(areaId: string) {
    return prisma.post.count({
      where: { areaId },
    });
  }

  async findApprovedVendorsByAreaId(areaId: string, limit: number) {
    return prisma.vendor.findMany({
      where: {
        areaId,
        kycStatus: 'approved',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        services: true,
        reviews: true,
      },
    });
  }

  async findAllActiveAreasExcept(areaId: string) {
    return prisma.area.findMany({
      where: {
        isActive: true,
        id: { not: areaId },
      },
    });
  }

  async countApprovedVendorsByAreaId(areaId: string) {
    return prisma.vendor.count({
      where: {
        areaId,
        kycStatus: 'approved',
      },
    });
  }

  async findPostsByAreaId(areaId: string) {
    return prisma.post.findMany({
      where: { areaId },
      orderBy: { createdAt: 'desc' },
      include: {
        likedBy: {
          select: { userId: true },
        },
      },
    });
  }

  async findPostById(id: string) {
    return prisma.post.findUnique({
      where: { id },
    });
  }

  async createPost(data: any) {
    return prisma.post.create({
      data,
    });
  }

  async findCommentsByPostId(postId: string) {
    return prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createCommentAndIncrementCount(postId: string, commentData: any) {
    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          postId,
          authorId: commentData.authorId,
          authorName: commentData.authorName,
          content: commentData.content,
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);
    return comment;
  }

  async deletePost(id: string) {
    return prisma.post.delete({
      where: { id },
    });
  }
}
