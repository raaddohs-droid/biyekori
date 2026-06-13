'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type Lang = 'bn' | 'en'

const MOMENTS = [
  {
    time: '০৫:৩০', timeEn: '05:30',
    chapter: 'ভোর', chapterEn: 'Dawn',
    skyColors: ['#020108', '#0d0521', '#6B1A4A'],
    stars: 28, moonPhase: 0.9,
    textBn: 'ঘুম ভাঙল।\nসবার আগে কী করেন?',
    textEn: 'You wake up.\nWhat is your very first move?',
    choices: [
      { bn: 'ফজরের নামাজ', en: 'Fajr prayer', color: '#0F4A35', icon: '🕌' },
      { bn: 'চুপচাপ শুয়ে থাকি', en: 'Lie quietly', color: '#2A1A4A', icon: '🌙' },
      { bn: 'ফোন ধরি না', en: 'No phone yet', color: '#3A2A0A', icon: '🍃' },
      { bn: 'উঠে পড়ি', en: 'Get up straight away', color: '#1A0A2A', icon: '⚡' },
    ]
  },
  {
    time: '০৯:০০', timeEn: '09:00',
    chapter: 'সকাল', chapterEn: 'Morning',
    skyColors: ['#1a0a2e', '#8B3A2A', '#E8824A'],
    stars: 3, moonPhase: 0,
    textBn: 'একটু সময় হাতে।\nমন কোথায় যায়?',
    textEn: 'A quiet morning hour.\nWhere does your mind go?',
    choices: [
      { bn: 'পড়াশোনা বা কাজ', en: 'Work or study', color: '#0F3A5C', icon: '📖' },
      { bn: 'পরিবারের সাথে', en: 'Family time', color: '#0F4A35', icon: '🏡' },
      { bn: 'হাঁটতে বেরোই', en: 'Go for a walk', color: '#3A1A0A', icon: '🌿' },
      { bn: 'একা থাকি', en: 'Quiet alone time', color: '#2A0A3A', icon: '☕' },
    ]
  },
  {
    time: '১৪:০০', timeEn: '14:00',
    chapter: 'দুপুর', chapterEn: 'Afternoon',
    skyColors: ['#0a2a1a', '#1A5A2A', '#3A9A5A'],
    stars: 0, moonPhase: 0,
    textBn: 'টাকার কথা ভাবলেন।\nমন কী বলে?',
    textEn: 'You think about money.\nWhat is your instinct?',
    choices: [
      { bn: 'ভবিষ্যতের জন্য জমাই', en: 'Save for the future', color: '#0F3A5C', icon: '🏦' },
      { bn: 'এখন উপভোগ করি', en: 'Enjoy now', color: '#3A1A4A', icon: '✨' },
      { bn: 'পরিবারে খরচ করি', en: 'Spend on family', color: '#0F4A35', icon: '❤️' },
      { bn: 'বিনিয়োগ করি', en: 'Invest it', color: '#3A2A0A', icon: '📈' },
    ]
  },
  {
    time: '১৯:০০', timeEn: '19:00',
    chapter: 'সন্ধ্যা', chapterEn: 'Evening',
    skyColors: ['#0d0521', '#4A1A2A', '#8B3A1A'],
    stars: 8, moonPhase: 0.4,
    textBn: 'সঙ্গী চুপচাপ।\nআপনি কী করেন?',
    textEn: 'Your partner goes quiet.\nWhat do you do?',
    choices: [
      { bn: 'আলতো জিজ্ঞেস করি', en: 'Gently ask', color: '#0F4A35', icon: '💬' },
      { bn: 'একটু সময় দিই', en: 'Give space', color: '#2A1A4A', icon: '🌿' },
      { bn: 'মন ভালো করাই', en: 'Try to cheer up', color: '#3A2A0A', icon: '😊' },
      { bn: 'নিজেই বলবে অপেক্ষা', en: 'Wait patiently', color: '#3A0A1A', icon: '🕰️' },
    ]
  },
  {
    time: '২৩:০০', timeEn: '23:00',
    chapter: 'রাত', chapterEn: 'Night',
    skyColors: ['#020108', '#05050F', '#0A0521'],
    stars: 40, moonPhase: 1,
    textBn: 'সঙ্গীর কাছে\nএকটাই চাওয়া কী?',
    textEn: 'One thing you need most\nfrom your life partner.',
    choices: [
      { bn: 'বোঝাপড়া', en: 'Understanding', color: '#0F4A35', icon: '🤝' },
      { bn: 'সম্মান', en: 'Respect', color: '#2A1A4A', icon: '👑' },
      { bn: 'বিশ্বস্ততা', en: 'Loyalty', color: '#3A2A0A', icon: '💎' },
      { bn: 'হাসি আর ভালোবাসা', en: 'Laughter and love', color: '#3A0A1A', icon: '😄' },
    ]
  },
]

