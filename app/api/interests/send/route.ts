import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Interest limits by package
const INTEREST_LIMITS: Record<string, number> = {
  prottasha: 3,
  silver: 10,
  gold: 999,
  milon: 999,
}

// Contact view limits by package (per month)
const CONTACT_LIMITS: Record<string, number> = {
  prottasha: 0,
  silver: 3,
  gold: 20,
  milon: 999,
}

export async function GET(req: Request) {
  // Return monthly usage stats for the user
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  const supabase = getSupabase()
  const { data: profile } = await supabase.from('profiles').select('package').eq('id', userId).single()
  const pkg = profile?.package || 'prottasha'
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0)
  const { count } = await supabase.from('interests').select('*', { count: 'exact', head: true })
    .eq('sender_id', userId).gte('sent_at', monthStart.toISOString())
  const used = count || 0
  const limit = INTEREST_LIMITS[pkg] || 3
  return NextResponse.json({ used, limit, remaining: Math.max(0, limit - used), package: pkg })
}

export async function POST(req: Request) {
  try {
    const { senderId, receiverId } = await req.json();
    if (!senderId || !receiverId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const supabase = getSupabase()
    const { data: sender } = await supabase.from("profiles").select("package,created_at").eq("id", senderId).single();
    const pkg = sender?.package || 'prottasha'
    const limit = INTEREST_LIMITS[pkg] || 3

    // Check monthly limit (not unlimited)
    if (limit < 999) {
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
      const { count } = await supabase.from("interests").select("*", { count: "exact", head: true })
        .eq("sender_id", senderId).gte("sent_at", monthStart.toISOString());
      if ((count || 0) >= limit) {
        return NextResponse.json({
          error: `You've used all ${limit} interests this month.`,
          upgrade: true,
          limit,
          used: count,
          package: pkg
        }, { status: 403 });
      }
    }

    // Check receiver's contact filter
    const { data: receiverFilter } = await supabase.from("profiles")
      .select("contact_min_age,contact_max_age,contact_religion,age,religion")
      .eq("id", receiverId).single();
    const { data: senderData } = await supabase.from("profiles")
      .select("age,religion").eq("id", senderId).single();

    let filtered = false;
    if (receiverFilter && senderData) {
      const senderAge = senderData.age || 0;
      const senderReligion = senderData.religion || '';
      const minAge = receiverFilter.contact_min_age || 18;
      const maxAge = receiverFilter.contact_max_age || 60;
      const relFilter = receiverFilter.contact_religion || 'any';
      if (senderAge < minAge || senderAge > maxAge) filtered = true;
      if (relFilter !== 'any' && senderReligion !== relFilter) filtered = true;
    }

    const { data: existing } = await supabase.from("interests").select("id,status").eq("sender_id", senderId).eq("receiver_id", receiverId).single();
    if (existing) return NextResponse.json({ error: "Already sent", status: existing.status }, { status: 409 });

    const { data: receiver } = await supabase.from("profiles").select("password,full_name").eq("id", receiverId).single();
    const isSeed = receiver?.password === "biyekori123";

    const { data, error } = await supabase.from("interests").insert([{
      sender_id: senderId, receiver_id: receiverId,
      status: "pending", is_seed_receiver: isSeed, is_filtered: filtered
    }]).select("id").single();
    if (error) throw error;

    if (!isSeed) {
      const { data: senderProfile } = await supabase.from("profiles").select("full_name").eq("id", senderId).single();
      await supabase.from("notifications").insert([{
        user_id: receiverId, type: "interest_received",
        message: senderProfile?.full_name + " আপনাকে interest পাঠিয়েছেন!",
        profile_id: senderId, is_read: false
      }]);
    }

    // Return remaining count
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
    const { count: newCount } = await supabase.from("interests").select("*", { count: "exact", head: true })
      .eq("sender_id", senderId).gte("sent_at", monthStart.toISOString());
    const remaining = Math.max(0, limit - (newCount || 0))

    return NextResponse.json({ success: true, interestId: data.id, filtered, remaining, limit });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
