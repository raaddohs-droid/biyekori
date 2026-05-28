import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── AI SCORING ENGINE ────────────────────────────────────────

function calculateMatchScore(profile: any, viewerProfile: any): number {
  if (!viewerProfile) return 0
  let score = 0

  // Religion match (25 points)
  if (profile.religion && viewerProfile.religion) {
    if (profile.religion === viewerProfile.religion) score += 25
    else score += 0
  }

  // Age preference match (15 points)
  const theirAge = profile.age
  const myMinAge = viewerProfile.expected_age_min
  const myMaxAge = viewerProfile.expected_age_max
  if (theirAge && myMinAge && myMaxAge) {
    if (theirAge >= myMinAge && theirAge <= myMaxAge) score += 15
    else if (Math.abs(theirAge - myMinAge) <= 2 || Math.abs(theirAge - myMaxAge) <= 2) score += 8
  } else {
    score += 8 // partial credit if no preference set
  }

  // Education match (15 points)
  const eduRank: Record<string, number> = {
    'SSC': 1, 'HSC': 2, "Bachelor's": 3, "Master's": 4,
    'Medical': 5, 'Engineering': 5, 'Law': 4
  }
  const theirEduRank = eduRank[profile.education] || 3
  const myExpectedEdu = eduRank[viewerProfile.expected_education] || 3
  if (Math.abs(theirEduRank - myExpectedEdu) === 0) score += 15
  else if (Math.abs(theirEduRank - myExpectedEdu) === 1) score += 10
  else score += 5

  // Location match (10 points)
  if (profile.district && viewerProfile.district) {
    if (profile.district === viewerProfile.district) score += 10
    else if (profile.city === viewerProfile.city) score += 10
    else score += 3
  } else score += 5

  // Personality compatibility (10 points)
  const compatible: Record<string, string[]> = {
    'Traditional': ['Traditional','Family-Oriented','Balanced'],
    'Modern': ['Modern','Ambitious','Balanced','Creative'],
    'Ambitious': ['Ambitious','Modern','Balanced','Intellectual'],
    'Balanced': ['Balanced','Traditional','Modern','Ambitious','Creative'],
    'Intellectual': ['Intellectual','Ambitious','Analytical'],
    'Creative': ['Creative','Balanced','Modern'],
    'Family-Oriented': ['Family-Oriented','Traditional','Balanced'],
    'Analytical': ['Analytical','Intellectual','Ambitious']
  }
  if (profile.personality_type && viewerProfile.personality_type) {
    const myCompatible = compatible[viewerProfile.personality_type] || []
    if (myCompatible.includes(profile.personality_type)) score += 10
    else score += 3
  } else score += 5

  // Religious level match (10 points)
  if (profile.religious_level && viewerProfile.expected_religious_level) {
    if (profile.religious_level === viewerProfile.expected_religious_level) score += 10
    else if (
      (profile.religious_level === 'Religious' && viewerProfile.expected_religious_level === 'Very Religious') ||
      (profile.religious_level === 'Moderate' && viewerProfile.expected_religious_level === 'Religious')
    ) score += 5
    else score += 2
  } else score += 5

  // Family values match (10 points)
  if (profile.family_values && viewerProfile.expected_family_type) {
    if (profile.family_values === viewerProfile.expected_family_type) score += 10
    else score += 4
  } else score += 5

  // Hobbies overlap (5 points)
  if (profile.hobbies && viewerProfile.hobbies) {
    const theirHobbies = profile.hobbies.toLowerCase()
    const myHobbies = viewerProfile.hobbies.toLowerCase()
    const theirList = theirHobbies.split(',').map((h: string) => h.trim())
    const myList = myHobbies.split(',').map((h: string) => h.trim())
    const overlap = theirList.filter((h: string) => myList.some((m: string) => m.includes(h) || h.includes(m)))
    if (overlap.length >= 2) score += 5
    else if (overlap.length === 1) score += 3
  } else score += 2

  return Math.min(Math.round(score), 100)
}

