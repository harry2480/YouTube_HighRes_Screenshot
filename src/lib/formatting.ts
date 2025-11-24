/**
 * ファイル名に使用できない文字を置換する
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[\\/:*?"<>|]/g, '_');
}

/**
 * 秒数を HH-MM-SS 形式にフォーマットする
 */
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (h > 0) {
    return `${pad(h)}-${pad(m)}-${pad(s)}`;
  } else {
    return `${pad(m)}-${pad(s)}`;
  }
}

/**
 * スクリーンショットのファイル名を生成する
 */
export function generateFilename(title: string, currentTime: number, width: number, height: number): string {
  const safeTitle = sanitizeFilename(title);
  const timeStr = formatTime(currentTime);
  return `${safeTitle}_${timeStr}_${width}x${height}.png`;
}
