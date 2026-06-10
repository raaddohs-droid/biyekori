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

function ListRow({ profile, viewerProfile, interestMap }: { profile: any, viewerProfile: any, interestMap?: Record<string, string> }) {
  const score = computeMatchScore(profile, viewerProfile)
  const activity = getActivityStatus(profile)
  const creationBadge = getCreationBadge(profile)
  const photoUrl = profile.photo_url || profile.photoUrl
  const isPremium = profile.package !== 'prottasha'
  const [interestSent, setInterestSent] = useState(false)
  const [showLimitNudge, setShowLimitNudge] = useState(false)
  const [limitData, setLimitData] = useState<any>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isShortlisted, setIsShortlisted] = useState(false)
  const [photoRequested, setPhotoRequested] = useState(false)
  const relationshipStatus = (interestMap?.[String(profile.id)] ?? 'none') as 'none'|'sent'|'received'|'accepted'
  const rawName = profile.full_name || profile.name || 'Anonymous'
  const name = maskName(rawName, relationshipStatus)

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
          const found = (data.shortlists || []).some((s: any) => String(s.profile_id) === String(profile.id))
          setIsShortlisted(found)
        }).catch(() => {})
    } catch(e) {}
  }, [profile.id])

  const handleShortlistRow = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const stored = localStorage.getItem('biyekori_user')
    if (!stored) { window.location.href = '/login'; return }
    const user = JSON.parse(stored)
    if (!user?.id) return
    if (isShortlisted) {
      await fetch('/api/shortlists', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, profileId: profile.id })
      })
      setIsShortlisted(false)
    } else {
      await fetch('/api/shortlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, profileId: profile.id })
      })
      setIsShortlisted(true)
    }
  }

  const handleSendInterest = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const stored = localStorage.getItem('biyekori_user')
    if (!stored) { window.location.href = '/register?reason=interest'; return; }
    if (interestSent) return
    const user = JSON.parse(stored)
    try {
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
    } catch(e) {}
  }

  const religionLevel = profile.religious_level && profile.religious_level !== 'Unknown' ? ', ' + profile.religious_level : ''
  const isFeatured = profile.is_featured && profile.featured_until && new Date(profile.featured_until) > new Date()
  const infoRows = [
    [
      profile.age ? profile.age + ' yrs' + (profile.height ? ', ' + profile.height : '') : null,
      (profile.marital_status && profile.marital_status !== 'Not specified') ? profile.marital_status : null
    ],
    [
      profile.religion ? profile.religion + religionLevel : null,
      (profile.city || profile.district) || null
    ],
    [
      profile.education || null,
      profile.profession || null
    ]
  ]

  return (
    <>
    <div
      onClick={() => window.location.href = '/profile/' + profile.id}
      style={{
        background: 'white', borderRadius: '16px',
        border: isPremium ? '2px solid #fcd34d' : '1px solid #e5e7eb',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex', gap: '0', alignItems: 'stretch',
        transition: 'box-shadow 0.2s, transform 0.1s', cursor: 'pointer',
        overflow: 'visible'
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
    >
      <div style={{ position: 'relative', flexShrink: 0, width: '320px', height: '340px', borderRadius: '16px 0 0 16px', overflow: 'visible', paddingBottom: '20px' }}>
        {photoUrl ? (
          <img src={photoUrl} alt={name} style={{ width: '320px', height: '320px', objectFit: 'cover', objectPosition: 'center 15%', display: 'block', borderRadius: '16px 0 0 16px' }} />
        ) : (
          <div style={{ width: '320px', height: '320px', overflow: 'hidden', position: 'relative', borderRadius: '16px 0 0 16px', background: profile.gender === 'female' ? '#FFF0F6' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {profile.gender === 'female' ? (
              <img src="https://cdn.jsdelivr.net/npm/@mdi/svg@7.4.47/svg/face-woman.svg" width="220" height="220" style={{ filter: 'invert(27%) sepia(80%) saturate(1500%) hue-rotate(300deg) brightness(90%)', opacity: 0.55, marginBottom: '30px' }} alt=""/>
            ) : (
              <img src="https://cdn.jsdelivr.net/npm/@mdi/svg@7.4.47/svg/account-tie.svg" width="220" height="220" style={{ filter: 'invert(27%) sepia(80%) saturate(500%) hue-rotate(180deg) brightness(90%)', opacity: 0.55, marginBottom: '30px' }} alt=""/>
            )}
            {/* Gold accent line */}
            <div style={{ position: 'absolute', bottom: '44px', left: '25%', right: '25%', height: '1px', background: 'linear-gradient(90deg,transparent,#F0C040,transparent)' }}/>
          <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, whiteSpace: 'nowrap' }}>
              {photoRequested ? (
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', background: 'rgba(255,255,255,0.95)', padding: '4px 12px', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>✓ Request sent</span>
              ) : (
                <button onClick={e => {
                    e.stopPropagation()
                    setPhotoRequested(true)
                    try {
                      const stored = localStorage.getItem('biyekori_user')
                      if (stored) {
                        const user = JSON.parse(stored)
                        fetch('/api/photo-request', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ requesterId: user.id, requestedId: profile.id })
                        })
                      }
                    } catch(e) {}
                  }} style={{ fontSize: '11px', fontWeight: 700, color: 'white', background: profile.gender === 'female' ? 'linear-gradient(135deg,#DB2777,#9D174D)' : 'linear-gradient(135deg,#1D4ED8,#1E40AF)', border: 'none', padding: '5px 14px', borderRadius: '20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', letterSpacing: '0.3px' }}>Photo on Request</button>
              )}
            </div>
          </div>
        )}
        {/* Score badge - outside photo, at bottom edge */}
        <a href={`/profile/${profile.id}`} onClick={(e) => { e.stopPropagation() }} style={{ position: 'absolute', bottom: '-28px', left: '50%', transform: 'translateX(-50%)', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
          <div style={{ background: viewerProfile ? getScoreColor(score) : '#6b7280', borderRadius: '20px', padding: '4px 14px', display: 'flex', alignItems: 'center', gap: '3px', boxShadow: '0 2px 8px rgba(0,0,0,0.2), 0 0 0 2px white', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '11px', color: 'white', fontWeight: 800, letterSpacing: '0.2px' }}>{viewerProfile ? '♥ ' + score + '%' : '🔒'}</span>
          </div>
          <span style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>why this score →</span>
        </a>
      </div>

      <div style={{ flex: 1, padding: '20px 20px 16px', minWidth: 0 }}>
        {creationBadge && (
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: creationBadge.color, background: creationBadge.bg, borderRadius: '20px', padding: '2px 10px', letterSpacing: '0.3px' }}>
              {creationBadge.label}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#111827' }}>{name}</span>
          {profile.guardian_mode ? (
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#7c3aed', background: '#ede9fe', padding: '2px 7px', borderRadius: '20px', border: '1px solid #c4b5fd' }}>👨‍👩‍👧 পরিবার পরিচালিত</span>
          ) : (
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '2px 7px', borderRadius: '20px', border: '1px solid #bae6fd' }}>👤 নিজে পরিচালিত</span>
          )}
              {relationshipStatus === 'none' && (
                <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, background: '#f3f4f6', borderRadius: '6px', padding: '2px 6px' }}>
                  {(() => { const id = profile.id; const dt = new Date(profile.created_at || ''); const yy = String(dt.getFullYear()).slice(2); const mm = String(dt.getMonth()+1).padStart(2,'0'); const nnnn = (id*7+dt.getSeconds()*13+id*31)%9000+1000; return isNaN(nnnn) ? 'BK-'+id : `BK-${yy}${mm}-${nnnn}` })()}
                </span>
              )}
          {isFeatured && (
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'white', background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: '20px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Featured
            </span>
          )}
          {isPremium && (
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#b45309', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '6px', padding: '2px 7px' }}>Premium</span>
          )}
          {profile.nid_verified && (
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#059669', background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '6px', padding: '2px 7px' }}>NID Verified</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: activity.color, display: 'inline-block', flexShrink: 0, boxShadow: activity.isOnline ? '0 0 0 2px rgba(16,185,129,0.25)' : 'none' }} />
            <span style={{ fontSize: '11px', color: activity.color, fontWeight: 700 }}>{activity.label}</span>
          </div>
          {relationshipStatus === 'received' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 800, color: 'white', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', borderRadius: '20px', padding: '5px 14px', boxShadow: '0 2px 8px rgba(124,58,237,0.4)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              Likes You!
            </span>
          )}
          {relationshipStatus === 'accepted' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 800, color: 'white', background: 'linear-gradient(135deg, #059669, #10b981)', borderRadius: '20px', padding: '5px 14px', boxShadow: '0 2px 8px rgba(16,185,129,0.4)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              You &amp; {profile.gender === 'Male' ? 'Him' : 'Her'} ✓
            </span>
          )}
          {relationshipStatus === 'sent' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 600, color: '#6b7280', background: '#f3f4f6', borderRadius: '20px', padding: '2px 8px' }}>
              ✓ Interest Sent
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 20px', marginBottom: '8px' }}>
          {infoRows.map((row, i) => row.some(Boolean) && (
            <React.Fragment key={i}>
              {row[0] && <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>{row[0]}</span>}
              {row[1] && <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>{row[1]}</span>}
            </React.Fragment>
          ))}
        </div>
        {profile.about_me && (
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '8px', marginTop: '4px' }}>
            <p style={{ margin: '0 0 2px', fontSize: '11.5px', color: '#6b7280', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontStyle: 'italic' }}>
              {profile.about_me}
            </p>
            <a href={'/profile/' + profile.id} onClick={e => e.stopPropagation()} style={{ fontSize: '11px', color: '#e11d48', fontWeight: 600, textDecoration: 'none' }}>More</a>
          </div>
        )}
      </div>

      <div style={{ flexShrink: 0, width: '140px', borderLeft: '1px solid #f3f4f6', background: 'linear-gradient(180deg,#fff5f7,#ffffff)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px 12px', minHeight: '100%' }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#e11d48', fontWeight: 700, textAlign: 'center' }}>Quick Actions</p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button onClick={handleSendInterest} disabled={interestSent} title={interestSent ? 'Interest Sent' : 'Send Interest'}
            style={{ width: '48px', height: '48px', borderRadius: '50%', border: 'none', cursor: interestSent ? 'default' : 'pointer', background: interestSent ? '#f3f4f6' : 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: interestSent ? 'none' : '0 3px 10px rgba(16,185,129,0.35)', transition: 'all 0.2s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={interestSent ? '#9ca3af' : 'white'} strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          </button>
          <span style={{ fontSize: '10px', color: interestSent ? '#9ca3af' : '#059669', fontWeight: 700 }}>{interestSent ? 'Sent' : 'Connect'}</span>
          {showLimitNudge && limitData && (
            <UpgradeNudge type="interest_limit" data={limitData} onDismiss={() => setShowLimitNudge(false)} />
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button onClick={(e) => { e.stopPropagation(); const stored = localStorage.getItem('biyekori_user'); if (!stored) { window.location.href = '/register?reason=contact'; return; } const user = JSON.parse(stored); if (!user.package || user.package === 'prottasha') { setShowUpgradeModal(true); return; } window.location.href = '/profile/' + profile.id; }}
            title="View Contact" style={{ width: '48px', height: '48px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#e11d48,#db2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(225,29,72,0.3)', transition: 'all 0.2s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </button>
          <span style={{ fontSize: '10px', color: '#e11d48', fontWeight: 700 }}>Contact</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <Link href={'/profile/' + profile.id} onClick={e => e.stopPropagation()}
            style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #e5e7eb', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.2s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </Link>
          <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600 }}>Profile</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button onClick={handleShortlistRow}
            style={{ width: '48px', height: '48px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: isShortlisted ? '#fff1f2' : '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isShortlisted ? '0 3px 10px rgba(225,29,72,0.2)' : 'none', transition: 'all 0.2s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isShortlisted ? '#e11d48' : 'none'} stroke={isShortlisted ? '#e11d48' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <span style={{ fontSize: '10px', color: isShortlisted ? '#e11d48' : '#9ca3af', fontWeight: 700 }}>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
        </div>
      </div>
    </div>
    {showUpgradeModal && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowUpgradeModal(false)}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '36px 28px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: '52px', marginBottom: '14px' }}>🔒</div>
          <h2 style={{ margin: '0 0 10px', fontSize: '22px', fontWeight: 900, color: '#111827' }}>Upgrade to Contact</h2>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6b7280', lineHeight: 1.7 }}>View contact details and connect directly with <strong>{profile.full_name || 'this member'}</strong>.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <a href="/pricing" style={{ display: 'block', padding: '15px', background: 'linear-gradient(135deg,#e11d48,#db2777)', color: 'white', borderRadius: '14px', fontWeight: 800, fontSize: '15px', textDecoration: 'none' }}>⭐ Upgrade to Silver — ৳499/mo</a>
            <a href="/pricing" style={{ display: 'block', padding: '15px', background: 'linear-gradient(135deg,#7c3aed,#e11d48)', color: 'white', borderRadius: '14px', fontWeight: 800, fontSize: '15px', textDecoration: 'none' }}>👑 Upgrade to Gold — ৳999/mo</a>
          </div>
          <button onClick={() => setShowUpgradeModal(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '14px', cursor: 'pointer', padding: '8px 16px' }}>Maybe later</button>
        </div>
      </div>
    )}
    </>
  )
}

export function ViewToggle({ view, onToggle }: { view: 'grid' | 'list', onToggle: (v: 'grid' | 'list') => void }) {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <button onClick={() => onToggle('list')} title="List view" style={{ padding: '6px 8px', borderRadius: '7px', border: '2px solid', borderColor: view === 'list' ? '#e11d48' : '#e5e7eb', background: view === 'list' ? '#fff1f2' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={view === 'list' ? '#e11d48' : '#9ca3af'} strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <button onClick={() => onToggle('grid')} title="Grid view" style={{ padding: '6px 8px', borderRadius: '7px', border: '2px solid', borderColor: view === 'grid' ? '#e11d48' : '#e5e7eb', background: view === 'grid' ? '#fff1f2' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={view === 'grid' ? '#e11d48' : '#9ca3af'} strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
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

  useEffect(() => {
    // Default order when no viewer — keep as-is
    setSortedProfiles(profiles)
  }, [profiles])

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
            // Sort profiles by match score descending
            const ranked = [...profiles].sort((a, b) =>
              computeMatchScore(b, vp) - computeMatchScore(a, vp)
            )
            setSortedProfiles(ranked)
            // Will re-sort with mutuals on top once interestMap loads
          }
        })
        .catch(() => {})

      // Fetch interest usage
      setCurrentUser(user)
      fetch('/api/interests/send?userId=' + user.id)
        .then(r => r.json())
        .then(data => { if (data.limit) setInterestUsage(data) })
        .catch(() => {})

      // Fetch all interests once and build lookup map
      fetch('/api/interests/list?userId=' + user.id)
        .then(r => r.json())
        .then(data => {
          const map: Record<string, string> = {}
          ;(data.sent || []).forEach((s: any) => {
            map[String(s.receiver_id)] = s.status === 'accepted' ? 'accepted' : 'sent'
          })
          ;(data.received || []).forEach((r: any) => {
            const id = String(r.sender_id)
            if (!map[id]) map[id] = r.status === 'accepted' ? 'accepted' : 'received'
            else if (r.status === 'accepted') map[id] = 'accepted'
          })
          setInterestMap(map)
          // Re-sort: mutuals first, then by score
          setSortedProfiles(prev => [...prev].sort((a, b) => {
            const aStatus = map[String(a.id)] || 'none'
            const bStatus = map[String(b.id)] || 'none'
            const aIsMutual = aStatus === 'accepted'
            const bIsMutual = bStatus === 'accepted'
            if (aIsMutual && !bIsMutual) return -1
            if (!aIsMutual && bIsMutual) return 1
            return 0
          }))
        })
        .catch(() => {})
    } catch(e) {}
  }, [profiles])

  return (
    <div>
      {view === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {interestUsage && currentUser && (
            <InterestCounter used={interestUsage.used} limit={interestUsage.limit} pkg={interestUsage.pkg} />
          )}
          {sortedProfiles.map((profile: any) => (
            <ListRow key={profile.id} profile={profile} viewerProfile={viewerProfile} interestMap={interestMap} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {sortedProfiles.map((profile: any) => (
            <ProfileCard key={profile.id} profile={profile} viewerProfile={viewerProfile} />
          ))}
        </div>
      )}
    </div>
  )
}
