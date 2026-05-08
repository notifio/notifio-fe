import AsyncStorage from '@react-native-async-storage/async-storage';

// Mobile client-error reporter — captures unhandled JS exceptions and
// promise rejections, batches offline via AsyncStorage, posts to BE
// `/client-errors`. x-device-id is mandatory (BE rate-limit on
// IPv6 /56 prefix; mobile carriers CGN behind a single bucket without
// the header).

const STACK_CAP_BYTES = 8 * 1024;
const QUEUE_KEY = 'notifio:error-queue';
const QUEUE_MAX = 100;
const QUEUE_STALE_MS = 7 * 24 * 60 * 60 * 1000;
const FLUSH_BATCH = 10;
const DEVICE_ID_KEY = 'notifio_device_id';

type Severity = 'error' | 'warning';
type ErrorType = 'js_error' | 'unhandled_rejection' | 'native_crash' | 'manual';

interface QueueItem {
  payload: ReportPayload;
  enqueuedAt: number;
}

interface ReportPayload {
  module: 'fe_mobile';
  severity: Severity;
  errorType: ErrorType;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}

let cachedDeviceId: string | null = null;
let droppedDueToRateLimit = 0;

async function getOrCreateDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;
  try {
    const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existing) {
      cachedDeviceId = existing;
      return existing;
    }
    const fresh = generateUuid();
    await AsyncStorage.setItem(DEVICE_ID_KEY, fresh);
    cachedDeviceId = fresh;
    return fresh;
  } catch {
    return `mobile-anon-${Math.random().toString(36).slice(2)}`;
  }
}

function generateUuid(): string {
  // RN 0.76+ / Hermes ships crypto.randomUUID; fall back to v4 RFC4122
  // shape generated from Math.random for older runtimes. Either is fine
  // for device-id buckets; we don't need cryptographic strength.
  const c: { randomUUID?: () => string } | undefined = (
    globalThis as unknown as { crypto?: { randomUUID?: () => string } }
  ).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function clipStack(stack?: string): string | undefined {
  if (!stack) return undefined;
  return stack.length > STACK_CAP_BYTES ? stack.slice(0, STACK_CAP_BYTES) : stack;
}

async function readQueue(): Promise<QueueItem[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueueItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeQueue(items: QueueItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch {
    // Storage full / corrupted — drop silently rather than crash again.
  }
}

async function pushQueue(item: QueueItem): Promise<void> {
  const items = await readQueue();
  items.push(item);
  while (items.length > QUEUE_MAX) items.shift();
  await writeQueue(items);
}

async function postOne(payload: ReportPayload): Promise<{ ok: boolean; rateLimited: boolean }> {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!baseUrl) return { ok: false, rateLimited: false };
  try {
    const res = await fetch(`${baseUrl}/api/v1/client-errors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': await getOrCreateDeviceId(),
      },
      body: JSON.stringify(payload),
    });
    if (res.status === 429) return { ok: false, rateLimited: true };
    return { ok: res.ok, rateLimited: false };
  } catch {
    return { ok: false, rateLimited: false };
  }
}

export function reportClientError(input: Omit<ReportPayload, 'module'>): void {
  const payload: ReportPayload = {
    module: 'fe_mobile',
    ...input,
    stack: clipStack(input.stack),
  };
  void (async () => {
    const result = await postOne(payload);
    if (result.rateLimited) {
      droppedDueToRateLimit++;
      return;
    }
    if (!result.ok) {
      await pushQueue({ payload, enqueuedAt: Date.now() });
    }
  })();
}

export async function flushErrorQueue(): Promise<void> {
  const items = await readQueue();
  if (items.length === 0) return;
  const now = Date.now();
  const fresh = items.filter((it) => now - it.enqueuedAt < QUEUE_STALE_MS);
  const batch = fresh.slice(0, FLUSH_BATCH);
  const remainder = fresh.slice(FLUSH_BATCH);

  for (const item of batch) {
    const result = await postOne(item.payload);
    if (result.rateLimited) {
      droppedDueToRateLimit++;
      continue;
    }
    if (!result.ok) {
      remainder.push(item);
    }
  }
  await writeQueue(remainder);
}

export function getDroppedDueToRateLimitCount(): number {
  return droppedDueToRateLimit;
}

let installed = false;

export function installGlobalErrorHandlers(): void {
  if (installed) return;
  installed = true;

  // Global JS handler — captures throws not caught by error boundaries.
  const ErrorUtils = (
    globalThis as unknown as {
      ErrorUtils?: {
        getGlobalHandler: () => (error: Error, isFatal?: boolean) => void;
        setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
      };
    }
  ).ErrorUtils;
  if (ErrorUtils) {
    const previous = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      reportClientError({
        severity: isFatal ? 'error' : 'warning',
        errorType: 'js_error',
        message: error.message,
        stack: error.stack,
        context: { isFatal: !!isFatal },
      });
      previous?.(error, isFatal);
    });
  }

  // Promise rejection — RN doesn't dispatch `unhandledrejection`, so use
  // the polyfill that's already shipped with React Native.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const tracking = require('promise/setimmediate/rejection-tracking') as {
      enable: (opts: {
        allRejections: boolean;
        onUnhandled: (id: number, err: unknown) => void;
        onHandled?: (id: number) => void;
      }) => void;
    };
    tracking.enable({
      allRejections: true,
      onUnhandled: (_id, err) => {
        const message =
          err instanceof Error
            ? err.message
            : typeof err === 'string'
              ? err
              : 'unhandled rejection';
        const stack = err instanceof Error ? err.stack : undefined;
        reportClientError({
          severity: 'error',
          errorType: 'unhandled_rejection',
          message,
          stack,
        });
      },
    });
  } catch {
    // Polyfill not available in this runtime — accept the gap.
  }

  // Best-effort flush of any offline queue.
  void flushErrorQueue();
}
