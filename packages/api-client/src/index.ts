import type {
  WeatherResponse,
  TrafficResponse,
  TrafficFlowResponse,
  WeatherWarning,
  EventDetail,
  UserVote,
  AirQualityResponse,
  OutageRecord,
  UtilityType,
  UserProfile,
  UserLocation,
  UserLocationsResponse,
  CreateLocationBody,
  UpdateLocationBody,
  UserPreferencesResponse,
  UpdatePreferencesRequest,
  MembershipDetails,
  RegisterDeviceBody,
  DeviceRegistrationResponse,
  PaginatedNotifications,
  UpgradeMembershipBody,
  DowngradeMembershipBody,
  ApiResponse,
  ConsentState,
  CreatePersonalReminderInput,
  UpdatePersonalReminderInput,
  PersonalReminder,
  SourceSummary,
  UpsertSourceRatingInput,
  UserEvent,
  UserEventCategory,
  CreateUserEventBody,
  UpdateUserEventBody,
  UserWeatherThreshold,
  SetWeatherThresholdBody,
  SourcePreference,
  SetSourcePreferenceBody,
  DigestMode,
  PollenResponse,
  CheckoutBody,
  CheckoutResponse,
  PortalBody,
  PortalResponse,
  DataExportJob,
  DataExportResult,
  NamedayResponse,
} from './shared-types.js';

export type {
  WeatherResponse,
  TrafficResponse,
  TrafficFlowResponse,
  TrafficFlowSegment,
  WeatherWarning,
  WeatherWarningSeverity,
  EventDetail,
  EventVotes,
  UserVote,
  AirQualityResponse,
  OutageRecord,
  UtilityType,
  UserProfile,
  UserLocation,
  UserLocationsResponse,
  CreateLocationBody,
  UpdateLocationBody,
  UserPreferencesResponse,
  UpdatePreferencesRequest,
  MembershipDetails,
  RegisterDeviceBody,
  DeviceRegistrationResponse,
  NotificationHistoryItem,
  PaginatedNotifications,
  UpgradeMembershipBody,
  DowngradeMembershipBody,
  ApiResponse,
} from './shared-types.js';

// Re-export shared enums/types that apps may need
export type {
  LocationLabel,
  MembershipTier,
  Platform,
  NotificationPreferenceItem,
  NotificationCategoryResponse,
  NotificationDeliveryStatus,
  NotificationTrigger,
  AlertCategory,
  NotificationSeverity,
  RefreshTokenBody,
  ConsentState,
  ConsentCategoryCode,
  UpsertConsentInput,
  PersonalReminder,
  CreatePersonalReminderInput,
  UpdatePersonalReminderInput,
  ReminderRecurrence,
  SourceSummary,
  UpsertSourceRatingInput,
  UserEvent,
  UserEventCategory,
  CreateUserEventBody,
  UpdateUserEventBody,
  UserWeatherThreshold,
  SetWeatherThresholdBody,
  SourcePreference,
  SetSourcePreferenceBody,
  DigestMode,
  PollenResponse,
  PollenComponents,
  PaymentPlan,
  CheckoutBody,
  CheckoutResponse,
  PortalBody,
  PortalResponse,
  DataExportJob,
  DataExportResult,
  DataExportStatus,
  NamedayResponse,
  NamedayDay,
  NamedayQuery,
} from './shared-types.js';

/**
 * Public tier descriptor returned by `/api/v1/membership/tiers`. Backed
 * by `c_membership` + `r_membership_feature` on the API. Prices are
 * strings (numeric(6,2)) — the same convention as `MembershipDetails`
 * in the shared package. Defined locally rather than in @notifio/shared
 * because the FE consumes it as a plain type; if we ever validate at
 * the boundary we can promote the schema upstream.
 */
export interface PublicMembershipTier {
  tier: string;
  name: string;
  description: string | null;
  maxLocations: number;
  priceMonthly: string;
  priceYearly: string;
  features: string[];
}

export interface NotifioClientConfig {
  baseUrl: string;
  getToken: () => Promise<string | null>;
  apiKey?: string;
  locale?: string | (() => string);
  onUnauthorized?: () => void;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly body: string;

