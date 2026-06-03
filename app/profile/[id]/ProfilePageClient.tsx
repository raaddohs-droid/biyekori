'use client'

import Link from 'next/link'
import { useState } from 'react'

// ─── SCORING ENGINE ───────────────────────────────────────────

function calculateScores(profile: any) {
  const breakdown: any[] = []
  let totalScore = 0

  const religionMatch = profile.religion === 'Islam'
  const religionScore = religionMatch ? 25 : 5
  totalScore += religionScore
  breakdown.push({
    factor: 'Religion', icon: '🕌', score: religionScore, max: 25, matched: religionMatch,
    reason: religionMatch ? `Both are ${profile.religion} — strong foundation` : `Religion is ${profile.religion} — may differ from your preference`,
    tip: 'Religion compatibility is the #1 factor in Bangladeshi marriages'
  })

  const age = profile.age
  const ageInRange = age >= 20 && age <= 35
  const ageScore = ageInRange ? 15 : age >= 18 && age <= 40 ? 8 : 3
  totalScore += ageScore
  breakdown.push({
    factor: 'Age Preference', icon: '🎂', score: ageScore, max: 15, matched: ageInRange,
    reason: ageInRange ? `Age ${age} is within typical preference range` : `Age ${age} is outside the typical preference range`,
    tip: 'Log in to set your exact age preference for accurate matching'
  })

  const eduRank: Record<string, number> = { 'SSC': 1, 'HSC': 2, "Bachelor's": 3, "Master's": 4, 'Medical': 5, 'Engineering': 5, 'Law': 4 }
  const eduScore = (eduRank[profile.education] || 3) >= 3 ? 15 : (eduRank[profile.education] || 3) === 2 ? 8 : 5
  totalScore += eduScore
  breakdown.push({
    factor: 'Education', icon: '🎓', score: eduScore, max: 15, matched: eduScore >= 12,
    reason: eduScore >= 12 ? `${profile.education} degree — strong educational background` : `${profile.education} — may differ from your preference`,
    tip: 'Higher education usually means better compatibility for modern couples'
  })

  totalScore += 7
  breakdown.push({
    factor: 'Location', icon: '📍', score: 7, max: 10, matched: true,
    reason: `Based in ${profile.city}, ${profile.district}`,
    tip: 'Log in to match with people near your preferred location'
  })

  const persScore = profile.personality_type ? 8 : 5
  totalScore += persScore
  breakdown.push({
    factor: 'Personality', icon: '🧠', score: persScore, max: 10, matched: persScore >= 8,
    reason: profile.personality_type ? `Personality: "${profile.personality_type}"` : 'Personality not specified',
    tip: 'Personality compatibility predicts long-term happiness'
  })

  const relScore = profile.religious_level === 'Religious' ? 10 : profile.religious_level === 'Very Religious' ? 7 : 5
  totalScore += relScore
  breakdown.push({
    factor: 'Religious Practice', icon: '🙏', score: relScore, max: 10, matched: relScore >= 8,
    reason: `Prayer habit: ${profile.prayer_habit || 'Not specified'}`,
    tip: 'Matching religious practice leads to harmonious family life'
  })

  const famScore = profile.family_values ? 8 : 5
  totalScore += famScore
  breakdown.push({
    factor: 'Family Values', icon: '👨‍👩‍👧‍👦', score: famScore, max: 10, matched: famScore >= 8,
    reason: profile.family_values ? `Family values: ${profile.family_values}` : 'Family values not specified',
    tip: 'Shared family values are essential for a lasting marriage'
  })

  const hobbyScore = profile.hobbies ? 4 : 2
  totalScore += hobbyScore
  breakdown.push({
    factor: 'Shared Interests', icon: '🎨', score: hobbyScore, max: 5, matched: hobbyScore >= 3,
    reason: profile.hobbies ? `Hobbies: ${profile.hobbies}` : 'Hobbies not specified',
    tip: 'Shared hobbies make daily life more enjoyable together'
  })

  let predictability = 0
  const predBreakdown = [
    { label: 'Profile Photo', icon: '📸', met: !!profile.photo_url, points: 15, tip: 'A photo builds trust and confidence' },
    { label: 'About Me written', icon: '✍️', met: (profile.about_me?.length || 0) > 30, points: 10, tip: 'Tells us who this person really is' },
    { label: 'Partner Preference', icon: '💕', met: (profile.partner_preference?.length || 0) > 20, points: 10, tip: 'Helps AI understand what they want' },
    { label: 'NID Verified', icon: '🪪', met: !!profile.nid_verified, points: 15, tip: 'Confirms this is a real, verified person' },
    { label: 'Religion & Prayer', icon: '🕌', met: !!profile.religion && !!profile.prayer_habit, points: 10, tip: 'Key compatibility factor' },
    { label: 'Education & Profession', icon: '🎓', met: !!profile.education && !!profile.profession, points: 10, tip: 'Helps assess lifestyle compatibility' },
    { label: 'Family Info', icon: '👨‍👩‍👧', met: !!profile.father_profession, points: 10, tip: 'Family background matters in BD marriages' },
    { label: 'Hobbies & Interests', icon: '🎨', met: !!profile.hobbies && !!profile.interests, points: 10, tip: 'Shared interests improve compatibility' },
    { label: 'Height & Weight', icon: '📏', met: !!profile.height && !!profile.weight, points: 5, tip: 'Physical compatibility factor' },
    { label: 'Phone Verified', icon: '📱', met: !!profile.phone_verified, points: 5, tip: 'Confirms genuine registration' },
  ]
  predBreakdown.forEach(c => { if (c.met) predictability += c.points })

  return {
    matchScore: Math.min(Math.round(totalScore), 100),
    predictability: Math.min(predictability, 100),
    breakdown,
    predBreakdown
  }
}

