import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const branch = sp.get("branch");
  const channel = sp.get("channel");
  const period = sp.get("period") || "daily"; // daily | weekly | monthly
  const from = sp.get("from");
  const to = sp.get("to");

  let query = supabase
    .from("ota_ctr_daily")
    .select("*")
    .order("date", { ascending: true });

  if (branch) query = query.eq("branch", branch);
  if (channel) query = query.eq("channel", channel);
  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (period === "daily") {
    return NextResponse.json(data);
  }

  // Aggregate by week or month
  const grouped = new Map<string, {
    impressions: number; clicks: number; bookings: number;
    channel: string; branch: string;
  }>();

  for (const row of data ?? []) {
    const d = new Date(row.date);
    let key: string;
    if (period === "weekly") {
      // ISO week start (Monday)
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d);
      monday.setDate(diff);
      key = `${monday.toISOString().slice(0, 10)}|${row.channel}|${row.branch}`;
    } else {
      key = `${row.date.slice(0, 7)}|${row.channel}|${row.branch}`;
    }

    const existing = grouped.get(key);
    if (existing) {
      existing.impressions += row.impressions;
      existing.clicks += row.clicks;
      existing.bookings += row.bookings;
    } else {
      grouped.set(key, {
        impressions: row.impressions,
        clicks: row.clicks,
        bookings: row.bookings,
        channel: row.channel,
        branch: row.branch,
      });
    }
  }

  const aggregated = Array.from(grouped.entries()).map(([k, v]) => ({
    period: k.split("|")[0],
    channel: v.channel,
    branch: v.branch,
    impressions: v.impressions,
    clicks: v.clicks,
    bookings: v.bookings,
    ctr: v.impressions > 0 ? Math.round((v.clicks / v.impressions) * 10000) / 10000 : 0,
    cvr: v.clicks > 0 ? Math.round((v.bookings / v.clicks) * 10000) / 10000 : 0,
  }));

  return NextResponse.json(aggregated);
}
