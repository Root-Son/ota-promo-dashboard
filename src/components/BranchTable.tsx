"use client";

import { CHANNEL_COLORS } from "@/lib/constants";

interface BranchRow {
  branch: string;
  channel: string;
  impressions: number;
  clicks: number;
  bookings: number;
  ctr: number;
  cvr: number;
  ctrChange: number;
}

interface Props {
  rows: BranchRow[];
}

export default function BranchTable({ rows }: Props) {
  const pct = (n: number) => `${(n * 100).toFixed(2)}%`;
  const delta = (n: number) => {
    if (n === 0) return "-";
    const s = (n * 100).toFixed(2);
    return n > 0 ? `+${s}%p` : `${s}%p`;
  };

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-xs">
            <th className="px-4 py-3 text-left">지점</th>
            <th className="px-4 py-3 text-left">채널</th>
            <th className="px-4 py-3 text-right">노출수</th>
            <th className="px-4 py-3 text-right">클릭수</th>
            <th className="px-4 py-3 text-right">예약수</th>
            <th className="px-4 py-3 text-right">CTR</th>
            <th className="px-4 py-3 text-right">CVR</th>
            <th className="px-4 py-3 text-right">CTR 변화</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2 font-medium">{r.branch}</td>
              <td className="px-4 py-2">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CHANNEL_COLORS[r.channel] || "#888" }}
                  />
                  {r.channel}
                </span>
              </td>
              <td className="px-4 py-2 text-right">{r.impressions.toLocaleString()}</td>
              <td className="px-4 py-2 text-right">{r.clicks.toLocaleString()}</td>
              <td className="px-4 py-2 text-right">{r.bookings.toLocaleString()}</td>
              <td className="px-4 py-2 text-right font-medium">{pct(r.ctr)}</td>
              <td className="px-4 py-2 text-right">{pct(r.cvr)}</td>
              <td className={`px-4 py-2 text-right font-medium ${
                r.ctrChange > 0 ? "text-green-600" : r.ctrChange < 0 ? "text-red-500" : "text-gray-400"
              }`}>
                {delta(r.ctrChange)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
