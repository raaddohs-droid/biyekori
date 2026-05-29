import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const { data: sent, error: sentError } = await supabase
      .from("interests")
      .select("*")
      .eq("sender_id", parseInt(userId))
      .order("sent_at", { ascending: false });

    const { data: received, error: recError } = await supabase
      .from("interests")
      .select("*")
      .eq("receiver_id", parseInt(userId))
      .order("sent_at", { ascending: false });

    if (sentError) console.error("sent error:", sentError);
    if (recError) console.error("rec error:", recError);

    return NextResponse.json({ received: received || [], sent: sent || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
