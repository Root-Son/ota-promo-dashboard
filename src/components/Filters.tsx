"use client";

import { BRANCHES, CHANNELS, CHANNEL_COLORS } from "@/lib/constants";
import type { Period } from "@/lib/types";

interface Props {
  branch: string;
  channels: string[];
  period: Period;
  from: string;
  to: string;
  onBranchChange: (v: string) => void;
  onChannelsChange: (v: string[]) => void;
  onPeriodChange: (v: Period) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}

export default function Filters(props: Props) {
  const selectClass =
    "border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300";

  const toggleChannel = (ch: string) => {
    if (props.channels.includes(ch)) {
      props.onChannelsChange(props.channels.filter((c) => c !== ch));
    } else {
      props.onChannelsChange([...props.channels, ch]);
    }
  };

  const allSelected = props.channels.length === 0 || props.channels.length === CHANNELS.length;

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

      {/* Channel multi-select toggle buttons */}
      <div className="flex rounded-lg border overflow-hidden">
        <button
          onClick={() => props.onChannelsChange([])}
          className={`px-3 py-2 text-sm border-r ${
            allSelected
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          전체
        </button>
        {CHANNELS.map((ch) => {
          const selected = props.channels.includes(ch);
          return (
            <button
              key={ch}
              onClick={() => toggleChannel(ch)}
              className="px-3 py-2 text-sm border-r last:border-r-0 transition-colors"
              style={
                selected
                  ? { backgroundColor: CHANNEL_COLORS[ch], color: "#fff" }
                  : { backgroundColor: "#fff", color: "#666" }
              }
            >
              {ch}
            </button>
          );
        })}
      </div>

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
