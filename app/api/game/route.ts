import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: Request) {
  try {
    const { action, userId, partnerId, gameId, momentIndex, choiceIndex } = await req.json()
    const supabase = getSupabase()

    if (action === 'start') {
      // Find existing game or create new one
      const { data: existing } = await supabase
        .from('compatibility_games')
        .select('*')
        .or(`and(user1_id.eq.${userId},user2_id.eq.${partnerId}),and(user1_id.eq.${partnerId},user2_id.eq.${userId})`)
        .eq('status', 'active')
        .single()

      if (existing) return NextResponse.json({ success: true, game: existing })

      const { data: newGame } = await supabase
        .from('compatibility_games')
        .insert([{ user1_id: userId, user2_id: partnerId }])
        .select()
        .single()

      return NextResponse.json({ success: true, game: newGame })
    }

    if (action === 'answer') {
      // Save answer
      const { error } = await supabase
        .from('compatibility_answers')
        .upsert([{
          game_id: gameId,
          user_id: userId,
          moment_index: momentIndex,
          choice_index: choiceIndex
        }], { onConflict: 'game_id,user_id,moment_index' })

      if (error) return NextResponse.json({ success: false, message: error.message })
      return NextResponse.json({ success: true })
    }

    if (action === 'status') {
      // Get answers for both users
      const { data: answers } = await supabase
        .from('compatibility_answers')
        .select('*')
        .eq('game_id', gameId)
        .order('moment_index')

      const myAnswers = answers?.filter(a => a.user_id === userId) || []
      const partnerAnswers = answers?.filter(a => a.user_id === partnerId) || []

      return NextResponse.json({
        success: true,
        myCount: myAnswers.length,
        partnerCount: partnerAnswers.length,
        myAnswers,
        partnerAnswers: myAnswers.length >= 12 ? partnerAnswers : [],
      })
    }

    if (action === 'results') {
      // Get all answers
      const { data: answers } = await supabase
        .from('compatibility_answers')
        .select('*')
        .eq('game_id', gameId)
        .order('moment_index')

      const myAnswers = answers?.filter(a => a.user_id === userId) || []
      const partnerAnswers = answers?.filter(a => a.user_id === partnerId) || []

      if (myAnswers.length < 5 || partnerAnswers.length < 5) {
        return NextResponse.json({ success: false, message: 'Game not complete' })
      }

      // Calculate matches
      const matches = myAnswers.map((a, i) => ({
        moment: a.moment_index,
        matched: a.choice_index === partnerAnswers[i]?.choice_index
      }))

      const matchCount = matches.filter(m => m.matched).length
      const score = Math.round((matchCount / 5) * 100)

      // Get profile names
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', [userId, partnerId])

      const myProfile = profiles?.find(p => p.id === userId)
      const partnerProfile = profiles?.find(p => p.id === partnerId)

      // Generate AI summary
      const matchedMoments = matches.filter(m => m.matched).map(m => m.moment)
      const differentMoments = matches.filter(m => !m.matched).map(m => m.moment)

      const chapterNames = ['dawn','morning','noon','afternoon','evening','dusk','dinner','night','late night','bedtime','midnight','end']
      const matchedChapters = matchedMoments.map(i => chapterNames[i]).join(', ')
      const differentChapters = differentMoments.map(i => chapterNames[i]).join(', ')

      let aiSummaryBn = ''
      let aiSummaryEn = ''

      try {
        const response = await anthropic.messages.create({
          model: 'claude-opus-4-5',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: `Two people completed a compatibility journey called "A Day Together" — a sealed game where they independently made choices about how they would live a day from dawn to midnight.

Score: ${score}% matched (${matchCount} of 12 moments aligned)
Aligned moments: ${matchedChapters}
Different moments: ${differentChapters || 'none'}

Write two short poetic summaries (2-3 sentences each):
1. In natural, warm Bangladeshi Bengali (not formal)
2. In English

Be warm, not clinical. Celebrate alignment. Frame differences as conversation starters, not problems. Do not mention percentages.

Reply in this exact JSON format only:
{
  "bn": "Bengali summary here",
  "en": "English summary here"
}`
          }]
        })

        const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
        const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
        aiSummaryBn = parsed.bn || ''
        aiSummaryEn = parsed.en || ''
      } catch (e) {
        aiSummaryBn = 'আপনাদের দিনটি অনেকাংশে মিলে গেছে। যেখানে পার্থক্য, সেখানেই আলাপের সুযোগ।'
        aiSummaryEn = 'Your day aligned in many beautiful ways. Where it differs, there lies your first real conversation.'
      }

      // Mark game complete
      await supabase
        .from('compatibility_games')
        .update({ status: 'complete' })
        .eq('id', gameId)

      return NextResponse.json({
        success: true,
        score,
        matchCount,
        matches,
        myAnswers,
        partnerAnswers,
        myName: myProfile?.full_name || 'You',
        partnerName: partnerProfile?.full_name || 'Partner',
        aiSummaryBn,
        aiSummaryEn
      })
    }

    return NextResponse.json({ success: false, message: 'Unknown action' })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message })
  }
}
