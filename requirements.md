# YouTube High-Res Screenshot Extension 要件定義書 (技術詳細確定版)

文書バージョン: 3.1 (Tech Stack Finalized)  
作成日: 2025/11/24  
最終更新: 2025/11/24  
作成者: Project Lead

## 1. 概要

### 1.1. プロジェクト名

YouTube High-Res Screenshot Extension

### 1.2. プロジェクトの目的

YouTube動画視聴において、ユーザーが再生中の動画の **「動画本来の最高解像度（Source Resolution）」** を維持したまま、UI要素を含まないクリーンな静止画として保存することを可能にする。

### 1.3. 開発方針

**「Zero Runtime Dependencies」** を掲げ、UIフレームワーク（React/Vue）を使用しない軽量かつ高速な実装を行う。開発環境には **Vite + TypeScript** のモダンな構成を採用し、保守性と開発体験（DX）を最大化する。

## 2. 機能要件 (FR)

### FR1: DOM検出とUI注入 (Injection)

- **FR1.1 ターゲット要素:**
  - 動画本体: `video.html5-main-video` (ページ内に複数ある場合は可視状態のものを優先)
  - ボタン挿入先: `.ytp-right-controls` (コントロールバー右側エリア)
- **FR1.2 動的監視 (SPA対応):**
  - `MutationObserver` を使用し、DOMの変化を監視する。
  - `requestAnimationFrame` 等を用いた **Debounce（間引き処理）** を実装し、監視負荷を最小限に抑える。
  - URL遷移時（`yt-navigate-finish` イベント）にも再注入ロジックをトリガーする。
- **FR1.3 ボタン実装:**
  - YouTubeネイティブの `.ytp-button` クラスを継承し、違和感のないデザインとする。
  - アイコンは外部リクエストを発生させない **Inline SVG** として実装する。

### FR2: 画像処理 (Core Logic)

- **FR2.1 解像度取得:**
  - `videoElement.videoWidth` / `videoElement.videoHeight` を使用する。
  - ※ `clientWidth`（表示サイズ）は使用禁止。
- **FR2.2 キャンバス描画:**
  - `document.createElement('canvas')` でオフスクリーンキャンバスを生成。
  - `CanvasRenderingContext2D.drawImage()` メソッドを使用。
- **FR2.3 エラーハンドリング:**
  - CORS制限（Tainted Canvas）による `SecurityError` を `try-catch` で捕捉し、ユーザーにはトースト通知等で失敗を伝える。

### FR3: ファイル出力

- **FR3.1 ダウンロード実行:**
  - `chrome.downloads` APIは使用せず、`<a>` タグ生成方式（Anchor Click Method）を採用する。これにより不要な権限要求（"downloads" permission）を回避する。
- **FR3.2 ファイル名生成:**
  - フォーマット: `[Title]_[Time]_[WxH].png`
  - タイトル取得: `h1.ytd-video-primary-info-renderer` 等から取得し、ファイル名禁止文字（`\/:*?"<>|`）を `_` に置換する。

## 3. 技術スタック要件 (Technical Stack)

### 3.1. 開発環境・ビルドツール

| カテゴリ | 選定技術 | バージョン要件 | 理由 |
| :--- | :--- | :--- | :--- |
| **Build Tool** | **Vite** | ^5.0.0 | 高速なHMRとビルドパフォーマンス。 |
| **Extension Plugin** | **@crxjs/vite-plugin** | ^2.0.0 (beta) | `manifest.json` をエントリーポイントとした自動リロード環境の構築。 |
| **Linter** | **ESLint** | ^8.50.0 | コード品質の均質化。 |
| **Formatter** | **Prettier** | ^3.0.0 | コードスタイルの統一。 |
| **Test Runner** | **Vitest** | Latest | ユーティリティ関数（ファイル名生成等）の単体テスト用。 |

### 3.2. プログラミング言語詳細 (TypeScript)

**TypeScript (^5.3.0)** を全面的に採用し、以下の運用ルールを適用する。

- **設定 (`tsconfig.json`):**
  - `"strict": true`: Null安全性と暗黙の `any` を禁止。
  - `"target": "ES2022"`: モダンブラウザ向けに出力（Top-level await等は使用しないが、新しい構文を許容）。
  - `"moduleResolution": "Bundler"`: Viteに最適化。