function calculatePredictability(profile: any): number {
  let score = 0

  // Photo uploaded (15%)
  if (profile.photo_url) score += 15

  // About me filled (10%)
  if (profile.about_me && profile.about_me.length > 30) score += 10

  // Partner preference filled (10%)
  if (profile.partner_preference && profile.partner_preference.length > 20) score += 10

  // NID verified (15%)
  if (profile.nid_verified) score += 15

  // Religion + prayer habit (10%)
  if (profile.religion && profile.prayer_habit) score += 10

  // Education + profession (10%)
  if (profile.education && profile.profession) score += 10

  // Family info complete (10%)
  if (profile.father_profession && profile.total_siblings !== null) score += 10

  // Hobbies + interests (10%)
  if (profile.hobbies && profile.interests) score += 10

  // Height + weight (5%)
  if (profile.height && profile.weight) score += 5

  // Phone verified (5%)
  if (profile.phone_verified) score += 5

  return Math.min(Math.round(score), 100)
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981' // green
  if (score >= 60) return '#f59e0b' // yellow
  if (score >= 40) return '#f97316' // orange
  return '#ef4444' // red
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent Match'
  if (score >= 70) return 'Good Match'
  if (score >= 55) return 'Fair Match'
  if (score >= 40) return 'Possible Match'
  return 'Low Match'
}

function getPredictabilityLabel(score: number): string {
  if (score >= 80) return 'High Confidence'
  if (score >= 60) return 'Good Confidence'
  if (score >= 40) return 'Moderate Confidence'
  return 'Low Confidence — Complete profile for better accuracy'
}

