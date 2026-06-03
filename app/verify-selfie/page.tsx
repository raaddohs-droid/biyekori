'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type Stage = 'landing' | 'camera' | 'challenge' | 'preview' | 'uploading' | 'done' | 'failed'
type Challenge = 'look-left' | 'look-right'

const CHALLENGES: Challenge[] = ['look-left', 'look-right']

const CHALLENGE_LABELS: Record<Challenge, string> = {
  'look-left': 'Look LEFT',
  'look-right': 'Look RIGHT',
}

const CHALLENGE_LABELS_BN: Record<Challenge, string> = {
  'look-left': 'বাম দিকে তাকান',
  'look-right': 'ডান দিকে তাকান',
}

export default function VerifySelfie() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stage, setStage] = useState<Stage>('landing')
  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [completedChallenges, setCompletedChallenges] = useState<boolean[]>([false, false])
  const [faceInOval, setFaceInOval] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState('')
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [attempts, setAttempts] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null)
  const animFrameRef = useRef<number>(0)
  const challengeCooldownRef = useRef(false)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('biyekori_user')
    if (!stored) { router.push('/login'); return }
    const u = JSON.parse(stored)
    setUser(u)
    // Check attempts
    fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${u.id}&select=selfie_attempts,selfie_status`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    }).then(r => r.json()).then(data => {
      if (data[0]) {
        setAttempts(data[0].selfie_attempts || 0)
        if (data[0].selfie_status === 'approved') setStage('done')
      }
    }).catch(() => {})
  }, [])

  const startCamera = async () => {
    setStage('camera')
    setErrorMsg('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current!.play()
          setStage('challenge')
          try {
            await initMediaPipe()
            startDetection()
          } catch (e) {
            setErrorMsg('Failed to load face detection. Please check your internet connection and try again.')
            stopCamera()
            setStage('landing')
          }
        }
      }
    } catch (e) {
      setErrorMsg('Camera access denied. Please allow camera access and try again.')
      setStage('landing')
    }
  }

  const initMediaPipe = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )
    const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFaceBlendshapes: true
    })
    faceLandmarkerRef.current = faceLandmarker
  }

  const stopCamera = () => {
    cancelAnimationFrame(animFrameRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  const startDetection = () => {
    let lastTime = 0
    const detect = (time: number) => {
      animFrameRef.current = requestAnimationFrame(detect)
      if (!faceLandmarkerRef.current || !videoRef.current) return
      if (time - lastTime < 100) return // 10fps enough
      lastTime = time

      const results = faceLandmarkerRef.current.detectForVideo(videoRef.current, time)
      if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
        setFaceInOval(false)
        return
      }

      const landmarks = results.faceLandmarks[0]
      const blendshapes = results.faceBlendshapes?.[0]?.categories || []

      // Check face is roughly in oval (nose tip landmark 1 should be centered)
      const noseTip = landmarks[1]
      const inOval = noseTip.x > 0.25 && noseTip.x < 0.75 && noseTip.y > 0.2 && noseTip.y < 0.85
      setFaceInOval(inOval)

      if (!inOval || challengeCooldownRef.current) return

      // Get head rotation from landmarks
      // Left eye outer: 33, Right eye outer: 263, Nose tip: 1
      const leftEye = landmarks[33]
      const rightEye = landmarks[263]
      const eyeDiffX = rightEye.x - leftEye.x

      // Yaw estimation: when looking left, right eye appears closer to nose
      // Normal eyeDiffX ~0.15-0.25, looking left < 0.08, looking right the face appears differently
      const noseLeft = landmarks[279]  // left side of nose
      const noseRight = landmarks[49]  // right side of nose
      const noseCenter = landmarks[1]

      // Simple yaw: difference between nose center and midpoint of eyes
      const eyeMidX = (leftEye.x + rightEye.x) / 2
      const yaw = noseCenter.x - eyeMidX // negative = looking left, positive = looking right

      setCompletedChallenges(prev => {
        const updated = [...prev]
        const challenge = CHALLENGES[currentChallenge]

        const threshold = 0.06
        const matched = (challenge === 'look-left' && yaw < -threshold) ||
                        (challenge === 'look-right' && yaw > threshold)

        if (matched && !updated[currentChallenge]) {
          updated[currentChallenge] = true
          challengeCooldownRef.current = true
          const nextChallenge = currentChallenge + 1
          setTimeout(() => {
            challengeCooldownRef.current = false
            if (nextChallenge >= CHALLENGES.length) {
              captureFrame()
            } else {
              setCurrentChallenge(nextChallenge)
            }
          }, 1000)
        }

        return updated
      })
    }
    animFrameRef.current = requestAnimationFrame(detect)
  }

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const w = video.videoWidth || 640
    const h = video.videoHeight || 480
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // Draw without mirror for verification purposes
    ctx.drawImage(video, 0, 0, w, h)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    stopCamera()
    setCapturedImage(dataUrl)
    setStage('preview')
  }

  const submitVerification = async () => {
    if (!capturedImage || !user) return
    setStage('uploading')

    try {
      // Upload selfie to Supabase storage
      const blob = await (await fetch(capturedImage)).blob()
      const file = new File([blob], `selfie-${user.id}-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const fileName = `selfies/${user.id}-${Date.now()}.jpg`

      const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/profile-photos/${fileName}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'image/jpeg',
          'x-upsert': 'true'
        },
        body: file
      })

      if (!uploadRes.ok) throw new Error('Upload failed')
      const selfieUrl = `${SUPABASE_URL}/storage/v1/object/public/profile-photos/${fileName}`

      // Call verification API
      const verifyRes = await fetch('/api/verify-selfie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, selfieUrl })
      })
      const result = await verifyRes.json()
      setVerificationResult(result)

      if (result.autoApproved) {
        setStage('done')
        // Update localStorage
        const stored = localStorage.getItem('biyekori_user')
        if (stored) {
          const u = JSON.parse(stored)
          u.selfie_verified = true
          localStorage.setItem('biyekori_user', JSON.stringify(u))
        }
      } else {
        setStage('failed')
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Something went wrong. Please try again.')
      setStage('preview')
    }
  }

  const retry = () => {
    setCapturedImage('')
    setCurrentChallenge(0)
    setCompletedChallenges([false, false])
    setFaceInOval(false)
    challengeCooldownRef.current = false
    setStage('landing')
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const profileCode = user ? (() => {
    // same logic as getProfileCode
    return `BK-${user.id}`
  })() : ''

  // ── LANDING STAGE ──────────────────────────────────────────────
  if (stage === 'landing') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #fff1f2 0%, #fdf4ff 50%, #eff6ff 100%)', paddingTop: '80px', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 20px' }}>

          {/* Back */}
          <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#e11d48', fontWeight: 600, fontSize: '13px', textDecoration: 'none', marginBottom: '32px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Dashboard
          </Link>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #e11d48, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(225,29,72,0.3)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 900, color: '#111827', lineHeight: 1.2 }}>Selfie Verification</h1>
            <p style={{ margin: 0, fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>আপনার পরিবার জানুক, এই মানুষটি সত্যিই সে</p>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#9ca3af' }}>Let your family know this person is truly who they say</p>
          </div>

          {/* Why it matters */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #fce7f3' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 800, color: '#111827' }}>Why this matters</h3>
            {[
              { icon: '🛡️', title: 'Proves you are real', desc: 'Confirms the person in your profile photo is actually you — not someone else\'s photo' },
              { icon: '💕', title: 'Builds deeper trust', desc: 'Verified profiles receive significantly more serious responses from families' },
              { icon: '👨‍👩‍👧', title: 'Reassures families', desc: 'Parents checking your profile can see you passed live face verification' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: i < 2 ? '16px' : 0 }}>
                <span style={{ fontSize: '24px', flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>{item.title}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy notice */}
          <div style={{ background: '#f0fdf4', borderRadius: '14px', padding: '16px', marginBottom: '20px', border: '1px solid #bbf7d0', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#15803d' }}>Your privacy is protected</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#166534', lineHeight: 1.5 }}>Your selfie is used only for one-time verification and is <strong>never shown publicly</strong>, shared with other users, or sold to anyone.</p>
            </div>
          </div>

          {/* How it works */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '28px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 800, color: '#111827' }}>How it works — 2 minutes</h3>
            {[
              { step: '1', text: 'Allow camera access' },
              { step: '2', text: 'Place your face in the oval frame' },
              { step: '3', text: 'Follow 2 simple head movement prompts' },
              { step: '4', text: 'AI instantly verifies and adds your badge' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: i < 3 ? '12px' : 0 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #e11d48, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'white' }}>{item.step}</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#374151', fontWeight: 500 }}>{item.text}</p>
              </div>
            ))}
          </div>

          {attempts >= 3 ? (
            <div style={{ background: '#fff1f2', borderRadius: '14px', padding: '16px', border: '1px solid #fecdd3', textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#e11d48' }}>Maximum attempts reached</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>You have used all 3 attempts this month. Contact support@biyekori.com if you need help.</p>
            </div>
          ) : (
            <button onClick={startCamera} style={{
              width: '100%', padding: '16px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #e11d48, #7c3aed)',
              color: 'white', border: 'none', fontSize: '16px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 8px 24px rgba(225,29,72,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              Start Verification
              <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '2px 8px' }}>
                {3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} remaining
              </span>
            </button>
          )}

          {errorMsg && (
            <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#e11d48', textAlign: 'center' }}>{errorMsg}</p>
          )}
        </div>
      </div>
    )
  }

  // ── CAMERA / CHALLENGE STAGE ───────────────────────────────────
  if (stage === 'camera' || stage === 'challenge') {
    const challenge = CHALLENGES[currentChallenge]
    const allDone = completedChallenges.every(Boolean)

    return (
      <div style={{ minHeight: '100vh', background: '#0f0a1e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Progress */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {CHALLENGES.map((_, i) => (
            <div key={i} style={{ width: '40px', height: '4px', borderRadius: '2px', background: completedChallenges[i] ? '#10b981' : i === currentChallenge ? '#e11d48' : 'rgba(255,255,255,0.2)', transition: 'background 0.3s' }} />
          ))}
        </div>

        {/* Challenge instruction */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {stage === 'camera' ? (
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>Initializing camera...</p>
          ) : allDone ? (
            <p style={{ color: '#10b981', fontSize: '18px', fontWeight: 800, margin: 0 }}>Capturing...</p>
          ) : (
            <>
              <p style={{ color: 'white', fontSize: '26px', fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                {CHALLENGE_LABELS[challenge]}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>
                {CHALLENGE_LABELS_BN[challenge]}
              </p>
            </>
          )}
        </div>

        {/* Oval camera frame */}
        <div style={{ position: 'relative', width: '280px', height: '340px' }}>
          {/* Video */}
          <video
            ref={videoRef}
            playsInline
            muted
            style={{
              width: '280px', height: '340px',
              objectFit: 'cover',
              borderRadius: '50%',
              transform: 'scaleX(-1)', // mirror
              display: 'block'
            }}
          />

          {/* Oval border overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: `4px solid ${faceInOval ? (allDone ? '#10b981' : '#e11d48') : 'rgba(255,255,255,0.3)'}`,
            boxShadow: faceInOval ? `0 0 0 2px ${allDone ? '#10b981' : '#e11d48'}, 0 0 30px ${allDone ? 'rgba(16,185,129,0.4)' : 'rgba(225,29,72,0.4)'}` : 'none',
            transition: 'all 0.3s',
            pointerEvents: 'none'
          }} />

          {/* Challenge arrow indicator */}
          {stage === 'challenge' && !allDone && faceInOval && (
            <div style={{
              position: 'absolute',
              top: '50%', transform: 'translateY(-50%)',
              ...(challenge === 'look-left' ? { left: '-50px' } : { right: '-50px' }),
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.5"
                style={{ transform: challenge === 'look-right' ? 'scaleX(-1)' : 'none' }}>
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </div>
          )}

          {/* Completed checkmarks */}
          {completedChallenges[currentChallenge > 0 ? currentChallenge - 1 : 0] && (
            <div style={{
              position: 'absolute', top: '10px', right: '10px',
              width: '32px', height: '32px', borderRadius: '50%',
              background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
          )}
        </div>

        {/* Face position hint */}
        <p style={{ color: faceInOval ? 'rgba(255,255,255,0.7)' : '#f59e0b', fontSize: '13px', marginTop: '20px', textAlign: 'center' }}>
          {!faceInOval ? 'Position your face inside the oval' : stage === 'camera' ? 'Loading...' : `Challenge ${currentChallenge + 1} of ${CHALLENGES.length}`}
        </p>

        <button onClick={() => { stopCamera(); setStage('landing') }}
          style={{ marginTop: '24px', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
          Cancel
        </button>
      </div>
    )
  }

  // ── PREVIEW STAGE ──────────────────────────────────────────────
  if (stage === 'preview') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #fff1f2 0%, #fdf4ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 800, color: '#111827' }}>Looking good!</h2>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6b7280' }}>This selfie will be used for verification only</p>

          {capturedImage && (
            <img src={capturedImage} alt="Selfie preview" style={{ width: '200px', height: '200px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #e11d48', boxShadow: '0 8px 24px rgba(225,29,72,0.25)', marginBottom: '24px' }} />
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={retry} style={{ flex: 1, padding: '14px', background: 'white', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#6b7280', cursor: 'pointer' }}>
              Retake
            </button>
            <button onClick={submitVerification} style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, #e11d48, #7c3aed)', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', cursor: 'pointer' }}>
              Submit for Verification
            </button>
          </div>

          {errorMsg && <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#e11d48' }}>{errorMsg}</p>}
        </div>
      </div>
    )
  }

  // ── UPLOADING STAGE ────────────────────────────────────────────
  if (stage === 'uploading') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #fff1f2 0%, #fdf4ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', border: '4px solid #fce7f3', borderTopColor: '#e11d48', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>Verifying your identity...</p>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>AI is comparing your selfie with your profile photo</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── DONE STAGE ─────────────────────────────────────────────────
  if (stage === 'done') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(16,185,129,0.35)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: 900, color: '#111827' }}>Selfie Verified!</h2>
          <p style={{ margin: '0 0 8px', fontSize: '15px', color: '#059669', fontWeight: 600 }}>আপনার প্রোফাইল এখন যাচাইকৃত</p>
          <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>Your profile now shows a Selfie Verified badge. Families viewing your profile will see you passed live face verification.</p>

          <div style={{ background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '24px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#dcfce7', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>Selfie Verified Badge</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Visible on your profile and profile cards</p>
            </div>
          </div>

          <Link href="/dashboard" style={{ display: 'block', width: '100%', padding: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '15px', textDecoration: 'none', textAlign: 'center' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // ── FAILED / PENDING MANUAL REVIEW ─────────────────────────────
  if (stage === 'failed') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #fff1f2 0%, #fdf4ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 900, color: '#111827' }}>Sent for Manual Review</h2>
          <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>
            Our AI could not automatically verify your selfie with high confidence. A team member will review it within 24 hours and notify you.
          </p>

          {verificationResult?.reason && (
            <div style={{ background: '#fffbeb', borderRadius: '12px', padding: '14px', marginBottom: '20px', border: '1px solid #fde68a', fontSize: '13px', color: '#92400e', textAlign: 'left' }}>
              <strong>AI notes:</strong> {verificationResult.reason}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={retry} style={{ flex: 1, padding: '14px', background: 'white', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#374151', cursor: 'pointer' }}>
              Try Again ({Math.max(0, 3 - attempts - 1)} left)
            </button>
            <Link href="/dashboard" style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #e11d48, #7c3aed)', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return null
}
