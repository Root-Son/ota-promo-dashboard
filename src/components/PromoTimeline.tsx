"use client";

import type { Promotion } from "@/lib/types";
import { CHANNEL_COLORS } from "@/lib/constants";

interface Props {
  promotions: Promotion[];
}

export default function PromoTimeline({ promotions }: Props) {
  if (!promotions.length) {
    return (
      <div className="bg-white rounded-xl border p-4 text-center text-gray-400 text-sm">
        등록된 프로모션이 없습니다
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-3">프로모션 타임라인</h3>
      <div className="space-y-2">
        {promotions.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 text-sm"
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: CHANNEL_COLORS[p.channel] || "#888" }}
            />
            <span className="text-gray-500 w-20 flex-shrink-0">{p.channel}</span>
            <span className="font-medium w-28 flex-shrink-0">{p.branch}</span>
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs">
              {p.promo_name} ({p.discount_rate}%)
            </span>
            <span className="text-gray-400 text-xs">
              {p.start_date} ~ {p.end_date}
            </span>
            <span className={`text-xs ml-auto ${p.is_active ? "text-green-600" : "text-gray-400"}`}>
              {p.is_active ? "진행중" : "종료"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
