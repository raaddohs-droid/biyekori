import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
const getSupabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
export async function POST(req: Request) {
  try {
    const { senderId, receiverId } = await req.json();
    if (!senderId || !receiverId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const { data: sender } = await getSupabase().from("profiles").select("package").eq("id", senderId).single();
    if (sender?.package === "prottasha") {
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
      const { count } = await getSupabase().from("interests").select("*", { count: "exact", head: true }).eq("sender_id", senderId).gte("sent_at", monthStart.toISOString());
      if ((count || 0) >= 3) return NextResponse.json({ error: "Monthly limit reached. Upgrade to send more.", upgrade: true }, { status: 403 });
    }
    const { data: existing } = await getSupabase().from("interests").select("id,status").eq("sender_id", senderId).eq("receiver_id", receiverId).single();
    if (existing) return NextResponse.json({ error: "Already sent", status: existing.status }, { status: 409 });
    const { data: receiver } = await getSupabase().from("profiles").select("password,full_name").eq("id", receiverId).single();
    const isSeed = receiver?.password === "biyekori123";
    const { data, error } = await getSupabase().from("interests").insert([{ sender_id: senderId, receiver_id: receiverId, status: "pending", is_seed_receiver: isSeed }]).select("id").single();
    if (error) throw error;
    if (!isSeed) {
      const { data: senderProfile } = await getSupabase().from("profiles").select("full_name").eq("id", senderId).single();
      await getSupabase().from("notifications").insert([{ user_id: receiverId, type: "interest_received", message: senderProfile?.full_name + " আপনাকে interest পাঠিয়েছেন!", profile_id: senderId, is_read: false }]);
    }
    return NextResponse.json({ success: true, interestId: data.id });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}




