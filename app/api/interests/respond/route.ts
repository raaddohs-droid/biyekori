import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const getSupabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const SMS_LIMIT_PER_WEEK = 2 // max mutual SMS per user per week

export async function POST(req: Request) {
  try {
    const { interestId, userId, action } = await req.json();
    if (!interestId || !userId || !["accepted","declined"].includes(action))
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const supabase = getSupabase()

    const { data: interest } = await supabase.from("interests").select("*").eq("id", interestId).single();
    if (!interest) return NextResponse.json({ error: "Interest not found" }, { status: 404 });

    const isInvolved = String(interest.receiver_id) === String(userId) || String(interest.sender_id) === String(userId);
    if (!isInvolved) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    await supabase.from("interests").update({ status: action }).eq("id", interestId);

    const { data: receiver } = await supabase.from("profiles").select("full_name").eq("id", userId).single();

    await supabase.from("notifications").insert([{
      user_id: interest.sender_id,
      type: action === "accepted" ? "interest_accepted" : "interest_declined",
      message: action === "accepted"
        ? receiver?.full_name + " আপনার interest গ্রহণ করেছেন!"
        : receiver?.full_name + " এবার আপনার interest গ্রহণ করেননি।",
      profile_id: userId,
      is_read: false
    }]);

    if (action === "accepted") {
      const { data: senderProfile } = await supabase.from("profiles").select("phone,full_name,sms_on_mutual").eq("id", interest.sender_id).single();
      const { data: receiverProfile } = await supabase.from("profiles").select("phone,full_name,sms_on_mutual").eq("id", interest.receiver_id).single();

      const sendSms = async (phone: string, message: string) => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);
          await fetch("https://api.bulksmsbd.net/api/smsapi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ api_key: process.env.BULKSMS_API_KEY, senderid: process.env.BULKSMS_SENDER_ID, number: phone, message }),
            signal: controller.signal
          });
          clearTimeout(timeout);
        } catch(e) { console.log("SMS failed:", e); }
      };

      // Rate limit check: count mutual SMS sent to this user in past 7 days
      const checkSmsRateLimit = async (profileId: number): Promise<boolean> => {
        try {
          const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
          const { count } = await supabase
            .from("sms_log")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profileId)
            .eq("type", "mutual")
            .gte("sent_at", weekAgo)
          return (count || 0) < SMS_LIMIT_PER_WEEK
        } catch(e) {
          return true // if sms_log table doesn't exist yet, allow
        }
      }

      const logSms = async (profileId: number) => {
        try {
          await supabase.from("sms_log").insert([{ user_id: profileId, type: "mutual", sent_at: new Date().toISOString() }])
        } catch(e) {} // table may not exist
      }

      // SMS to sender
      if (senderProfile?.phone && senderProfile?.sms_on_mutual !== false) {
        const allowed = await checkSmsRateLimit(interest.sender_id)
        if (allowed) {
          await sendSms(senderProfile.phone, "বিয়েকরি: " + receiver?.full_name + " আপনার interest গ্রহণ করেছেন! এখন যোগাযোগ করুন। biyekori.com/dashboard");
          await logSms(interest.sender_id)
        }
      }

      // SMS to receiver
      if (receiverProfile?.phone && receiverProfile?.sms_on_mutual !== false) {
        const allowed = await checkSmsRateLimit(interest.receiver_id)
        if (allowed) {
          await sendSms(receiverProfile.phone, "বিয়েকরি: " + (senderProfile?.full_name || "একজন সদস্য") + " এর সাথে আপনার mutual interest হয়েছে! biyekori.com/dashboard");
          await logSms(interest.receiver_id)
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
