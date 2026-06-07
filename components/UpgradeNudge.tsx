'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NudgeProps {
  type: 'interest_limit' | 'viewer_tease' | 'near_miss' | 'mutual_urgency' | 'contact_limit' | 'soft'
  data?: any
  onDismiss?: () => void
}

// The master nudge component — handles all upgrade prompts
export default function UpgradeNudge({ type, data, onDismiss }: NudgeProps) {
  const [visible, setVisible] = useState(true)
  const [pkg, setPkg] = useState('prottasha')

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('biyekori_user') || '{}')
      setPkg(user.package || 'prottasha')
    } catch(e) {}
  }, [])

  if (!visible) return null

  const dismiss = () => { setVisible(false); onDismiss?.() }

  // ─── INTEREST LIMIT ────────────────────────────────────────
  if (type === 'interest_limit') {
    const { used, limit, remaining, mutualName } = data || {}
    const isExhausted = remaining === 0
    const isLast = remaining === 1

    if (!isExhausted && !isLast) return null // only show when 1 or 0 left

    return (
      <div style={{
        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 8000, width: '90%', maxWidth: '440px',
        background: isExhausted ? 'white' : 'white',
        borderRadius: '20px', padding: '20px 24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        border: `1.5px solid ${isExhausted ? '#fecdd3' : '#fde68a'}`,
        animation: 'slideUp 0.3s ease'
      }}>
        <style>{`@keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }`}</style>
        <button onClick={dismiss} style={{ position: 'absolute', top: '12px', right: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9ca3af' }}>×</button>

        {isExhausted ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px' }}>💌</span>
              <div>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#111827' }}>
                  {used} interests sent this month
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Free plan limit reached</p>
              </div>
            </div>
            {mutualName && (
              <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px', border: '1px solid #bbf7d0' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#15803d', fontWeight: 600 }}>
                  ✓ {mutualName} accepted your interest — message them free!
                </p>
              </div>
            )}
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
              New interests refresh on the 1st of next month. Upgrade Silver for <strong>10/month</strong>, or Gold for <strong>unlimited</strong>.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {mutualName && (
                <Link href="/messages" style={{ flex: 1, padding: '11px', background: '#10b981', color: 'white', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '13px', textAlign: 'center' }}>
                  Message {mutualName.split(' ')[0]}
                </Link>
              )}
              <Link href="/pricing" style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg,#e11d48,#7c3aed)', color: 'white', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '13px', textAlign: 'center' }}>
                Upgrade — Unlock More
              </Link>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#92400e' }}>
                Last interest this month — make it count
              </p>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#6b7280' }}>
              You have <strong>1 interest</strong> left. Upgrade Silver to get 10/month.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={dismiss} style={{ flex: 1, padding: '10px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                Got it
              </button>
              <Link href="/pricing" style={{ flex: 2, padding: '10px', background: 'linear-gradient(135deg,#e11d48,#7c3aed)', color: 'white', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '13px', textAlign: 'center' }}>
                Upgrade Silver ৳799
              </Link>
            </div>
          </>
        )}
      </div>
    )
  }

  // ─── VIEWER TEASE ──────────────────────────────────────────
  if (type === 'viewer_tease') {
    const { count } = data || { count: 0 }
    if (count < 3) return null

    return (
      <div style={{
        background: 'linear-gradient(135deg,#1e1b4b,#4c1d95)',
        borderRadius: '16px', padding: '20px 24px', marginBottom: '20px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05,
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '30px 30px' }} />
        <p style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 800, color: 'white' }}>
          👁️ {count} people viewed your profile this week
        </p>
        {/* Blurred face stack */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
          {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
            <div key={i} style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: `hsl(${i * 40}, 60%, 60%)`,
              filter: pkg === 'prottasha' ? 'blur(4px)' : 'none',
              border: '2px solid rgba(255,255,255,0.3)',
              flexShrink: 0
            }} />
          ))}
          {count > 6 && <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'white', fontWeight: 700 }}>+{count - 6}</div>}
        </div>
        {pkg === 'prottasha' ? (
          <>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
              Upgrade <strong style={{ color: '#c4b5fd' }}>Silver</strong> to see 3 names · <strong style={{ color: '#fbbf24' }}>Gold</strong> to see all {count}
            </p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '10px 20px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '13px' }}>
              See who viewed you →
            </Link>
          </>
        ) : pkg === 'silver' ? (
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Upgrade Gold to see all {count} viewers</p>
        ) : null}
      </div>
    )
  }

  // ─── NEAR MISS TEASE ───────────────────────────────────────
  if (type === 'near_miss') {
    const { matchPercent, profile } = data || {}
    return (
      <div style={{
        background: 'white', borderRadius: '16px', overflow: 'hidden',
        border: '2px dashed #e11d48', position: 'relative'
      }}>
        <div style={{ position: 'relative', aspectRatio: '3/4', background: '#f3f4f6' }}>
          {profile?.photo_url && (
            <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(12px)', transform: 'scale(1.1)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#e11d48', borderRadius: '20px', padding: '4px 12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 900, color: 'white' }}>{matchPercent}% Match</span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: 'white', fontWeight: 600 }}>Upgrade to connect</p>
          </div>
        </div>
        <div style={{ padding: '10px 12px' }}>
          <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 800, color: '#e11d48' }}>Premium Match</p>
          <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>Upgrade to view profile</p>
        </div>
      </div>
    )
  }

  // ─── MUTUAL URGENCY ────────────────────────────────────────
  if (type === 'mutual_urgency') {
    const { name, lastActive, competitorCount } = data || {}
    return (
      <div style={{
        background: 'linear-gradient(135deg,#064e3b,#065f46)',
        borderRadius: '16px', padding: '18px 20px', marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{ fontSize: '20px' }}>🎉</span>
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'white' }}>
              {name?.split(' ')[0]} is waiting for you
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
              Active {lastActive} · Mutual match
            </p>
          </div>
        </div>
        {competitorCount > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#fbbf24', fontWeight: 600 }}>
              ⚡ {competitorCount} Silver member{competitorCount > 1 ? 's' : ''} also matched with {name?.split(' ')[0]}
            </p>
          </div>
        )}
        <Link href="/messages" style={{ display: 'block', padding: '11px', background: '#10b981', color: 'white', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '13px', textAlign: 'center' }}>
          Message {name?.split(' ')[0]} — It's Free ✓
        </Link>
      </div>
    )
  }

  // ─── SOFT NUDGE (dashboard/profile pages) ──────────────────
  if (type === 'soft') {
    const { message, ctaText, ctaHref } = data || {}
    return (
      <div style={{
        background: '#fffbeb', borderRadius: '12px', padding: '12px 16px',
        border: '1px solid #fde68a', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '12px', marginBottom: '16px'
      }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#92400e' }}>{message}</p>
        <Link href={ctaHref || '/pricing'} style={{ flexShrink: 0, padding: '7px 14px', background: '#d97706', color: 'white', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '12px' }}>
          {ctaText || 'Upgrade'}
        </Link>
      </div>
    )
  }

  return null
}

