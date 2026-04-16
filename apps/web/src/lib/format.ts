export function formatTimeRemaining(isoDate: string): string {
  const diff = new Date(isoDate).getTime() - Date.now();
  if (diff <= 0) return '0h';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

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
