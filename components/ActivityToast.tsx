'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

interface ActivityProfile {
  id: number
  full_name: string
  age: number
  district: string
  photo_url: string | null
  gender: string
}

interface Toast {
  id: string
  profile: ActivityProfile
  type: 'joined' | 'active' | 'viewed'
  exiting: boolean
}

// Weighted: joined 40%, active 40%, viewed 20%
const WEIGHTED_TYPES: Array<Toast['type']> = [
  'joined', 'joined', 'joined', 'joined',
  'active', 'active', 'active', 'active',
  'viewed', 'viewed',
]

const TOAST_LABELS: Record<Toast['type'], (name: string) => string> = {
  joined:  (n) => `${n} এইমাত্র যোগ দিয়েছেন`,
  active:  (n) => `${n} এখন সক্রিয়`,
  viewed:  (n) => `${n} আজ প্রোফাইল দেখেছেন`,
}

const MAX_TOASTS_PER_SESSION = 8

function maskName(full: string): string {
  const parts = full.trim().split(' ')
  if (parts.length === 1) return parts[0]
  return parts[0] + ' ' + parts[1].charAt(0).toUpperCase() + '.'
}

export default function ActivityToast({ viewerGender }: { viewerGender?: string }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [profiles, setProfiles] = useState<ActivityProfile[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const indexRef = useRef(0)
  const shownCountRef = useRef(0)

  // Always show opposite gender. Female viewer → male. Male or guest → female.
  const showGender = viewerGender === 'Female' ? 'Male' : 'Female'

  useEffect(() => {
    fetch('/api/live-activity?gender=' + showGender)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.profiles) && data.profiles.length) {
          // Only keep 8 profiles from the pool — no need for more
          setProfiles(data.profiles.slice(0, MAX_TOASTS_PER_SESSION))
        }
      })
      .catch(() => {})
  }, [showGender])

  useEffect(() => {
    if (!profiles.length) return

    function showNext() {
      // Stop after MAX_TOASTS_PER_SESSION
      if (shownCountRef.current >= MAX_TOASTS_PER_SESSION) {
        if (timerRef.current) clearTimeout(timerRef.current)
        return
      }

      const profile = profiles[indexRef.current % profiles.length]
      indexRef.current++
      shownCountRef.current++

      const type = WEIGHTED_TYPES[Math.floor(Math.random() * WEIGHTED_TYPES.length)]
      const toastId = Date.now().toString()

      setToasts(prev => [...prev, { id: toastId, profile, type, exiting: false }].slice(-3))

      // Notify dashboard to bump stats
      try { window.dispatchEvent(new Event('biyekori-activity')) } catch {}

      // Exit after 5s
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === toastId ? { ...t, exiting: true } : t))
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toastId))
        }, 400)
      }, 5000)
    }

    function scheduleNext() {
      if (shownCountRef.current >= MAX_TOASTS_PER_SESSION) return
      const delay = 24000 + Math.random() * 12000 // 24-36s
      timerRef.current = setTimeout(() => {
        showNext()
        scheduleNext()
      }, delay)
    }

    // First toast after 4s
    const firstTimer = setTimeout(() => {
      showNext()
      scheduleNext()
    }, 4000)

    return () => {
      clearTimeout(firstTimer)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [profiles])

  if (!toasts.length) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '20px',
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none',
    }}>
      {toasts.map((toast) => {
        const maskedName = maskName(toast.profile.full_name)
        const label = TOAST_LABELS[toast.type](maskedName)

        return (
          <Link
            key={toast.id}
            href={`/profile/${toast.profile.id}`}
            style={{ pointerEvents: 'auto', textDecoration: 'none' }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(255,251,245,0.97)',
              border: '1px solid rgba(123,29,46,0.15)',
              borderLeft: '3px solid #7B1D2E',
              borderRadius: '10px',
              padding: '10px 14px 10px 10px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              minWidth: '220px',
              maxWidth: 'min(280px, calc(100vw - 44px))',
              cursor: 'pointer',
              opacity: toast.exiting ? 0 : 1,
              transform: toast.exiting ? 'translateX(-20px)' : 'translateX(0)',
              animation: toast.exiting ? 'none' : 'toastSlideIn 0.35s ease',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}>

              {/* Avatar */}
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                border: '2px solid #7B1D2E',
                background: '#f0e8ec',
              }}>
                {toast.profile.photo_url ? (
                  <img
                    src={toast.profile.photo_url}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #7B1D2E, #9D174D)',
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" fill="rgba(255,255,255,0.7)" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="rgba(255,255,255,0.5)" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1a0a0d',
                  fontFamily: 'system-ui, sans-serif',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {maskedName}, {toast.profile.age}
                </p>
                <p style={{
                  margin: '2px 0 0',
                  fontSize: '11.5px',
                  color: '#7B1D2E',
                  fontFamily: 'Hind Siliguri, system-ui, sans-serif',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {label}
                </p>
                <p style={{
                  margin: '2px 0 0',
                  fontSize: '11px',
                  color: 'rgba(26,10,13,0.45)',
                  fontFamily: 'system-ui, sans-serif',
                }}>
                  {toast.profile.district || 'Bangladesh'}
                </p>
              </div>

              {/* Live green dot */}
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#22c55e',
                flexShrink: 0,
                boxShadow: '0 0 6px rgba(34,197,94,0.6)',
                animation: 'pulse 2s infinite',
              }} />
            </div>
          </Link>
        )
      })}

      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
      `}</style>
    </div>
  )
}
