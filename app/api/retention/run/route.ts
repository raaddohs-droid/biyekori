import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── helpers ────────────────────────────────────────────────────────────────

async function alreadyInteracted(seedId: number, userId: number, action: string): Promise<boolean> {
  const { data } = await supabase
    .from('seed_interactions')
    .select('id')
    .eq('seed_id', seedId)
    .eq('user_id', userId)
    .eq('action', action)
    .limit(1)
  return (data?.length ?? 0) > 0
}

async function logInteraction(seedId: number, userId: number, action: string) {
  await supabase.from('seed_interactions').insert({ seed_id: seedId, user_id: userId, action })
}

// Pick a compatible seed for a user (religion match, opposite gender, has photo, never used same action before)
async function pickSeed(userId: number, userGender: string, userReligion: string, action: string) {
  const seedGender = userGender === 'male' ? 'female' : 'male'

  const { data: seeds } = await supabase
    .from('profiles')
    .select('id, full_name, religion, district')
    .eq('gender', seedGender)
    .eq('religion', userReligion)
    .not('photo_url', 'is', null)
    .limit(50)

  if (!seeds?.length) return null

  for (const seed of seeds.sort(() => Math.random() - 0.5)) {
    const used = await alreadyInteracted(seed.id, userId, action)
    if (!used) return seed
  }
  return null
}

// ─── actions ────────────────────────────────────────────────────────────────

async function seedView(userId: number, seedId: number) {
  await supabase.from('profile_views').insert({
    viewer_id: seedId,
    viewed_profile_id: userId,
    viewed_at: new Date().toISOString()
  })
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'profile_view',
    message: 'Someone viewed your profile',
    is_read: false
  })
  await logInteraction(seedId, userId, 'view')
}

async function seedShortlist(userId: number, seedId: number) {
  await supabase.from('shortlists').insert({
    user_id: seedId,
    profile_id: userId
  })
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'shortlisted',
    message: 'Someone shortlisted your profile',
    is_read: false
  })
  await logInteraction(seedId, userId, 'shortlist')
}

async function seedAcceptInterest(interestId: number, seedId: number, userId: number) {
  await supabase.from('interests').update({ status: 'accepted' }).eq('id', interestId)
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'interest_accepted',
    message: 'Your interest was accepted',
    is_read: false
  })
  await logInteraction(seedId, userId, 'accept')
}

// ─── main engine ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    // Auth check — only allow from cron or admin
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'biyekori-cron-2026'
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = { views: 0, shortlists: 0, accepts: 0, skipped: 0 }
    const now = new Date()

    // ── 1. NEW USERS (registered in last 7 days) ──────────────────────────
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: newUsers } = await supabase
      .from('profiles')
      .select('id, gender, religion, created_at')
      .gte('created_at', sevenDaysAgo)
      .eq('is_banned', false)
      .limit(100)

    for (const user of newUsers || []) {
      const daysSinceJoin = (now.getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)

      // Day 1-2: seed views their profile (2 seeds)
      if (daysSinceJoin <= 2) {
        for (let i = 0; i < 2; i++) {
          const seed = await pickSeed(user.id, user.gender, user.religion, 'view')
          if (seed) { await seedView(user.id, seed.id); results.views++ }
        }
      }

      // Day 2-4: 1 seed shortlists them
      if (daysSinceJoin >= 2 && daysSinceJoin <= 4) {
        const seed = await pickSeed(user.id, user.gender, user.religion, 'shortlist')
        if (seed) { await seedShortlist(user.id, seed.id); results.shortlists++ }
        else results.skipped++
      }
    }

    // ── 2. STRUGGLING USERS (3+ interests sent, 0 accepted back) ─────────
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: strugglers } = await supabase
      .from('profiles')
      .select('id, gender, religion')
      .eq('is_banned', false)
      .gte('created_at', thirtyDaysAgo)
      .limit(200)

    for (const user of strugglers || []) {
      // Count sent interests this month
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0)
      const { count: sentCount } = await supabase
        .from('interests')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', user.id)
        .gte('sent_at', monthStart.toISOString())

      if ((sentCount || 0) < 3) continue

      // Count accepted interests received
      const { count: acceptedCount } = await supabase
        .from('interests')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('status', 'accepted')

      if ((acceptedCount || 0) > 0) continue // already has a response

      // Check if already got a seed accept recently
      const { data: recentAccept } = await supabase
        .from('seed_interactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('action', 'accept')
        .gte('created_at', thirtyDaysAgo)
        .limit(1)

      if (recentAccept?.length) continue // already helped this month

      // Find a pending interest from this user to a seed profile
      const { data: pendingInterests } = await supabase
        .from('interests')
        .select('id, receiver_id, receiver:receiver_id(id, gender, religion, photo_url)')
        .eq('sender_id', user.id)
        .eq('status', 'pending')
        .limit(20)

      let accepted = false
      for (const interest of pendingInterests || []) {
        const receiver = interest.receiver as any
        if (!receiver?.photo_url) continue
        if (receiver.religion !== user.religion) continue
        // This receiver acts as the seed accepting
        const alreadyUsed = await alreadyInteracted(receiver.id, user.id, 'accept')
        if (alreadyUsed) continue
        await seedAcceptInterest(interest.id, receiver.id, user.id)
        results.accepts++
        accepted = true
        break
      }

      if (!accepted) {
        // No pending interest to a compatible profile — seed shortlists them instead
        const seed = await pickSeed(user.id, user.gender, user.religion, 'shortlist')
        if (seed) { await seedShortlist(user.id, seed.id); results.shortlists++ }
      }
    }

    // ── 3. PENDING INTERESTS TO SEED PROFILES — accept with delay ────────
    // Find interests sent to seed profiles (any profile with no login activity)
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()
    const { data: pendingToSeeds } = await supabase
      .from('interests')
      .select('id, sender_id, receiver_id, sent_at, sender:sender_id(id, gender, religion), receiver:receiver_id(id, gender, religion, photo_url, last_active_at)')
      .eq('status', 'pending')
      .lte('sent_at', fortyEightHoursAgo) // sent 48h+ ago
      .limit(50)

    for (const interest of pendingToSeeds || []) {
      const sender = interest.sender as any
      const receiver = interest.receiver as any
      if (!receiver?.photo_url) continue
      if (receiver.religion !== sender?.religion) continue
      // Only accept if receiver has no recent real activity (seed-like)
      const lastActive = receiver.last_active_at ? new Date(receiver.last_active_at) : null
      const isInactive = !lastActive || (now.getTime() - lastActive.getTime()) > 7 * 24 * 60 * 60 * 1000
      if (!isInactive) continue

      const alreadyUsed = await alreadyInteracted(receiver.id, sender.id, 'accept')
      if (alreadyUsed) continue

      await seedAcceptInterest(interest.id, receiver.id, sender.id)
      results.accepts++
    }

    return NextResponse.json({ success: true, results, timestamp: now.toISOString() })
  } catch (err: any) {
    console.error('Retention engine error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Also allow GET for Vercel cron (cron jobs use GET)
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || 'biyekori-cron-2026'
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return POST(request)
}
