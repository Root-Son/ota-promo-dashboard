"use client";

import { BRANCHES, CHANNELS } from "@/lib/constants";
import type { Period } from "@/lib/types";

interface Props {
  branch: string;
  channel: string;
  period: Period;
  from: string;
  to: string;
  onBranchChange: (v: string) => void;
  onChannelChange: (v: string) => void;
  onPeriodChange: (v: Period) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}

export default function Filters(props: Props) {
  const selectClass =
    "border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        className={selectClass}
        value={props.branch}
        onChange={(e) => props.onBranchChange(e.target.value)}
      >
        <option value="">전체 지점</option>
        {BRANCHES.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={props.channel}
        onChange={(e) => props.onChannelChange(e.target.value)}
      >
        <option value="">전체 채널</option>
        {CHANNELS.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <div className="flex rounded-lg border overflow-hidden">
        {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => props.onPeriodChange(p)}
            className={`px-3 py-2 text-sm ${
              props.period === p
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {p === "daily" ? "일별" : p === "weekly" ? "주별" : "월별"}
          </button>
        ))}
      </div>

      <input
        type="date"
        className={selectClass}
        value={props.from}
        onChange={(e) => props.onFromChange(e.target.value)}
      />
      <span className="text-gray-400">~</span>
      <input
        type="date"
        className={selectClass}
        value={props.to}
        onChange={(e) => props.onToChange(e.target.value)}
      />
    </div>
  );
}