function getMatchLabel(s: number) {
  if (s >= 85) return 'Excellent Match! 🌟'
  if (s >= 70) return 'Good Match 👍'
  if (s >= 55) return 'Fair Match 🤝'
  if (s >= 40) return 'Possible Match 🔍'
  return 'Low Match ⚠️'
}
function getPredLabel(s: number) {
  if (s >= 80) return 'High Confidence ✅'
  if (s >= 60) return 'Good Confidence 👍'
  if (s >= 40) return 'Moderate Confidence ⚠️'
  return 'Low Confidence ❌'
}

// ─── MODAL ────────────────────────────────────────────────────

function ScoreModal({ profile, onClose }: { profile: any, onClose: () => void }) {
  const { matchScore, predictability, breakdown, predBreakdown } = calculateScores(profile)
  const [tab, setTab] = useState<'match' | 'predict'>('match')

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">🤖 AI Score Explained</h2>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 text-lg font-bold">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className={`rounded-xl p-3 text-center cursor-pointer transition ${tab === 'match' ? 'bg-white/30 ring-2 ring-white' : 'bg-white/10'}`} onClick={() => setTab('match')}>
              <div className="text-3xl font-black">{matchScore}%</div>
              <div className="text-sm font-bold">AI Match Score</div>
              <div className="text-xs text-purple-200">{getMatchLabel(matchScore)}</div>
              <div className="text-xs text-purple-300 mt-1">Tap to see breakdown</div>
            </div>
            <div className={`rounded-xl p-3 text-center cursor-pointer transition ${tab === 'predict' ? 'bg-white/30 ring-2 ring-white' : 'bg-white/10'}`} onClick={() => setTab('predict')}>
              <div className="text-3xl font-black" style={{ color: predictability >= 60 ? '#34d399' : '#fbbf24' }}>{predictability}%</div>
              <div className="text-sm font-bold">Predictability</div>
              <div className="text-xs text-purple-200">{getPredLabel(predictability)}</div>
              <div className="text-xs text-purple-300 mt-1">Tap to see breakdown</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {tab === 'match' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-800">
                ℹ️ Score based on <strong>general preferences</strong>. <Link href="/login" className="text-blue-600 font-bold underline">Log in</Link> for your personal match score!
              </div>
              <h3 className="font-bold text-gray-800 mb-3">Match Score Breakdown</h3>
              <div className="space-y-3">
                {breakdown.map((item: any, i: number) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span className="font-semibold text-gray-800 text-sm">{item.factor}</span>
                      </div>
                      <span className="text-xs text-gray-500">{item.score}/{item.max} pts</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${(item.score / item.max) * 100}%`, backgroundColor: item.matched ? '#10b981' : '#f97316' }} />
                    </div>
                    <p className="text-xs text-gray-600">{item.reason}</p>
                    <p className="text-xs text-purple-600 italic mt-1">💡 {item.tip}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'predict' && (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800">
                ℹ️ <strong>Predictability</strong> = how complete this profile is. More info = more accurate AI matching.
              </div>
              <h3 className="font-bold text-gray-800 mb-3">Profile Completeness</h3>
              <div className="space-y-2">
                {predBreakdown.map((item: any, i: number) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${item.met ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800">{item.label}</span>
                        <span className={`text-xs font-bold ${item.met ? 'text-green-600' : 'text-red-400'}`}>{item.met ? `+${item.points}%` : '—'}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.tip}</p>
                    </div>
                    <span>{item.met ? '✅' : '❌'}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-3">Want YOUR match score with this person?</p>
            <Link href="/login" className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl text-sm hover:shadow-lg transition">
              🔑 Log In for Personal Match Score
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN CLIENT COMPONENT ────────────────────────────────────

export default function ProfilePageClient({ profile }: { profile: any }) {
  const [showModal, setShowModal] = useState(false)
  const { matchScore, predictability } = calculateScores(profile)

  const matchCircle = 2 * Math.PI * 54
  const predCircle = 2 * Math.PI * 54

  const hasValue = (value: any) => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim() !== '' && value.trim().toLowerCase() !== 'not specified'
    return true
  }

  const showDegree = hasValue(profile.degree) &&
    profile.degree !== profile.education &&
    !['SSC', 'HSC'].includes(profile.education)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        <Link href="/profiles" className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-6 font-medium">← Back to Profiles</Link>

        {/* AI Score Card */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🤖</span>
            <div>
              <h2 className="text-xl font-bold">AI Compatibility Analysis</h2>
              <p className="text-purple-200 text-xs">Powered by Biyekori AI Matchmaker • Based on general preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 bg-white/10 rounded-xl p-6 mt-4">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <svg width="128" height="128" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="12" />
                  <circle cx="64" cy="64" r="54" fill="none" stroke="white" strokeWidth="12"
                    strokeDasharray={matchCircle} strokeDashoffset={matchCircle - (matchScore / 100) * matchCircle} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-black text-white">{matchScore}%</span>
                </div>
              </div>
              <p className="font-bold text-white mt-2">AI Match Score</p>
              <p className="text-purple-200 text-xs text-center mt-1">{getMatchLabel(matchScore)}</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <svg width="128" height="128" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="12" />
                  <circle cx="64" cy="64" r="54" fill="none"
                    stroke={predictability >= 60 ? '#34d399' : '#fbbf24'} strokeWidth="12"
                    strokeDasharray={predCircle} strokeDashoffset={predCircle - (predictability / 100) * predCircle} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-black" style={{ color: predictability >= 60 ? '#34d399' : '#fbbf24' }}>{predictability}%</span>
                </div>
              </div>
              <p className="font-bold text-white mt-2">Predictability</p>
              <p className="text-purple-200 text-xs text-center mt-1">{getPredLabel(predictability)}</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-6 py-2.5 rounded-xl transition text-sm hover:bg-purple-50 shadow-lg"
            >
              🔍 Why this score? Tap to understand
            </button>
            <p className="text-purple-200 text-xs mt-2">Score is based on general preferences • Log in for your personal match score</p>
          </div>
        </div>

        {showModal && <ScoreModal profile={profile} onClose={() => setShowModal(false)} />}

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-32"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-16">
              <div className="flex-shrink-0">
                {profile.photo_url ? (
                  <img src={profile.photo_url} alt={profile.full_name || 'Profile'} className="w-40 h-40 rounded-2xl border-4 border-white shadow-lg object-cover" />
                ) : (
                  <div className="w-40 h-40 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-4xl">{profile.gender === 'male' ? '👨' : '👩'}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 mt-4 md:mt-16">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.full_name || 'Anonymous'}</h1>
                <div className="flex flex-wrap gap-2 mb-3">
                  {hasValue(profile.age) && <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">{profile.age} years</span>}
                  {hasValue(profile.marital_status) && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">{profile.marital_status}</span>}
                  {profile.nid_verified && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">✓ NID Verified</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {hasValue(profile.religious_level) && <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm">🕌 {profile.religious_level}</span>}
                  {hasValue(profile.city) && <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">📍 {profile.city}</span>}
                  {hasValue(profile.profession) && <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm">💼 {profile.profession}</span>}
                  {hasValue(profile.education) && <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-sm">🎓 {profile.education}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {hasValue(profile.about_me) && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📝 About Me</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.about_me}</p>
          </div>
        )}

        {hasValue(profile.partner_preference) && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">💕 What I'm Looking For</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.partner_preference}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {(hasValue(profile.height) || hasValue(profile.weight)) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">👤 Personal Details</h3>
              <div className="space-y-3">
                {hasValue(profile.height) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Height</span><span className="font-medium">{profile.height}</span></div>}
                {hasValue(profile.weight) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Weight</span><span className="font-medium">{profile.weight} kg</span></div>}
                {hasValue(profile.complexion) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Complexion</span><span className="font-medium">{profile.complexion}</span></div>}
                {hasValue(profile.body_type) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Body Type</span><span className="font-medium">{profile.body_type}</span></div>}
                {hasValue(profile.blood_group) && <div className="flex justify-between py-2"><span className="text-gray-600">Blood Group</span><span className="font-medium">{profile.blood_group}</span></div>}
              </div>
            </div>
          )}

          {hasValue(profile.city) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📍 Location</h3>
              <div className="space-y-3">
                {hasValue(profile.city) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">City</span><span className="font-medium">{profile.city}</span></div>}
                {hasValue(profile.district) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">District</span><span className="font-medium">{profile.district}</span></div>}
                {hasValue(profile.country) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Country</span><span className="font-medium">{profile.country}</span></div>}
                {hasValue(profile.willing_to_relocate) && <div className="flex justify-between py-2"><span className="text-gray-600">Willing to Relocate</span><span className="font-medium">{profile.willing_to_relocate ? 'Yes' : 'No'}</span></div>}
              </div>
            </div>
          )}

          {hasValue(profile.education) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🎓 Education</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Education Level</span><span className="font-medium">{profile.education}</span></div>
                {showDegree && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Degree</span><span className="font-medium">{profile.degree}</span></div>}
                {hasValue(profile.institution) && <div className="flex justify-between py-2"><span className="text-gray-600">Institution</span><span className="font-medium">{profile.institution}</span></div>}
              </div>
            </div>
          )}

          {hasValue(profile.profession) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">💼 Career & Income</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Profession</span><span className="font-medium">{profile.profession}</span></div>
                {hasValue(profile.monthly_income) && profile.monthly_income > 0 && (
                  <div className="flex justify-between py-2"><span className="text-gray-600">Monthly Income</span><span className="font-medium">৳{Number(profile.monthly_income).toLocaleString()}</span></div>
                )}
              </div>
            </div>
          )}

          {hasValue(profile.religious_level) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🕌 Religious Background</h3>
              <div className="space-y-3">
                {hasValue(profile.religion) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Religion</span><span className="font-medium">{profile.religion}</span></div>}
                {hasValue(profile.sect) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Sect</span><span className="font-medium">{profile.sect}</span></div>}
                {hasValue(profile.religious_level) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Religious Level</span><span className="font-medium">{profile.religious_level}</span></div>}
                {hasValue(profile.prayer_habit) && <div className="flex justify-between py-2"><span className="text-gray-600">Prayer Habit</span><span className="font-medium">{profile.prayer_habit}</span></div>}
              </div>
            </div>
          )}

          {hasValue(profile.father_profession) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">👨‍👩‍👧‍👦 Family Background</h3>
              <div className="space-y-3">
                {hasValue(profile.father_profession) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Father's Profession</span><span className="font-medium">{profile.father_profession}</span></div>}
                {hasValue(profile.mother_profession) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Mother's Profession</span><span className="font-medium">{profile.mother_profession}</span></div>}
                {hasValue(profile.total_siblings) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Total Siblings</span><span className="font-medium">{profile.total_siblings}</span></div>}
                {hasValue(profile.family_type) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Family Type</span><span className="font-medium">{profile.family_type}</span></div>}
                {hasValue(profile.family_values) && <div className="flex justify-between py-2"><span className="text-gray-600">Family Values</span><span className="font-medium">{profile.family_values}</span></div>}
              </div>
            </div>
          )}

          {hasValue(profile.hobbies) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🎨 Lifestyle & Hobbies</h3>
              <div className="space-y-3">
                {hasValue(profile.diet) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Diet</span><span className="font-medium">{profile.diet}</span></div>}
                {hasValue(profile.personality_type) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Personality</span><span className="font-medium">{profile.personality_type}</span></div>}
                {hasValue(profile.hobbies) && <div className="py-2 border-b border-gray-100"><span className="text-gray-600 block mb-1">Hobbies</span><span className="font-medium text-sm">{profile.hobbies}</span></div>}
                {hasValue(profile.interests) && <div className="py-2"><span className="text-gray-600 block mb-1">Interests</span><span className="font-medium text-sm">{profile.interests}</span></div>}
              </div>
            </div>
          )}
        </div>

        {hasValue(profile.expected_age_min) && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">👑 Partner Expectations</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Expected Age</span><span className="font-medium">{profile.expected_age_min} - {profile.expected_age_max} years</span></div>
              {hasValue(profile.expected_education) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Expected Education</span><span className="font-medium">{profile.expected_education}</span></div>}
              {hasValue(profile.expected_religious_level) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Religious Level</span><span className="font-medium">{profile.expected_religious_level}</span></div>}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all">💌 Send Interest</button>
            <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all">💬 Send Message</button>
            <button className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-all">📥 Download Biodata</button>
            <button className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-all">🔗 Shortlist</button>
          </div>
        </div>

      </div>
    </div>
  )
}
