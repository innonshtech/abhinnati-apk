export type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'failed';

export interface KYCFile {
  documentType: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadProgress: number;
  uploadStatus: UploadStatus;
  uploadedAt?: string;
  previewUri?: string;
  fileData?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
];

export const fileUploadService = {
  /**
   * Validates file size and file formats
   */
  validateFile: (fileName: string, mimeType: string, fileSize: number): { valid: boolean; error?: string } => {
    // Format check
    if (!SUPPORTED_MIME_TYPES.includes(mimeType.toLowerCase())) {
      return {
        valid: false,
        error: 'Unsupported File Format. Please upload a PDF, JPG, JPEG, or PNG file.'
      };
    }

    // Size check
    if (fileSize > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'File Too Large. Maximum allowed size is 10 MB.'
      };
    }

    return { valid: true };
  },

  /**
   * Simulated image compression
   */
  compressImage: async (file: KYCFile): Promise<KYCFile> => {
    if (file.mimeType.startsWith('image/')) {
      // Simulate 40% size reduction on images
      const compressedSize = Math.round(file.fileSize * 0.6);
      return {
        ...file,
        fileSize: compressedSize,
        fileName: file.fileName.replace(/(\.[\w\d]+)$/i, '_compressed$1'),
      };
    }
    // PDF files should not be compressed
    return file;
  },

  /**
   * Mock permission request simulator
   */
  requestPermission: async (type: 'camera' | 'gallery'): Promise<'granted' | 'denied'> => {
    return new Promise((resolve) => {
      // In development simulation, it resolves with 'granted'.
      // UI overlays will handle developer mock settings toggle if needed.
      setTimeout(() => {
        resolve('granted');
      }, 500);
    });
  },

  /**
   * Simulates network upload with progress callbacks
   */
  startUpload: (
    file: KYCFile,
    onProgress: (progress: number) => void,
    onComplete: (updatedFile: KYCFile) => void,
    onFail: (error: string) => void
  ) => {
    let progress = 0;
    let isCancelled = false;

    const interval = setInterval(() => {
      if (isCancelled) return;

      // Increment progress in random steps (between 5% and 20%)
      progress += Math.floor(Math.random() * 15) + 5;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        onProgress(100);
        
        // Simulating mock server success state
        onComplete({
          ...file,
          uploadProgress: 100,
          uploadStatus: 'uploaded',
          uploadedAt: new Date().toISOString(),
        });
      } else {
        onProgress(progress);
      }
    }, 200);

    return {
      cancel: () => {
        isCancelled = true;
        clearInterval(interval);
      }
    };
  }
};
