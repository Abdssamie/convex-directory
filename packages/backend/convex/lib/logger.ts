export const logger = {
  warn: (key: string, payload?: Record<string, unknown>) => {
    console.warn(`[${key}]`, payload ?? "");
  },
  error: (key: string, payload?: Record<string, unknown>) => {
    console.error(`[${key}]`, payload ?? "");
  },
  info: (key: string, payload?: Record<string, unknown>) => {
    console.info(`[${key}]`, payload ?? "");
  },
};
