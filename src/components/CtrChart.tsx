"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea, Legend,
} from "recharts";
import { CHANNEL_COLORS } from "@/lib/constants";
import type { Promotion } from "@/lib/types";

type DataPoint = Record<string, number | string>;

interface Props {
  data: DataPoint[];
  channels: string[];
  promotions: Promotion[];
  metric: "ctr" | "cvr";
}

export default function CtrChart({ data, channels, promotions, metric }: Props) {
  const label = metric === "ctr" ? "CTR" : "CVR";

  return (
    <div className="bg-white rounded-xl border p-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-3">{label} 추이</h3>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => `${(v * 100).toFixed(1)}%`}
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(v: any) => `${(Number(v) * 100).toFixed(2)}%`}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            labelFormatter={(l: any) => String(l)}
          />
          <Legend />

          {/* Promotion periods as shaded areas */}
          {promotions.map((p) => (
            <ReferenceArea
              key={p.id}
              x1={p.start_date}
              x2={p.end_date}
              fill="#FEF3C7"
              fillOpacity={0.5}
              label={{
                value: `${p.promo_name} (${p.discount_rate}%)`,
                position: "insideTop",
                fontSize: 10,
                fill: "#92400E",
              }}
            />
          ))}

          {channels.map((ch) => (
            <Line
              key={ch}
              type="monotone"
              dataKey={ch}
              stroke={CHANNEL_COLORS[ch] || "#888"}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
