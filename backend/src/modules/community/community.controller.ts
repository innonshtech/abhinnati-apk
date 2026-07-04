import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { CommunityService } from './community.service';
import { createPostSchema, createCommentSchema } from './community.validation';

export class CommunityController {
  private communityService = new CommunityService();

  async handleFeed(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const areaId = searchParams.get('area_id');

      if (!areaId) {
        return NextResponse.json({ error: 'area_id query parameter is required' }, { status: 400 });
      }

      const data = await this.communityService.getFeed(areaId);
      return NextResponse.json(data);
    } catch (error: any) {
      console.error('[CommunityController] handleFeed error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async handleEmptyFeed(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const areaId = searchParams.get('area_id') || user.activeAreaId;

      if (!areaId) {
        return NextResponse.json({ error: 'area_id query parameter or user activeAreaId is required' }, { status: 400 });
      }

      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '10', 10);

      const data = await this.communityService.getEmptyFeed(areaId, page, limit);
      return NextResponse.json(data);
    } catch (error: any) {
      console.error('[CommunityController] handleEmptyFeed error:', error);
      const status = error?.message?.includes('not found') ? 404 : 500;
      return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status });
    }
  }

  async handleCreatePost(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const result = createPostSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ error: 'Invalid post data', details: result.error.issues }, { status: 400 });
      }

      const data = await this.communityService.createPost(user.id, user.name, result.data);
      return NextResponse.json({
        ...data,
        likedBy: [],
      });
    } catch (error: any) {
      console.error('[CommunityController] handleCreatePost error:', error);
      return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
  }

  async handleGetComments(request: Request, postId: string) {
    try {
      const data = await this.communityService.getComments(postId);
      return NextResponse.json(data);
    } catch (error: any) {
      console.error('[CommunityController] handleGetComments error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async handleCreateComment(request: Request, postId: string) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const result = createCommentSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ error: 'content text is required', details: result.error.issues }, { status: 400 });
      }

      const data = await this.communityService.createComment(user.id, user.name, postId, result.data);
      return NextResponse.json(data);
    } catch (error: any) {
      console.error('[CommunityController] handleCreateComment error:', error);
      const status = error?.message?.includes('not found') ? 404 : 500;
      return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status });
    }
  }

  async handleDeletePost(request: Request, postId: string) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      await this.communityService.deletePost(user.id, user.role, postId);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error('[CommunityController] handleDeletePost error:', error);
      const status = error?.message?.includes('Forbidden')
        ? 403
        : error?.message?.includes('not found')
        ? 404
        : 500;
      return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status });
    }
  }
}
