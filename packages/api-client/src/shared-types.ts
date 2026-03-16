/**
 * Local type stubs for @notifio/shared.
 * These will be replaced by the real package once GitHub Packages auth is configured.
 * Run `npm install` after adding a valid GITHUB_TOKEN to .npmrc.
 */

export interface Alert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  h3Cell: string;
  lat: number;
  lon: number;
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

export interface WeatherResponse {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  forecast: Array<{
    date: string;
    tempMin: number;
    tempMax: number;
    description: string;
    icon: string;
  }>;
}

export interface TrafficResponse {
  congestionLevel: 'free' | 'light' | 'moderate' | 'heavy' | 'severe';
  incidents: Array<{
    id: string;
    type: string;
    description: string;
    lat: number;
    lon: number;
  }>;
}

export interface AirQualityResponse {
  aqi: number;
  level: 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
  pollutants: Record<string, number>;
  description: string;
}

export interface NotificationPreferences {
  weather: boolean;
  traffic: boolean;
  airQuality: boolean;
  utilityOutage: boolean;
  events: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  severityThreshold: 'info' | 'warning' | 'critical';
}

export type NotificationPreferencesUpdate = Partial<NotificationPreferences>;

export interface DeviceRegistrationInput {
  platform: 'ios' | 'android' | 'web';
  pushToken: string;
  locale: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: Record<string, unknown>;
}
