import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const { data: sent } = await supabase
      .from("interests")
      .select("*, receiver:profiles!receiver_id(id, full_name, photo_url, age, district, profession, guardian_mode)")
      .eq("sender_id", parseInt(userId))
      .order("created_at", { ascending: false });

    const { data: received } = await supabase
      .from("interests")
      .select("*, sender:profiles!sender_id(id, full_name, photo_url, age, district, profession, guardian_mode)")
      .eq("receiver_id", parseInt(userId))
      .order("created_at", { ascending: false });

    return NextResponse.json({ received: received || [], sent: sent || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
