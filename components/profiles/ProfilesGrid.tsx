'use client'
import { useState, useEffect } from 'react'
import ProfileCard from './ProfileCard'
import Link from 'next/link'

function getQuickScore(profile: any): number {
  let score = 0
  if (profile.religion === 'Islam') score += 25; else score += 5
  const age = profile.age || 0
  if (age >= 20 && age <= 35) score += 15
  else if (age >= 18 && age <= 40) score += 8
  else score += 3
  const eduRank: Record<string, number> = { 'SSC': 1, 'HSC': 2, "Bachelor's": 3, "Master's": 4, 'Medical': 5, 'Engineering': 5, 'Law': 4 }
  score += (eduRank[profile.education] || 3) >= 3 ? 15 : (eduRank[profile.education] || 3) === 2 ? 8 : 5
  score += 7
  score += profile.personality_type ? 8 : 5
  score += profile.religious_level === 'Religious' ? 10 : 5
  score += profile.family_values ? 8 : 5
  score += profile.hobbies ? 4 : 2
  return Math.min(Math.round(score), 100)
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#10b981'
  if (score >= 70) return '#3b82f6'
  if (score >= 55) return '#f59e0b'
  return '#e11d48'
}

function getActivityStatus(profile: any): { label: string; color: string } {
  if (!profile.last_active) return { label: 'Recently active', color: '#9ca3af' }
  const diff = Date.now() - new Date(profile.last_active).getTime()
  const mins = diff / 60000
  if (mins < 30) return { label: 'Online now', color: '#10b981' }
  if (mins < 1440) return { label: 'Active today', color: '#f59e0b' }
  if (mins < 10080) return { label: 'Active this week', color: '#3b82f6' }
  return { label: 'Recently active', color: '#9ca3af' }
}

function ListRow({ profile }: { profile: any }) {
  const score = getQuickScore(profile)
  const activity = getActivityStatus(profile)
  const photoUrl = profile.photo_url || profile.photoUrl
  const name = profile.full_name || profile.name || 'Anonymous'
  const isPremium = profile.package !== 'prottasha'
  const [interestSent, setInterestSent] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('biyekori_user')
      if (stored) {
        const user = JSON.parse(stored)
        fetch(`/api/interests/list?userId=${user.id}`)
          .then(r => r.json())
          .then(data => {
            if (data.sent?.some((s: any) => String(s.receiver_id) === String(profile.id))) {
              setInterestSent(true)
            }
          }).catch(() => {})
      }
    } catch(e) {}
  }, [profile.id])

  const handleSendInterest = async () => {
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
      if (data.success) setInterestSent(true)
    } catch(e) {}
  }

  return (
    <div style={{
      background: 'white', borderRadius: '16px', padding: '16px',
      border: isPremium ? '2px solid #fcd34d' : '1px solid #f3f4f6',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      display: 'flex', gap: '16px', alignItems: 'center',
      transition: 'box-shadow 0.2s', cursor: 'pointer',
      position: 'relative'
    }}
    onClick={(e) => {
      if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
      window.location.href = '/profile/' + profile.id;
    }}>
      {/* Photo */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: '90px', height: '120px', borderRadius: '12px', overflow: 'hidden', background: '#f3f4f6' }}>
          {photoUrl ? (
            <img src={photoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
              {profile.gender === 'male' ? '👨' : '👩'}
            </div>
          )}
        </div>
        {/* AI score badge */}
        <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', background: getScoreColor(score), borderRadius: '20px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '3px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '9px', color: 'white', fontWeight: 600, opacity: 0.85 }}>AI</span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'white' }}>{score}%</span>
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>{name}</span>
          {isPremium && (
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#b45309', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '6px', padding: '1px 6px' }}>Premium</span>
          )}
          <span style={{ fontSize: '11px', color: activity.color, fontWeight: 600 }}>• {activity.label}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
          {profile.age && <span style={{ fontSize: '12px', color: '#6b7280' }}>{profile.age} yrs</span>}
          {profile.height && <span style={{ fontSize: '12px', color: '#6b7280' }}>• {profile.height}</span>}
          {(profile.city || profile.district) && <span style={{ fontSize: '12px', color: '#6b7280' }}>• {profile.city || profile.district}</span>}
          {profile.religion && <span style={{ fontSize: '12px', color: '#6b7280' }}>• {profile.religion}</span>}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {profile.education && <span style={{ fontSize: '11px', color: '#4b5563', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '2px 8px' }}>{profile.education}</span>}
          {profile.profession && <span style={{ fontSize: '11px', color: '#4b5563', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '2px 8px' }}>{profile.profession}</span>}
          {profile.marital_status && <span style={{ fontSize: '11px', color: '#4b5563', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '2px 8px' }}>{profile.marital_status}</span>}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={handleSendInterest}
          disabled={interestSent}
          style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
            border: 'none', cursor: interestSent ? 'not-allowed' : 'pointer',
            background: interestSent ? '#f3f4f6' : 'linear-gradient(135deg,#e11d48,#db2777)',
            color: interestSent ? '#9ca3af' : 'white', whiteSpace: 'nowrap'
          }}
        >
          {interestSent ? 'Sent' : 'Express Interest'}
        </button>
        <Link href={'/profile/' + profile.id} style={{
          padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
          background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
          color: 'white', textDecoration: 'none', textAlign: 'center', whiteSpace: 'nowrap'
        }}>
          View Profile
        </Link>
      </div>
    </div>
  )
}

export default function ProfilesGrid({ profiles }: { profiles: any[] }) {
  const [view, setView] = useState<'grid' | 'list'>('list')

  useEffect(() => {
    const saved = localStorage.getItem('biyekori_view')
    if (saved === 'grid' || saved === 'list') setView(saved as 'grid' | 'list')
  }, [])

  const toggleView = (v: 'grid' | 'list') => {
    setView(v)
    localStorage.setItem('biyekori_view', v)
  }

  return (
    <div>
      {/* View toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', gap: '4px' }}>
        <button
          onClick={() => toggleView('list')}
          title="List view"
          style={{
            padding: '7px 10px', borderRadius: '8px', border: '2px solid',
            borderColor: view === 'list' ? '#e11d48' : '#e5e7eb',
            background: view === 'list' ? '#fff1f2' : 'white',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={view === 'list' ? '#e11d48' : '#9ca3af'} strokeWidth="2.5">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <button
          onClick={() => toggleView('grid')}
          title="Grid view"
          style={{
            padding: '7px 10px', borderRadius: '8px', border: '2px solid',
            borderColor: view === 'grid' ? '#e11d48' : '#e5e7eb',
            background: view === 'grid' ? '#fff1f2' : 'white',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={view === 'grid' ? '#e11d48' : '#9ca3af'} strokeWidth="2.5">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
        </button>
      </div>

      {/* Profiles */}
      {view === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {profiles.map((profile: any) => (
            <ListRow key={profile.id} profile={profile} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {profiles.map((profile: any) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  )
}