  constructor(status: number, body: string) {
    super(`API error ${status}: ${body}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string | string[] | undefined>;
}

export function createNotifioClient(config: NotifioClientConfig) {
  async function request<T>(path: string, options?: RequestOptions): Promise<T> {
    const { method = 'GET', body, params } = options ?? {};

    let url = `${config.baseUrl}${path}`;

    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
          for (const v of value) {
            searchParams.append(key, v);
          }
        } else {
          searchParams.set(key, value);
        }
      }
      const qs = searchParams.toString();
      if (qs) {
        url += `?${qs}`;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.apiKey) {
      headers['x-api-key'] = config.apiKey;
    }

    const locale = typeof config.locale === 'function' ? config.locale() : config.locale;
    if (locale) {
      headers['Accept-Language'] = locale;
    }

    const token = await config.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      config.onUnauthorized?.();
      const text = await response.text();
      throw new ApiError(response.status, text);
    }

    if (!response.ok) {
      const text = await response.text();
      throw new ApiError(response.status, text);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const json = (await response.json()) as ApiResponse<T>;

    if (!json.success) {
      throw new ApiError(response.status, json.error ?? 'Unknown API error');
    }

    return json.data as T;
  }

  return {
    // ─── Public endpoints ──────────────────────────────────────────

    async getWeather(lat: number, lng: number): Promise<WeatherResponse> {
      const { weather } = await request<{ weather: WeatherResponse }>('/weather', {
        params: { lat: String(lat), lng: String(lng) },
      });
      return weather;
    },

    async getWeatherWarnings(lat: number, lng: number): Promise<WeatherWarning[]> {
      const { warnings } = await request<{ warnings: WeatherWarning[] }>('/weather/warnings', {
        params: { lat: String(lat), lng: String(lng) },
      });
      return warnings;
    },

    async getTraffic(lat: number, lng: number): Promise<TrafficResponse> {
      const { traffic } = await request<{ traffic: TrafficResponse }>('/traffic', {
        params: { lat: String(lat), lng: String(lng) },
      });
      return traffic;
    },

    async getTrafficFlow(lat: number, lng: number): Promise<TrafficFlowResponse> {
      return request<TrafficFlowResponse>('/traffic/flow', {
        params: { lat: String(lat), lng: String(lng) },
      });
    },

    async getAirQuality(lat: number, lng: number): Promise<AirQualityResponse> {
      const { airQuality } = await request<{ airQuality: AirQualityResponse }>('/air-quality', {
        params: { lat: String(lat), lng: String(lng) },
      });
      return airQuality;
    },

    async getPollen(lat: number, lng: number): Promise<PollenResponse> {
      return request<PollenResponse>('/pollen', {
        params: { lat: String(lat), lng: String(lng) },
      });
    },

    async getNameday(params: { lat: number; lng: number; date?: string; upcoming?: number }): Promise<NamedayResponse> {
      return request<NamedayResponse>('/nameday', {
        params: {
          lat: String(params.lat),
          lng: String(params.lng),
          date: params.date,
          upcoming: params.upcoming !== undefined ? String(params.upcoming) : undefined,
        },
      });
    },

    async getOutages(utility: UtilityType): Promise<OutageRecord[]> {
      const data = await request<{ totalOutages: number; outages: OutageRecord[] }>('/outages', {
        params: { utility },
      });
      return data.outages;
    },

    // ─── Event endpoints ──────────────────────────────────────────

    async getEventDetail(eventId: string): Promise<EventDetail> {
      return request<EventDetail>(`/events/${eventId}`);
    },

    async voteOnEvent(eventId: string, isValid: boolean): Promise<void> {
      await request<void>(`/events/${eventId}/vote`, {
        method: 'POST',
        body: { isValid },
      });
    },

    async getUserVote(eventId: string): Promise<UserVote> {
      return request<UserVote>(`/events/${eventId}/vote`);
    },

    // ─── Device endpoints ──────────────────────────────────────────

    async registerDevice(registration: RegisterDeviceBody): Promise<DeviceRegistrationResponse> {
      return request<DeviceRegistrationResponse>('/devices/register', {
        method: 'POST',
        body: registration,
      });
    },

    async refreshDeviceToken(deviceId: string, fcmToken: string): Promise<{ updated: boolean }> {
      return request<{ updated: boolean }>(`/devices/${deviceId}/token`, {
        method: 'PUT',
        body: { fcmToken },
      });
    },

    async submitDeviceLocation(deviceId: string, lat: number, lng: number): Promise<{ h3Res7: string; h3Res8: string; capturedAt: string }> {
      return request<{ h3Res7: string; h3Res8: string; capturedAt: string }>(`/devices/${deviceId}/location`, {
        method: 'POST',
        body: { lat, lng },
      });
    },

    async deactivateDevice(deviceId: string): Promise<{ deactivated: boolean }> {
      return request<{ deactivated: boolean }>(`/devices/${deviceId}`, {
        method: 'DELETE',
      });
    },

    // ─── /me endpoints (authenticated) ─────────────────────────────

    async getProfile(): Promise<UserProfile> {
      return request<UserProfile>('/me');
    },

    async updateProfile(data: { countryCode?: string; digestMode?: DigestMode }): Promise<UserProfile> {
      return request<UserProfile>('/me', { method: 'PATCH', body: data });
    },

    async deleteAccount(): Promise<void> {
      await request<void>('/me', { method: 'DELETE' });
    },

    async getLocations(): Promise<UserLocationsResponse> {
      return request<UserLocationsResponse>('/me/locations');
    },

    async createLocation(data: CreateLocationBody): Promise<UserLocation> {
      return request<UserLocation>('/me/locations', { method: 'POST', body: data });
    },

    async updateLocation(locationId: string, data: UpdateLocationBody): Promise<UserLocation> {
      return request<UserLocation>(`/me/locations/${locationId}`, { method: 'PATCH', body: data });
    },

    async deleteLocation(locationId: string): Promise<void> {
      await request<void>(`/me/locations/${locationId}`, { method: 'DELETE' });
    },

    async getPreferences(): Promise<UserPreferencesResponse> {
      return request<UserPreferencesResponse>('/me/preferences');
    },

    async updatePreferences(data: UpdatePreferencesRequest): Promise<UserPreferencesResponse> {
      return request<UserPreferencesResponse>('/me/preferences', { method: 'PATCH', body: data });
    },

    async getMembership(): Promise<MembershipDetails> {
      return request<MembershipDetails>('/me/membership');
    },

    /**
     * Public tier catalog — used by the pricing page so prices and feature
     * lists live in `c_membership` + `r_membership_feature` instead of
     * being duplicated in the FE bundle. No auth required; safe to call
     * before sign-in.
     */
    async getMembershipTiers(): Promise<PublicMembershipTier[]> {
      return request<PublicMembershipTier[]>('/membership/tiers');
    },

    async upgradeMembership(data: UpgradeMembershipBody): Promise<MembershipDetails> {
      return request<MembershipDetails>('/me/membership/upgrade', {
        method: 'POST',
        body: data,
      });
    },

    async downgradeMembership(data: DowngradeMembershipBody): Promise<MembershipDetails> {
      return request<MembershipDetails>('/me/membership/downgrade', {
        method: 'POST',
        body: data,
      });
    },

    async getNotificationHistory(params?: {
      page?: number;
      limit?: number;
    }): Promise<PaginatedNotifications> {
      return request<PaginatedNotifications>('/me/notifications', {
        params: {
          page: params?.page !== undefined ? String(params.page) : undefined,
          limit: params?.limit !== undefined ? String(params.limit) : undefined,
        },
      });
    },

    // ─── Consent endpoints ───────────────────────────────────────────

    async getConsents(): Promise<ConsentState[]> {
      return request<ConsentState[]>('/me/consents');
    },

    async updateConsent(categoryCode: string, granted: boolean): Promise<ConsentState> {
      return request<ConsentState>(`/me/consents/${categoryCode}`, {
        method: 'PUT',
        body: { granted },
      });
    },

    // ─── Reminder endpoints (PRO) ────────────────────────────────────

    async getReminders(): Promise<PersonalReminder[]> {
      return request<PersonalReminder[]>('/me/reminders');
    },

    async createReminder(body: CreatePersonalReminderInput): Promise<PersonalReminder> {
      return request<PersonalReminder>('/me/reminders', {
        method: 'POST',
        body,
      });
    },

    async updateReminder(reminderId: string, body: UpdatePersonalReminderInput): Promise<PersonalReminder> {
      return request<PersonalReminder>(`/me/reminders/${reminderId}`, {
        method: 'PATCH',
        body,
      });
    },

    async deleteReminder(reminderId: string): Promise<void> {
      await request<void>(`/me/reminders/${reminderId}`, { method: 'DELETE' });
    },

    // ─── Source endpoints ────────────────────────────────────────────

    async getSources(): Promise<SourceSummary[]> {
      return request<SourceSummary[]>('/sources');
    },

    async rateSource(sourceAdapterId: number, body: UpsertSourceRatingInput): Promise<SourceSummary> {
      return request<SourceSummary>(`/sources/${sourceAdapterId}/rating`, {
        method: 'PUT',
        body,
      });
    },

    async deleteSourceRating(sourceAdapterId: number): Promise<void> {
      await request<void>(`/sources/${sourceAdapterId}/rating`, { method: 'DELETE' });
    },

    // ─── Event endpoints (extended) ──────────────────────────────────

    async getEvents(params: { lat: number; lng: number; radius?: number }): Promise<UserEvent[]> {
      return request<UserEvent[]>('/events', {
        params: {
          lat: String(params.lat),
          lng: String(params.lng),
          radius: params.radius !== undefined ? String(params.radius) : undefined,
        },
      });
    },

    async createEvent(body: CreateUserEventBody): Promise<UserEvent> {
      return request<UserEvent>('/events', {
        method: 'POST',
        body,
      });
    },

    async updateEvent(eventId: string, body: UpdateUserEventBody): Promise<UserEvent> {
      return request<UserEvent>(`/events/${eventId}`, {
        method: 'PATCH',
        body,
      });
    },

    async deleteEvent(eventId: string): Promise<void> {
      await request<void>(`/events/${eventId}`, { method: 'DELETE' });
    },

    async getEventCategories(): Promise<UserEventCategory[]> {
      return request<UserEventCategory[]>('/events/categories');
    },

    async getUserEvents(): Promise<UserEvent[]> {
      return request<UserEvent[]>('/events/mine');
    },

    // ─── Source preference endpoints (PRO) ───────────────────────────

    async getSourcePreferences(): Promise<SourcePreference[]> {
      return request<SourcePreference[]>('/me/source-preferences');
    },

    async setSourcePreference(body: SetSourcePreferenceBody): Promise<SourcePreference> {
      return request<SourcePreference>('/me/source-preferences', {
        method: 'PUT',
        body,
      });
    },

    async deleteSourcePreference(categoryCode: string): Promise<void> {
      await request<void>('/me/source-preferences', {
        method: 'DELETE',
        params: { categoryCode },
      });
    },

    // ─── Weather threshold endpoints (PRO) ───────────────────────────

    async getWeatherThresholds(): Promise<UserWeatherThreshold[]> {
      return request<UserWeatherThreshold[]>('/me/weather-thresholds');
    },

    async setWeatherThreshold(body: SetWeatherThresholdBody): Promise<UserWeatherThreshold> {
      return request<UserWeatherThreshold>('/me/weather-thresholds', {
        method: 'PUT',
        body,
      });
    },

    async deleteWeatherThreshold(subcategoryCode: string): Promise<void> {
      await request<void>('/me/weather-thresholds', {
        method: 'DELETE',
        params: { subcategoryCode },
      });
    },

    // ─── Payment endpoints ──────────────────────────────────────────

    async createCheckoutSession(body: CheckoutBody): Promise<CheckoutResponse> {
      return request<CheckoutResponse>('/payments/checkout', {
        method: 'POST',
        body,
      });
    },

    async createPortalSession(body: PortalBody): Promise<PortalResponse> {
      return request<PortalResponse>('/payments/portal', {
        method: 'POST',
        body,
      });
    },

    // ─── Data export endpoints ──────────────────────────────────────

    async requestDataExport(): Promise<DataExportJob> {
      return request<DataExportJob>('/me/data-export', {
        method: 'POST',
      });
    },

    async getDataExportStatus(jobId: string): Promise<DataExportResult> {
      return request<DataExportResult>(`/me/data-export/${jobId}`);
    },

    // ─── Account deletion endpoints ─────────────────────────────────

    async cancelAccountDeletion(): Promise<void> {
      await request<void>('/me/cancel-deletion', {
        method: 'POST',
      });
    },
  };
}
