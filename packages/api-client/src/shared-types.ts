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

// Traffic flow types — hand-written to match API contract
// (not re-exported through @notifio/shared barrel due to Zod v4 resolution issue)
export type CongestionLevel = 'free' | 'moderate' | 'heavy' | 'severe';

export interface TrafficFlowSegment {
  coordinates: [number, number][];
  currentSpeed: number;
  freeFlowSpeed: number;
  congestion: CongestionLevel;
  confidence: number;
  roadName?: string;
}

export interface TrafficFlowResponse {
  segments: TrafficFlowSegment[];
  bbox: [number, number, number, number];
  updatedAt: string;
}

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
