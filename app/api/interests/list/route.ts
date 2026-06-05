import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    // Fetch user's contact filter settings
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("contact_min_age, contact_max_age, contact_religion")
      .eq("id", parseInt(userId))
      .single();

    const minAge = userProfile?.contact_min_age || 18;
    const maxAge = userProfile?.contact_max_age || 60;
    const religionFilter = userProfile?.contact_religion || "any";

    const { data: sent } = await supabase
      .from("interests")
      .select("*, receiver:profiles!receiver_id(id, full_name, photo_url, age, district, profession, guardian_mode)")
      .eq("sender_id", parseInt(userId))
      .order("created_at", { ascending: false });

    const { data: received } = await supabase
      .from("interests")
      .select("*, sender:profiles!sender_id(id, full_name, photo_url, age, district, profession, guardian_mode, religion)")
      .eq("receiver_id", parseInt(userId))
      .order("created_at", { ascending: false });

    // Split received into normal and filtered
    const normal: any[] = [];
    const filtered: any[] = [];

    for (const interest of (received || [])) {
      const sender = interest.sender;
      const age = sender?.age || 0;
      const religion = sender?.religion || "";

      let filterReason = null;

      if (age < minAge || age > maxAge) {
        filterReason = `Age ${age} is outside your preferred range (${minAge}–${maxAge})`;
      } else if (religionFilter !== "any" && religion && religion !== religionFilter) {
        filterReason = `Religion (${religion}) does not match your preference (${religionFilter})`;
      }

      if (filterReason) {
        filtered.push({ ...interest, filterReason });
      } else {
        normal.push(interest);
      }
    }

    return NextResponse.json({ received: normal, filtered, sent: sent || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
