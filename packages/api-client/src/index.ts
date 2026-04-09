import type {
  WeatherResponse,
  TrafficResponse,
  TrafficFlowResponse,
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
} from './shared-types.js';

export type {
  WeatherResponse,
  TrafficResponse,
  TrafficFlowResponse,
  TrafficFlowSegment,
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
} from './shared-types.js';

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

    async getOutages(utility: UtilityType): Promise<OutageRecord[]> {
      const data = await request<{ totalOutages: number; outages: OutageRecord[] }>('/outages', {
        params: { utility },
      });
      return data.outages;
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

    async updateProfile(data: { countryCode: string }): Promise<UserProfile> {
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
  };
}
