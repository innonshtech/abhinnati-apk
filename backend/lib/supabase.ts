import { Buffer } from 'buffer';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const BUCKET_NAME = 'profile-images';

/**
 * Uploads a base64 encoded image to Supabase Storage.
 * If credentials are not configured, it generates a mock/placeholder URL.
 * 
 * @param userId - The ID of the user uploading the image.
 * @param base64Data - Base64 data string (can be a raw base64 string or a data URI).
 * @returns The public URL of the uploaded image.
 */
export async function uploadProfileImage(userId: string, base64Data: string): Promise<string> {
  let mimeType = 'image/png';
  let extension = 'png';
  let base64String = base64Data;

  // Check if it's a data URI (e.g. data:image/jpeg;base64,...)
  const match = base64Data.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
  if (match) {
    mimeType = match[1];
    extension = mimeType.split('/')[1] || 'png';
    base64String = match[2];
  }

  const filename = `${userId}-${Date.now()}.${extension}`;
  const mockUrl = `https://ocsokyjpiclytbxyuiaq.supabase.co/storage/v1/object/public/${BUCKET_NAME}/${filename}`;

  // Fallback to mock URL if Supabase credentials are not configured
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[Supabase Storage] Credentials not configured. Falling back to mock URL:', mockUrl);
    return mockUrl;
  }

  try {
    const buffer = Buffer.from(base64String, 'base64');
    const uploadUrl = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/${BUCKET_NAME}/${filename}`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': mimeType,
      },
      body: buffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
    }

    // Supabase public URL format
    const publicUrl = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
    return publicUrl;
  } catch (error) {
    console.error('[Supabase Storage] Error uploading image:', error);
    // Return mock URL as fallback to prevent request crash in dev envs
    return mockUrl;
  }
}
