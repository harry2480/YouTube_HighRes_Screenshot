
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('screenshot-btn') as HTMLButtonElement;
  const status = document.getElementById('status') as HTMLDivElement;

  if (!btn) return;

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    status.textContent = 'Capturing...';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab?.id) {
        throw new Error('No active tab found');
      }

      // YouTubeページかどうかチェック（簡易的）
      if (!tab.url?.includes('youtube.com/watch')) {
        status.textContent = 'Not a YouTube video page';
        btn.disabled = false;
        return;
      }

      await chrome.tabs.sendMessage(tab.id, { type: 'TAKE_SCREENSHOT' });
      status.textContent = 'Done!';
      
      // 少し待ってからリセット
      setTimeout(() => {
        status.textContent = '';
        btn.disabled = false;
      }, 2000);

    } catch (error) {
      console.error(error);
      status.textContent = 'Error occurred';
      btn.disabled = false;
    }
  });
});
