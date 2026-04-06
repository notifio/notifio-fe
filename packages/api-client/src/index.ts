import type {
  Alert,
  AlertFilter,
  WeatherResponse,
  TrafficResponse,
  AirQualityResponse,
  OutageResponse,
  OutageRecord,
  UtilityType,
  UserProfile,
  UserLocation,
  UserLocationsResponse,
  CreateLocationInput,
  UpdateLocationInput,
  UserPreferencesResponse,
  UpdatePreferencesInput,
  MembershipDetails,
  DeviceRegistrationInput,
  RefreshTokenInput,
  NotificationHistoryItem,
  PaginatedNotifications,
  ApiResponse,
} from './shared-types.js';

export type {
  Alert,
  AlertFilter,
  WeatherResponse,
  TrafficResponse,
  AirQualityResponse,
  OutageResponse,
  OutageRecord,
  UtilityType,
  UserProfile,
  UserLocation,
  UserLocationsResponse,
  CreateLocationInput,
  UpdateLocationInput,
  UserPreferencesResponse,
  UpdatePreferencesInput,
  MembershipDetails,
  DeviceRegistrationInput,
  RefreshTokenInput,
  NotificationHistoryItem,
  PaginatedNotifications,
  ApiResponse,
};

export interface NotifioClientConfig {
  baseUrl: string;
  getToken: () => Promise<string | null>;
  apiKey?: string;
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

  async function requestWithMeta<T>(
    path: string,
    options?: RequestOptions,
  ): Promise<{ data: T; meta: Record<string, unknown> }> {
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

    const json = (await response.json()) as ApiResponse<T> & { meta?: Record<string, unknown> };

    if (!json.success) {
      throw new ApiError(response.status, json.error ?? 'Unknown API error');
    }

    return { data: json.data as T, meta: json.meta ?? {} };
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

    async getActiveAlerts(lat: number, lng: number): Promise<Alert[]> {
      return request<Alert[]>('/alerts/active', {
        params: { lat: String(lat), lng: String(lng) },
      });
    },

    async getAlertsByH3(h3Cell: string, filters?: AlertFilter): Promise<Alert[]> {
      return request<Alert[]>(`/alerts/h3/${h3Cell}`, {
        params: {
          type: filters?.type,
          severity: filters?.severity,
          active: filters?.active !== undefined ? String(filters.active) : undefined,
        },
      });
    },

    async getAlertById(id: string): Promise<Alert> {
      return request<Alert>(`/alerts/${id}`);
    },

    async registerDevice(registration: DeviceRegistrationInput): Promise<{ deviceId: string; linked: boolean }> {
      return request<{ deviceId: string; linked: boolean }>('/devices/register', {
        method: 'POST',
        body: registration,
      });
    },

    async refreshDeviceToken(deviceId: string, data: RefreshTokenInput): Promise<{ updated: boolean }> {
      return request<{ updated: boolean }>(`/devices/${deviceId}/token`, {
        method: 'PUT',
        body: data,
      });
    },

    async deactivateDevice(deviceId: string): Promise<{ deactivated: boolean }> {
      return request<{ deactivated: boolean }>(`/devices/${deviceId}`, { method: 'DELETE' });
    },

    async updateDeviceLocation(deviceId: string, lat: number, lng: number): Promise<void> {
      return request<void>(`/devices/${deviceId}/location`, {
        method: 'PUT',
        body: { lat, lng },
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

    async createLocation(data: CreateLocationInput): Promise<UserLocation> {
      return request<UserLocation>('/me/locations', { method: 'POST', body: data });
    },

    async updateLocation(locationId: string, data: UpdateLocationInput): Promise<UserLocation> {
      return request<UserLocation>(`/me/locations/${locationId}`, { method: 'PATCH', body: data });
    },

    async deleteLocation(locationId: string): Promise<void> {
      await request<void>(`/me/locations/${locationId}`, { method: 'DELETE' });
    },

    async getPreferences(): Promise<UserPreferencesResponse> {
      return request<UserPreferencesResponse>('/me/preferences');
    },

    async updatePreferences(data: UpdatePreferencesInput): Promise<UserPreferencesResponse> {
      return request<UserPreferencesResponse>('/me/preferences', { method: 'PATCH', body: data });
    },

    async getMembership(): Promise<MembershipDetails> {
      return request<MembershipDetails>('/me/membership');
    },

    async upgradeMembership(targetTier: 'PLUS' | 'PRO'): Promise<MembershipDetails> {
      return request<MembershipDetails>('/me/membership/upgrade', {
        method: 'POST',
        body: { targetTier },
      });
    },

    async downgradeMembership(targetTier: 'FREE' | 'PLUS'): Promise<MembershipDetails> {
      return request<MembershipDetails>('/me/membership/downgrade', {
        method: 'POST',
        body: { targetTier },
      });
    },

    async getNotificationHistory(params?: {
      page?: number;
      limit?: number;
    }): Promise<PaginatedNotifications> {
      const { data, meta } = await requestWithMeta<NotificationHistoryItem[]>(
        '/me/notifications',
        {
          params: {
            page: params?.page !== undefined ? String(params.page) : undefined,
            limit: params?.limit !== undefined ? String(params.limit) : undefined,
          },
        },
      );
      return {
        items: data,
        page: (meta.page as number) ?? 1,
        limit: (meta.limit as number) ?? 20,
        total: (meta.total as number) ?? 0,
      };
    },
  };
}
