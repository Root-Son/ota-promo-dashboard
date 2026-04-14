"use client";

interface KpiData {
  totalImpressions: number;
  totalClicks: number;
  totalBookings: number;
  avgCtr: number;
  avgCvr: number;
  ctrChange: number; // vs previous period
}

export default function KpiCards({ data }: { data: KpiData }) {
  const fmt = (n: number) => n.toLocaleString();
  const pct = (n: number) => `${(n * 100).toFixed(2)}%`;
  const delta = (n: number) =>
    n > 0 ? `+${(n * 100).toFixed(2)}%p` : `${(n * 100).toFixed(2)}%p`;

  const cards = [
    { label: "총 노출수", value: fmt(data.totalImpressions), sub: null },
    { label: "총 클릭수", value: fmt(data.totalClicks), sub: null },
    { label: "총 예약수", value: fmt(data.totalBookings), sub: null },
    {
      label: "평균 CTR",
      value: pct(data.avgCtr),
      sub: delta(data.ctrChange),
      positive: data.ctrChange >= 0,
    },
    { label: "평균 CVR", value: pct(data.avgCvr), sub: null },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">{c.label}</p>
          <p className="text-xl font-bold mt-1">{c.value}</p>
          {c.sub && (
            <p className={`text-xs mt-1 ${
              c.positive ? "text-green-600" : "text-red-500"
            }`}>
              전기 대비 {c.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