- **型定義方針:**
  - DOM要素の取得時は、ジェネリクスを用いて型を明示する。
  - 例: `document.querySelector<HTMLVideoElement>('video')`
  - YouTube独自のDOMプロパティ（存在する場合）については、`src/types/youtube.d.ts` でインターフェース定義を行う。
- **実装スタイル:**
  - **クラスベース禁止:** 不要なボイラープレートを避けるため、**関数型アプローチ**（Functional Approach）を採用する。状態管理が必要な場合のみクロージャまたは単一のStateオブジェクトを使用する。

### 3.3. ランタイムライブラリ (Runtime Dependencies)

- **Zero Dependencies Policy:**
  - React, Vue, jQuery, Lodash 等のライブラリは **一切導入しない**。
  - DOM操作は標準APIのラッパー関数（Helper）を自作して対応する。
  - CSSはSCSS（Dart Sass）でコンパイルし、バンドルサイズを数KB単位に抑える。

## 4. プロジェクト構成とディレクトリ構造

機能単位ではなく **「責務単位」** で分離し、再利用性と可読性を高める構造とする。

```text
root/
├── public/
│   └── icons/             # manifest用アイコン
├── src/
│   ├── features/          # 機能ロジック（ビジネスロジック）
│   │   ├── button/        # ボタンUI関連
│   │   │   ├── injector.ts  # DOMへの注入・重複チェックロジック
│   │   │   └── styles.scss  # ボタン固有のBEMスタイル (.yts-button)
│   │   ├── capture/       # スクリーンショット機能
│   │   │   ├── canvas.ts    # 描画処理 (pure function)
│   │   │   └── download.ts  # ダウンロード処理 (anchor method)
│   │   └── shortcuts/     # ショートカットキー監視
│   ├── core/              # アプリケーション基盤
│   │   ├── observer.ts    # MutationObserverの最適化ラッパー
│   │   └── main.ts        # エントリーポイント (Content Script)
│   ├── lib/               # 汎用ヘルパー (依存なし・純粋関数)
│   │   ├── dom.ts         # Vanilla JS用DOM生成・操作ヘルパー
│   │   ├── formatting.ts  # 時間・文字列整形
│   │   └── logger.ts      # 開発用ロガー
│   ├── types/             # 型定義ファイル
│   │   └── youtube.d.ts   # YouTube独自型定義
│   └── manifest.json      # Manifest V3 定義
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 5. 実装詳細ガイドライン

### 5.1. DOM操作ヘルパー (`src/lib/dom.ts`)

React等の代わりに、型安全なDOM生成関数を実装して使用すること。

```typescript
/**
 * 型安全なDOM要素生成ヘルパー
 * @param tag HTMLタグ名
 * @param attrs 属性オブジェクト (className, onclick等を含む)
 * @param children 子要素リスト
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number | boolean | EventListener> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  // 実装は標準API (document.createElement) を使用
  // ...
}
```

### 5.2. スタイリング戦略

- **CSS Preprocessor:** **SCSS**
- **命名規則:** **BEM (Block Element Modifier)**
- **Prefix:** `yts-` (YouTube Screenshotの略) を全てのクラスに付与し、YouTube本体のCSSとの衝突を回避する。
  - 例: `.yts-button`, `.yts-button--capturing`, `.yts-toast`

### 5.3. 権限設定 (`manifest.json`)

必要最小限の権限のみを定義する。

```json
{
  "manifest_version": 3,
  "name": "__MSG_appName__",
  "permissions": [
    "activeTab" 
    // "downloads" は使用しない
  ],
  "host_permissions": [
    "*://www.youtube.com/*"
  ],
  "content_scripts": [
    {
      "matches": ["*://www.youtube.com/*"],
      "js": ["src/core/main.ts"],
      "run_at": "document_end"
    }
  ]
}
```

## 6. 開発フェーズ

1. **Setup Phase:**
    - `npm create vite@latest . -- --template vanilla-ts`
    - `npm install -D @crxjs/vite-plugin sass vitest`
    - ディレクトリ構造の作成とエイリアス設定。
2. **Core Phase (DOM Integration):**
    - `MutationObserver` の実装とボタン注入ロジックの確立。
    - YouTubeの画面遷移（SPA）に追従できることを確認。
3. **Feature Phase (Capture Logic):**
    - Canvas描画と `toDataURL` の実装。
    - `videoWidth` を用いた高解像度化の検証。
4. **Polish Phase:**
    - ファイル名生成ロジックの改善（タイトル取得）。
    - ショートカットキー (`S`) 対応。
    - `vitest` によるユーティリティ関数のテスト。
