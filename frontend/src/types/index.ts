export interface UserResponse {
  id: string;
  email: string;
  plan: 'free' | 'pro';
  is_active: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LinkResponse {
  id: string;
  original_url: string;
  slug: string;
  short_url: string;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

export interface CreateLinkPayload {
  original_url: string;
  custom_slug?: string;
  expires_at?: string;
}

export interface DailyClick {
  _id: string;
  count: number;
}

export interface DeviceStat {
  _id: string;
  count: number;
}

export interface BrowserStat {
  _id: string;
  count: number;
}

export interface SourceStat {
  _id: string;
  count: number;
}

export interface LocationStat {
  _id: { country: string; city: string };
  count: number;
}

export interface AnalyticsResponse {
  slug: string;
  total_clicks: number;
  period_days: number;
  daily_clicks: DailyClick[];
  devices: DeviceStat[];
  browsers: BrowserStat[];
  sources: SourceStat[];
  top_locations: LocationStat[];
}
