import { withExponentialBackoff } from '../utils/backoff';
import { getValidAccessToken, invalidateAccessToken } from './auth';

export interface GoogleApiErrorBody {
  error?: {
    code?: number;
    message?: string;
    status?: string;
    errors?: Array<{ reason?: string; message?: string }>;
  };
}

export class GoogleApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly reason?: string
  ) {
    super(message);
    this.name = 'GoogleApiError';
  }
}

function shouldRetryGoogleError(error: unknown): boolean {
  return error instanceof GoogleApiError && (error.status === 429 || error.status >= 500);
}

async function createApiError(response: Response): Promise<GoogleApiError> {
  let body: GoogleApiErrorBody | null = null;

  try {
    body = (await response.json()) as GoogleApiErrorBody;
  } catch {
    body = null;
  }

  const reason = body?.error?.errors?.[0]?.reason ?? body?.error?.status;
  const message = body?.error?.message || `Google API 요청에 실패했습니다. (${response.status})`;
  return new GoogleApiError(message, response.status, reason);
}

async function authorizedFetch(url: string, init: RequestInit, allowAuthRetry: boolean): Promise<Response> {
  const accessToken = await getValidAccessToken();
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  const response = await fetch(url, { ...init, headers });

  if (response.status === 401 && allowAuthRetry) {
    invalidateAccessToken();
    const refreshedToken = await getValidAccessToken(true);
    headers.set('Authorization', `Bearer ${refreshedToken}`);
    return fetch(url, { ...init, headers });
  }

  return response;
}

export async function googleFetch(url: string, init: RequestInit = {}): Promise<Response> {
  return withExponentialBackoff(
    async () => {
      const response = await authorizedFetch(url, init, true);
      if (!response.ok) {
        throw await createApiError(response);
      }
      return response;
    },
    { retries: 3, baseDelayMs: 300, shouldRetry: shouldRetryGoogleError }
  );
}

export async function googleJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await googleFetch(url, init);
  return (await response.json()) as T;
}

export async function googleBlob(url: string, init: RequestInit = {}): Promise<Blob> {
  const response = await googleFetch(url, init);
  return response.blob();
}

let writeChain = Promise.resolve();
let lastWriteAt = 0;

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, delayMs));
}

export function scheduleGoogleWrite<T>(operation: () => Promise<T>): Promise<T> {
  const scheduled = writeChain.catch(() => undefined).then(async () => {
    const remainingDelay = Math.max(0, 180 - (Date.now() - lastWriteAt));
    if (remainingDelay > 0) {
      await wait(remainingDelay);
    }

    try {
      return await operation();
    } finally {
      lastWriteAt = Date.now();
    }
  });

  writeChain = scheduled.then(
    () => undefined,
    () => undefined
  );
  return scheduled;
}
