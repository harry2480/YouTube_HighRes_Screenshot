const PREFIX = '[YTS]';

export const logger = {
  log: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.log(PREFIX, ...args);
    }
  },
  warn: (...args: unknown[]) => {
    console.warn(PREFIX, ...args);
  },
  error: (...args: unknown[]) => {
    console.error(PREFIX, ...args);
  },
};
