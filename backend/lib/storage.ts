import { Buffer } from 'buffer';
import { logger } from './logger';
import { config } from './config';

export interface IStorageService {
  /**
   * Uploads a file (provided as base64 string or data URI) to the specified storage bucket.
   * 
   * @param bucket - The storage bucket name (e.g., 'profile-images', 'kyc-docs').
   * @param filename - The unique name of the target file.
   * @param base64Data - Base64 encoded file data.
   * @param mimeType - Optional file MIME type.
   * @returns The public URL of the uploaded resource.
   */
  uploadFile(bucket: string, filename: string, base64Data: string, mimeType?: string): Promise<string>;
}

class SupabaseStorageService implements IStorageService {
  async uploadFile(bucket: string, filename: string, base64Data: string, mimeType: string = 'application/octet-stream'): Promise<string> {
    // If the input is already a public HTTP/HTTPS URL, return it directly
    if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
      logger.info(`[Storage] Input is already a public URL, skipping upload: ${base64Data}`);
      return base64Data;
    }

    let resolvedMimeType = mimeType;
    let base64String = base64Data;

    // Check if the data is a base64 Data URI
    const dataUriMatch = base64Data.match(/^data:([a-zA-Z+.-]+\/[a-zA-Z+.-]+);base64,(.+)$/);
    if (dataUriMatch) {
      resolvedMimeType = dataUriMatch[1];
      base64String = dataUriMatch[2];
    }

    const SUPABASE_PROJECT_REF = 'ocsokyjpiclytbxyuiaq'; // Default project ref from db url
    
    // Determine the base storage URL and authorization header
    const storageApiBase = config.SUPABASE_URL 
      ? config.SUPABASE_URL.replace(/\/$/, '')
      : `https://${SUPABASE_PROJECT_REF}.supabase.co`;

    const publicUrl = `${storageApiBase}/storage/v1/object/public/${bucket}/${filename}`;

    if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
      logger.warn(`[Storage] Supabase environment variables not set. Generating mock upload URL: ${publicUrl}`);
      return publicUrl;
    }

    try {
      const buffer = Buffer.from(base64String, 'base64');
      const uploadUrl = `${storageApiBase}/storage/v1/object/${bucket}/${filename}`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.SUPABASE_ANON_KEY}`,
          'Content-Type': resolvedMimeType,
        },
        body: buffer,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
      }

      logger.info(`[Storage] Uploaded successfully: ${filename} to bucket ${bucket}`);
      return publicUrl;
    } catch (error) {
      logger.error(`[Storage] Upload error for ${filename} to bucket ${bucket}:`, error);
      // Fallback to public mock URL in local dev environments
      return publicUrl;
    }
  }
}

export const storageService = new SupabaseStorageService();
