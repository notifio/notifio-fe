// Web client-error reporter — posts unhandled exceptions and React render
// errors to the BE `/client-errors` endpoint. Best-effort: never awaits,
// never throws. BE rate-limit is 10/min/device with x-device-id required
// (see notifio-api fix/be-rate-limit-ipv6-safe-keygen). Without the
// header the bucket falls back to IPv6 /56 and CGN-shared users get
// throttled together.

const STACK_CAP_BYTES = 8 * 1024;
const DEDUP_WINDOW_MS = 60_000;
const DEVICE_ID_KEY = 'notifio_device_id';

type Severity = 'error' | 'warning';
type ErrorType =
  | 'react_render'
  | 'window_error'
  | 'unhandled_rejection'
  | 'manual';

interface ReportPayload {
  module: 'fe_web';
  severity: Severity;
  errorType: ErrorType;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}

const recentSignatures = new Map<string, number>();
let droppedDueToRateLimit = 0;

function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr-no-device';
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    // Reuse DEVICE_ID_KEY ('notifio_device_id') with `useWebPush` so we
    // don't fragment device identity if push is enabled later.
    const fresh =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_ID_KEY, fresh);
    return fresh;
  } catch {
    return `web-anon-${Math.random().toString(36).slice(2)}`;
  }
}

function clipStack(stack?: string): string | undefined {
  if (!stack) return undefined;
  return stack.length > STACK_CAP_BYTES ? stack.slice(0, STACK_CAP_BYTES) : stack;
}

function dedupKey(message: string, stack?: string): string {
  return `${message}::${(stack ?? '').slice(0, 100)}`;
}

export function reportClientError(payload: Omit<ReportPayload, 'module'>): void {
  if (typeof window === 'undefined') return;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return;

  const stack = clipStack(payload.stack);
  const key = dedupKey(payload.message, stack);
  const now = Date.now();
  const last = recentSignatures.get(key);
  if (last !== undefined && now - last < DEDUP_WINDOW_MS) return;
  recentSignatures.set(key, now);

  const body: ReportPayload = { module: 'fe_web', ...payload, stack };
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-device-id': getOrCreateDeviceId(),
  };

  try {
    void fetch(`${baseUrl}/api/v1/client-errors`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      keepalive: true,
    })
      .then((res) => {
        if (res.status === 429) {
          droppedDueToRateLimit++;
        }
      })
      .catch(() => {
        // Network or CORS — accept the loss; this is best-effort.
      });
  } catch {
    // Synchronous failure on fetch construction (rare) — also accept.
  }
}

export function getDroppedDueToRateLimitCount(): number {
  return droppedDueToRateLimit;
}

let installed = false;

export function installGlobalErrorHandlers(): void {
  if (typeof window === 'undefined' || installed) return;
  installed = true;

  window.addEventListener('error', (e) => {
    reportClientError({
      severity: 'error',
      errorType: 'window_error',
      message: e.message ?? String(e.error ?? 'window error'),
      stack: (e.error as Error | undefined)?.stack,
      context: { source: e.filename, line: e.lineno, col: e.colno },
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason as unknown;
    const message =
      reason instanceof Error
        ? reason.message
        : typeof reason === 'string'
          ? reason
          : 'unhandled rejection';
    const stack = reason instanceof Error ? reason.stack : undefined;
    reportClientError({
      severity: 'error',
      errorType: 'unhandled_rejection',
      message,
      stack,
    });
  });
}
