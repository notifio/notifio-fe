export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const absDiff = Math.abs(diff);
  const minutes = Math.floor(absDiff / 60_000);
  const hours = Math.floor(absDiff / 3_600_000);
  const days = Math.floor(absDiff / 86_400_000);

  if (minutes < 2) return 'Just now';

  if (diff > 0) {
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  if (minutes < 60) return `in ${minutes}m`;
  if (hours < 24) return `in ${hours}h`;
  return `in ${days}d`;
}

/**
 * Localized date (no time). Example (sk): "15. apr 2026".
 */
export function formatDate(iso: string, lang: string): string {
  return new Date(iso).toLocaleDateString(lang, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Localized 24h time. Example: "13:00".
 */
export function formatTime(iso: string, lang: string): string {
  return new Date(iso).toLocaleTimeString(lang, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Localized date + time. Example (sk): "15. apr 2026 13:00".
 */
export function formatDateTime(iso: string, lang: string): string {
  return `${formatDate(iso, lang)} ${formatTime(iso, lang)}`;
}

/**
 * Locale-independent yyyy-MM-dd in local time. Used as the calendar
 * grid key for react-native-calendars (which keys cells by date string).
 */
export function formatDateKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Calendar day-section header. Example (sk, today):
 *   "DNES · NEDEĽA 3. MÁJA"
 * Example (sk, other day):
 *   "PIATOK 8. MÁJA"
 *
 * `iso` is expected to be a yyyy-MM-dd string (calendar selection).
 * Anchored at midnight local time so the weekday/day match the cell
 * the user tapped.
 */
export function formatDayHeader(iso: string, lang: string, todayLabel?: string): string {
  const date = new Date(`${iso}T00:00:00`);
  const fmt = new Intl.DateTimeFormat(lang, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const label = fmt.format(date).toUpperCase();
  const isToday = formatDateKey(date) === formatDateKey(new Date());
  return isToday && todayLabel ? `${todayLabel.toUpperCase()} · ${label}` : label;
}