const TOTAL = MOMENTS.length

export default function CompatibilityGame({ partnerId, partnerName }: { partnerId: number, partnerName: string }) {
  const [lang, setLang] = useState<Lang>('bn')
  const [user, setUser] = useState<any>(null)
  const [gameId, setGameId] = useState<number | null>(null)
  const [currentMoment, setCurrentMoment] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [phase, setPhase] = useState<'landing' | 'playing' | 'waiting' | 'results'>('landing')
  const [partnerCount, setPartnerCount] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [animating, setAnimating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const skyAnimRef = useRef<number | null>(null)
  const pollRef = useRef<any>(null)
  const particleRef = useRef<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('biyekori_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (skyAnimRef.current) cancelAnimationFrame(skyAnimRef.current)
      if (particleRef.current) clearInterval(particleRef.current)
    }
  }, [])

  const startGame = async () => {
    if (!user) return
    const res = await fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', userId: user.id, partnerId })
    })
    const data = await res.json()
    if (data.success) { setGameId(data.game.id); setPhase('playing') }
  }

  const handleChoice = async (choiceIdx: number) => {
    if (selectedChoice !== null || animating) return
    setSelectedChoice(choiceIdx)
    setAnimating(true)
    if (gameId && user) {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'answer', userId: user.id, gameId, momentIndex: currentMoment, choiceIndex: choiceIdx })
      })
    }
    const newAnswers = [...answers, choiceIdx]
    setAnswers(newAnswers)
    setTimeout(() => {
      setAnimating(false)
      setSelectedChoice(null)
      if (currentMoment + 1 >= TOTAL) { setPhase('waiting'); startPolling(newAnswers) }
      else setCurrentMoment(currentMoment + 1)
    }, 700)
  }

  const startPolling = (_myAnswers: number[]) => {
    pollRef.current = setInterval(async () => {
      if (!gameId || !user) return
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', userId: user.id, partnerId, gameId })
      })
      const data = await res.json()
      setPartnerCount(data.partnerCount || 0)
      if (data.partnerCount >= TOTAL) { clearInterval(pollRef.current); loadResults() }
    }, 3000)
  }

  const loadResults = async () => {
    if (!gameId || !user) return
    const res = await fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'results', userId: user.id, partnerId, gameId })
    })
    const data = await res.json()
    if (data.success) { setResults(data); setPhase('results') }
  }

  useEffect(() => {
    if (phase !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const m = MOMENTS[currentMoment]
    let t = 0

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    const w = canvas.width, h = canvas.height

    const starArr = Array.from({ length: m.stars }, () => ({
      x: Math.random() * w, y: Math.random() * h * 0.6,
      r: Math.random() * 1.5 + 0.3,
      twinkle: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.04
    }))

    if (skyAnimRef.current) cancelAnimationFrame(skyAnimRef.current)

    const draw = () => {
      t += 0.008
      ctx.clearRect(0, 0, w, h)
      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, m.skyColors[0])
      grad.addColorStop(0.5, m.skyColors[1])
      grad.addColorStop(1, m.skyColors[2])
      ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h)

      if (m.moonPhase > 0) {
        const mx = w * 0.78, my = h * 0.18
        ctx.save(); ctx.globalAlpha = m.moonPhase * 0.9
        const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 28)
        mg.addColorStop(0, 'rgba(255,248,220,0.95)')
        mg.addColorStop(0.7, 'rgba(255,235,180,0.6)')
        mg.addColorStop(1, 'rgba(255,220,150,0)')
        ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, 28, 0, Math.PI * 2); ctx.fill(); ctx.restore()
      }

      starArr.forEach(s => {
        s.twinkle += s.speed
        ctx.save(); ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(s.twinkle))
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); ctx.restore()
      })

      skyAnimRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => { if (skyAnimRef.current) cancelAnimationFrame(skyAnimRef.current) }
  }, [phase, currentMoment])

  const moment = MOMENTS[currentMoment]
  const progress = (currentMoment / TOTAL) * 100

  // LANDING
  if (phase === 'landing') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0d0521 0%, #4A1A6B 55%, #8B1A4A 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
        <style>{`
          @keyframes twinkle { 0%,100%{opacity:0.15} 50%{opacity:0.9} }
          @keyframes floatUp { 0%{transform:translateY(0);opacity:0.6} 100%{transform:translateY(-100vh);opacity:0} }
          @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
          .porichiti-star { position:absolute; background:#fff; border-radius:50%; animation:twinkle ease-in-out infinite; pointer-events:none; }
          .porichiti-particle { position:absolute; border-radius:50%; animation:floatUp linear infinite; pointer-events:none; }
          .porichiti-slide { animation:slideUp 0.5s ease forwards; }
        `}</style>
        {Array.from({ length: 60 }, (_, i) => (
          <div key={i} className="porichiti-star" style={{ width: `${Math.random() * 2.5 + 0.5}px`, height: `${Math.random() * 2.5 + 0.5}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 80}%`, animationDuration: `${2 + Math.random() * 3}s`, animationDelay: `${Math.random() * 3}s` }} />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="porichiti-particle" style={{ width: `${Math.random() * 4 + 2}px`, height: `${Math.random() * 4 + 2}px`, background: ['rgba(250,217,90,0.35)', 'rgba(233,30,140,0.25)', 'rgba(255,255,255,0.2)'][i % 3], left: `${Math.random() * 100}%`, bottom: `${Math.random() * 20}%`, animationDuration: `${7 + Math.random() * 8}s`, animationDelay: `${Math.random() * 6}s` }} />
        ))}
        <div className="porichiti-slide" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <button onClick={() => setLang('bn')} style={{ padding: '7px 18px', background: lang === 'bn' ? '#FAD95A' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '20px', color: lang === 'bn' ? '#0d0521' : '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>বাংলা</button>
            <button onClick={() => setLang('en')} style={{ padding: '7px 18px', background: lang === 'en' ? '#FAD95A' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '20px', color: lang === 'en' ? '#0d0521' : '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>English</button>
          </div>
          <div style={{ fontSize: '26px', marginBottom: '14px', letterSpacing: '10px' }}>✦ ✦ ✦</div>
          <h1 style={{ margin: '0 0 6px', fontSize: '38px', fontWeight: 900, color: '#FAD95A', fontFamily: 'Georgia, serif' }}>পরিচিতি</h1>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '4px', marginBottom: '22px', fontFamily: 'Georgia, serif' }}>PORICHITI</div>
          <p style={{ margin: '0 0 28px', fontSize: '15px', color: 'rgba(255,255,255,0.75)', fontFamily: 'Georgia, serif', lineHeight: 1.8 }}>
            {lang === 'bn'
              ? <>আসুন <strong style={{ color: '#FAD95A' }}>{partnerName}</strong> এর সাথে পরিচিত হই। কিন্তু আলাদা জায়গা থেকে।<br />আপনার যা ভালো লাগে, সেটি ক্লিক করুন।</>
              : <>Get to know <strong style={{ color: '#FAD95A' }}>{partnerName}</strong> — but from your own space.<br />Click what feels true to you.</>}
          </p>
          <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '20px', marginBottom: '24px', textAlign: 'left' }}>
            {[
              { icon: '🔒', bn: 'দুজনেই শেষ না করলে কিছু দেখা যাবে না', en: 'Nothing revealed until both finish' },
              { icon: '✨', bn: 'ফলাফল হবে আসল কথোপকথনের শুরু', en: 'Results become your first real conversation' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: i === 0 ? '14px' : 0 }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontFamily: 'Georgia, serif', lineHeight: 1.5 }}>{lang === 'bn' ? item.bn : item.en}</p>
              </div>
            ))}
          </div>
          <button onClick={startGame} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #C4523A, #8B1A4A)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '17px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
            {lang === 'bn' ? 'শুরু করুন →' : 'Begin →'}
          </button>
        </div>
      </div>
    )
  }

  // PLAYING
  if (phase === 'playing') {
    const lines = (lang === 'bn' ? moment.textBn : moment.textEn).split('\n')
    return (
      <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <style>{`
          @keyframes slideIn { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
          .q-slide { animation:slideIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
          .choice-card { transition:transform 0.2s,box-shadow 0.2s,border-color 0.2s; }
          .choice-card:hover { transform:translateY(-4px) scale(1.03); box-shadow:0 10px 28px rgba(0,0,0,0.35); border-color:rgba(255,255,255,0.45) !important; }
          .choice-card.chosen { border-color:#FAD95A !important; box-shadow:0 0 0 3px rgba(250,217,90,0.35) !important; transform:scale(1.06) !important; }
          .choice-card.dimmed { opacity:0.3; transform:scale(0.96) !important; }
        `}</style>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '20px', padding: '6px 16px', border: '1px solid rgba(255,255,255,0.12)' }}>
              <span style={{ fontSize: '15px', color: '#FAD95A', fontFamily: 'Georgia, serif', fontWeight: 700 }}>{lang === 'bn' ? moment.time : moment.timeEn}</span>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '20px', padding: '6px 16px', border: '1px solid rgba(255,255,255,0.12)' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontFamily: 'Georgia, serif' }}>{lang === 'bn' ? moment.chapter : moment.chapterEn}</span>
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button onClick={() => setLang('bn')} style={{ padding: '5px 10px', background: lang === 'bn' ? '#FAD95A' : 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '12px', color: lang === 'bn' ? '#0d0521' : '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>বাং</button>
              <button onClick={() => setLang('en')} style={{ padding: '5px 10px', background: lang === 'en' ? '#FAD95A' : 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '12px', color: lang === 'en' ? '#0d0521' : '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>EN</button>
            </div>
          </div>
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px', marginBottom: '20px' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #FAD95A, #E91E8C)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
          </div>
          <div className="q-slide" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', padding: '0 8px' }}>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 900, color: '#fff', fontFamily: 'Georgia, serif', lineHeight: 1.4, textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>{lines[0]}</p>
              {lines[1] && <p style={{ margin: '0 0 32px', fontSize: '16px', color: 'rgba(255,255,255,0.65)', fontFamily: 'Georgia, serif', lineHeight: 1.5, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>{lines[1]}</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {moment.choices.map((choice, idx) => (
                <button
                  key={idx}
                  className={`choice-card${selectedChoice === idx ? ' chosen' : selectedChoice !== null ? ' dimmed' : ''}`}
                  onClick={() => handleChoice(idx)}
                  disabled={selectedChoice !== null}
                  style={{ padding: '20px 12px', background: choice.color, border: '2px solid rgba(255,255,255,0.18)', borderRadius: '18px', cursor: selectedChoice !== null ? 'default' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                >
                  <span style={{ fontSize: '40px' }}>{choice.icon}</span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#fff', fontFamily: 'Georgia, serif', lineHeight: 1.3, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{lang === 'bn' ? choice.bn : choice.en}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', padding: '8px 16px', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', alignSelf: 'center' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#E91E8C', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontFamily: 'Georgia, serif' }}>{lang === 'bn' ? `${partnerName} এখন খেলছেন` : `${partnerName} is also playing`}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // WAITING
  if (phase === 'waiting') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #020108 0%, #0A0521 50%, #1A0A4A 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <style>{`@keyframes pulse2 { 0%,100%{opacity:1} 50%{opacity:0.3} } @keyframes twinkle2 { 0%,100%{opacity:0.15} 50%{opacity:0.9} } .ws { position:absolute;background:#fff;border-radius:50%;animation:twinkle2 ease-in-out infinite;pointer-events:none; }`}</style>
        {Array.from({ length: 50 }, (_, i) => (
          <div key={i} className="ws" style={{ width: `${Math.random() * 2 + 0.5}px`, height: `${Math.random() * 2 + 0.5}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 90}%`, animationDuration: `${2 + Math.random() * 3}s`, animationDelay: `${Math.random() * 3}s` }} />
        ))}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '360px', width: '100%' }}>
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>🌙</div>
          <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 900, color: '#FAD95A', fontFamily: 'Georgia, serif' }}>{lang === 'bn' ? 'আপনার উত্তর সিল করা হয়েছে' : 'Your answers are sealed'}</h2>
          <p style={{ margin: '0 0 32px', fontSize: '15px', color: 'rgba(255,255,255,0.65)', fontFamily: 'Georgia, serif', lineHeight: 1.7 }}>
            {lang === 'bn' ? `${partnerName} এখন তাদের দিন কাটাচ্ছেন। দুজনেই শেষ হলেই ফলাফল আসবে।` : `${partnerName} is still playing. Results appear when both finish.`}
          </p>
          <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '16px', padding: '16px 24px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', fontFamily: 'Georgia, serif' }}>
              <span>{lang === 'bn' ? 'ভোর' : 'Dawn'}</span><span>{lang === 'bn' ? 'রাত' : 'Night'}</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
              <div style={{ height: '100%', width: `${(partnerCount / TOTAL) * 100}%`, background: 'linear-gradient(90deg, #E91E8C, #FAD95A)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Georgia, serif' }}>{partnerName} — {partnerCount} / {TOTAL}</div>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>{lang === 'bn' ? 'সম্পন্ন হলেই ফলাফল দেখা যাবে' : 'Results will appear automatically'}</p>
        </div>
      </div>
    )
  }

  // RESULTS
  if (phase === 'results' && results) {
    const score = results.score
    return (
      <div style={{ minHeight: '100vh', background: '#f8f0ff', paddingBottom: '60px' }}>
        <div style={{ background: 'linear-gradient(160deg, #0d0521 0%, #4A1A6B 60%, #8B1A4A 100%)', padding: '40px 20px 32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <button onClick={() => setLang('bn')} style={{ padding: '5px 10px', background: lang === 'bn' ? '#FAD95A' : 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '12px', color: lang === 'bn' ? '#0d0521' : '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>বাং</button>
            <button onClick={() => setLang('en')} style={{ padding: '5px 10px', background: lang === 'en' ? '#FAD95A' : 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '12px', color: lang === 'en' ? '#0d0521' : '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>EN</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #8B1A4A, #C4523A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', border: '3px solid rgba(250,217,90,0.4)' }}>👩</div>
            <div style={{ fontSize: '24px' }}>❤️</div>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #0F5C42, #1a7a58)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', border: '3px solid rgba(250,217,90,0.4)' }}>👨</div>
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '26px', fontWeight: 900, color: '#FAD95A', fontFamily: 'Georgia, serif' }}>{lang === 'bn' ? 'পরিচিতি ফলাফল' : 'Porichiti Results'}</h1>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Georgia, serif', letterSpacing: '2px' }}>{results.myName} & {partnerName}</p>
          <div style={{ display: 'inline-block', background: 'rgba(250,217,90,0.1)', borderRadius: '20px', padding: '16px 32px', border: '2px solid rgba(250,217,90,0.3)' }}>
            <div style={{ fontSize: '48px', fontWeight: 900, color: '#FAD95A', fontFamily: 'Georgia, serif', lineHeight: 1 }}>{score}%</div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontFamily: 'Georgia, serif', marginTop: '4px' }}>{lang === 'bn' ? 'মিলে গেছে' : 'In Harmony'}</div>
          </div>
        </div>
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {results.matches.map((match: any, i: number) => {
            const m = MOMENTS[i]
            const matched = match.matched
            return (
              <div key={i} style={{ background: matched ? '#E8F8F0' : '#FDF0F5', borderRadius: '14px', padding: '14px 16px', border: `1px solid ${matched ? '#bbf7d0' : '#fecdd3'}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: matched ? '#0F5C42' : '#8B1A4A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '18px' }}>{m.choices[0].icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 800, color: matched ? '#0F5C42' : '#8B1A4A', fontFamily: 'Georgia, serif' }}>{lang === 'bn' ? m.chapter : m.chapterEn}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: matched ? '#2a7a58' : '#8B1A4A', fontFamily: 'Georgia, serif' }}>{matched ? (lang === 'bn' ? 'একই পথে হাঁটেন' : 'You walked the same path') : (lang === 'bn' ? 'কথা বলার সুযোগ' : 'A conversation to have')}</p>
                </div>
                <span style={{ fontSize: '20px' }}>{matched ? '✅' : '💬'}</span>
              </div>
            )
          })}
        </div>
        <div style={{ margin: '0 16px', background: '#0d0521', borderRadius: '16px', padding: '24px' }}>
          <div style={{ fontSize: '28px', color: '#4A1A6B', fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: '8px' }}>"</div>
          <p style={{ margin: '0 0 12px', fontSize: '15px', color: '#C9A0E8', fontFamily: 'Georgia, serif', lineHeight: 1.7, fontStyle: 'italic' }}>{lang === 'bn' ? results.aiSummaryBn : results.aiSummaryEn}</p>
          <p style={{ margin: 0, fontSize: '11px', color: '#4A1A6B', fontFamily: 'Georgia, serif' }}>✦ Biyekori AI</p>
        </div>
        <p style={{ textAlign: 'center', margin: '16px 0', fontSize: '12px', color: '#9a8aaa', fontFamily: 'Georgia, serif', letterSpacing: '1px' }}>biyekori.com</p>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link href="/messages" style={{ display: 'block', padding: '16px', background: 'linear-gradient(135deg, #0F5C42, #1a7a58)', borderRadius: '14px', color: 'white', fontWeight: 800, fontSize: '15px', textDecoration: 'none', textAlign: 'center', fontFamily: 'Georgia, serif' }}>{lang === 'bn' ? 'কথা শুরু করুন →' : 'Start the Conversation →'}</Link>
          <button onClick={() => { setPhase('landing'); setCurrentMoment(0); setAnswers([]); setResults(null) }} style={{ padding: '12px', background: 'none', border: '1px solid #ddd', borderRadius: '14px', color: '#9a8aaa', fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{lang === 'bn' ? 'আবার খেলুন' : 'Play Again'}</button>
        </div>
      </div>
    )
  }

  return null
}
