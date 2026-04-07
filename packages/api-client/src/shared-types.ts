// Re-exports from @notifio/shared — the single source of truth for all API types.

// Response types
export type {
  WeatherData as WeatherResponse,
  TrafficData as TrafficResponse,
  AirQualityData as AirQualityResponse,
  OutageData as OutageResponse,
  OutageRecord,
  UtilityType,
  ApiResponse,
} from '@notifio/shared';

// User types
export type {
  UserProfile,
  UserLocation,
  UserLocationsResponse,
  MembershipDetails,
  LocationLabel,
  MembershipTier,
  Platform,
} from '@notifio/shared';

// Preference types
export type {
  UserPreferencesResponse,
  NotificationPreferenceItem,
  NotificationCategoryResponse,
} from '@notifio/shared';

// Device types
export type {
  DeviceRegistrationResponse,
} from '@notifio/shared';

// Notification types
export type {
  NotificationHistoryItem,
  PaginatedNotifications,
  NotificationDeliveryStatus,
  NotificationTrigger,
  AlertCategory,
  NotificationSeverity,
} from '@notifio/shared';

// Request body types
export type {
  RegisterDeviceBody,
  RefreshTokenBody,
  CreateLocationBody,
  UpdateLocationBody,
  UpdatePreferencesRequest,
  UpgradeMembershipBody,
  DowngradeMembershipBody,
} from '@notifio/shared';
