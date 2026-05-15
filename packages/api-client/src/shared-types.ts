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
  ForecastData,
  ForecastHourly,
  ForecastDaily,
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
  MembershipResponse,
  LocationLabel,
  MembershipTier,
  Platform,
} from '@notifio/shared';

// Preference types — Sprint 2 augmentation overrides the shared shape
// with the split-toggle + per-location fields. Callers see the new
// shape under the original type names.
export type {
  UserPreferencesResponse,
  NotificationPreferenceItem,
  NotificationCategoryResponse,
  QuietHours,
  UpdatePreferenceItem,
  UpdatePreferencesRequest,
} from './preferences-sprint2.js';

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

// Request body types — UpdatePreferencesRequest re-exported from the
// Sprint 2 augmentation above, not from @notifio/shared.
export type {
  RegisterDeviceBody,
  RefreshTokenBody,
  CreateLocationBody,
  UpdateLocationBody,
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
  EventFeedItem,
  EventFeedResponse,
  TeaserPin,
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

// Digest mode — legacy alias. Shared 1.0.0 replaced DigestModeSchema
// with DigestPreferencesSchema (multi-channel: realTime/morning/evening).
// Kept here as a local string alias until consumers migrate to the new
// shape (tracked in CLAUDE.md BE follow-ups).
export type DigestMode = 'REAL_TIME' | 'MORNING' | 'EVENING' | 'BOTH';

// Payment types
export type {
  PaymentPlan,
  CheckoutBody,
  CheckoutResponse,
  PortalBody,
  PortalResponse,
} from '@notifio/shared';

// Nameday types
export type {
  NamedayResponse,
  NamedayDay,
  NamedayQuery,
} from '@notifio/shared';

// Data export types
export type {
  DataExportJob,
  DataExportResult,
  DataExportStatus,
} from '@notifio/shared';

// Pollen types
export type {
  PollenResponse,
  PollenComponents,
} from '@notifio/shared';
