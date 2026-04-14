"use client";

import { useState, useEffect, useCallback } from "react";
import Filters from "@/components/Filters";
import KpiCards from "@/components/KpiCards";
import CtrChart from "@/components/CtrChart";
import PromoTimeline from "@/components/PromoTimeline";
import BranchTable from "@/components/BranchTable";
import type { Period, Promotion } from "@/lib/types";
import { CHANNELS } from "@/lib/constants";
import Link from "next/link";

interface RawRow {
  date?: string;
  period?: string;
  channel: string;
  branch: string;
  impressions: number;
  clicks: number;
  bookings: number;
  ctr: number;
  cvr: number;
}

export default function Dashboard() {
  const [branch, setBranch] = useState("");
  const [channel, setChannel] = useState("");
  const [period, setPeriod] = useState<Period>("daily");
  const [from, setFrom] = useState("2026-03-01");
  const [to, setTo] = useState("2026-04-14");
  const [rows, setRows] = useState<RawRow[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ period, from, to });
    if (branch) params.set("branch", branch);
    if (channel) params.set("channel", channel);

    const promoParams = new URLSearchParams();
    if (branch) promoParams.set("branch", branch);
    if (channel) promoParams.set("channel", channel);

    const [ctrRes, promoRes] = await Promise.all([
      fetch(`/api/ctr?${params}`),
      fetch(`/api/promotions?${promoParams}`),
    ]);

    const ctrData = await ctrRes.json();
    const promoData = await promoRes.json();

    setRows(Array.isArray(ctrData) ? ctrData : []);
    setPromotions(Array.isArray(promoData) ? promoData : []);
    setLoading(false);
  }, [branch, channel, period, from, to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // KPI calculations
  const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0);
  const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
  const totalBookings = rows.reduce((s, r) => s + r.bookings, 0);
  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgCvr = totalClicks > 0 ? totalBookings / totalClicks : 0;

  // CTR change: first half vs second half
  const mid = Math.floor(rows.length / 2);
  const firstHalf = rows.slice(0, mid);
  const secondHalf = rows.slice(mid);
  const firstImp = firstHalf.reduce((s, r) => s + r.impressions, 0);
  const firstClk = firstHalf.reduce((s, r) => s + r.clicks, 0);
  const secImp = secondHalf.reduce((s, r) => s + r.impressions, 0);
  const secClk = secondHalf.reduce((s, r) => s + r.clicks, 0);
  const firstCtr = firstImp > 0 ? firstClk / firstImp : 0;
  const secCtr = secImp > 0 ? secClk / secImp : 0;
  const ctrChange = secCtr - firstCtr;

  // Chart: pivot by date, one line per channel
  const activeChannels = channel
    ? [channel]
    : [...new Set(rows.map((r) => r.channel))].filter((c) =>
        CHANNELS.includes(c as (typeof CHANNELS)[number]),
      );

  const dateMap = new Map<string, Record<string, number>>();
  for (const r of rows) {
    const d = r.date || r.period || "";
    if (!dateMap.has(d)) dateMap.set(d, {});
    const entry = dateMap.get(d)!;
    const key = r.channel;
    entry[`${key}_imp`] = (entry[`${key}_imp`] || 0) + r.impressions;
    entry[`${key}_clk`] = (entry[`${key}_clk`] || 0) + r.clicks;
  }

  const chartData = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => {
      const point: Record<string, number | string> = { date };
      for (const ch of activeChannels) {
        const imp = vals[`${ch}_imp`] || 0;
        const clk = vals[`${ch}_clk`] || 0;
        point[ch] = imp > 0 ? clk / imp : 0;
      }
      return point;
    });

  // Branch table
  const branchMap = new Map<
    string,
    { impressions: number; clicks: number; bookings: number; channel: string; branch: string }
  >();
  for (const r of rows) {
    const k = `${r.branch}|${r.channel}`;
    const ex = branchMap.get(k);
    if (ex) {
      ex.impressions += r.impressions;
      ex.clicks += r.clicks;
      ex.bookings += r.bookings;
    } else {
      branchMap.set(k, {
        branch: r.branch,
        channel: r.channel,
        impressions: r.impressions,
        clicks: r.clicks,
        bookings: r.bookings,
      });
    }
  }

  const tableRows = Array.from(branchMap.values())
    .map((r) => ({
      ...r,
      ctr: r.impressions > 0 ? r.clicks / r.impressions : 0,
      cvr: r.clicks > 0 ? r.bookings / r.clicks : 0,
      ctrChange: 0,
    }))
    .sort((a, b) => b.ctr - a.ctr);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">OTA 프로모션 효율 대시보드</h1>
            <p className="text-sm text-gray-500 mt-1">
              프로모션 적용 전후 CTR 변화를 추적합니다
            </p>
          </div>
          <Link
            href="/admin"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            프로모션 관리
          </Link>
        </div>

        <Filters
          branch={branch}
          channel={channel}
          period={period}
          from={from}
          to={to}
          onBranchChange={setBranch}
          onChannelChange={setChannel}
          onPeriodChange={setPeriod}
          onFromChange={setFrom}
          onToChange={setTo}
        />

        {loading ? (
          <div className="text-center text-gray-400 py-20">로딩 중...</div>
        ) : (
          <>
            <KpiCards
              data={{ totalImpressions, totalClicks, totalBookings, avgCtr, avgCvr, ctrChange }}
            />
            <CtrChart
              data={chartData}
              channels={activeChannels}
              promotions={promotions}
              metric="ctr"
            />
            <PromoTimeline promotions={promotions} />
            <BranchTable rows={tableRows} />
          </>
        )}
      </div>
    </main>
  );
}
