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

// Weather warning types — hand-written to match API contract
// (not re-exported through @notifio/shared barrel due to Zod v4 resolution issue)
export type WeatherWarningSeverity = 'yellow' | 'orange' | 'red';

export interface WeatherWarning {
  id: string;
  event: string;
  severity: WeatherWarningSeverity;
  certainty: string;
  urgency: string;
  headline: string;
  description: string;
  instruction: string;
  regionCodes: string[];
  regionNames: string[];
  validFrom: string;
  validUntil: string;
  sentAt: string;
  provider: string;
  sourceUrl: string;
}

// Event detail types — hand-written to match API contract
export interface EventVotes {
  valid: number;
  invalid: number;
  total: number;
  score: number;
}

export interface EventDetail {
  eventId: string;
  type: { code: string; name: string };
  category: { code: string; name: string };
  subcategory: { code: string; name: string } | null;
  materiality: { level: number; label: string };
  location: { lat: number; lng: number; h3Res7: string };
  h3Cells: string[];
  sourceId: string;
  eventFrom: string;
  eventTo: string | null;
  votes: EventVotes;
  createdAt: string;
}

export interface UserVote {
  voted: boolean;
  isValid?: boolean;
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

// Consent types
export type {
  ConsentState,
  ConsentCategoryCode,
  UpsertConsentInput,
} from '@notifio/shared';

// Personal reminder types
export type {
  PersonalReminder,
  CreatePersonalReminderInput,
  UpdatePersonalReminderInput,
  ReminderRecurrence,
} from '@notifio/shared';

// Source types
export type {
  SourceSummary,
  UpsertSourceRatingInput,
} from '@notifio/shared';

// User event types
export type {
  UserEvent,
  UserEventCategory,
  CreateUserEventBody,
  UpdateUserEventBody,
} from '@notifio/shared';

// Weather threshold types
export type {
  UserWeatherThreshold,
  SetWeatherThresholdBody,
} from '@notifio/shared';

// Source preference types
export type {
  SourcePreference,
  SetSourcePreferenceBody,
} from '@notifio/shared';

// Digest mode
export type { DigestMode } from '@notifio/shared';

// Pollen types — hand-written to match API contract
export interface PollenComponents {
  birch: number | null;
  grass: number | null;
  ragweed: number | null;
  alder: number | null;
  mugwort: number | null;
  olive: number | null;
}

export interface PollenResponse {
  level: string;
  dominant: string | null;
  components: PollenComponents;
  unit: string;
  updatedAt: string;
}
