'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function recordView(profileId: string) {
  const userData = localStorage.getItem('biyekori_user');
  const viewer = userData ? JSON.parse(userData) : null;
  await fetch(`${SUPABASE_URL}/rest/v1/profile_views`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
    body: JSON.stringify({ viewed_profile_id: profileId, viewer_id: viewer?.id || null })
  });
}

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
    tip: 'Age compatibility is important for long-term happiness'
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
    tip: 'Proximity makes meeting families easier'
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

function ScoreModal({ profile, onClose, isLoggedIn }: { profile: any, onClose: () => void, isLoggedIn: boolean }) {
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
              {!isLoggedIn && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-800">
                Score based on general preferences. <Link href="/login" className="text-blue-600 font-bold underline">Log in</Link> for your personal match score!
              </div>
              )}
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

          {!isLoggedIn && (
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-3">Want YOUR match score with this person?</p>
            <Link href="/login" className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl text-sm hover:shadow-lg transition">
              Log In for Personal Match Score
            </Link>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN CLIENT COMPONENT ────────────────────────────────────

export default function ProfilePageClient({ profile }: { profile: any }) {
  const [showModal, setShowModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [contactRequest, setContactRequest] = useState<any>(null)
  const [loadingContact, setLoadingContact] = useState(false)
  const { matchScore, predictability } = calculateScores(profile)

  const [interestSent, setInterestSent] = useState<boolean | null>(null)
  const [actionMsg, setActionMsg] = useState<{text: string, type: 'info'|'success'|'upgrade'} | null>(null)

  useEffect(() => {
    if (profile?.id) recordView(String(profile.id));
    const userData = localStorage.getItem('biyekori_user');
    setIsLoggedIn(!!userData);
    if (userData && profile?.id) {
      try {
        const u = JSON.parse(userData)
        fetch('/api/contact-request/status?userId=' + u.id + '&profileId=' + profile.id)
          .then(r => r.json())
          .then(data => setContactRequest(data))
          .catch(() => {})
      } catch(e) {}
    }

    // Check if interest already sent
    if (userData) {
      const user = JSON.parse(userData);
      fetch(`/api/interests/list?userId=${user.id}`)
        .then(r => r.json())
        .then(data => {
          if (data.sent && data.sent.some((s: any) => String(s.receiver_id) === String(profile.id))) {
            setInterestSent(true);
          }
        })
        .catch(() => {});
    }
  }, [profile?.id])

  const showMsg = (text: string, type: 'info'|'success'|'upgrade') => {
    setActionMsg({text, type});
    setTimeout(() => setActionMsg(null), 5000);
  }

  const handleSendInterest = async () => {
    const userData = localStorage.getItem('biyekori_user');
    if (!userData) { window.location.href = '/register?reason=interest'; return; }
    if (interestSent) return;
    const user = JSON.parse(userData);
    try {
      const res = await fetch('/api/interests/send', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ senderId: user.id, receiverId: profile.id })
      });
      const data = await res.json();
      if (data.success) { setInterestSent(true); showMsg('Interest sent successfully!', 'success'); }
      else if (data.upgrade) { showMsg('You have reached your free limit. Upgrade to send more interests.', 'upgrade'); }
      else { showMsg(data.message || 'Could not send interest. Please try again.', 'info'); }
    } catch { showMsg('Something went wrong. Please try again.', 'info'); }
  }

  const handleSendMessage = async () => {
    const userData = localStorage.getItem('biyekori_user');
    if (!userData) { window.location.href = '/register?reason=message'; return; }
    const user = JSON.parse(userData);
    const isPaid = user.plan && user.plan !== 'free';

    if (isPaid) {
      // Paid users can message anyone
      showMsg('Messaging coming soon. Your interest has been noted.', 'info');
      return;
    }

    // Free user — check interest status
    if (!interestSent) {
      showMsg('Please send an interest first before messaging.', 'info');
      return;
    }

    try {
      const res = await fetch(`/api/interests/list?userId=${user.id}`);
      const data = await res.json();
      const match = data.sent?.find((s: any) => String(s.receiver_id) === String(profile.id));
      if (match && match.status === 'accepted') {
        // Mutual — upgrade prompt
        showMsg('Your interest was accepted! Upgrade to start messaging.', 'upgrade');
      } else {
        showMsg('Waiting for them to accept your interest before you can message.', 'info');
      }
    } catch {
      showMsg('Could not check interest status. Please try again.', 'info');
    }
  }

  const handleDownloadBiodata = () => {
    const userData = localStorage.getItem('biyekori_user');
    if (!userData) { window.location.href = '/register?reason=biodata'; return; }
    window.location.href = '/biodata/' + profile.id;
  }

  const handleRequestContact = async () => {
    const stored = localStorage.getItem('biyekori_user')
    if (!stored) { window.location.href = '/register?reason=contact'; return; }
    const user = JSON.parse(stored)
    const isPaid = user.package && user.package !== 'prottasha'
    if (!isPaid) { window.location.href = '/pricing'; return; }
    setLoadingContact(true)
    try {
      const res = await fetch('/api/contact-request/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterId: user.id, targetId: profile.id })
      })
      const data = await res.json()
      if (data.success) {
        setContactRequest((prev: any) => ({ ...prev, sent: { status: 'pending' } }))
        showMsg('Contact request sent! They will be notified.', 'success')
      } else if (data.upgrade) {
        window.location.href = '/pricing'
      } else {
        showMsg(data.message || 'Request already sent.', 'info')
      }
    } catch(e) {}
    setLoadingContact(false)
  }

  const handleShareWhatsApp = () => {
    const name = profile.full_name || 'Profile';
    const profileUrl = 'https://biyekori.com/profile/' + profile.id;
    const msg = 'Ei profile ta dekho Biye Kori te: ' + profileUrl;
    const waUrl = 'https://wa.me/?text=' + encodeURIComponent(msg);
    const a = document.createElement('a');
    a.href = waUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8 px-4" style={{colorScheme:"light"}}>
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
            {!isLoggedIn && <p className="text-purple-200 text-xs mt-2">Score is based on general preferences • Log in for your personal match score</p>}
          </div>
        </div>

        {showModal && <ScoreModal profile={profile} onClose={() => setShowModal(false)} isLoggedIn={isLoggedIn} />}

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-32"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-16">
              <div className="flex-shrink-0">
                {(() => {
                  const mainPhoto = profile.photo_url
                  const additional = Array.isArray(profile.additional_photos) ? profile.additional_photos : []
                  const allPhotos = mainPhoto ? [mainPhoto, ...additional] : additional
                  const total = allPhotos.length

                  if (total === 0) {
                    return (
                      <div style={{ width: '200px', height: '220px', background: 'linear-gradient(135deg,#fce7f3,#ede9fe)', borderRadius: '16px', border: '4px solid white', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '48px' }}>{profile.gender === 'male' ? '👨' : '👩'}</span>
                      </div>
                    )
                  }

                  return (
                    <div style={{ width: '200px' }}>
                      {/* Main photo */}
                      <div style={{ position: 'relative', width: '200px', height: '220px', borderRadius: '16px', overflow: 'hidden', border: '4px solid white', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                        <img
                          src={allPhotos[photoIndex]}
                          alt={profile.full_name || 'Profile'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', transition: 'opacity 0.2s' }}
                        />
                        {/* Counter */}
                        {total > 1 && (
                          <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px' }}>
                            {photoIndex + 1} of {total}
                          </div>
                        )}
                        {/* Left arrow */}
                        {total > 1 && photoIndex > 0 && (
                          <button onClick={() => setPhotoIndex(photoIndex - 1)} style={{ position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                          </button>
                        )}
                        {/* Right arrow */}
                        {total > 1 && photoIndex < total - 1 && (
                          <button onClick={() => setPhotoIndex(photoIndex + 1)} style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                          </button>
                        )}
                      </div>
                      {/* Thumbnail strip */}
                      {total > 1 && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                          {allPhotos.map((photo: string, i: number) => (
                            <button key={i} onClick={() => setPhotoIndex(i)} style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', border: i === photoIndex ? '2px solid #e11d48' : '2px solid #e5e7eb', padding: 0, cursor: 'pointer', flexShrink: 0 }}>
                              <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })()}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{color:"#111827"}}>📝 About Me</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line" style={{color:"#374151"}}>{profile.about_me}</p>
          </div>
        )}

        {hasValue(profile.partner_preference) && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{color:"#111827"}}>💕 What I'm Looking For</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line" style={{color:"#374151"}}>{profile.partner_preference}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {(hasValue(profile.height) || hasValue(profile.weight)) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4" style={{color:"#111827"}}>👤 Personal Details</h3>
              <div className="space-y-3">
                {hasValue(profile.height) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Height</span><span className="font-medium" style={{color:"#111827"}}>{profile.height}</span></div>}
                {hasValue(profile.weight) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Weight</span><span className="font-medium" style={{color:"#111827"}}>{profile.weight} kg</span></div>}
                {hasValue(profile.complexion) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Complexion</span><span className="font-medium" style={{color:"#111827"}}>{profile.complexion}</span></div>}
                {hasValue(profile.body_type) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Body Type</span><span className="font-medium" style={{color:"#111827"}}>{profile.body_type}</span></div>}
                {hasValue(profile.blood_group) && <div className="flex justify-between py-2"><span className="text-gray-600" style={{color:"#4b5563"}}>Blood Group</span><span className="font-medium" style={{color:"#111827"}}>{profile.blood_group}</span></div>}
              </div>
            </div>
          )}

          {hasValue(profile.city) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4" style={{color:"#111827"}}>📍 Location</h3>
              <div className="space-y-3">
                {hasValue(profile.city) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>City</span><span className="font-medium" style={{color:"#111827"}}>{profile.city}</span></div>}
                {hasValue(profile.district) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>District</span><span className="font-medium" style={{color:"#111827"}}>{profile.district}</span></div>}
                {hasValue(profile.country) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Country</span><span className="font-medium" style={{color:"#111827"}}>{profile.country}</span></div>}
                {hasValue(profile.willing_to_relocate) && <div className="flex justify-between py-2"><span className="text-gray-600" style={{color:"#4b5563"}}>Willing to Relocate</span><span className="font-medium" style={{color:"#111827"}}>{profile.willing_to_relocate ? 'Yes' : 'No'}</span></div>}
              </div>
            </div>
          )}

          {hasValue(profile.education) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4" style={{color:"#111827"}}>🎓 Education</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Education Level</span><span className="font-medium" style={{color:"#111827"}}>{profile.education}</span></div>
                {showDegree && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Degree</span><span className="font-medium" style={{color:"#111827"}}>{profile.degree}</span></div>}
                {hasValue(profile.institution) && <div className="flex justify-between py-2"><span className="text-gray-600" style={{color:"#4b5563"}}>Institution</span><span className="font-medium" style={{color:"#111827"}}>{profile.institution}</span></div>}
              </div>
            </div>
          )}

          {hasValue(profile.profession) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4" style={{color:"#111827"}}>💼 Career & Income</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Profession</span><span className="font-medium" style={{color:"#111827"}}>{profile.profession}</span></div>
                {hasValue(profile.monthly_income) && profile.monthly_income > 0 && (
                  <div className="flex justify-between py-2"><span className="text-gray-600" style={{color:"#4b5563"}}>Monthly Income</span><span className="font-medium" style={{color:"#111827"}}>৳{Number(profile.monthly_income).toLocaleString()}</span></div>
                )}
              </div>
            </div>
          )}

          {hasValue(profile.religious_level) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4" style={{color:"#111827"}}>🕌 Religious Background</h3>
              <div className="space-y-3">
                {hasValue(profile.religion) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Religion</span><span className="font-medium" style={{color:"#111827"}}>{profile.religion}</span></div>}
                {hasValue(profile.sect) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Sect</span><span className="font-medium" style={{color:"#111827"}}>{profile.sect}</span></div>}
                {hasValue(profile.religious_level) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Religious Level</span><span className="font-medium" style={{color:"#111827"}}>{profile.religious_level}</span></div>}
                {hasValue(profile.prayer_habit) && <div className="flex justify-between py-2"><span className="text-gray-600" style={{color:"#4b5563"}}>Prayer Habit</span><span className="font-medium" style={{color:"#111827"}}>{profile.prayer_habit}</span></div>}
              </div>
            </div>
          )}

          {hasValue(profile.father_profession) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4" style={{color:"#111827"}}>👨‍👩‍👧‍👦 Family Background</h3>
              <div className="space-y-3">
                {hasValue(profile.father_profession) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Father's Profession</span><span className="font-medium" style={{color:"#111827"}}>{profile.father_profession}</span></div>}
                {hasValue(profile.mother_profession) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Mother's Profession</span><span className="font-medium" style={{color:"#111827"}}>{profile.mother_profession}</span></div>}
                {hasValue(profile.total_siblings) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Total Siblings</span><span className="font-medium" style={{color:"#111827"}}>{profile.total_siblings}</span></div>}
                {hasValue(profile.family_type) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Family Type</span><span className="font-medium" style={{color:"#111827"}}>{profile.family_type}</span></div>}
                {hasValue(profile.family_values) && <div className="flex justify-between py-2"><span className="text-gray-600" style={{color:"#4b5563"}}>Family Values</span><span className="font-medium" style={{color:"#111827"}}>{profile.family_values}</span></div>}
              </div>
            </div>
          )}

          {hasValue(profile.hobbies) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4" style={{color:"#111827"}}>🎨 Lifestyle & Hobbies</h3>
              <div className="space-y-3">
                {hasValue(profile.diet) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Diet</span><span className="font-medium" style={{color:"#111827"}}>{profile.diet}</span></div>}
                {hasValue(profile.personality_type) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Personality</span><span className="font-medium" style={{color:"#111827"}}>{profile.personality_type}</span></div>}
                {hasValue(profile.hobbies) && <div className="py-2 border-b border-gray-100"><span className="text-gray-600 block mb-1" style={{color:"#4b5563"}}>Hobbies</span><span className="font-medium text-sm" style={{color:"#111827"}}>{profile.hobbies}</span></div>}
                {hasValue(profile.interests) && <div className="py-2"><span className="text-gray-600 block mb-1" style={{color:"#4b5563"}}>Interests</span><span className="font-medium text-sm" style={{color:"#111827"}}>{profile.interests}</span></div>}
              </div>
            </div>
          )}
        </div>

        {hasValue(profile.expected_age_min) && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{color:"#111827"}}>👑 Partner Expectations</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Expected Age</span><span className="font-medium" style={{color:"#111827"}}>{profile.expected_age_min} - {profile.expected_age_max} years</span></div>
              {hasValue(profile.expected_education) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Expected Education</span><span className="font-medium" style={{color:"#111827"}}>{profile.expected_education}</span></div>}
              {hasValue(profile.expected_religious_level) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600" style={{color:"#4b5563"}}>Religious Level</span><span className="font-medium" style={{color:"#111827"}}>{profile.expected_religious_level}</span></div>}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6">
          {actionMsg && (
            <div className={`mb-4 p-4 rounded-xl text-sm font-medium text-center ${actionMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : actionMsg.type === 'upgrade' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
              {actionMsg.text}
              {actionMsg.type === 'upgrade' && (
                <a href="/pricing" className="ml-2 underline font-bold">View Plans</a>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleSendInterest}
              disabled={interestSent === true}
              className={`px-8 py-3 font-semibold rounded-lg transition-all ${interestSent === true ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed' : 'bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:shadow-lg'}`}
            >
              {interestSent === true ? 'Interest Sent' : 'Express Interest'}
            </button>
            <button
              onClick={handleSendMessage}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              Send Message
            </button>
            <button
              onClick={handleDownloadBiodata}
              className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-pink-400 transition-all"
            >
              Download Biodata
            </button>
            <a
              href={'https://wa.me/?text=' + encodeURIComponent('Ei profile ta dekho Biye Kori te: https://biyekori.com/profile/' + profile.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 hover:shadow-lg transition-all inline-block"
            >
              Share on WhatsApp
            </a>
          </div>
        </div>

      </div>

      {/* Contact Request Section */}
      {isLoggedIn && contactRequest !== null && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px 24px', margin: '0 0 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 800, color: '#111827' }}>Contact Details</h3>
          {contactRequest.sent?.status === 'pending' ? (
            <p style={{ margin: 0, fontSize: '13px', color: '#92400e' }}>Contact request sent — waiting for approval.</p>
          ) : contactRequest.received?.status === 'pending' ? (
            <div>
              <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#5b21b6', fontWeight: 600 }}>This person wants to exchange contact details with you.</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={async () => { const u = JSON.parse(localStorage.getItem('biyekori_user') || '{}'); await fetch('/api/contact-request/respond', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: contactRequest.received.id, action: 'approved', userId: u.id }) }); showMsg('Approved!', 'success'); setContactRequest((p: any) => ({ ...p, received: { ...p.received, status: 'approved' } })) }} style={{ padding: '8px 18px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Approve</button>
                <button onClick={async () => { const u = JSON.parse(localStorage.getItem('biyekori_user') || '{}'); await fetch('/api/contact-request/respond', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: contactRequest.received.id, action: 'declined', userId: u.id }) }); setContactRequest((p: any) => ({ ...p, received: { ...p.received, status: 'declined' } })) }} style={{ padding: '8px 18px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Decline</button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280' }}>Request to exchange contact details with consent.</p>
              <button onClick={handleRequestContact} disabled={loadingContact} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#0891b2,#7c3aed)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>{loadingContact ? 'Sending...' : 'Request Contact Details'}</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
