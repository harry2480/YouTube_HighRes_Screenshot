import { takeScreenshot } from '@/features/capture/action';
import { logger } from '@/lib/logger';

export function initShortcuts() {
  window.addEventListener('keydown', async (e) => {
    // 入力フォーム等では無効化
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable) {
      return;
    }
    
    // S key (case insensitive)
    if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      logger.log('Shortcut triggered: S');
      
      // ボタンにアニメーションを適用するために検索
      const button = document.querySelector('.yts-button');
      if (button) {
        button.classList.add('yts-button--capturing');
      }

      try {
        await takeScreenshot();
      } catch (error) {
        // エラーは takeScreenshot 内でログ出力済み
      } finally {
        if (button) {
          button.classList.remove('yts-button--capturing');
        }
      }
    }
  });
}
