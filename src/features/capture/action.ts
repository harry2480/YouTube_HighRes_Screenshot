import { captureVideoFrame } from './canvas';
import { downloadImage } from './download';
import { generateFilename } from '@/lib/formatting';
import { logger } from '@/lib/logger';

export async function takeScreenshot(): Promise<void> {
  const video = document.querySelector<HTMLVideoElement>('video.html5-main-video');
  if (!video) {
    logger.error('Video element not found');
    return;
  }

  try {
    // 視覚的フィードバックのためにボタンの状態を変えたいが、
    // ここは純粋なロジックのみにするか、イベントを発火するか。
    // 簡易的に、ボタンのクラス操作は呼び出し元で行うか、
    // あるいはグローバルなイベントバスを使うのが理想だが、
    // ここではシンプルに実行のみ行う。
    
    const dataUrl = await captureVideoFrame(video);
    
    const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer') 
      || document.querySelector('#title h1 yt-formatted-string');
    const title = titleElement?.textContent?.trim() || 'YouTube_Video';
    
    const filename = generateFilename(
      title, 
      video.currentTime, 
      video.videoWidth, 
      video.videoHeight
    );
    
    downloadImage(dataUrl, filename);
    logger.log(`Screenshot saved: ${filename}`);
    
  } catch (error) {
    logger.error('Screenshot failed:', error);
    throw error; // 呼び出し元でハンドリングさせる
  }
}
