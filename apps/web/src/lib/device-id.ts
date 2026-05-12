const STORAGE_KEY = 'notifio:device-id';

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return '';
  if (typeof crypto === 'undefined' || typeof crypto.randomUUID !== 'function') return '';
  let id: string | null = null;
  try {
    id = localStorage.getItem(STORAGE_KEY);
  } catch {
    return '';
  }
  if (!id) {
    id = crypto.randomUUID();
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      return id;
    }
  }
  return id;
}
