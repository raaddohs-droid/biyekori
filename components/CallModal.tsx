'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const AGORA_APP_ID = 'c4513ff1afb74017b915fb18cd7312d8'

const FREE_CALL_LIMIT = 5 * 60
const PREMIUM_CALL_LIMIT = 15 * 60

interface CallModalProps {
  currentUser: any
  targetProfile: any
  onClose: () => void
  mode: 'outgoing' | 'incoming'
  incomingSignal?: any
}

export default function CallModal({ currentUser, targetProfile, onClose, mode, incomingSignal }: CallModalProps) {
  const [callState, setCallState] = useState<'ringing' | 'connecting' | 'active' | 'ended' | 'rejected' | 'timeout'>('ringing')
  const [timeLeft, setTimeLeft] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const clientRef = useRef<any>(null)
  const localTrackRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const channelRef = useRef<any>(null)
  const callStartRef = useRef<number>(0)

  const isPremium = currentUser?.package && currentUser.package !== 'prottasha'
  const callLimit = isPremium ? PREMIUM_CALL_LIMIT : FREE_CALL_LIMIT

  const sendSignal = useCallback(async (type: string, data: any) => {
    try {
      await fetch('/api/call/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, fromId: currentUser.id, toId: targetProfile.id, data })
      })
    } catch(e) {}
  }, [currentUser.id, targetProfile.id])

  const endCall = useCallback(async (reason: 'ended' | 'rejected' | 'timeout' = 'ended') => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (channelRef.current) { try { channelRef.current.unsubscribe() } catch(e) {} }
    if (localTrackRef.current) { try { localTrackRef.current.close() } catch(e) {} }
    if (clientRef.current) {
      try {
        await clientRef.current.leave()
      } catch(e) {}
    }
    sendSignal('call-end', { reason })
    setCallState(reason === 'rejected' ? 'rejected' : reason === 'timeout' ? 'timeout' : 'ended')
    setTimeout(onClose, 2000)
  }, [sendSignal, onClose])

  const startTimer = useCallback(() => {
    callStartRef.current = Date.now()
    setTimeLeft(callLimit)
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - callStartRef.current) / 1000)
      const remaining = callLimit - elapsed
      if (remaining <= 0) { endCall('timeout'); return }
      setTimeLeft(remaining)
    }, 1000)
  }, [callLimit, endCall])

  const joinAgoraChannel = useCallback(async (channelName: string, isPublisher: boolean) => {
    try {
      setCallState('connecting')

      // Dynamic import of Agora SDK
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default
      AgoraRTC.setLogLevel(3) // warnings only

      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
      clientRef.current = client

      // Get token from our API
      const uid = parseInt(String(currentUser.id))
      const tokenRes = await fetch('/api/agora-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName, uid })
      })
      const { token } = await tokenRes.json()

      // Join the channel
      await client.join(AGORA_APP_ID, channelName, token || null, uid)

      // Create and publish local audio track
      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: 'music_standard'
      })
      localTrackRef.current = localAudioTrack
      await client.publish([localAudioTrack])

      // Handle remote users
      client.on('user-published', async (user: any, mediaType: "audio" | "video" | "datachannel") => {
        await client.subscribe(user, mediaType)
        if (mediaType === 'audio') {
          user.audioTrack?.play()
          setCallState('active')
          startTimer()
        }
      })

      client.on('user-unpublished', (user: any) => {
        console.log('User unpublished:', user.uid)
      })

      client.on('user-left', () => {
        endCall('ended')
      })

      setCallState('connecting')
      console.log('Agora: joined channel', channelName)

      // If outgoing, set a timeout for no answer
      if (isPublisher) {
        setTimeout(() => {
          if (callState !== 'active') {
            // Don't auto-end, let user decide
          }
        }, 45000)
      }

    } catch(err: any) {
      console.error('Agora error:', err)
      setErrorMsg('Could not connect. Please check mic permissions and try again.')
      setCallState('ended')
      setTimeout(onClose, 3000)
    }
  }, [currentUser.id, startTimer, endCall, onClose])

  // Subscribe to realtime signals
  const subscribeToSignals = useCallback(() => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })
    const channel = supabase
      .channel('call-signals-' + currentUser.id + '-' + Date.now())
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'call_signals',
        filter: `to_id=eq.${currentUser.id}`
      }, (payload: any) => {
        const signal = payload.new
        if (signal.type === 'call-end') {
          endCall('ended')
        }
        if (signal.type === 'call-reject') {
          endCall('rejected')
        }
      })
      .subscribe()
    channelRef.current = channel
  }, [currentUser.id, endCall])

  // Channel name is deterministic — same for both users
  const getChannelName = useCallback(() => {
    const ids = [parseInt(String(currentUser.id)), parseInt(String(targetProfile.id))].sort()
    return `bk-${ids[0]}-${ids[1]}`
  }, [currentUser.id, targetProfile.id])

  useEffect(() => {
    subscribeToSignals()
    if (mode === 'outgoing') {
      sendSignal('call-offer', { channel: getChannelName() })
      joinAgoraChannel(getChannelName(), true)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (channelRef.current) { try { channelRef.current.unsubscribe() } catch(e) {} }
      if (localTrackRef.current) { try { localTrackRef.current.close() } catch(e) {} }
      if (clientRef.current) { try { clientRef.current.leave() } catch(e) {} }
    }
  }, [])

  const answerCall = useCallback(async () => {
    await joinAgoraChannel(getChannelName(), false)
  }, [joinAgoraChannel, getChannelName])

  const toggleMute = () => {
    if (localTrackRef.current) {
      if (isMuted) {
        localTrackRef.current.setEnabled(true)
      } else {
        localTrackRef.current.setEnabled(false)
      }
      setIsMuted(!isMuted)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const name = targetProfile.full_name || 'Match'
  const photo = targetProfile.photo_url

  const stateColors: Record<string, string> = {
    ringing: '#f59e0b', connecting: '#3b82f6', active: '#10b981',
    ended: '#6b7280', rejected: '#e11d48', timeout: '#e11d48'
  }
  const stateLabels: Record<string, string> = {
    ringing: mode === 'outgoing' ? 'Calling...' : 'Incoming Call',
    connecting: 'Connecting...', active: 'Connected',
    ended: 'Call Ended', rejected: 'Call Declined',
    timeout: 'No Answer'
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
        borderRadius: '28px', width: '100%', maxWidth: '340px',
        padding: '40px 24px 32px', textAlign: 'center',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.1)', borderRadius: '20px',
          padding: '4px 14px', marginBottom: '28px'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: stateColors[callState], display: 'inline-block' }} />
          <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>{stateLabels[callState]}</span>
        </div>

        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
          {photo
            ? <img src={photo} alt={name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)' }} />
            : <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>?</div>
          }
          {callState === 'active' && (
            <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#10b981', border: '2px solid #1e1b4b' }} />
          )}
        </div>

        <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 800, color: 'white' }}>{name}</h2>
        <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Biyekori Match</p>

        {callState === 'active' && (
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: timeLeft <= 30 ? '#f87171' : '#34d399', fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(timeLeft)}
            </span>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
              {isPremium ? '15 min limit · Premium' : '5 min limit · Free'}
            </p>
          </div>
        )}

        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px', marginBottom: '16px', fontSize: '12px', color: '#fca5a5' }}>
            {errorMsg}
          </div>
        )}

        {/* Incoming call buttons */}
        {mode === 'incoming' && callState === 'ringing' && (
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '32px' }}>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => { sendSignal('call-reject', {}); setCallState('rejected'); setTimeout(onClose, 1500) }}
                style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.4 12.4 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.26 9.84a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.18 1h3a2 2 0 0 1 2 1.72 12.4 12.4 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.16 8.84"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Decline</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={answerCall}
                style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10b981', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </button>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Answer</span>
            </div>
          </div>
        )}

        {/* Active call buttons */}
        {callState === 'active' && (
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '28px' }}>
            <div style={{ textAlign: 'center' }}>
              <button onClick={toggleMute}
                style={{ width: '52px', height: '52px', borderRadius: '50%', background: isMuted ? '#ef4444' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  {isMuted
                    ? <><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>
                    : <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>
                  }
                </svg>
              </button>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{isMuted ? 'Unmute' : 'Mute'}</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => endCall('ended')}
                style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.4 12.4 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.26 9.84a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.18 1h3a2 2 0 0 1 2 1.72 12.4 12.4 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.16 8.84"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>End</span>
            </div>
          </div>
        )}

        {/* Outgoing ringing/connecting cancel */}
        {(callState === 'connecting' || callState === 'ringing') && mode === 'outgoing' && (
          <div style={{ marginTop: '32px' }}>
            <button onClick={() => endCall('ended')}
              style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.4 12.4 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.26 9.84a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.18 1h3a2 2 0 0 1 2 1.72 12.4 12.4 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.16 8.84"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Cancel</span>
          </div>
        )}

        {(callState === 'ended' || callState === 'rejected' || callState === 'timeout') && (
          <p style={{ marginTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
            {callState === 'rejected' ? 'Call was declined.' : callState === 'timeout' ? 'No answer. Try again later.' : 'Call ended.'}
          </p>
        )}
      </div>
    </div>
  )
}
