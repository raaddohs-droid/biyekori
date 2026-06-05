import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
const getSupabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
export async function POST(req: Request) {
  try {
    const { interestId, userId, action } = await req.json();
    if (!interestId || !userId || !["accepted","declined"].includes(action)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const { data: interest } = await getSupabase().from("interests").select("*").eq("id", interestId).single();
    if (!interest) return NextResponse.json({ error: "Interest not found" }, { status: 404 });
    // Allow both sender and receiver to update status
    const isInvolved = String(interest.receiver_id) === String(userId) || String(interest.sender_id) === String(userId);
    if (!isInvolved) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    await getSupabase().from("interests").update({ status: action }).eq("id", interestId);
    const { data: receiver } = await getSupabase().from("profiles").select("full_name").eq("id", userId).single();
    await getSupabase().from("notifications").insert([{ user_id: interest.sender_id, type: action === "accepted" ? "interest_accepted" : "interest_declined", message: action === "accepted" ? receiver?.full_name + " আপনার interest গ্রহণ করেছেন!" : receiver?.full_name + " এবার আপনার interest গ্রহণ করেননি।", profile_id: userId, is_read: false }]);
    if (action === "accepted") {
      // Fetch both profiles for mutual SMS
      const { data: senderProfile } = await getSupabase().from("profiles").select("phone,full_name,sms_on_mutual").eq("id", interest.sender_id).single();
      const { data: receiverProfile } = await getSupabase().from("profiles").select("phone,sms_on_mutual").eq("id", interest.receiver_id).single();
      const sendSms = async (phone: string, message: string) => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);
          await fetch("https://api.bulksmsbd.net/api/smsapi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ api_key: process.env.BULKSMS_API_KEY, senderid: process.env.BULKSMS_SENDER_ID, number: phone, message }), signal: controller.signal });
          clearTimeout(timeout);
        } catch(e) { console.log("SMS failed:", e); }
      };
      // SMS to sender (their interest was accepted)
      if (senderProfile?.phone && senderProfile?.sms_on_mutual !== false) {
        await sendSms(senderProfile.phone, "বিয়েকরি: " + receiver?.full_name + " আপনার interest গ্রহণ করেছেন! এখন যোগাযোগ করুন। biyekori.com/dashboard");
      }
      // SMS to receiver (mutual match notification)
      if (receiverProfile?.phone && receiverProfile?.sms_on_mutual !== false) {
        await sendSms(receiverProfile.phone, "বিয়েকরি: " + (senderProfile?.full_name || "একজন সদস্য") + " এর সাথে আপনার mutual interest হয়েছে! biyekori.com/dashboard");
      }
    }
    return NextResponse.json({ success: true });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}




