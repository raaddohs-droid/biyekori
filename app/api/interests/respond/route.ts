import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
const getSupabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
export async function POST(req: Request) {
  try {
    const { interestId, userId, action } = await req.json();
    if (!interestId || !userId || !["accepted","declined"].includes(action)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const { data: interest } = await getSupabase().from("interests").select("*").eq("id", interestId).single();
    if (!interest || String(interest.receiver_id) !== String(userId)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    await getSupabase().from("interests").update({ status: action, responded_at: new Date().toISOString() }).eq("id", interestId);
    const { data: receiver } = await getSupabase().from("profiles").select("full_name").eq("id", userId).single();
    await getSupabase().from("notifications").insert([{ user_id: interest.sender_id, type: action === "accepted" ? "interest_accepted" : "interest_declined", message: action === "accepted" ? receiver?.full_name + " আপনার interest গ্রহণ করেছেন!" : receiver?.full_name + " এবার আপনার interest গ্রহণ করেননি।", profile_id: userId, is_read: false }]);
    if (action === "accepted") {
      const { data: senderProfile } = await getSupabase().from("profiles").select("phone").eq("id", interest.sender_id).single();
      if (senderProfile?.phone) {
        await fetch("https://api.bulksmsbd.net/api/smsapi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ api_key: process.env.BULKSMS_API_KEY, senderid: process.env.BULKSMS_SENDER_ID, number: senderProfile.phone, message: "বিয়েকরি: " + receiver?.full_name + " আপনার interest গ্রহণ করেছেন! biyekori.com/dashboard" }) });
      }
    }
    return NextResponse.json({ success: true });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}




