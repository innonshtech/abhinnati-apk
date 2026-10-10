import { NextResponse } from 'next/server';

import { prisma } from '../../../../../lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const areaId = searchParams.get('area_id');

  try {
    const posts = await prisma.post.findMany({
      where: areaId ? { areaId } : {},
      orderBy: { createdAt: 'desc' }
    });

    const mappedPosts = posts.map(p => ({
      id: p.id,
      authorId: p.authorId,
      authorName: p.authorName,
      areaId: p.areaId,
      tag: p.tag,
      title_mr: p.titleMr,
      title_en: p.titleEn,
      content_mr: p.contentMr,
      content_en: p.contentEn,
      likes: p.likes,
      likedBy: p.likedBy ? JSON.parse(p.likedBy) : [],
      commentsCount: p.commentsCount,
      createdAt: p.createdAt.toISOString()
    }));

    return NextResponse.json({ success: true, data: mappedPosts });
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch feed' }, { status: 500 });
  }
}