// Circular progress SVG
function CircularScore({ score, size, color, label, sublabel }: {
  score: number, size: number, color: string, label: string, sublabel: string
}) {
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#e5e7eb" strokeWidth="10"
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>{score}%</span>
        </div>
      </div>
      <p className="font-bold text-gray-800 mt-2 text-center">{label}</p>
      <p className="text-xs text-gray-500 text-center mt-1 max-w-[140px]">{sublabel}</p>
    </div>
  )
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !profile) notFound()

  // For demo: use a sample viewer profile
  // In production this would come from the logged-in user's session
  const sampleViewer = {
    religion: 'Islam',
    expected_age_min: 22,
    expected_age_max: 32,
    expected_education: "Bachelor's",
    expected_religious_level: 'Religious',
    expected_family_type: 'Nuclear',
    personality_type: 'Balanced',
    hobbies: 'Reading, Cooking, Traveling',
    district: profile.district, // same district for demo
  }

  const matchScore = calculateMatchScore(profile, sampleViewer)
  const predictability = calculatePredictability(profile)
  const matchColor = getScoreColor(matchScore)
  const predictColor = getScoreColor(predictability)

  const hasValue = (value: any) => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') {
      const trimmed = value.trim()
      return trimmed !== '' && trimmed.toLowerCase() !== 'not specified'
    }
    return true
  }

  // Hide degree if SSC/HSC
  const showDegree = hasValue(profile.degree) &&
    profile.degree !== profile.education &&
    !['SSC', 'HSC'].includes(profile.education)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        <Link href="/profiles" className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-6 font-medium">
          ← Back to Profiles
        </Link>

        {/* ─── AI SCORE CARD ─── */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🤖</span>
            <div>
              <h2 className="text-xl font-bold">AI Compatibility Analysis</h2>
              <p className="text-purple-200 text-sm">Powered by Biyekori AI Matchmaker</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 bg-white/10 rounded-xl p-6">
            {/* Match Score */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <svg width="128" height="128" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="12" />
                  <circle
                    cx="64" cy="64" r="54" fill="none"
                    stroke="white" strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 - (matchScore / 100) * 2 * Math.PI * 54}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{matchScore}%</span>
                </div>
              </div>
              <p className="font-bold text-white mt-2">AI Match Score</p>
              <p className="text-purple-200 text-xs text-center mt-1">{getScoreLabel(matchScore)}</p>
            </div>

            {/* Predictability Score */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <svg width="128" height="128" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="12" />
                  <circle
                    cx="64" cy="64" r="54" fill="none"
                    stroke={predictability >= 60 ? '#34d399' : '#fbbf24'} strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 - (predictability / 100) * 2 * Math.PI * 54}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black" style={{ color: predictability >= 60 ? '#34d399' : '#fbbf24' }}>
                    {predictability}%
                  </span>
                </div>
              </div>
              <p className="font-bold text-white mt-2">Predictability</p>
              <p className="text-purple-200 text-xs text-center mt-1">{getPredictabilityLabel(predictability)}</p>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-purple-200 text-xs mb-2">Match based on:</p>
              <div className="space-y-1">
                <div className="flex justify-between"><span>Religion</span><span>✓</span></div>
                <div className="flex justify-between"><span>Age preference</span><span>✓</span></div>
                <div className="flex justify-between"><span>Education</span><span>✓</span></div>
                <div className="flex justify-between"><span>Personality</span><span>✓</span></div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-purple-200 text-xs mb-2">Predictability based on:</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Photo</span>
                  <span>{profile.photo_url ? '✓' : '✗'}</span>
                </div>
                <div className="flex justify-between">
                  <span>NID Verified</span>
                  <span>{profile.nid_verified ? '✓' : '✗'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Full Bio</span>
                  <span>{profile.about_me?.length > 30 ? '✓' : '✗'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Family Info</span>
                  <span>{profile.father_profession ? '✓' : '✗'}</span>
                </div>
              </div>
            </div>
          </div>

          {predictability < 60 && (
            <div className="mt-4 bg-yellow-400/20 border border-yellow-400/40 rounded-lg p-3 text-sm">
              ⚠️ Predictability is low because this profile is incomplete. More info = more accurate AI matching.
            </div>
          )}
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-32"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-16">
              <div className="flex-shrink-0">
                {profile.photo_url ? (
                  <Image
                    src={profile.photo_url}
                    alt={profile.full_name || 'Profile Photo'}
                    width={160} height={160}
                    className="rounded-2xl border-4 border-white shadow-lg object-cover"
                    style={{ width: '160px', height: '160px' }}
                  />
                ) : (
                  <div className="w-40 h-40 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-4xl">{profile.gender === 'male' ? '👨' : '👩'}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 mt-4 md:mt-16">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.full_name || 'Anonymous'}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  {hasValue(profile.age) && <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">{profile.age} years</span>}
                  {hasValue(profile.marital_status) && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">{profile.marital_status}</span>}
                  {profile.nid_verified && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">✓ NID Verified</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {hasValue(profile.religious_level) && <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm">🕌 {profile.religious_level}</span>}
                  {hasValue(profile.city) && <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">📍 {profile.city}</span>}
                  {hasValue(profile.profession) && <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm">💼 {profile.profession}</span>}
                  {hasValue(profile.education) && <span className="inline-flex items-center px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-sm">🎓 {profile.education}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {hasValue(profile.about_me) && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center"><span className="text-pink-500 mr-2">📝</span>About Me</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.about_me}</p>
          </div>
        )}

        {hasValue(profile.partner_preference) && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center"><span className="text-pink-500 mr-2">💕</span>What I'm Looking For</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.partner_preference}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">

          {(hasValue(profile.height) || hasValue(profile.weight) || hasValue(profile.complexion) || hasValue(profile.body_type) || hasValue(profile.blood_group)) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center"><span className="text-pink-500 mr-2">👤</span>Personal Details</h3>
              <div className="space-y-3">
                {hasValue(profile.height) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Height</span><span className="font-medium text-gray-900">{profile.height}</span></div>}
                {hasValue(profile.weight) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Weight</span><span className="font-medium text-gray-900">{profile.weight} kg</span></div>}
                {hasValue(profile.complexion) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Complexion</span><span className="font-medium text-gray-900">{profile.complexion}</span></div>}
                {hasValue(profile.body_type) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Body Type</span><span className="font-medium text-gray-900">{profile.body_type}</span></div>}
                {hasValue(profile.blood_group) && <div className="flex justify-between py-2"><span className="text-gray-600">Blood Group</span><span className="font-medium text-gray-900">{profile.blood_group}</span></div>}
              </div>
            </div>
          )}

          {(hasValue(profile.city) || hasValue(profile.district) || hasValue(profile.country)) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center"><span className="text-pink-500 mr-2">📍</span>Location</h3>
              <div className="space-y-3">
                {hasValue(profile.city) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">City</span><span className="font-medium text-gray-900">{profile.city}</span></div>}
                {hasValue(profile.district) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">District</span><span className="font-medium text-gray-900">{profile.district}</span></div>}
                {hasValue(profile.country) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Country</span><span className="font-medium text-gray-900">{profile.country}</span></div>}
                {hasValue(profile.willing_to_relocate) && <div className="flex justify-between py-2"><span className="text-gray-600">Willing to Relocate</span><span className="font-medium text-gray-900">{profile.willing_to_relocate ? 'Yes' : 'No'}</span></div>}
              </div>
            </div>
          )}

          {(hasValue(profile.education) || hasValue(profile.degree)) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center"><span className="text-pink-500 mr-2">🎓</span>Education</h3>
              <div className="space-y-3">
                {hasValue(profile.education) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Education Level</span><span className="font-medium text-gray-900">{profile.education}</span></div>}
                {showDegree && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Degree</span><span className="font-medium text-gray-900">{profile.degree}</span></div>}
                {hasValue(profile.institution) && <div className="flex justify-between py-2"><span className="text-gray-600">Institution</span><span className="font-medium text-gray-900">{profile.institution}</span></div>}
              </div>
            </div>
          )}

          {(hasValue(profile.profession) || hasValue(profile.monthly_income)) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center"><span className="text-pink-500 mr-2">💼</span>Career & Income</h3>
              <div className="space-y-3">
                {hasValue(profile.profession) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Profession</span><span className="font-medium text-gray-900">{profile.profession}</span></div>}
                {hasValue(profile.monthly_income) && profile.monthly_income > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Monthly Income</span>
                    <span className="font-medium text-gray-900">৳{Number(profile.monthly_income).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {(hasValue(profile.religious_level) || hasValue(profile.prayer_habit)) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center"><span className="text-pink-500 mr-2">🕌</span>Religious Background</h3>
              <div className="space-y-3">
                {hasValue(profile.religion) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Religion</span><span className="font-medium text-gray-900">{profile.religion}</span></div>}
                {hasValue(profile.sect) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Sect</span><span className="font-medium text-gray-900">{profile.sect}</span></div>}
                {hasValue(profile.religious_level) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Religious Level</span><span className="font-medium text-gray-900">{profile.religious_level}</span></div>}
                {hasValue(profile.prayer_habit) && <div className="flex justify-between py-2"><span className="text-gray-600">Prayer Habit</span><span className="font-medium text-gray-900">{profile.prayer_habit}</span></div>}
              </div>
            </div>
          )}

          {(hasValue(profile.father_profession) || hasValue(profile.total_siblings) || hasValue(profile.family_values)) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center"><span className="text-pink-500 mr-2">👨‍👩‍👧‍👦</span>Family Background</h3>
              <div className="space-y-3">
                {hasValue(profile.father_profession) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Father's Profession</span><span className="font-medium text-gray-900">{profile.father_profession}</span></div>}
                {hasValue(profile.mother_profession) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Mother's Profession</span><span className="font-medium text-gray-900">{profile.mother_profession}</span></div>}
                {hasValue(profile.total_siblings) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Total Siblings</span><span className="font-medium text-gray-900">{profile.total_siblings}</span></div>}
                {hasValue(profile.family_type) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Family Type</span><span className="font-medium text-gray-900">{profile.family_type}</span></div>}
                {hasValue(profile.family_values) && <div className="flex justify-between py-2"><span className="text-gray-600">Family Values</span><span className="font-medium text-gray-900">{profile.family_values}</span></div>}
              </div>
            </div>
          )}

          {(hasValue(profile.hobbies) || hasValue(profile.interests) || hasValue(profile.personality_type)) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center"><span className="text-pink-500 mr-2">🎨</span>Lifestyle & Hobbies</h3>
              <div className="space-y-3">
                {hasValue(profile.diet) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Diet</span><span className="font-medium text-gray-900">{profile.diet}</span></div>}
                {hasValue(profile.personality_type) && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Personality</span><span className="font-medium text-gray-900">{profile.personality_type}</span></div>}
                {hasValue(profile.hobbies) && <div className="py-2 border-b border-gray-100"><span className="text-gray-600 block mb-1">Hobbies</span><span className="font-medium text-gray-900 text-sm">{profile.hobbies}</span></div>}
                {hasValue(profile.interests) && <div className="py-2"><span className="text-gray-600 block mb-1">Interests</span><span className="font-medium text-gray-900 text-sm">{profile.interests}</span></div>}
              </div>
            </div>
          )}

        </div>

        {(hasValue(profile.expected_age_min) || hasValue(profile.expected_education)) && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center"><span className="text-pink-500 mr-2">👑</span>Partner Expectations</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {(hasValue(profile.expected_age_min) || hasValue(profile.expected_age_max)) && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Expected Age</span>
                  <span className="font-medium text-gray-900">{profile.expected_age_min} - {profile.expected_age_max} years</span>
                </div>
              )}
              {hasValue(profile.expected_education) && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Expected Education</span>
                  <span className="font-medium text-gray-900">{profile.expected_education}</span>
                </div>
              )}
              {hasValue(profile.expected_religious_level) && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Expected Religious Level</span>
                  <span className="font-medium text-gray-900">{profile.expected_religious_level}</span>
                </div>
              )}
              {hasValue(profile.expected_profession) && profile.expected_profession !== 'Any' && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Expected Profession</span>
                  <span className="font-medium text-gray-900">{profile.expected_profession}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all shadow-md">
              💌 Send Interest
            </button>
            <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md">
              💬 Send Message
            </button>
            <button className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-all">
              📥 Download PDF Biodata
            </button>
            <button className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-all">
              🔗 Add to Shortlist
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
