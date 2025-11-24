import { logger } from '@/lib/logger';

export class CaptureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CaptureError';
  }
}

/**
 * 動画要素から高解像度のスクリーンショットを生成する
 */
export async function captureVideoFrame(video: HTMLVideoElement): Promise<string> {
  if (!video.videoWidth || !video.videoHeight) {
    throw new CaptureError('Video dimensions are not available.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new CaptureError('Failed to get canvas context.');
  }

  try {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 画質設定 (1.0 = 最高画質)
    return canvas.toDataURL('image/png', 1.0);
  } catch (error) {
    logger.error('Canvas draw error:', error);
    // Tainted canvas error (CORS)
    if (error instanceof Error && error.name === 'SecurityError') {
      throw new CaptureError('Cannot capture screenshot due to CORS restrictions (Tainted Canvas).');
    }
    throw error;
  }
}
