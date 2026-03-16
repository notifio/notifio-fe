// TODO: Replace with `import type { ... } from '@notifio/shared'` once GitHub Packages auth is configured.
import { type Alert, type AlertFilter, type WeatherResponse, type TrafficResponse, type AirQualityResponse, type NotificationPreferences, type NotificationPreferencesUpdate, type DeviceRegistrationInput, type ApiResponse } from './shared-types.js';

export type { Alert, AlertFilter, WeatherResponse, TrafficResponse, AirQualityResponse, NotificationPreferences, NotificationPreferencesUpdate, DeviceRegistrationInput, ApiResponse };

export interface NotifioClientConfig {
  baseUrl: string;
  getToken: () => Promise<string | null>;
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

    const token = await config.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new ApiError(response.status, text);
    }

    const json = (await response.json()) as ApiResponse<T>;

    if (!json.success) {
      throw new ApiError(response.status, json.error ?? 'Unknown API error');
    }

    return json.data as T;
  }

  return {
    async getWeather(lat: number, lon: number): Promise<WeatherResponse> {
      return request<WeatherResponse>('/weather', {
        params: { lat: String(lat), lon: String(lon) },
      });
    },

    async getTraffic(lat: number, lon: number): Promise<TrafficResponse> {
      return request<TrafficResponse>('/traffic', {
        params: { lat: String(lat), lon: String(lon) },
      });
    },

    async getAirQuality(lat: number, lon: number): Promise<AirQualityResponse> {
      return request<AirQualityResponse>('/air-quality', {
        params: { lat: String(lat), lon: String(lon) },
      });
    },

    async getActiveAlerts(lat: number, lon: number): Promise<Alert[]> {
      return request<Alert[]>('/alerts/active', {
        params: { lat: String(lat), lon: String(lon) },
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

    async getPreferences(): Promise<NotificationPreferences> {
      return request<NotificationPreferences>('/preferences');
    },

    async updatePreferences(prefs: NotificationPreferencesUpdate): Promise<NotificationPreferences> {
      return request<NotificationPreferences>('/preferences', {
        method: 'PATCH',
        body: prefs,
      });
    },

    async registerDevice(registration: DeviceRegistrationInput): Promise<{ deviceId: string }> {
      return request<{ deviceId: string }>('/devices', {
        method: 'POST',
        body: registration,
      });
    },

    async updateDeviceLocation(deviceId: string, lat: number, lon: number): Promise<void> {
      return request<void>(`/devices/${deviceId}/location`, {
        method: 'PUT',
        body: { lat, lon },
      });
    },
  };
}
