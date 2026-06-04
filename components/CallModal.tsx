'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const channelRef = useRef<any>(null)
  const callStartRef = useRef<number>(0)
  const answerSetRef = useRef(false)
  const iceCandidateBuffer = useRef<any[]>([])
  const remoteDescSet = useRef(false)
  const callerIceBuffer = useRef<any[]>([])
  const answerReceivedRef = useRef(false)

  const isPremium = currentUser?.package && currentUser.package !== 'prottasha'
  const callLimit = isPremium ? PREMIUM_CALL_LIMIT : FREE_CALL_LIMIT

  // Send signal via API
  const sendSignal = useCallback(async (type: string, data: any) => {
    try {
      await fetch('/api/call/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, fromId: currentUser.id, toId: targetProfile.id, data })
      })
    } catch(e) {}
  }, [currentUser.id, targetProfile.id])

  const endCall = useCallback((reason: 'ended' | 'rejected' | 'timeout' = 'ended') => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (channelRef.current) channelRef.current.unsubscribe()
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop())
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null }
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
      if (remaining <= 0) { endCall('timeout'); return }
      setTimeLeft(remaining)
    }, 1000)
  }, [callLimit, endCall])

  const setupPeerConnection = useCallback(async () => {
    try {
      // Hardcoded TURN credentials from Metered
      const iceServers: any[] = [
        { urls: 'stun:stun.relay.metered.ca:80' },
        { urls: 'turn:global.relay.metered.ca:80', username: '79afb5cbdd5a93798dbf8629', credential: 'IxSBu1pxZ034OMZj' },
        { urls: 'turn:global.relay.metered.ca:80?transport=tcp', username: '79afb5cbdd5a93798dbf8629', credential: 'IxSBu1pxZ034OMZj' },
        { urls: 'turn:global.relay.metered.ca:443', username: '79afb5cbdd5a93798dbf8629', credential: 'IxSBu1pxZ034OMZj' },
        { urls: 'turns:global.relay.metered.ca:443?transport=tcp', username: '79afb5cbdd5a93798dbf8629', credential: 'IxSBu1pxZ034OMZj' },
        { urls: 'stun:stun.l.google.com:19302' },
      ]
      console.log('Using hardcoded TURN servers:', iceServers.length)

      const pc = new RTCPeerConnection({ iceServers })
      pcRef.current = pc

      // Get microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false
      })
      localStreamRef.current = stream
      stream.getTracks().forEach(track => pc.addTrack(track, stream))

      // Remote audio via DOM element
      pc.ontrack = (e) => {
        console.log('ontrack:', e.track.kind, e.streams.length)
        if (remoteAudioRef.current && e.streams[0]) {
          remoteAudioRef.current.srcObject = e.streams[0]
          remoteAudioRef.current.volume = 1.0
          remoteAudioRef.current.play().catch(err => console.warn('Audio play:', err))
        }
      }

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          if (answerReceivedRef.current) {
            // Answer already received, send immediately
            sendSignal('ice-candidate', { candidate: e.candidate })
          } else {
            // Buffer until answer received
            callerIceBuffer.current.push(e.candidate)
          }
        }
      }

      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState)
        if (pc.connectionState === 'failed') {
          setErrorMsg('Connection failed. Please try again.')
        }
      }

      return pc
    } catch(err: any) {
      setErrorMsg('Microphone access denied. Please allow mic and try again.')
      return null
    }
  }, [sendSignal])

  // Subscribe to realtime signals via Supabase
  const subscribeToSignals = useCallback((pc: RTCPeerConnection) => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })
    const channel = supabase
      .channel('call-signals-' + currentUser.id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'call_signals',
        filter: `to_id=eq.${currentUser.id}`
      }, async (payload: any) => {
        const signal = payload.new
        console.log('Received signal:', signal.type, 'from:', signal.from_id)
        if (String(signal.from_id) !== String(targetProfile.id) && signal.type !== 'call-end') return

        const data = JSON.parse(signal.data || '{}')

        if (signal.type === 'call-answer' && !answerSetRef.current) {
          answerSetRef.current = true
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
            remoteDescSet.current = true
            answerReceivedRef.current = true
            // Flush remote ICE candidates buffered before answer
            for (const candidate of iceCandidateBuffer.current) {
              try { await pc.addIceCandidate(new RTCIceCandidate(candidate)) } catch(e) {}
            }
            iceCandidateBuffer.current = []
            // Now send our buffered ICE candidates to callee
            for (const candidate of callerIceBuffer.current) {
              sendSignal('ice-candidate', { candidate })
            }
            callerIceBuffer.current = []
            setCallState('active')
            startTimer()
          } catch(e) { console.error('setRemoteDescription error:', e) }
        }

        if (signal.type === 'ice-candidate') {
          if (remoteDescSet.current) {
            try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)) } catch(e) {}
          } else {
            iceCandidateBuffer.current.push(data.candidate)
          }
        }

        if (signal.type === 'call-reject') {
          endCall('rejected')
        }

        if (signal.type === 'call-end') {
          endCall('ended')
        }
      })
      .subscribe()

    channelRef.current = channel
    return channel
  }, [currentUser.id, targetProfile.id, endCall, startTimer])

  const makeCall = useCallback(async () => {
    setCallState('connecting')
    const pc = await setupPeerConnection()
    if (!pc) return

    subscribeToSignals(pc)

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    await sendSignal('call-offer', { sdp: offer })

    // Timeout after 45s
    setTimeout(() => {
      if (callState !== 'active') endCall('timeout')
    }, 45000)
  }, [setupPeerConnection, subscribeToSignals, sendSignal, endCall, callState])

  const answerCall = useCallback(async () => {
    setCallState('connecting')
    const pc = await setupPeerConnection()
    if (!pc) return

    subscribeToSignals(pc)

    const offerData = JSON.parse(incomingSignal?.data || '{}')
    await pc.setRemoteDescription(new RTCSessionDescription(offerData.sdp))
    remoteDescSet.current = true
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    await sendSignal('call-answer', { sdp: answer })
    setCallState('active')
    startTimer()
  }, [setupPeerConnection, subscribeToSignals, incomingSignal, sendSignal, startTimer])

  useEffect(() => {
    if (mode === 'outgoing') makeCall()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (channelRef.current) channelRef.current.unsubscribe()
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
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Mute</span>
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

          {/* Outgoing ringing / connecting cancel */}
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
    </div>
  )
}
