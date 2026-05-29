import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
const getSupabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    const { data: received } = await getSupabase().from("interests").select("*, sender:profiles!interests_sender_id_fkey(full_name, photo_url, age, district, profession)").eq("receiver_id", userId).order("sent_at", { ascending: false });
    const { data: sent } = await getSupabase().from("interests").select("*, receiver:profiles!interests_receiver_id_fkey(full_name, photo_url, age, district, profession)").eq("sender_id", userId).order("sent_at", { ascending: false });
    return NextResponse.json({ received: received || [], sent: sent || [] });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}





