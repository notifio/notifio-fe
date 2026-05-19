import type { NotificationSeverity } from '@notifio/shared';

// Shared schema types severity as plain `string` (BE-driven open set);
// `warning` is the deprecated legacy alias and is folded onto `medium`
// so labels and colors stay consistent. Other values pass through and
// downstream lookups fall back to defaults if unknown.
export function normalizeSeverity(severity: string): NotificationSeverity {
  return severity === 'warning' ? 'medium' : (severity as NotificationSeverity);
}
