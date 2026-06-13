"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import UpgradeNudge from "@/components/UpgradeNudge"

const C = {
  maroon: '#7B1D2E',
  gold: '#B8892A',
  goldLight: '#F5E6C8',
  border: '#E8E0D8',
  text: '#1C1917',
  textMuted: '#78716C',
  textLight: '#A8A29E',
  cardShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
}

function getBKId(profile: any): string {
  const id = profile.id
  const dt = new Date(profile.created_at || '')
  const yy = String(dt.getFullYear()).slice(2)
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const nnnn = (id * 7 + dt.getSeconds() * 13 + id * 31) % 9000 + 1000
  return isNaN(nnnn) ? `BK-${id}` : `BK-${yy}${mm}-${nnnn}`
}

function maskName(fullName: string, relationship: string): string {
  if (!fullName) return 'Anonymous'
  if (relationship === 'accepted') return fullName
  const parts = fullName.trim().split(' ')
  return parts.map(p => p[0] + '*'.repeat(Math.max(p.length - 1, 3))).join(' ')
}

function getActivityStatus(profile: any): { label: string; color: string; isOnline: boolean } {
  const lastActive = profile.last_active_at || profile.last_active
  if (lastActive) {
    const mins = (Date.now() - new Date(lastActive).getTime()) / 60000
    if (mins < 30) return { label: 'Online now', color: '#16a34a', isOnline: true }
    if (mins < 240) return { label: 'Active today', color: '#d97706', isOnline: false }
    if (mins < 1440) return { label: 'Active yesterday', color: '#d97706', isOnline: false }
    if (mins < 10080) return { label: 'Active this week', color: '#2563eb', isOnline: false }
  }
  const bdTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }))
  const hour = bdTime.getHours()
  const seed = (parseInt(String(profile.id)) * 2654435761) % 100
  const onlineChance = hour >= 17 && hour < 22 ? 15 : hour >= 12 && hour < 14 ? 12 : 7
  const activeChance = hour >= 17 && hour < 22 ? 42 : hour >= 12 && hour < 14 ? 38 : 28
  if (seed < onlineChance) return { label: 'Online now', color: '#16a34a', isOnline: true }
  if (seed < onlineChance + activeChance) return { label: 'Active today', color: '#d97706', isOnline: false }
  return { label: 'Recently active', color: C.textLight, isOnline: false }
}

