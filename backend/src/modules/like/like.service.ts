import { LikeRepository } from './like.repository';
import { prisma } from '@/lib/prisma';

export class LikeService {
  private likeRepository = new LikeRepository();

  async likePost(postId: string, userId: string) {
    // 1. Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      throw new Error('Post not found');
    }

    // 2. Check for duplicate like to make it idempotent and prevent double-likes
    const existingLike = await this.likeRepository.findLike(postId, userId);
    if (existingLike) {
      return { success: true, likes: post.likes, liked: true };
    }

    // 3. Atomically perform the like transaction
    const result = await this.likeRepository.createLike(postId, userId);
    return { success: true, likes: result.likesCount, liked: true };
  }

  async unlikePost(postId: string, userId: string) {
    // 1. Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      throw new Error('Post not found');
    }

    // 2. Verify like exists to make it idempotent and prevent errors on duplicate unlikes
    const existingLike = await this.likeRepository.findLike(postId, userId);
    if (!existingLike) {
      return { success: true, likes: post.likes, liked: false };
    }

    // 3. Atomically perform the unlike transaction
    const result = await this.likeRepository.deleteLike(postId, userId);
    return { success: true, likes: result.likesCount, liked: false };
  }

  async getLikes(postId: string) {
    // 1. Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      throw new Error('Post not found');
    }

    // 2. Fetch the user list
    const likes = await this.likeRepository.getLikesForPost(postId);
    return likes.map((l) => ({
      userId: l.user.id,
      name: l.user.name || 'Anonymous User',
    }));
  }
}
