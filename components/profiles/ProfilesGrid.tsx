'use client'
import React, { useState, useEffect } from 'react'
import UpgradeNudge, { InterestCounter } from '@/components/UpgradeNudge'
import ProfileCard from './ProfileCard'
import Link from 'next/link'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const EDU_RANK: Record<string, number> = {
  'SSC': 1, 'HSC': 2, 'Diploma': 2, "Bachelor's": 3,
  'Law': 4, "Master's": 4, 'Medical': 5, 'Engineering': 5, 'PhD': 6, 'Other': 2
}

function maskName(fullName: string, relationship: 'none' | 'sent' | 'received' | 'accepted'): string {
  if (!fullName) return 'Anonymous'
  if (relationship === 'accepted') return fullName
  // Mask all name parts for all other states
  const parts = fullName.trim().split(' ')
  return parts.map(p => p[0] + '*'.repeat(Math.max(p.length - 1, 3))).join(' ')
}

function parseHeightToCm(h: string): number {
  if (!h) return 0
  const m = h.match(/(\d+)'(\d+)?/)
  if (!m) return 0
  return parseInt(m[1]) * 30.48 + (parseInt(m[2] || '0') * 2.54)
}

function computeMatchScore(profile: any, viewer: any): number {
  const REL_LEVELS = ['Liberal', 'Moderate', 'Religious', 'Very Religious']
  const hasViewer = !!(viewer && viewer.id)

  if (!hasViewer) {
    // Generic score for guests
    let score = 0
    score += profile.religion ? 12 : 4
    const age = profile.age || 0
    if (age >= 20 && age <= 35) score += 12
    else if (age >= 18 && age <= 40) score += 7
    else score += 3
    score += (EDU_RANK[profile.education || ''] || 2) >= 3 ? 12 : 6
    score += Math.round(((profile.profile_completion || 30) / 100) * 20)
    if (String(profile.smoking || 'false') === 'false') score += 5
    if (String(profile.drinking || 'false') === 'false') score += 5
    if (profile.is_verified) score += 8
    else if (profile.phone_verified) score += 4
    if (profile.photo_url) score += 8
    if (profile.about_me) score += 6
    if (profile.family_values) score += 4
    if (profile.hobbies) score += 4
    return Math.max(30, Math.min(99, score))
  }

  let earned = 0
  let possible = 0

  function add(weight: number, score: number) { earned += score; possible += weight }

  // 1. RELIGION (15)
  if (viewer.religion || profile.religion) {
    const match = viewer.religion === profile.religion
    add(15, match ? 15 : 0)
  }

  // 2. RELIGIOUS LEVEL (10)
  if (viewer.expected_religious_level || profile.religious_level) {
    const vRI = REL_LEVELS.indexOf(viewer.expected_religious_level || '')
    const pRI = REL_LEVELS.indexOf(profile.religious_level || '')
    let score = 6
    if (vRI >= 0 && pRI >= 0) {
      const d = Math.abs(vRI - pRI)
      score = d === 0 ? 10 : d === 1 ? 7 : d === 2 ? 3 : 0
    }
    add(10, score)
  }

  // 3. AGE (12)
  {
    const age = profile.age || 0
    const ageMin = viewer.expected_age_min || 18
    const ageMax = viewer.expected_age_max || 60
    const inRange = age >= ageMin && age <= ageMax
    const diff = inRange ? 0 : Math.min(Math.abs(age - ageMin), Math.abs(age - ageMax))
    add(12, inRange ? 12 : Math.max(0, 12 - diff * 2))
  }

  // 4. EDUCATION (8)
  if (viewer.expected_education || profile.education) {
    const expRank = EDU_RANK[viewer.expected_education || ''] || 0
    const profRank = EDU_RANK[profile.education || ''] || 0
    add(8, expRank === 0 ? 6 : profRank >= expRank ? 8 : Math.max(0, 8 - (expRank - profRank) * 2))
  }

  // 5. LOCATION (7)
  {
    const profDist = (profile.district || profile.city || '').toLowerCase()
    let expDists: string[] = []
    try { expDists = (viewer.expected_districts || []).map((d: string) => d.toLowerCase()) } catch {}
    const viewerDist = (viewer.district || '').toLowerCase()
    const inExpected = expDists.length > 0 && expDists.includes(profDist)
    const sameAsViewer = profDist === viewerDist
    add(7, inExpected || sameAsViewer ? 7 : expDists.length > 0 ? 2 : 4)
  }

  // 6. INCOME (7)
  if (viewer.expected_income || profile.monthly_income) {
    const expInc = parseFloat(viewer.expected_income || '0')
    const profInc = profile.monthly_income || 0
    let score = 4
    if (expInc > 0 && profInc > 0) {
      const r = profInc / expInc
      score = r >= 1 ? 7 : r >= 0.8 ? 5 : r >= 0.6 ? 3 : 1
    } else if (!expInc) score = 4
    add(7, score)
  }

  // 7. MARITAL STATUS (7)
  {
    const expMs = (viewer.expected_marital_status || 'Never Married').toLowerCase()
    const profMs = (profile.marital_status || '').toLowerCase()
    const match = expMs === 'any' || expMs === profMs
    add(7, match ? 7 : profMs === 'never married' ? 5 : 2)
  }

  // 8. HEIGHT (5)
  if (profile.height) {
    const phCm = parseHeightToCm(profile.height)
    const minCm = parseHeightToCm(viewer.expected_height_min || '')
    const maxCm = parseHeightToCm(viewer.expected_height_max || '')
    let score = 3
    if (phCm > 0 && minCm > 0 && maxCm > 0) {
      if (phCm >= minCm && phCm <= maxCm) score = 5
      else { const d = Math.min(Math.abs(phCm-minCm), Math.abs(phCm-maxCm)); score = d < 5 ? 3 : 1 }
    }
    add(5, score)
  }

  // 9. FAMILY VALUES (5)
  if (viewer.expected_family_values || profile.family_values) {
    const expFv = (viewer.expected_family_values || '').toLowerCase()
    const profFv = (profile.family_values || '').toLowerCase()
    add(5, !expFv || expFv === profFv ? 5 : 2)
  }

  // 10. SMOKING (4)
  {
    const expSmoke = (viewer.expected_smoking || 'no').toLowerCase()
    const profileSmokes = String(profile.smoking || 'false').toLowerCase() === 'true'
    add(4, expSmoke === 'no' ? (!profileSmokes ? 4 : 0) : 4)
  }

  // 11. FAMILY TYPE (4)
  if (viewer.expected_family_type || profile.family_type) {
    const expFt = (viewer.expected_family_type || '').toLowerCase()
    const profFt = (profile.family_type || '').toLowerCase()
    add(4, !expFt || expFt === profFt ? 4 : 2)
  }

  // 12. PROFILE TRUST (8)
  add(8, Math.round(((profile.profile_completion || 30) / 100) * 8))

  // 13. VERIFICATION (5)
  add(5, profile.is_verified ? 5 : profile.phone_verified ? 2 : 0)

  return Math.max(30, Math.min(99, possible > 0 ? Math.round((earned / possible) * 100) : 50))
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#10b981'
  if (score >= 70) return '#3b82f6'
  if (score >= 55) return '#f59e0b'
  return '#e11d48'
}

function getCreationBadge(profile: any): { label: string; bg: string; color: string } | null {
  const created = profile.created_at || profile.createdAt
  if (!created) return null
  const ageDays = (Date.now() - new Date(created).getTime()) / 86400000
  if (ageDays < 1) return { label: 'Just Joined', bg: '#f3e8ff', color: '#7c3aed' }
  if (ageDays < 14) return { label: 'New Member', bg: '#dcfce7', color: '#15803d' }
  return null
}

function getActivityStatus(profile: any): { label: string; color: string; isOnline: boolean } {
  const lastActive = profile.last_active_at || profile.last_active
  if (lastActive) {
    const mins = (Date.now() - new Date(lastActive).getTime()) / 60000
    if (mins < 30) return { label: 'Online now', color: '#10b981', isOnline: true }
    if (mins < 240) return { label: 'Active today', color: '#f59e0b', isOnline: false }
    if (mins < 1440) return { label: 'Active yesterday', color: '#f59e0b', isOnline: false }
    if (mins < 4320) return { label: 'Active this week', color: '#3b82f6', isOnline: false }
    if (mins < 10080) return { label: 'Active recently', color: '#6b7280', isOnline: false }
    const days = Math.floor(mins / 1440)
    return { label: `Active ${days}d ago`, color: '#d1d5db', isOnline: false }
  }
  return { label: 'Recently active', color: '#9ca3af', isOnline: false }
}


const C = {
  maroon: '#7B1D2E',
  gold: '#B8892A',
  goldLight: '#F5E6C8',
  border: '#E8E0D8',
  text: '#1C1917',
  textMuted: '#78716C',
  textLight: '#A8A29E',
}

function getBKId(profile: any): string {
  const id = profile.id
  const dt = new Date(profile.created_at || '')
  const yy = String(dt.getFullYear()).slice(2)
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const nnnn = (id * 7 + dt.getSeconds() * 13 + id * 31) % 9000 + 1000
  return isNaN(nnnn) ? `BK-${id}` : `BK-${yy}${mm}-${nnnn}`
}

function ListRow({ profile, viewerProfile, interestMap }: { profile: any, viewerProfile: any, interestMap?: Record<string, string> }) {
  const score = computeMatchScore(profile, viewerProfile)
  const activity = getActivityStatus(profile)
  const creationBadge = getCreationBadge(profile)
  const photoUrl = profile.photo_url || profile.photoUrl
  const isPremium = profile.package !== 'prottasha'
  const isFeatured = profile.is_featured && profile.featured_until && new Date(profile.featured_until) > new Date()
  const [interestSent, setInterestSent] = useState(false)
  const [showLimitNudge, setShowLimitNudge] = useState(false)
  const [limitData, setLimitData] = useState<any>(null)
  const [isShortlisted, setIsShortlisted] = useState(false)
  const [photoRequested, setPhotoRequested] = useState(false)
  const relationshipStatus = (interestMap?.[String(profile.id)] ?? 'none') as 'none'|'sent'|'received'|'accepted'
  const rawName = profile.full_name || profile.name || 'Anonymous'
  const name = maskName(rawName, relationshipStatus)
  const bkId = getBKId(profile)

  useEffect(() => {
    if (relationshipStatus === 'sent' || relationshipStatus === 'accepted') setInterestSent(true)
  }, [relationshipStatus])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('biyekori_user')
      if (!stored) return
      const user = JSON.parse(stored)
      if (!user?.id) return
      fetch('/api/shortlists?userId=' + user.id)
        .then(r => r.json())
        .then(data => {
          setIsShortlisted((data.shortlists || []).some((s: any) => String(s.profile_id) === String(profile.id)))
        }).catch(() => {})
    } catch {}
  }, [profile.id])

  const handleShortlist = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const stored = localStorage.getItem('biyekori_user')
    if (!stored) { window.location.href = '/login'; return }
    const user = JSON.parse(stored)
    if (!user?.id) return
    await fetch('/api/shortlists', {
      method: isShortlisted ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, profileId: profile.id })
    })
    setIsShortlisted(!isShortlisted)
  }

  const handleSendInterest = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const stored = localStorage.getItem('biyekori_user')
    if (!stored) { window.location.href = '/register?reason=interest'; return }
    if (interestSent) return
    const user = JSON.parse(stored)
    const res = await fetch('/api/interests/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId: user.id, receiverId: profile.id })
    })
    const data = await res.json()
    if (res.status === 403 && data.upgrade) {
      setLimitData({ used: data.used || data.limit, limit: data.limit, remaining: 0 })
      setShowLimitNudge(true)
      return
    }
    if (data.success) setInterestSent(true)
  }

  return (
    <>
      <div
        onClick={() => window.location.href = '/profile/' + profile.id}
        style={{
          background: 'white',
          borderRadius: '16px',
          border: isFeatured ? `1.5px solid ${C.gold}` : `1px solid ${C.border}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'stretch',
          transition: 'box-shadow 0.2s, transform 0.15s',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
      >
        {/* Photo */}
        <div style={{ position: 'relative', flexShrink: 0, width: '200px' }}>
          {photoUrl ? (
            <img src={photoUrl} alt={name} style={{ width: '200px', height: '100%', objectFit: 'cover', objectPosition: 'center 10%', display: 'block', minHeight: '220px' }} />
          ) : (
            <div style={{ width: '200px', minHeight: '220px', height: '100%', background: profile.gender === 'female' ? '#FDF2F8' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
              <img
                src={profile.gender === 'female'
                  ? "https://cdn.jsdelivr.net/npm/@mdi/svg@7.4.47/svg/face-woman.svg"
                  : "https://cdn.jsdelivr.net/npm/@mdi/svg@7.4.47/svg/account-tie.svg"}
                width="100" height="100"
                style={{ opacity: 0.3, filter: profile.gender === 'female' ? 'invert(27%) sepia(80%) saturate(1500%) hue-rotate(300deg)' : 'invert(27%) sepia(80%) saturate(500%) hue-rotate(180deg)' }}
                alt=""
              />
              {!photoRequested ? (
                <button onClick={e => {
                  e.stopPropagation(); setPhotoRequested(true)
                  try { const u = JSON.parse(localStorage.getItem('biyekori_user') || '{}'); if (u.id) fetch('/api/photo-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requesterId: u.id, requestedId: profile.id }) }) } catch {}
                }} style={{ fontSize: '11px', fontWeight: 600, color: 'white', background: C.maroon, border: 'none', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer' }}>
                  Photo on Request
                </button>
              ) : (
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#15803d', background: 'rgba(255,255,255,0.95)', padding: '4px 10px', borderRadius: '20px' }}>✓ Request sent</span>
              )}
            </div>
          )}
          {/* Activity badge */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.92)', padding: '3px 8px', borderRadius: '20px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: activity.color, flexShrink: 0, boxShadow: activity.isOnline ? `0 0 0 2px rgba(22,163,74,0.3)` : 'none' }} />
            <span style={{ fontSize: '10px', color: activity.color, fontWeight: 600, whiteSpace: 'nowrap' }}>{activity.label}</span>
          </div>
          {/* Match score */}
          {viewerProfile && (
            <Link href={`/profile/${profile.id}`} onClick={e => e.stopPropagation()}
              style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', background: getScoreColor(score), borderRadius: '20px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.2), 0 0 0 2px white', whiteSpace: 'nowrap', textDecoration: 'none' }}>
              <span style={{ fontSize: '11px', color: 'white', fontWeight: 700 }}>♥ {score}% match</span>
            </Link>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '18px 20px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Name row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: C.text }}>{name}</span>
                {creationBadge && (
                  <span style={{ fontSize: '10px', fontWeight: 700, color: creationBadge.color, background: creationBadge.bg, padding: '2px 8px', borderRadius: '20px' }}>{creationBadge.label}</span>
                )}
                {isFeatured && (
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'white', background: C.gold, padding: '2px 8px', borderRadius: '20px' }}>★ Featured</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', color: C.textLight, fontWeight: 600, background: '#F5F5F4', padding: '2px 7px', borderRadius: '6px' }}>{bkId}</span>
                {profile.guardian_mode ? (
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#7c3aed', background: '#EDE9FE', padding: '2px 7px', borderRadius: '20px' }}>👨‍👩‍👧 Family Managed</span>
                ) : (
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#0369a1', background: '#E0F2FE', padding: '2px 7px', borderRadius: '20px' }}>👤 Self Managed</span>
                )}
                {isPremium && (
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#b45309', background: '#FEF3C7', border: '1px solid #FCD34D', padding: '2px 7px', borderRadius: '6px' }}>Premium</span>
                )}
              </div>
            </div>
            {/* Relationship badges */}
            {relationshipStatus === 'received' && (
              <span style={{ flexShrink: 0, fontSize: '12px', fontWeight: 700, color: 'white', background: '#7c3aed', padding: '5px 12px', borderRadius: '20px' }}>❤ Likes You!</span>
            )}
            {relationshipStatus === 'accepted' && (
              <span style={{ flexShrink: 0, fontSize: '12px', fontWeight: 700, color: 'white', background: '#059669', padding: '5px 12px', borderRadius: '20px' }}>✓ Matched</span>
            )}
            {relationshipStatus === 'sent' && (
              <span style={{ flexShrink: 0, fontSize: '11px', fontWeight: 600, color: C.textMuted, background: '#F5F5F4', padding: '4px 10px', borderRadius: '20px' }}>✓ Interest Sent</span>
            )}
          </div>

          {/* Info grid */}
          <div style={{ className='profiles-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px' }}>
            {profile.age && <span style={{ fontSize: '13px', color: C.textMuted }}>{profile.age} yrs{profile.height ? `, ${profile.height}` : ''}</span>}
            {(profile.city || profile.district) && <span style={{ fontSize: '13px', color: C.textMuted }}>📍 {profile.city || profile.district}</span>}
            {profile.profession && <span style={{ fontSize: '13px', color: C.textMuted }}>💼 {profile.profession}</span>}
            {profile.education && <span style={{ fontSize: '13px', color: C.textMuted }}>🎓 {profile.education}</span>}
            {profile.religion && profile.religion !== 'Not specified' && <span style={{ fontSize: '13px', color: C.textMuted }}>{profile.religion}{profile.religious_level && profile.religious_level !== 'Unknown' ? ` · ${profile.religious_level}` : ''}</span>}
            {profile.marital_status && profile.marital_status !== 'Not specified' && <span style={{ fontSize: '13px', color: C.textMuted }}>{profile.marital_status}</span>}
          </div>

          {/* Verification badges */}
          {(profile.is_verified || profile.nid_verified || profile.phone_verified) && (
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {profile.is_verified && <span style={{ fontSize: '10px', fontWeight: 600, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 7px', borderRadius: '6px' }}>✓ Verified</span>}
              {profile.nid_verified && <span style={{ fontSize: '10px', fontWeight: 600, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 7px', borderRadius: '6px' }}>✓ NID Verified</span>}
              {profile.phone_verified && !profile.nid_verified && <span style={{ fontSize: '10px', fontWeight: 600, color: '#2563eb', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '2px 7px', borderRadius: '6px' }}>✓ Phone Verified</span>}
            </div>
          )}

          {/* Bio */}
          {profile.about_me && (
            <p style={{ margin: 0, fontSize: '12.5px', color: C.textMuted, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontStyle: 'italic' }}>
              {profile.about_me}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
            <button onClick={handleShortlist}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: isShortlisted ? '#FDF2F4' : 'white', border: `1px solid ${isShortlisted ? C.maroon : C.border}`, borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: isShortlisted ? C.maroon : C.textMuted, cursor: 'pointer' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill={isShortlisted ? C.maroon : 'none'} stroke={isShortlisted ? C.maroon : C.textLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {isShortlisted ? 'Shortlisted' : 'Shortlist'}
            </button>
            <Link href={`/profile/${profile.id}`} onClick={e => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', padding: '7px 16px', background: 'white', border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: C.text, textDecoration: 'none' }}>
              View Profile
            </Link>
            <button onClick={handleSendInterest} disabled={interestSent}
              style={{ display: 'flex', alignItems: 'center', padding: '7px 16px', background: interestSent ? '#F5F5F4' : C.maroon, border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: interestSent ? C.textLight : 'white', cursor: interestSent ? 'default' : 'pointer' }}>
              {interestSent ? '✓ Interest Sent' : 'Send Interest'}
            </button>
          </div>
        </div>
      </div>
      {showLimitNudge && limitData && (
        <UpgradeNudge type="interest_limit" data={limitData} onDismiss={() => setShowLimitNudge(false)} />
      )}
    </>
  )
}

export function ViewToggle({ view, onToggle }: { view: 'grid' | 'list', onToggle: (v: 'grid' | 'list') => void }) {
  return (
    <div style={{ display: 'flex', gap: '2px', background: 'white', padding: '3px', borderRadius: '9px', border: '1px solid #E8E0D8' }}>
      <button onClick={() => onToggle('list')} title="List view" style={{ padding: '5px 8px', borderRadius: '7px', border: 'none', background: view === 'list' ? '#7B1D2E' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={view === 'list' ? 'white' : '#A8A29E'} strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <button onClick={() => onToggle('grid')} title="Grid view" style={{ padding: '5px 8px', borderRadius: '7px', border: 'none', background: view === 'grid' ? '#7B1D2E' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={view === 'grid' ? 'white' : '#A8A29E'} strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
      </button>
    </div>
  )
}

export default function ProfilesGrid({ profiles, view }: { profiles: any[], view: 'grid' | 'list' }) {
  const [viewerProfile, setViewerProfile] = useState<any>(null)
  const [sortedProfiles, setSortedProfiles] = useState<any[]>(profiles)
  const [interestMap, setInterestMap] = useState<Record<string, string>>({})
  const [interestUsage, setInterestUsage] = useState<{used:number,limit:number,pkg:string}|null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => { setSortedProfiles(profiles) }, [profiles])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('biyekori_user')
      if (!stored) return
      const user = JSON.parse(stored)
      if (!user.id) return
      fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=*`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      })
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data) && data[0]) {
            const vp = data[0]
            setViewerProfile(vp)
            const ranked = [...profiles].sort((a, b) => computeMatchScore(b, vp) - computeMatchScore(a, vp))
            setSortedProfiles(ranked)
          }
        }).catch(() => {})

      setCurrentUser(user)
      fetch('/api/interests/send?userId=' + user.id)
        .then(r => r.json())
        .then(data => { if (data.limit) setInterestUsage(data) }).catch(() => {})

      fetch('/api/interests/list?userId=' + user.id)
        .then(r => r.json())
        .then(data => {
          const map: Record<string, string> = {}
          ;(data.sent || []).forEach((s: any) => { map[String(s.receiver_id)] = s.status === 'accepted' ? 'accepted' : 'sent' })
          ;(data.received || []).forEach((r: any) => {
            const id = String(r.sender_id)
            if (!map[id]) map[id] = r.status === 'accepted' ? 'accepted' : 'received'
            else if (r.status === 'accepted') map[id] = 'accepted'
          })
          setInterestMap(map)
          setSortedProfiles(prev => [...prev].sort((a, b) => {
            const aM = map[String(a.id)] === 'accepted', bM = map[String(b.id)] === 'accepted'
            if (aM && !bM) return -1; if (!aM && bM) return 1; return 0
          }))
        }).catch(() => {})
    } catch {}
  }, [profiles])

  return (
    <div>
      {interestUsage && currentUser && (
        <InterestCounter used={interestUsage.used} limit={interestUsage.limit} pkg={interestUsage.pkg} />
      )}
      {view === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {sortedProfiles.map((profile: any) => (
            <ListRow key={profile.id} profile={profile} viewerProfile={viewerProfile} interestMap={interestMap} />
          ))}
        </div>
      ) : (
        <div style={{ className='profiles-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {sortedProfiles.map((profile: any) => (
            <ProfileCard key={profile.id} profile={profile} viewerProfile={viewerProfile} interestMap={interestMap} />
          ))}
        </div>
      )}
    </div>
  )
}
