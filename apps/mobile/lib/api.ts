import type { ApiResponse } from '@notifio/shared/api';
import type { AirQualityData, OutageData, TrafficData, UtilityType, WeatherData } from '@notifio/shared/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchApi<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json: unknown = await res.json();
  const envelope = json as { success?: boolean; error?: string };
  if ('success' in envelope && !envelope.success) {
    throw new Error(envelope.error || 'API request failed');
  }
  return json as T;
}

export const api = {
  getWeather: (lat: number, lon: number) =>
    fetchApi<ApiResponse<{ weather: WeatherData }>>(
      `${API_URL}/api/v1/weather?lat=${lat}&lng=${lon}`,
    ),
  getAirQuality: (lat: number, lng: number) =>
    fetchApi<ApiResponse<{ airQuality: AirQualityData }>>(
      `${API_URL}/api/v1/air-quality?lat=${lat}&lng=${lng}`,
    ),
  getOutages: (utility: UtilityType) =>
    fetchApi<ApiResponse<OutageData>>(
      `${API_URL}/api/v1/outages?utility=${utility}`,
    ),
  getTraffic: (lat: number, lng: number) =>
    fetchApi<ApiResponse<{ traffic: TrafficData }>>(
      `${API_URL}/api/v1/traffic?lat=${lat}&lng=${lng}`,
    ),
};
