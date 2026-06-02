'use client'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const CallModal = dynamic(() => import('./CallModal'), { ssr: false })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface CallButtonProps {
  currentUser: any
  targetProfile: any
}

export default function CallButton({ currentUser, targetProfile }: CallButtonProps) {
  const [canCall, setCanCall] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)
  const [incomingCall, setIncomingCall] = useState<any>(null)
  const [callMode, setCallMode] = useState<'outgoing' | 'incoming'>('outgoing')
  const sinceRef = useRef<string>(new Date().toISOString())
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!currentUser?.id || !targetProfile?.id) return

    // Check mutual interest
    fetch(`${SUPABASE_URL}/rest/v1/interests?or=(and(sender_id.eq.${currentUser.id},receiver_id.eq.${targetProfile.id}),and(sender_id.eq.${targetProfile.id},receiver_id.eq.${currentUser.id}))&status=eq.accepted&select=id`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setCanCall(true)
      })
      .catch(() => {})

    // Poll for incoming calls
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/call/signal?userId=${currentUser.id}&since=${sinceRef.current}`)
        const { signals } = await res.json()
        sinceRef.current = new Date().toISOString()
        for (const signal of signals) {
          if (signal.type === 'call-offer' && signal.from_id === targetProfile.id) {
            setIncomingCall(signal)
            setCallMode('incoming')
            setShowCallModal(true)
          }
        }
      } catch(e) {}
    }, 2000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [currentUser?.id, targetProfile?.id])

  if (!canCall) return null

  return (
    <>
      <button
        onClick={() => { setCallMode('outgoing'); setShowCallModal(true) }}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          color: 'white', border: 'none', borderRadius: '12px',
          fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
          transition: 'all 0.2s'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        Voice Call
        <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px', padding: '2px 6px' }}>
          {currentUser?.package && currentUser.package !== 'prottasha' ? '15 min' : '5 min'}
        </span>
      </button>

      {showCallModal && (
        <CallModal
          currentUser={currentUser}
          targetProfile={targetProfile}
          onClose={() => { setShowCallModal(false); setIncomingCall(null) }}
          mode={callMode}
          incomingSignal={incomingCall}
        />
      )}
    </>
  )
}
