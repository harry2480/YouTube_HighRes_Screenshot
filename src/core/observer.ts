import { injectButton } from '@/features/button/injector';
import { logger } from '@/lib/logger';

let observer: MutationObserver | null = null;
let debounceTimer: number | null = null;

const TARGET_SELECTOR = '.ytp-right-controls';

function handleMutations() {
  if (debounceTimer) {
    cancelAnimationFrame(debounceTimer);
  }

  debounceTimer = requestAnimationFrame(() => {
    const controls = document.querySelector(TARGET_SELECTOR);
    if (controls) {
      injectButton(controls);
    }
    debounceTimer = null;
  });
}

export function startObserver() {
  if (observer) return;

  logger.log('Starting observer...');

  observer = new MutationObserver(handleMutations);
  
  // body全体を監視して、コントロールバーの出現を待つ
  // 範囲を絞れるなら絞ったほうが良いが、YouTubeの構造変更に弱くなるため
  // 比較的上位の要素を監視する。
  // ただし、subtree: true は重いので注意が必要。
  // ここでは ytd-app や #content などをターゲットにするのが一般的だが、
  // 確実性を取って body にする。ただし childList のみにする。
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // 初回実行
  handleMutations();

  // SPA遷移対応
  window.addEventListener('yt-navigate-finish', () => {
    logger.log('Navigation finished, re-checking...');
    handleMutations();
  });
}

export function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}
