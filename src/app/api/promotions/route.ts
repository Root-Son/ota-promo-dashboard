import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


// GET — list promotions
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const branch = sp.get("branch");
  const channelList = sp.getAll("channel");
  const activeOnly = sp.get("active") === "true";

  let query = supabase
    .from("ota_promotions")
    .select("*")
    .order("start_date", { ascending: false });

  if (branch) query = query.eq("branch", branch);
  if (channelList.length === 1) query = query.eq("channel", channelList[0]);
  else if (channelList.length > 1) query = query.in("channel", channelList);
  if (activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — create promotion
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { branch, channel, promo_name, discount_rate, start_date, end_date, description } = body;

  if (!branch || !channel || !promo_name || !start_date || !end_date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("ota_promotions")
    .insert({
      branch,
      channel,
      promo_name,
      discount_rate: discount_rate || 0,
      start_date,
      end_date,
      description: description || "",
      is_active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH — update promotion
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("ota_promotions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE — remove promotion
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("ota_promotions")
    .delete()
    .eq("id", parseInt(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
