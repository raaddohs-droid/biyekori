'use client'
import { useState, useEffect } from 'react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const EDU_RANK: Record<string, number> = {
  'SSC': 1, 'HSC': 2, 'Diploma': 2, "Bachelor's": 3,
  'Law': 4, "Master's": 4, 'Medical': 5, 'Engineering': 5, 'PhD': 6, 'Other': 2
}

function parseHeightToCm(h: string): number {
  if (!h) return 0
  const m = h.match(/(\d+)'(\d+)?/)
  if (!m) return 0
  return parseInt(m[1]) * 30.48 + (parseInt(m[2] || '0') * 2.54)
}

interface MatchItem {
  label: string
  matched: boolean | null // null = not applicable
  note: string
  weight: number
}

function computeMatch(viewer: any, profile: any): {
  viewerMatchesProfile: MatchItem[]
  profileMatchesViewer: MatchItem[]
  mutualScore: number
  viewerScore: number
  profileScore: number
} {
  // How well viewer matches profile's expectations
  const viewerMatchesProfile: MatchItem[] = []

  // Age
  const vAge = viewer.age || 0
  const pAgeMin = profile.expected_age_min || 0
  const pAgeMax = profile.expected_age_max || 99
  if (pAgeMin > 0 || pAgeMax < 99) {
    if (vAge >= pAgeMin && vAge <= pAgeMax) {
      viewerMatchesProfile.push({ label: 'Age', matched: true, note: `Your age ${vAge} is in their range (${pAgeMin}–${pAgeMax})`, weight: 10 })
    } else {
      viewerMatchesProfile.push({ label: 'Age', matched: false, note: `Your age ${vAge} is outside their range (${pAgeMin}–${pAgeMax})`, weight: 10 })
    }
  }

  // Religion
  if (profile.expected_religion) {
    const match = viewer.religion === profile.expected_religion
    viewerMatchesProfile.push({ label: 'Religion', matched: match, note: match ? `Both ${viewer.religion}` : `They prefer ${profile.expected_religion}, you are ${viewer.religion || 'not specified'}`, weight: 12 })
  }

  // Religious level
  if (profile.expected_religious_level) {
    const levels = ['Liberal', 'Moderate', 'Religious', 'Very Religious']
    const vIdx = levels.indexOf(viewer.religious_level || '')
    const pIdx = levels.indexOf(profile.expected_religious_level)
    if (vIdx >= 0 && pIdx >= 0) {
      const diff = Math.abs(vIdx - pIdx)
      const match = diff <= 1
      viewerMatchesProfile.push({ label: 'Religious Practice', matched: match, note: match ? `Compatible religiosity (${viewer.religious_level})` : `They prefer ${profile.expected_religious_level}, you are ${viewer.religious_level}`, weight: 8 })
    }
  }

  // Education
  if (profile.expected_education) {
    const vEdu = EDU_RANK[viewer.education || ''] || 0
    const pEdu = EDU_RANK[profile.expected_education] || 0
    const match = vEdu >= pEdu
    viewerMatchesProfile.push({ label: 'Education', matched: match, note: match ? `Your education meets their expectation` : `They expect ${profile.expected_education} or above`, weight: 6 })
  }

  // Marital status
  if (profile.expected_marital_status) {
    const expected = profile.expected_marital_status.split(',').map((s: string) => s.trim())
    const match = expected.length === 0 || expected.includes(viewer.marital_status || '')
    viewerMatchesProfile.push({ label: 'Marital Status', matched: match, note: match ? `Your marital status is acceptable` : `They prefer: ${expected.join(' or ')}`, weight: 8 })
  }

  // District
  if (profile.partner_district) {
    const match = viewer.city === profile.partner_district || viewer.district === profile.partner_district
    viewerMatchesProfile.push({ label: 'Location', matched: match, note: match ? `You are from their preferred district` : `They prefer ${profile.partner_district}, you are from ${viewer.city || viewer.district || 'unknown'}`, weight: 7 })
  }

  // Marriage timeline
  if (profile.expected_marriage_timeline && viewer.marriage_timeline) {
    const match = profile.expected_marriage_timeline === viewer.marriage_timeline
    viewerMatchesProfile.push({ label: 'Marriage Timeline', matched: match, note: match ? `Same marriage timeline` : `Timeline may differ — worth discussing`, weight: 7 })
  }

  // Living arrangement
  if (profile.expected_living_arrangement && viewer.living_arrangement) {
    const match = profile.expected_living_arrangement === viewer.living_arrangement ||
      profile.expected_living_arrangement === 'Flexible' || viewer.living_arrangement === 'Flexible'
    viewerMatchesProfile.push({ label: 'Living Arrangement', matched: match, note: match ? `Compatible living preference` : `They prefer ${profile.expected_living_arrangement}`, weight: 7 })
  }

  // Smoking
  if (profile.expected_smoking === 'no') {
    const vSmoke = String(viewer.smoking || 'false').toLowerCase()
    const match = vSmoke === 'false' || vSmoke === 'no'
    viewerMatchesProfile.push({ label: 'Non-smoker', matched: match, note: match ? `You are a non-smoker as preferred` : `They prefer a non-smoker`, weight: 6 })
  }

  // Work after marriage
  if (profile.expected_work_after_marriage && viewer.work_after_marriage) {
    const match = profile.expected_work_after_marriage === viewer.work_after_marriage ||
      profile.expected_work_after_marriage === 'Depends on situation'
    viewerMatchesProfile.push({ label: 'Work After Marriage', matched: match, note: match ? `Compatible work preference` : `Worth discussing work plans`, weight: 5 })
  }

  // Children
  if (profile.accepts_children === false) {
    const vHasChildren = viewer.has_children && viewer.has_children !== 'false'
    viewerMatchesProfile.push({ label: 'Children', matched: !vHasChildren, note: !vHasChildren ? `No children as preferred` : `They prefer partner without children`, weight: 8 })
  }

  // How well profile matches viewer's expectations
  const profileMatchesViewer: MatchItem[] = []

  // Age
  const pAge = profile.age || 0
  const vAgeMin = viewer.partner_age_min || viewer.expected_age_min || 0
  const vAgeMax = viewer.partner_age_max || viewer.expected_age_max || 99
  if (vAgeMin > 0 || vAgeMax < 99) {
    const match = pAge >= vAgeMin && pAge <= vAgeMax
    profileMatchesViewer.push({ label: 'Age', matched: match, note: match ? `Their age ${pAge} is in your range` : `Their age ${pAge} is outside your range (${vAgeMin}–${vAgeMax})`, weight: 10 })
  }

  // Religion
  if (viewer.expected_religion) {
    const match = profile.religion === viewer.expected_religion
    profileMatchesViewer.push({ label: 'Religion', matched: match, note: match ? `Both ${profile.religion}` : `You prefer ${viewer.expected_religion}`, weight: 12 })
  }

  // Education
  if (viewer.partner_education || viewer.expected_education) {
    const exp = viewer.partner_education || viewer.expected_education
    const pEdu = EDU_RANK[profile.education || ''] || 0
    const vEdu = EDU_RANK[exp] || 0
    const match = pEdu >= vEdu
    profileMatchesViewer.push({ label: 'Education', matched: match, note: match ? `Their education meets your expectation` : `You expect ${exp} or above`, weight: 6 })
  }

  // District
  if (viewer.partner_district) {
    const match = profile.city === viewer.partner_district || profile.district === viewer.partner_district
    profileMatchesViewer.push({ label: 'Location', matched: match, note: match ? `They are from your preferred district` : `You prefer ${viewer.partner_district}`, weight: 7 })
  }

  // Marriage timeline
  if (viewer.expected_marriage_timeline && profile.marriage_timeline) {
    const match = viewer.expected_marriage_timeline === profile.marriage_timeline
    profileMatchesViewer.push({ label: 'Marriage Timeline', matched: match, note: match ? `Same timeline` : `Timeline may differ`, weight: 7 })
  }

  // Living arrangement
  if (viewer.expected_living_arrangement && profile.living_arrangement) {
    const match = viewer.expected_living_arrangement === profile.living_arrangement ||
      viewer.expected_living_arrangement === 'Flexible' || profile.living_arrangement === 'Flexible'
    profileMatchesViewer.push({ label: 'Living Arrangement', matched: match, note: match ? `Compatible living preference` : `Different living preference`, weight: 7 })
  }

  // Smoking
  if (viewer.expected_smoking === 'no') {
    const pSmoke = String(profile.smoking || 'false').toLowerCase()
    const match = pSmoke === 'false' || pSmoke === 'no'
    profileMatchesViewer.push({ label: 'Non-smoker', matched: match, note: match ? `Non-smoker as you prefer` : `They smoke`, weight: 6 })
  }

  // Children
  if (viewer.accepts_children === false) {
    const pHasChildren = profile.has_children && profile.has_children !== 'false'
    profileMatchesViewer.push({ label: 'Children', matched: !pHasChildren, note: !pHasChildren ? `No children as you prefer` : `They have children`, weight: 8 })
  }

  // Family values
  if (viewer.expected_family_values && profile.family_values) {
    const match = viewer.expected_family_values === profile.family_values
    profileMatchesViewer.push({ label: 'Family Values', matched: match, note: match ? `Similar family values` : `Different family values`, weight: 5 })
  }

  // Calculate scores
  const calcScore = (items: MatchItem[]) => {
    if (items.length === 0) return 0
    const totalWeight = items.reduce((s, i) => s + i.weight, 0)
    const matchedWeight = items.filter(i => i.matched).reduce((s, i) => s + i.weight, 0)
    return Math.round((matchedWeight / totalWeight) * 100)
  }

  const viewerScore = calcScore(viewerMatchesProfile)
  const profileScore = calcScore(profileMatchesViewer)

  // Mutual score formula: min*0.6 + avg*0.4
  const avg = (viewerScore + profileScore) / 2
  const min = Math.min(viewerScore, profileScore)
  const mutualScore = Math.round(min * 0.6 + avg * 0.4)

  return { viewerMatchesProfile, profileMatchesViewer, mutualScore, viewerScore, profileScore }
}

function getMutualLabel(score: number) {
  if (score >= 85) return { text: 'Excellent Match', color: '#10b981', bg: '#f0fdf4' }
  if (score >= 70) return { text: 'Good Match', color: '#3b82f6', bg: '#eff6ff' }
  if (score >= 55) return { text: 'Fair Match', color: '#f59e0b', bg: '#fffbeb' }
  return { text: 'Needs Discussion', color: '#e11d48', bg: '#fff1f2' }
}

interface Props {
  profile: any
  viewerProfile: any
}

export default function MatchComparison({ profile, viewerProfile }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (!viewerProfile || !profile) return null

  const { viewerMatchesProfile, profileMatchesViewer, mutualScore, viewerScore, profileScore } = computeMatch(viewerProfile, profile)

  if (viewerMatchesProfile.length === 0 && profileMatchesViewer.length === 0) return null

  const label = getMutualLabel(mutualScore)

  const viewerMatched = viewerMatchesProfile.filter(i => i.matched)
  const viewerMissed = viewerMatchesProfile.filter(i => !i.matched)
  const profileMatched = profileMatchesViewer.filter(i => i.matched)
  const profileMissed = profileMatchesViewer.filter(i => !i.matched)

  const allGood = [...viewerMatched, ...profileMatched]
  const allDiscuss = [...viewerMissed, ...profileMissed]

  // Deduplicate by label
  const goodUnique = allGood.filter((item, idx, arr) => arr.findIndex(x => x.label === item.label) === idx)
  const discussUnique = allDiscuss.filter((item, idx, arr) => arr.findIndex(x => x.label === item.label) === idx && !goodUnique.find(g => g.label === item.label))

  return (
    <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', marginBottom: '24px', border: `1px solid ${label.color}20` }}>
      
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${label.color}15, ${label.color}08)`, padding: '20px 24px', borderBottom: `1px solid ${label.color}20` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: 900, color: label.color }}>{mutualScore}%</span>
              <span style={{ fontSize: '14px', fontWeight: 800, color: label.color, background: label.bg, padding: '4px 12px', borderRadius: '20px' }}>{label.text}</span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Mutual compatibility based on your preferences</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#111827' }}>{viewerScore}%</div>
              <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>You match their prefs</div>
            </div>
            <div style={{ width: '1px', background: '#e5e7eb' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#111827' }}>{profileScore}%</div>
              <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>They match your prefs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary counts */}
      <div style={{ padding: '16px 24px', display: 'flex', gap: '24px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          <span style={{ fontSize: '13px', color: '#374151', fontWeight: 600 }}>{goodUnique.length} compatible factors</span>
        </div>
        {discussUnique.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ fontSize: '13px', color: '#374151', fontWeight: 600 }}>{discussUnique.length} to discuss</span>
          </div>
        )}
      </div>

      {/* Compatible factors */}
      {goodUnique.length > 0 && (
        <div style={{ padding: '16px 24px', borderBottom: discussUnique.length > 0 ? '1px solid #f3f4f6' : 'none' }}>
          <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Why this match looks suitable</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(expanded ? goodUnique : goodUnique.slice(0, 4)).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <circle cx="8" cy="8" r="8" fill="#10b981" opacity="0.15"/>
                  <path d="M5 8l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '6px' }}>{item.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Things to discuss */}
      {discussUnique.length > 0 && (
        <div style={{ padding: '16px 24px', background: '#fffbeb', borderTop: '1px solid #fde68a20' }}>
          <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Things to discuss</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(expanded ? discussUnique : discussUnique.slice(0, 3)).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <circle cx="8" cy="8" r="8" fill="#f59e0b" opacity="0.15"/>
                  <path d="M8 5v4M8 11v.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '6px' }}>{item.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show more/less */}
      {(goodUnique.length > 4 || discussUnique.length > 3) && (
        <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', padding: '12px', background: 'none', border: 'none', borderTop: '1px solid #f3f4f6', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#6b7280' }}>
          {expanded ? 'Show less' : `Show all ${goodUnique.length + discussUnique.length} factors`}
        </button>
      )}
    </div>
  )
}
