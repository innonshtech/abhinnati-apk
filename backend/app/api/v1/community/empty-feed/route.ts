import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    return NextResponse.json({
      success: true,
      message: 'No posts yet',
      data: []
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch empty feed' }, { status: 500 });
  }
}
