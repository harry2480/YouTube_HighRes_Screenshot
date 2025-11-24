// YouTube specific type definitions

declare global {
  interface WindowEventMap {
    'yt-navigate-finish': CustomEvent;
  }
}

export {};