export default function ProfileCard({ profile, viewerProfile, interestMap }: { profile: any; viewerProfile?: any; interestMap?: Record<string, string> }) {
  const [isShortlisted, setIsShortlisted] = useState(false)
  const [interestSent, setInterestSent] = useState(false)
  const [showLimitNudge, setShowLimitNudge] = useState(false)
  const [limitData, setLimitData] = useState<any>(null)
  const [photoRequested, setPhotoRequested] = useState(false)

  const photoUrl = profile.photo_url || profile.photoUrl
  const relationshipStatus = (interestMap?.[String(profile.id)] ?? 'none') as string
  const name = maskName(profile.full_name || profile.name || 'Anonymous', relationshipStatus)
  const bkId = getBKId(profile)
  const activity = getActivityStatus(profile)
  const isPremium = profile.package !== 'prottasha'
  const isFeatured = profile.is_featured && profile.featured_until && new Date(profile.featured_until) > new Date()

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
    e.preventDefault(); e.stopPropagation()
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
    e.preventDefault(); e.stopPropagation()
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
    if (res.status === 403 && data.upgrade) { setLimitData({ used: data.used || data.limit, limit: data.limit, remaining: 0 }); setShowLimitNudge(true); return }
    if (data.success) setInterestSent(true)
  }

  return (
    <div style={{ position: 'relative' }}>
      <Link href={`/profile/${profile.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          border: isFeatured ? `1.5px solid ${C.gold}` : `1px solid ${C.border}`,
          boxShadow: C.cardShadow,
          overflow: 'hidden',
          transition: 'box-shadow 0.2s, transform 0.15s',
          cursor: 'pointer',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = C.cardShadow; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
        >
          {/* Photo */}
          <div style={{ position: 'relative', height: '260px', background: profile.gender === 'female' ? '#FDF2F8' : '#EFF6FF', overflow: 'hidden' }}>
            {photoUrl ? (
              <img src={photoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 10%' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={profile.gender === 'female'
                    ? "https://cdn.jsdelivr.net/npm/@mdi/svg@7.4.47/svg/face-woman.svg"
                    : "https://cdn.jsdelivr.net/npm/@mdi/svg@7.4.47/svg/account-tie.svg"}
                  width="140" height="140"
                  style={{ opacity: 0.35, filter: profile.gender === 'female' ? 'invert(27%) sepia(80%) saturate(1500%) hue-rotate(300deg)' : 'invert(27%) sepia(80%) saturate(500%) hue-rotate(180deg)' }}
                  alt=""
                />
                {!photoRequested ? (
                  <button onClick={e => {
                    e.preventDefault(); e.stopPropagation(); setPhotoRequested(true)
                    try { const u = JSON.parse(localStorage.getItem('biyekori_user') || '{}'); if (u.id) fetch('/api/photo-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requesterId: u.id, requestedId: profile.id }) }) } catch {}
                  }} style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: 600, color: 'white', background: C.maroon, border: 'none', padding: '5px 14px', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Photo on Request
                  </button>
                ) : (
                  <span style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: 600, color: '#15803d', background: 'rgba(255,255,255,0.95)', padding: '4px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}>✓ Request sent</span>
                )}
              </div>
            )}

            {/* Top badges */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {isFeatured && (
                <span style={{ background: C.gold, color: 'white', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px' }}>★ Featured</span>
              )}
              {isPremium && (
                <span style={{ background: 'rgba(184,137,42,0.9)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px' }}>Premium</span>
              )}
            </div>

            {/* Shortlist button */}
            <button onClick={handleShortlist} style={{ position: 'absolute', top: '10px', right: '10px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill={isShortlisted ? C.maroon : 'none'} stroke={isShortlisted ? C.maroon : C.textLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>

            {/* Activity dot */}
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.92)', padding: '3px 8px', borderRadius: '20px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: activity.color, display: 'inline-block', boxShadow: activity.isOnline ? `0 0 0 2px rgba(22,163,74,0.3)` : 'none' }} />
              <span style={{ fontSize: '10px', color: activity.color, fontWeight: 600 }}>{activity.label}</span>
            </div>

            {/* Relationship badges */}
            {relationshipStatus === 'received' && (
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: '#7c3aed', color: 'white', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>❤ Likes You</div>
            )}
            {relationshipStatus === 'accepted' && (
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: '#059669', color: 'white', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>✓ Matched</div>
            )}
          </div>

          {/* Card body */}
          <div style={{ padding: '14px 16px 16px' }}>
            {/* Name + ID row */}
            <div style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                <span style={{ fontSize: '10px', color: C.textLight, fontWeight: 600, flexShrink: 0, background: '#F5F5F4', padding: '2px 6px', borderRadius: '6px' }}>{bkId}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {profile.guardian_mode ? (
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#7c3aed', background: '#EDE9FE', padding: '2px 7px', borderRadius: '20px' }}>👨‍👩‍👧 Family Managed</span>
                ) : (
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#0369a1', background: '#E0F2FE', padding: '2px 7px', borderRadius: '20px' }}>👤 Self Managed</span>
                )}
              </div>
            </div>

            {/* Key info */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginBottom: '8px' }}>
              {profile.age && (
                <span style={{ fontSize: '12px', color: C.textMuted }}>{profile.age} yrs{profile.height ? `, ${profile.height}` : ''}</span>
              )}
              {(profile.city || profile.district) && (
                <span style={{ fontSize: '12px', color: C.textMuted }}>📍 {profile.city || profile.district}</span>
              )}
              {profile.profession && (
                <span style={{ fontSize: '12px', color: C.textMuted }}>💼 {profile.profession}</span>
              )}
              {profile.education && (
                <span style={{ fontSize: '12px', color: C.textMuted }}>🎓 {profile.education}</span>
              )}
              {profile.religion && (
                <span style={{ fontSize: '12px', color: C.textMuted }}>{profile.religion}</span>
              )}
              {profile.marital_status && profile.marital_status !== 'Not specified' && (
                <span style={{ fontSize: '12px', color: C.textMuted }}>{profile.marital_status}</span>
              )}
            </div>

            {/* Verification badges */}
            {(profile.is_verified || profile.nid_verified || profile.phone_verified) && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {profile.is_verified && <span style={{ fontSize: '10px', fontWeight: 600, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 7px', borderRadius: '6px' }}>✓ Verified</span>}
                {profile.nid_verified && <span style={{ fontSize: '10px', fontWeight: 600, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 7px', borderRadius: '6px' }}>✓ NID</span>}
                {profile.phone_verified && !profile.nid_verified && <span style={{ fontSize: '10px', fontWeight: 600, color: '#2563eb', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '2px 7px', borderRadius: '6px' }}>✓ Phone</span>}
              </div>
            )}

            {/* Bio preview */}
            {profile.about_me && (
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: C.textMuted, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontStyle: 'italic' }}>
                {profile.about_me}
              </p>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link href={`/profile/${profile.id}`} onClick={e => e.stopPropagation()}
                style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'white', border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: C.text, textDecoration: 'none' }}>
                View Profile
              </Link>
              <button onClick={handleSendInterest} disabled={interestSent}
                style={{ flex: 1, padding: '8px', background: interestSent ? '#F5F5F4' : C.maroon, border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: interestSent ? C.textLight : 'white', cursor: interestSent ? 'default' : 'pointer' }}>
                {interestSent ? '✓ Sent' : 'Send Interest'}
              </button>
            </div>
          </div>
        </div>
      </Link>
      {showLimitNudge && limitData && (
        <UpgradeNudge type="interest_limit" data={limitData} onDismiss={() => setShowLimitNudge(false)} />
      )}
    </div>
  )
}
