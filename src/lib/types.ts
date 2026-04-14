export interface CtrRecord {
  id?: number;
  date: string;        // YYYY-MM-DD
  channel: string;
  branch: string;
  rank: number | null;
  impressions: number;
  clicks: number;
  bookings: number;
  ctr: number;         // clicks / impressions
  cvr: number;         // bookings / clicks
}

export interface Promotion {
  id?: number;
  branch: string;
  channel: string;
  promo_name: string;
  discount_rate: number;  // 0~100
  start_date: string;     // YYYY-MM-DD
  end_date: string;       // YYYY-MM-DD
  description: string;
  is_active: boolean;
  created_at?: string;
}

export type Period = "daily" | "weekly" | "monthly";

export interface CtrAggregated {
  period: string;        // date or week label or month
  channel: string;
  branch: string;
  impressions: number;
  clicks: number;
  bookings: number;
  ctr: number;
  cvr: number;
}
