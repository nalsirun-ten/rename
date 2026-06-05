/**
 * Retries an async operation with exponential backoff.
 * Automatically handles network errors, rate limits (429), and server errors (5xx).
 * Does NOT retry on client errors (4xx except 429) — those are permanent.
 */
export async function retry(
  fn: () => any,
  options: {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<any> {
  const {
    maxAttempts = 3,
    baseDelayMs = 1000,
    maxDelayMs = 10000,
    onRetry,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;

      // Don't retry if we're on the last attempt
      if (attempt === maxAttempts) break;

      // Don't retry on client errors (4xx) except 429 (rate limit)
      const status = err?.status || err?.code;
      const isRateLimit = status === 429 || status === '429';
      const isServerError = status >= 500 || status === 'ECONNRESET' || status === 'ETIMEDOUT' || status === 'ENOTFOUND' || err?.message?.includes('fetch');
      const isNetworkError = err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('Load failed'));

      if (!isRateLimit && !isServerError && !isNetworkError && status >= 400) {
        throw err; // Client error — don't retry
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 500,
        maxDelayMs
      );

      onRetry?.(attempt, err);
      console.warn(`Retry attempt ${attempt}/${maxAttempts} after ${Math.round(delay)}ms:`, err.message);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
