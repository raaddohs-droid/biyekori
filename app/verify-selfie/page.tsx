'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type Stage = 'landing' | 'camera' | 'preview' | 'uploading' | 'done' | 'failed'

export default function VerifySelfie() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stage, setStage] = useState<Stage>('landing')
  const [capturedImage, setCapturedImage] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState('')
  const [attempts, setAttempts] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('biyekori_user')
    if (!stored) { router.push('/login'); return }
    const u = JSON.parse(stored)
    setUser(u)
    fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${u.id}&select=selfie_attempts,selfie_status`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    }).then(r => r.json()).then(data => {
      if (data[0]) {
        setAttempts(data[0].selfie_attempts || 0)
        if (data[0].selfie_status === 'approved') setStage('done')
      }
    }).catch(() => {})
  }, [])

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  useEffect(() => { return () => stopCamera() }, [])

  const startCamera = async () => {
    setErrorMsg('')
    setStage('camera')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (e: any) {
      setStage('landing')
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setErrorMsg('camera_denied')
      } else {
        setErrorMsg('ক্যামেরা চালু হয়নি। Chrome এ: অ্যাড্রেস বারের 🔒 আইকন → Site settings → Camera → Allow করুন। তারপর রিফ্রেশ করুন।')
      }
    }
  }

  const capture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const w = video.videoWidth || 640
    const h = video.videoHeight || 480
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0, w, h)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    stopCamera()
    setCapturedImage(dataUrl)
    setStage('preview')
  }

  const retake = () => {
    setCapturedImage('')
    startCamera()
  }

  const submit = async () => {
    if (!capturedImage || !user) return
    setStage('uploading')
    try {
      const blob = await (await fetch(capturedImage)).blob()
      const fileName = `selfies/${user.id}-${Date.now()}.jpg`
      const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/profile-photos/${fileName}`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
        body: blob
      })
      if (!uploadRes.ok) throw new Error('Upload failed')
      const selfieUrl = `${SUPABASE_URL}/storage/v1/object/public/profile-photos/${fileName}`
      const verifyRes = await fetch('/api/verify-selfie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, selfieUrl })
      })
      const result = await verifyRes.json()
      if (result.autoApproved) {
        const stored = localStorage.getItem('biyekori_user')
        if (stored) { const u = JSON.parse(stored); u.selfie_verified = true; localStorage.setItem('biyekori_user', JSON.stringify(u)) }
        setStage('done')
      } else {
        setStage('failed')
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।')
      setStage('preview')
    }
  }

  // ── LANDING ──
  if (stage === 'landing') {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: '60px', paddingTop: '70px' }}>
        <div style={{ background: 'linear-gradient(135deg, #7B1D2E 0%, #4A1A6B 100%)', padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '26px', fontWeight: 900, color: '#fff' }}>পরিচয় যাচাই করুন</h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>২ মিনিট · বিনামূল্যে · একবারই</p>
        </div>

        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 20px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '24px' }}>
            {[{ icon: '🛡️', label: 'AI Verified' }, { icon: '🔒', label: 'Never shown publicly' }, { icon: '💕', label: '3× more responses' }].map((b, i) => (
              <div key={i} style={{ background: '#fdf6ee', borderRadius: '12px', padding: '12px 8px', textAlign: 'center', border: '1px solid #f0d9c0' }}>
                <div style={{ fontSize: '22px', marginBottom: '4px' }}>{b.icon}</div>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#7B1D2E', lineHeight: 1.3 }}>{b.label}</p>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '16px', border: '1.5px solid #f3e8ff' }}>
            <p style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 800, color: '#111827' }}>কেন এটি গুরুত্বপূর্ণ</p>
            {[
              { icon: '✅', text: 'প্রোফাইল ফটোতে আপনি সত্যিই আছেন তা প্রমাণ করে' },
              { icon: '👨‍👩‍👧', text: 'পরিবার আপনার প্রোফাইলে Verified ব্যাজ দেখতে পাবে' },
              { icon: '💬', text: 'Verified প্রোফাইলে সিরিয়াস পরিবার বেশি সাড়া দেয়' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < 2 ? '12px' : 0 }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>{item.text}</p>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '16px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 800, color: '#111827' }}>কীভাবে কাজ করে — ২ মিনিট</p>
            {[
              { step: '১', text: 'ক্যামেরা অ্যাক্সেস দিন' },
              { step: '২', text: 'ক্যামেরার দিকে তাকান' },
              { step: '৩', text: 'ছবি তুলুন' },
              { step: '৪', text: 'AI যাচাই করে Verified ব্যাজ যোগ করবে' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: i < 3 ? '10px' : 0 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #7B1D2E, #4A1A6B)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'white' }}>{item.step}</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#374151', fontWeight: 500 }}>{item.text}</p>
              </div>
            ))}
          </div>

          <div style={{ background: '#f0fdf4', borderRadius: '14px', padding: '14px 16px', marginBottom: '24px', border: '1px solid #bbf7d0', display: 'flex', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <p style={{ margin: 0, fontSize: '12px', color: '#166534', lineHeight: 1.5 }}>আপনার সেলফি শুধু একবারই যাচাইয়ের জন্য ব্যবহার হবে এবং <strong>কখনো প্রকাশ্যে দেখানো হবে না।</strong></p>
          </div>

          {attempts >= 3 ? (
            <div style={{ background: '#fff1f2', borderRadius: '14px', padding: '16px', border: '1px solid #fecdd3', textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#e11d48' }}>সর্বোচ্চ চেষ্টা শেষ</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>support@biyekori.com এ যোগাযোগ করুন।</p>
            </div>
          ) : (
            <button onClick={startCamera} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #7B1D2E, #4A1A6B)', color: 'white', border: 'none', fontSize: '16px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              যাচাই শুরু করুন
              <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '2px 8px' }}>{3 - attempts}টি সুযোগ বাকি</span>
            </button>
          )}

          {errorMsg === 'camera_denied' && (
            <div style={{ marginTop: '14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '14px 16px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#c2410c' }}>ক্যামেরা অ্যাক্সেস বন্ধ আছে</p>
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#9a3412', lineHeight: 1.5 }}>১. ব্রাউজারের অ্যাড্রেস বারে 🔒 আইকনে ক্লিক করুন</p>
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#9a3412', lineHeight: 1.5 }}>২. Camera → Allow করুন</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#9a3412', lineHeight: 1.5 }}>৩. পেজ রিফ্রেশ করে আবার চেষ্টা করুন</p>
            </div>
          )}
          {errorMsg && errorMsg !== 'camera_denied' && (
            <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#e11d48', textAlign: 'center' }}>{errorMsg}</p>
          )}
        </div>
      </div>
    )
  }

  // ── CAMERA ──
  if (stage === 'camera') {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0a1e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', paddingTop: '80px' }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginBottom: '20px', textAlign: 'center' }}>ক্যামেরার দিকে তাকান, তারপর ছবি তুলুন</p>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px', borderRadius: '20px', overflow: 'hidden', border: '3px solid #7B1D2E' }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', display: 'block', transform: 'scaleX(-1)' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {/* Oval overlay */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="none">
              <defs>
                <mask id="oval-mask">
                  <rect width="400" height="300" fill="white"/>
                  <ellipse cx="200" cy="150" rx="110" ry="130" fill="black"/>
                </mask>
              </defs>
              <rect width="400" height="300" fill="rgba(0,0,0,0.45)" mask="url(#oval-mask)"/>
              <ellipse cx="200" cy="150" rx="110" ry="130" fill="none" stroke="#FAD95A" strokeWidth="2.5"/>
            </svg>
          </div>
        </div>
        <button onClick={capture} style={{ marginTop: '28px', width: '72px', height: '72px', borderRadius: '50%', background: '#7B1D2E', border: '4px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        </button>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '12px' }}>ছবি তুলতে বোতামটি চাপুন</p>
        <button onClick={() => { stopCamera(); setStage('landing') }} style={{ marginTop: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '13px', cursor: 'pointer' }}>বাতিল করুন</button>
      </div>
    )
  }

  // ── PREVIEW ──
  if (stage === 'preview') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #fff1f2 0%, #fdf4ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: 900, color: '#111827' }}>ছবিটি ঠিক আছে?</h2>
          <img src={capturedImage} alt="Preview" style={{ width: '100%', borderRadius: '16px', marginBottom: '24px', border: '3px solid #7B1D2E' }} />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={retake} style={{ flex: 1, padding: '14px', background: 'white', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#374151', cursor: 'pointer' }}>আবার তুলুন</button>
            <button onClick={submit} style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #7B1D2E, #4A1A6B)', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', cursor: 'pointer' }}>জমা দিন →</button>
          </div>
          {errorMsg && <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#e11d48' }}>{errorMsg}</p>}
        </div>
      </div>
    )
  }

  // ── UPLOADING ──
  if (stage === 'uploading') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #fff1f2 0%, #fdf4ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid rgba(123,29,46,0.2)', borderTopColor: '#7B1D2E', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>যাচাই হচ্ছে...</p>
          <p style={{ fontSize: '13px', color: '#9ca3af' }}>AI আপনার পরিচয় যাচাই করছে</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  // ── DONE ──
  if (stage === 'done') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '360px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 900, color: '#111827' }}>যাচাই সম্পন্ন!</h2>
          <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>আপনার প্রোফাইলে Verified ব্যাজ যোগ হয়েছে। পরিবার এখন আপনার উপর আরো আস্থা রাখবে।</p>
          <Link href="/dashboard" style={{ display: 'block', padding: '14px', background: 'linear-gradient(135deg, #7B1D2E, #4A1A6B)', borderRadius: '12px', color: 'white', fontWeight: 700, textDecoration: 'none', fontSize: '15px' }}>ড্যাশবোর্ডে ফিরুন →</Link>
        </div>
      </div>
    )
  }

  // ── FAILED ──
  if (stage === 'failed') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #fff1f2 0%, #fdf4ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '360px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>😕</div>
          <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900, color: '#111827' }}>যাচাই হয়নি</h2>
          <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>ছবি স্পষ্ট ছিল না অথবা মুখ ঠিকমতো দেখা যায়নি। আবার চেষ্টা করুন।</p>
          <button onClick={() => { setCapturedImage(''); setStage('landing') }} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #7B1D2E, #4A1A6B)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>আবার চেষ্টা করুন</button>
        </div>
      </div>
    )
  }

  return null
}
