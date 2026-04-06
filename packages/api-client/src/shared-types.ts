/**
 * Re-exports from @notifio/shared.
 * This file preserves the api-client's import paths during migration.
 */

export type {
  // Response types
  WeatherData as WeatherResponse,
  TrafficData as TrafficResponse,
  AirQualityData as AirQualityResponse,
  OutageData as OutageResponse,
  OutageRecord,
  UtilityType,
  // Enums / common
  ApiResponse,
} from '@notifio/shared';

// ─── Types not yet in @notifio/shared ────────────────────────────────
// TODO: Move these to @notifio/shared once the backend publishes them.

export interface Alert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  h3Cell: string;
  lat: number;
  lng: number;
  startsAt: string;
  endsAt: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertFilter {
  type?: string[];
  severity?: string[];
  active?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  countryCode: string;
  createdAt: string;
}

export interface UserLocation {
  id: string;
  label: string;
  lat: number;
  lng: number;
  h3Index: string;
  isPrimary: boolean;
}

export interface UserLocationsResponse {
  locations: UserLocation[];
}

export interface CreateLocationInput {
  label: string;
  lat: number;
  lng: number;
  isPrimary?: boolean;
}

export interface UpdateLocationInput {
  label?: string;
  isPrimary?: boolean;
}

export interface UserPreferencesResponse {
  alertCategories: string[];
  minSeverity: 'info' | 'warning' | 'critical';
  locale: string;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

export interface UpdatePreferencesInput {
  alertCategories?: string[];
  minSeverity?: 'info' | 'warning' | 'critical';
  locale?: string;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
}

export interface MembershipDetails {
  tier: 'FREE' | 'PLUS' | 'PRO';
  expiresAt: string | null;
  maxLocations: number;
}

export interface DeviceRegistrationInput {
  fcmToken: string;
  platform: 'ios' | 'android' | 'web';
}

export interface RefreshTokenInput {
  fcmToken: string;
}

export interface NotificationHistoryItem {
  notificationId: number;
  eventId: string;
  status: string;
  trigger: string;
  sentAt: string | null;
  createdAt: string;
  event: {
    typeName: string;
    categoryCode: string;
    categoryName: string;
    eventFrom: string | null;
    eventTo: string | null;
  };
}

export interface PaginatedNotifications {
  items: NotificationHistoryItem[];
  page: number;
  limit: number;
  total: number;
}
