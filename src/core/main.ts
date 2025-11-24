import { startObserver } from './observer';
import { initShortcuts } from '@/features/shortcuts/handler';
import { takeScreenshot } from '@/features/capture/action';
import { logger } from '@/lib/logger';

logger.log('Extension loaded');
startObserver();
initShortcuts();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message.type === 'TAKE_SCREENSHOT') {
    takeScreenshot()
      .then(() => sendResponse({ success: true }))
      .catch((error) => {
        logger.error('Screenshot failed via popup', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Will respond asynchronously
  }
});
