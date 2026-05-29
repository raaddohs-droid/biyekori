import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
const getSupabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
export async function GET() {
  try {
    const now = new Date();
    const { data: pending } = await getSupabase().from("interests").select("id,sender_id,receiver_id,sent_at").eq("status","pending").eq("is_seed_receiver",true).eq("auto_responded",false);
    if (!pending?.length) return NextResponse.json({ processed: 0 });
    let accepted = 0, declined = 0, skipped = 0;
    for (const interest of pending) {
      const hoursAgo = (now.getTime() - new Date(interest.sent_at).getTime()) / 3600000;
      const minDelay = 2 + (interest.id % 46);
      if (hoursAgo < minDelay) { skipped++; continue; }
      const roll = Math.random();
      let status;
      if (roll < 0.60) { status = "accepted"; accepted++; }
      else if (roll < 0.90) { status = "declined"; declined++; }
      else { await getSupabase().from("interests").update({ auto_responded: true }).eq("id", interest.id); skipped++; continue; }
      await getSupabase().from("interests").update({ status, responded_at: now.toISOString(), auto_responded: true }).eq("id", interest.id);
      if (status === "accepted") {
        const { data: receiver } = await getSupabase().from("profiles").select("full_name").eq("id", interest.receiver_id).single();
        const { data: sender } = await getSupabase().from("profiles").select("phone").eq("id", interest.sender_id).single();
        await getSupabase().from("notifications").insert([{ user_id: interest.sender_id, type: "interest_accepted", message: receiver?.full_name + " আপনার interest গ্রহণ করেছেন!", profile_id: interest.receiver_id, is_read: false }]);
        if (sender?.phone) await fetch("https://api.bulksmsbd.net/api/smsapi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ api_key: process.env.BULKSMS_API_KEY, senderid: process.env.BULKSMS_SENDER_ID, number: sender.phone, message: "বিয়েকরি: " + receiver?.full_name + " আপনার interest গ্রহণ করেছেন! biyekori.com/dashboard" }) });
      }
    }
    return NextResponse.json({ processed: pending.length, accepted, declined, skipped });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}




