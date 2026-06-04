'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const FREE_CALL_LIMIT = 5 * 60 // 5 minutes in seconds
const PREMIUM_CALL_LIMIT = 15 * 60 // 15 minutes in seconds

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
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const callStartRef = useRef<number>(0)
  const sinceRef = useRef<string>(new Date().toISOString())

  const isPremium = currentUser?.package && currentUser.package !== 'prottasha'
  const callLimit = isPremium ? PREMIUM_CALL_LIMIT : FREE_CALL_LIMIT

  const sendSignal = useCallback(async (type: string, data: any) => {
    await fetch('/api/call/signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, fromId: currentUser.id, toId: targetProfile.id, data })
    })
  }, [currentUser.id, targetProfile.id])

  const endCall = useCallback((reason: 'ended' | 'rejected' | 'timeout' = 'ended') => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (pollRef.current) clearInterval(pollRef.current)
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop())
    if (pcRef.current) pcRef.current.close()
    sendSignal('call-end', { reason })
    setCallState(reason)
    setTimeout(onClose, 2000)
  }, [sendSignal, onClose])

  const startTimer = useCallback(() => {
    callStartRef.current = Date.now()
    setTimeLeft(callLimit)
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - callStartRef.current) / 1000)
      const remaining = callLimit - elapsed
      if (remaining <= 0) {
        endCall('timeout')
      } else {
        setTimeLeft(remaining)
      }
    }, 1000)
  }, [callLimit, endCall])

  const setupPeerConnection = useCallback(async () => {
    // Fetch TURN credentials from Metered
    let iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
    try {
      const turnRes = await fetch('/api/turn')
      const turnData = await turnRes.json()
      if (turnData.iceServers && turnData.iceServers.length > 0) {
        iceServers = turnData.iceServers
      }
    } catch(e) {}

    const pc = new RTCPeerConnection({
      iceServers
    })
    pcRef.current = pc

    // Get microphone
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      localStreamRef.current = stream
      stream.getTracks().forEach(track => pc.addTrack(track, stream))
    } catch (e) {
      setErrorMsg('Microphone access denied. Please allow microphone to make calls.')
      endCall('ended')
      return null
    }

    // Remote audio — use DOM element via ref for autoplay policy compliance
    pc.ontrack = (e) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = e.streams[0]
        remoteAudioRef.current.play().catch(() => {})
      }
    }

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal('ice-candidate', { candidate: e.candidate })
      }
    }

    return pc
  }, [sendSignal, endCall])

  const makeCall = useCallback(async () => {
    setCallState('connecting')
    const pc = await setupPeerConnection()
    if (!pc) return

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    await sendSignal('call-offer', { sdp: offer })

    // Poll for answer — keep since fixed from offer time, don't advance it
    const offerTime = new Date(Date.now() - 2000).toISOString()
    let attempts = 0
    pollRef.current = setInterval(async () => {
      attempts++
      if (attempts > 45) { // 45 seconds timeout
        endCall('timeout')
        return
      }
      const res = await fetch(`/api/call/signal?userId=${currentUser.id}&since=${offerTime}`)
      const { signals } = await res.json()
      // Don't update sinceRef here — keep fetching from offer time

      for (const signal of signals) {
        const data = JSON.parse(signal.data || '{}')
        if (signal.type === 'call-answer' && signal.from_id === targetProfile.id) {
          clearInterval(pollRef.current!)
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
          setCallState('active')
          startTimer()
        }
        if (signal.type === 'call-reject' && signal.from_id === targetProfile.id) {
          clearInterval(pollRef.current!)
          endCall('rejected')
        }
        if (signal.type === 'call-end') {
          clearInterval(pollRef.current!)
          endCall('ended')
        }
        if (signal.type === 'ice-candidate' && signal.from_id === targetProfile.id) {
          try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)) } catch(e) {}
        }
      }
    }, 1000)
  }, [setupPeerConnection, sendSignal, currentUser.id, targetProfile.id, endCall, startTimer])

  const answerCall = useCallback(async () => {
    setCallState('connecting')
    const pc = await setupPeerConnection()
    if (!pc) return

    const offerData = JSON.parse(incomingSignal?.data || '{}')
    await pc.setRemoteDescription(new RTCSessionDescription(offerData.sdp))
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    // Send answer immediately — critical for caller to receive it
    await sendSignal('call-answer', { sdp: answer })
    // Also send a second time after short delay as backup
    setTimeout(() => sendSignal('call-answer', { sdp: answer }), 1500)
    setCallState('active')
    startTimer()

    // Poll for ICE candidates and end signals
    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/call/signal?userId=${currentUser.id}&since=${sinceRef.current}`)
      const { signals } = await res.json()
      sinceRef.current = new Date().toISOString()
      for (const signal of signals) {
        const data = JSON.parse(signal.data || '{}')
        if (signal.type === 'call-end') {
          clearInterval(pollRef.current!)
          endCall('ended')
        }
        if (signal.type === 'ice-candidate' && signal.from_id === targetProfile.id) {
          try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)) } catch(e) {}
        }
      }
    }, 1000)
  }, [setupPeerConnection, sendSignal, incomingSignal, currentUser.id, targetProfile.id, endCall, startTimer])

  useEffect(() => {
    if (mode === 'outgoing') {
      makeCall()
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (pollRef.current) clearInterval(pollRef.current)
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop())
      if (pcRef.current) pcRef.current.close()
    }
  }, [])

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = isMuted })
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
    ringing: '#f59e0b',
    connecting: '#3b82f6',
    active: '#10b981',
    ended: '#6b7280',
    rejected: '#e11d48',
    timeout: '#e11d48'
  }

  const stateLabels: Record<string, string> = {
    ringing: mode === 'outgoing' ? 'Calling...' : 'Incoming Call',
    connecting: 'Connecting...',
    active: 'Connected',
    ended: 'Call Ended',
    rejected: 'Call Declined',
    timeout: callState === 'timeout' && callStartRef.current > 0 ? 'Time Limit Reached' : 'No Answer'
  }

  return (
    <div>
      <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />
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
        {/* Status indicator */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.1)', borderRadius: '20px',
          padding: '4px 14px', marginBottom: '28px'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: stateColors[callState], display: 'inline-block' }} />
          <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>{stateLabels[callState]}</span>
        </div>

        {/* Avatar */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
          {photo ? (
            <img src={photo} alt={name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)' }} />
          ) : (
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', border: '3px solid rgba(255,255,255,0.3)' }}>?</div>
          )}
          {callState === 'active' && (
            <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#10b981', border: '2px solid #1e1b4b' }} />
          )}
        </div>

        <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 800, color: 'white' }}>{name}</h2>
        <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Biyekori Match</p>

        {/* Timer */}
        {callState === 'active' && (
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: timeLeft <= 30 ? '#f87171' : '#34d399', fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(timeLeft)}
            </span>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
              {isPremium ? '15 min limit' : '5 min limit'} · {isPremium ? 'Premium' : 'Free'}
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
                  {isMuted ? <><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></> : <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>}
                </svg>
              </button>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{isMuted ? 'Unmute' : 'Mute'}</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => endCall('ended')}
                style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
              </button>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>End</span>
            </div>
          </div>
        )}

        {/* Outgoing ringing */}
        {mode === 'outgoing' && (callState === 'ringing' || callState === 'connecting') && (
          <div style={{ marginTop: '32px' }}>
            <button onClick={() => endCall('ended')}
              style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
            </button>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Cancel</span>
          </div>
        )}

        {/* End states */}
        {(callState === 'ended' || callState === 'rejected' || callState === 'timeout') && (
          <div style={{ marginTop: '24px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
            {callState === 'rejected' && 'They declined the call.'}
            {callState === 'ended' && 'Call ended.'}
            {callState === 'timeout' && callStartRef.current > 0 && `Time limit reached. Upgrade for longer calls.`}
            {callState === 'timeout' && callStartRef.current === 0 && 'No answer. Try again later.'}
          </div>
        )}
      </div>
    </div>
    </div>
  )
}