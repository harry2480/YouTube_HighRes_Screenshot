/**
 * DataURLを画像ファイルとしてダウンロードさせる
 */
export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  // クリーンアップ
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
}
