// Sprint 2 (B1 + B3) preference shape extensions.
//
// The base types from `@notifio/shared` (NotificationPreferenceItem,
// NotificationCategoryResponse, UserPreferencesResponse,
// UpdatePreferencesRequest) predate the schema split + per-location
// fields. Until the next shared bump republishes the Zod schemas, we
// augment the shape here and re-export under the original type names so
// callers stay on a single import path.
//
// Wire compatibility:
// - Backend serves both old (`enabled`) and new (`sendNotifications`,
//   `showOnMap`, `locationId`, `locationLabel`) fields per item.
// - Old clients read `enabled` and stay functional through the
//   transition.
// - `quietHours` moved from per-item to a root-level object — Filip's
//   product decision (single section in Settings UI).

import type {
  UserPreferencesResponse as BaseUserPreferencesResponse,
  NotificationPreferenceItem as BaseNotificationPreferenceItem,
  NotificationCategoryResponse as BaseNotificationCategoryResponse,
  UpdatePreferencesRequest as BaseUpdatePreferencesRequest,
} from '@notifio/shared';

export interface NotificationPreferenceItem extends BaseNotificationPreferenceItem {
  /** Sprint 2 / B1: NULL = category-global default; UUID = override for this saved location. */
  locationId: string | null;
  /** Sprint 2 / B1: friendly label of the linked saved location, e.g. "Domov". */
  locationLabel: string | null;
  /** Sprint 2 / B3: drives push delivery (BE filter). Replaces `enabled`. */
  sendNotifications: boolean;
  /** Sprint 2 / B3: drives map pin visibility (FE filter). */
  showOnMap: boolean;
}

export interface NotificationCategoryResponse extends Omit<BaseNotificationCategoryResponse, 'items'> {
  items: NotificationPreferenceItem[];
}

export interface QuietHours {
  start: string | null;
  end: string | null;
}

export interface UserPreferencesResponse extends Omit<BaseUserPreferencesResponse, 'notifications'> {
  notifications: NotificationCategoryResponse[];
  /** Sprint 2: global quiet hours (single section in the FE settings). */
  quietHours: QuietHours;
}

export interface UpdatePreferenceItem {
  categoryCode: string;
  subcategoryCode?: string | null;
  /** Sprint 2 / B1: UUID of a saved location to override (omit / null = category-global). */
  locationId?: string | null;
  /** @deprecated Sprint 2: use `sendNotifications`. Accepted as fallback for transitional clients. */
  enabled?: boolean;
  /** Sprint 2 / B3. */
  sendNotifications?: boolean;
  /** Sprint 2 / B3. */
  showOnMap?: boolean;
}

export interface UpdatePreferencesRequest extends Omit<BaseUpdatePreferencesRequest, 'notifications'> {
  notifications?: UpdatePreferenceItem[];
  /** Sprint 2: global quiet hours (PRO-tier feature). */
  quietHours?: QuietHours;
}