// ─── NOOB BOOST UTILITY ────────────────────────────────────────
export function isNoobBoosted(createdAt: string): boolean {
  if (!createdAt) return false
  const created = new Date(createdAt).getTime()
  const now = Date.now()
  const sevenDays = 7 * 24 * 60 * 60 * 1000
  return (now - created) < sevenDays
}

// ─── INTEREST COUNTER BADGE ────────────────────────────────────
export function InterestCounter({ used, limit, pkg }: { used: number, limit: number, pkg: string }) {
  const remaining = limit - used
  const pct = (used / limit) * 100

  if (limit >= 999) return null // unlimited — don't show

  const color = remaining === 0 ? '#e11d48' : remaining <= 2 ? '#d97706' : '#10b981'
  const bg = remaining === 0 ? '#fff1f2' : remaining <= 2 ? '#fffbeb' : '#f0fdf4'
  const border = remaining === 0 ? '#fecdd3' : remaining <= 2 ? '#fde68a' : '#bbf7d0'

  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color }}>
            {remaining === 0 ? 'No interests left' : `${remaining} interest${remaining !== 1 ? 's' : ''} left this month`}
          </span>
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>{used}/{limit}</span>
        </div>
        <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width 0.3s' }} />
        </div>
      </div>
      {remaining === 0 && (
        <a href="/pricing" style={{ flexShrink: 0, padding: '6px 12px', background: 'linear-gradient(135deg,#e11d48,#7c3aed)', color: 'white', borderRadius: '8px', fontSize: '11px', fontWeight: 700, textDecoration: 'none' }}>
          Upgrade
        </a>
      )}
    </div>
  )
}
