import { NextResponse } from 'next/server';
import { LikeService } from './like.service';
import { verifyAuth } from '@/lib/auth';

export class LikeController {
  private likeService = new LikeService();

  async handleLike(request: Request, postId: string) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      if (!postId) {
        return NextResponse.json({ success: false, error: 'Post ID is required' }, { status: 400 });
      }

      const result = await this.likeService.likePost(postId, user.id);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error('[LikeController] handleLike error:', error);
      if (error?.message === 'Post not found') {
        return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
      }
      return NextResponse.json(
        { success: false, error: 'Internal Server Error', message: error?.message },
        { status: 500 }
      );
    }
  }

  async handleUnlike(request: Request, postId: string) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      if (!postId) {
        return NextResponse.json({ success: false, error: 'Post ID is required' }, { status: 400 });
      }

      const result = await this.likeService.unlikePost(postId, user.id);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error('[LikeController] handleUnlike error:', error);
      if (error?.message === 'Post not found') {
        return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
      }
      return NextResponse.json(
        { success: false, error: 'Internal Server Error', message: error?.message },
        { status: 500 }
      );
    }
  }

  async handleGetLikes(request: Request, postId: string) {
    try {
      if (!postId) {
        return NextResponse.json({ success: false, error: 'Post ID is required' }, { status: 400 });
      }

      const data = await this.likeService.getLikes(postId);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      console.error('[LikeController] handleGetLikes error:', error);
      if (error?.message === 'Post not found') {
        return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
      }
      return NextResponse.json(
        { success: false, error: 'Internal Server Error', message: error?.message },
        { status: 500 }
      );
    }
  }
}
