import { NextResponse } from 'next/server';

import { prisma } from '../../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { authorId, authorName, areaId, tag, title_mr, title_en, content_mr, content_en } = body;

    const newPost = await prisma.post.create({
      data: {
        authorId: authorId || 'resident-anon',
        authorName: authorName || 'Anonymous',
        areaId: areaId || 'area-kothrud',
        tag: tag || 'community',
        titleMr: title_mr || '',
        titleEn: title_en || '',
        contentMr: content_mr || '',
        contentEn: content_en || '',
        likes: 0,
        likedBy: '[]',
        commentsCount: 0
      }
    });

    const mappedPost = {
      id: newPost.id,
      authorId: newPost.authorId,
      authorName: newPost.authorName,
      areaId: newPost.areaId,
      tag: newPost.tag,
      title_mr: newPost.titleMr,
      title_en: newPost.titleEn,
      content_mr: newPost.contentMr,
      content_en: newPost.contentEn,
      likes: newPost.likes,
      likedBy: [],
      commentsCount: newPost.commentsCount,
      createdAt: newPost.createdAt.toISOString()
    };

    return NextResponse.json({ success: true, data: mappedPost });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ success: false, error: 'Failed to create post' }, { status: 500 });
  }
}
