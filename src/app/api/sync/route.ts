import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { readSheet } from "@/lib/gsheets";
import { SPREADSHEET_ID, SHEET_NAME } from "@/lib/constants";

export const maxDuration = 60;

function parseDate(raw: string): string {
  // "2025. 10. 1" → "2025-10-01"
  const parts = raw.replace(/\s/g, "").split(".");
  if (parts.length < 3) return raw;
  return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
}

function parseNum(raw: string | undefined): number {
  if (!raw) return 0;
  return parseInt(raw.replace(/,/g, ""), 10) || 0;
}

export async function POST() {
  try {
    const rows = await readSheet(SPREADSHEET_ID, `${SHEET_NAME}!A2:H`);
    if (!rows.length) return NextResponse.json({ error: "No data" }, { status: 400 });

    const records = rows
      .filter((r) => r.length >= 6 && r[0] && r[1] && r[2])
      .map((r) => {
        const impressions = parseNum(r[4]);
        const clicks = parseNum(r[5]);
        const bookings = parseNum(r[6]);
        return {
          date: parseDate(r[0]),
          channel: r[1],
          branch: r[2],
          rank: parseNum(r[3]) || null,
          impressions,
          clicks,
          bookings,
          ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 10000 : 0,
          cvr: clicks > 0 ? Math.round((bookings / clicks) * 10000) / 10000 : 0,
        };
      });

    // Upsert in chunks of 500
    const chunkSize = 500;
    let upserted = 0;
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      const { error } = await supabase
        .from("ota_ctr_daily")
        .upsert(chunk, { onConflict: "date,channel,branch" });
      if (error) throw error;
      upserted += chunk.length;
    }

    return NextResponse.json({ success: true, upserted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
