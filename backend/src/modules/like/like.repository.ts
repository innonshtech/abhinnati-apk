import { prisma } from '@/lib/prisma';

export class LikeRepository {
  async findLike(postId: string, userId: string) {
    return prisma.userPostLike.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
  }

  async createLike(postId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Create the user like record
      const like = await tx.userPostLike.create({
        data: {
          postId,
          userId,
        },
      });

      // 2. Increment the likes counter on the post
      const post = await tx.post.update({
        where: { id: postId },
        data: {
          likes: {
            increment: 1,
          },
        },
      });

      return { like, likesCount: post.likes };
    });
  }

  async deleteLike(postId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Delete the user like record
      await tx.userPostLike.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      // 2. Decrement the likes counter on the post
      const post = await tx.post.update({
        where: { id: postId },
        data: {
          likes: {
            decrement: 1,
          },
        },
      });

      return { likesCount: post.likes };
    });
  }

  async getLikesForPost(postId: string) {
    return prisma.userPostLike.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });
  }
}
