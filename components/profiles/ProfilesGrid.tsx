'use client'
import React, { useState, useEffect } from 'react'
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

// Returns creation-based badge (New Member / Just Joined)
function getCreationBadge(profile: any): { label: string; bg: string; color: string } | null {
  const created = profile.created_at || profile.createdAt
  if (!created) return null
  const ageDays = (Date.now() - new Date(created).getTime()) / 86400000
  if (ageDays < 1) return { label: 'Just Joined', bg: '#f3e8ff', color: '#7c3aed' }
  if (ageDays < 14) return { label: 'New Member', bg: '#dcfce7', color: '#15803d' }
  return null
}

// Returns activity-based badge (Online now / Active today etc)
function getActivityStatus(profile: any): { label: string; color: string } {
  if (profile.last_active) {
    const mins = (Date.now() - new Date(profile.last_active).getTime()) / 60000
    if (mins < 30) return { label: 'Online now', color: '#10b981' }
    if (mins < 240) return { label: 'Active today', color: '#f59e0b' }
    if (mins < 4320) return { label: 'Active this week', color: '#3b82f6' }
    if (mins < 10080) return { label: 'Active recently', color: '#6b7280' }
  }
  return { label: 'Recently active', color: '#9ca3af' }
}

function ListRow({ profile }: { profile: any }) {
  const score = getQuickScore(profile)
  const activity = getActivityStatus(profile)
  const creationBadge = getCreationBadge(profile)
  const photoUrl = profile.photo_url || profile.photoUrl
  const name = profile.full_name || profile.name || 'Anonymous'
  const isPremium = profile.package !== 'prottasha'
  const [interestSent, setInterestSent] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('biyekori_user')
      if (stored) {
        const user = JSON.parse(stored)
        fetch('/api/interests/list?userId=' + user.id)
          .then(r => r.json())
          .then(data => {
            if (data.sent?.some((s: any) => String(s.receiver_id) === String(profile.id))) {
              setInterestSent(true)
            }
          }).catch(() => {})
      }
    } catch(e) {}
  }, [profile.id])

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
      if (data.success) setInterestSent(true)
    } catch(e) {}
  }

  const religionLevel = profile.religious_level && profile.religious_level !== 'Unknown' ? ', ' + profile.religious_level : ''
  const isFeatured = profile.is_featured && profile.featured_until && new Date(profile.featured_until) > new Date()
  const infoRows = [
    [
      profile.age ? profile.age + ' yrs' + (profile.height ? ', ' + profile.height : '') : null,
      profile.marital_status || null
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
    <div
      onClick={() => window.location.href = '/profile/' + profile.id}
      style={{
        background: 'white', borderRadius: '16px',
        border: isPremium ? '2px solid #fcd34d' : '1px solid #e5e7eb',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex', gap: '0', alignItems: 'stretch',
        transition: 'box-shadow 0.2s, transform 0.1s', cursor: 'pointer',
        overflow: 'hidden'
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
    >
      {/* Photo section */}
      <div style={{ position: 'relative', flexShrink: 0, width: '160px' }}>
        {photoUrl ? (
          <img src={photoUrl} alt={name} style={{ width: '160px', height: '100%', minHeight: '180px', objectFit: 'cover', objectPosition: 'center 15%', display: 'block' }} />
        ) : (
          <div style={{ width: '160px', minHeight: '180px', background: 'linear-gradient(135deg,#fce7f3,#ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
            {profile.gender === 'male' ? '👨' : '👩'}
          </div>
        )}
        {/* AI score */}
        <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', background: getScoreColor(score), borderRadius: '20px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '3px', boxShadow: '0 2px 6px rgba(0,0,0,0.25)', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '9px', color: 'white', fontWeight: 600, opacity: 0.85 }}>AI</span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'white' }}>{score}%</span>
        </div>
      </div>

      {/* Middle: info section */}
      <div style={{ flex: 1, padding: '16px 20px', minWidth: 0 }}>
        {/* Creation badge */}
        {creationBadge && (
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: creationBadge.color, background: creationBadge.bg, borderRadius: '20px', padding: '2px 10px', letterSpacing: '0.3px' }}>
              {creationBadge.label}
            </span>
          </div>
        )}
        {/* Name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#111827' }}>{name}</span>
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
        {/* Activity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: activity.color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: '11px', color: activity.color, fontWeight: 600 }}>{activity.label}</span>
        </div>
        {/* 2-col info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 20px', marginBottom: '8px' }}>
          {infoRows.map((row, i) => row.some(Boolean) && (
            <React.Fragment key={i}>
              {row[0] && <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>{row[0]}</span>}
              {row[1] && <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>{row[1]}</span>}
            </React.Fragment>
          ))}
        </div>
        {/* About me snippet */}
        {profile.about_me && (
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '8px', marginTop: '4px' }}>
            <p style={{ margin: '0 0 2px', fontSize: '11.5px', color: '#6b7280', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontStyle: 'italic' }}>
              {profile.about_me}
            </p>
            <a href={'/profile/' + profile.id} onClick={e => e.stopPropagation()} style={{ fontSize: '11px', color: '#e11d48', fontWeight: 600, textDecoration: 'none' }}>More</a>
          </div>
        )}
      </div>

      {/* Right: action section */}
      <div style={{ flexShrink: 0, width: '120px', borderLeft: '1px solid #f3f4f6', background: 'linear-gradient(180deg,#fff5f7,#ffffff)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px 12px', minHeight: '100%' }}>
        <p style={{ margin: 0, fontSize: '10px', color: '#e11d48', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Actions</p>

        {/* Connect - green circle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={handleSendInterest}
            disabled={interestSent}
            title={interestSent ? 'Interest Sent' : 'Send Interest'}
            style={{
              width: '48px', height: '48px', borderRadius: '50%', border: 'none',
              cursor: interestSent ? 'default' : 'pointer',
              background: interestSent ? '#f3f4f6' : 'linear-gradient(135deg,#10b981,#059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: interestSent ? 'none' : '0 3px 10px rgba(16,185,129,0.35)',
              transition: 'all 0.2s'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={interestSent ? '#9ca3af' : 'white'} strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          </button>
          <span style={{ fontSize: '10px', color: interestSent ? '#9ca3af' : '#059669', fontWeight: 700 }}>{interestSent ? 'Sent' : 'Connect'}</span>
        </div>

        {/* Phone - pink circle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const stored = localStorage.getItem('biyekori_user');
              if (!stored) { window.location.href = '/register?reason=contact'; return; }
              const user = JSON.parse(stored);
              const isPaidUser = user.package && user.package !== 'prottasha';
              if (!isPaidUser) { window.location.href = '/pricing'; return; }
              window.location.href = '/profile/' + profile.id;
            }}
            title="View Contact"
            style={{
              width: '48px', height: '48px', borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#e11d48,#db2777)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(225,29,72,0.3)',
              transition: 'all 0.2s'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </button>
          <span style={{ fontSize: '10px', color: '#e11d48', fontWeight: 700 }}>Contact</span>
        </div>

        {/* View - grey circle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <Link
            href={'/profile/' + profile.id}
            onClick={e => e.stopPropagation()}
            style={{
              width: '48px', height: '48px', borderRadius: '50%',
              border: '2px solid #e5e7eb', background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', transition: 'all 0.2s'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </Link>
          <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600 }}>Profile</span>
        </div>
      </div>
    </div>
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
  return (
    <div>
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
