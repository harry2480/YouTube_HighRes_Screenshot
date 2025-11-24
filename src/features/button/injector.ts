import { createElement } from '@/lib/dom';
import { takeScreenshot } from '@/features/capture/action';
import { logger } from '@/lib/logger';
import './styles.scss';

const BUTTON_CLASS = 'yts-button';
const CAMERA_ICON_SVG = `
<svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
  <path d="M10,24 C10,25.1045695 10.8954305,26 12,26 L24,26 C25.1045695,26 26,25.1045695 26,24 L26,14 C26,12.8954305 25.1045695,12 24,12 L21,12 L20,10 L16,10 L15,12 L12,12 C10.8954305,12 10,12.8954305 10,14 L10,24 Z M18,23 C15.790861,23 14,21.209139 14,19 C14,16.790861 15.790861,15 18,15 C20.209139,15 22,16.790861 22,19 C22,21.209139 20.209139,23 18,23 Z M18,21 C19.1045695,21 20,20.1045695 20,19 C20,17.8954305 19.1045695,17 18,17 C16.8954305,17 16,17.8954305 16,19 C16,20.1045695 16.8954305,21 18,21 Z" fill="#fff"></path>
</svg>
`;

export function createScreenshotButton(): HTMLButtonElement {
  const button = createElement('button', {
    className: `${BUTTON_CLASS} ytp-button`,
    'aria-label': 'Take Screenshot',
    title: 'Take Screenshot (High-Res)',
  });
  
  button.innerHTML = CAMERA_ICON_SVG;

  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      button.classList.add(`${BUTTON_CLASS}--capturing`);
      await takeScreenshot();
    } catch (error) {
      alert('Failed to take screenshot. See console for details.');
    } finally {
      button.classList.remove(`${BUTTON_CLASS}--capturing`);
    }
  });

  return button;
}

export function injectButton(container: Element): void {
  if (container.querySelector(`.${BUTTON_CLASS}`)) {
    return; // Already injected
  }
  
  const button = createScreenshotButton();
  // 設定ボタンの左側、あるいは一番左に追加するなど位置調整が必要
  // 通常は .ytp-right-controls の先頭に追加すると左端（設定ボタンの左）に来る
  container.insertBefore(button, container.firstChild);
  logger.log('Button injected');
}
