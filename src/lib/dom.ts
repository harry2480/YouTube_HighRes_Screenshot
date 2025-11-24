/**
 * 型安全なDOM要素生成ヘルパー
 * @param tag HTMLタグ名
 * @param attrs 属性オブジェクト (className, onclick等を含む)
 * @param children 子要素リスト
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number | boolean | EventListener | Partial<CSSStyleDeclaration>> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      // イベントリスナーとして登録
      const eventName = key.substring(2).toLowerCase();
      element.addEventListener(eventName, value as EventListener);
    } else if (key === 'className') {
      element.className = String(value);
    } else {
      // その他の属性
      if (value === true) {
        element.setAttribute(key, '');
      } else if (value !== false && value != null) {
        element.setAttribute(key, String(value));
      }
    }
  }

  for (const child of children) {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  }

  return element;
}
