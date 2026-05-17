/**
 * Format a warning expiration timestamp with smart day context:
 *  - Today:        "Dnes 15:00"
 *  - Tomorrow:     "Zajtra 15:00"
 *  - >1 day out:   "16. máj 15:00"  (localized short date)
 *  - In the past:  "15:00"  (no day prefix)
 */
export function formatWarningExpiry(
  isoTimestamp: string,
  locale: string,
  todayLabel: string,
  tomorrowLabel: string,
): string {
  const target = new Date(isoTimestamp);
  if (Number.isNaN(target.getTime())) return '';

  const now = new Date();
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayDiff = Math.round((targetDay.getTime() - today.getTime()) / 86400000);

  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(target);

  if (dayDiff === 0) return `${todayLabel} ${time}`;
  if (dayDiff === 1) return `${tomorrowLabel} ${time}`;
  if (dayDiff > 1) {
    const dateStr = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
    }).format(target);
    return `${dateStr} ${time}`;
  }
  return time;
}
