'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type Lang = 'bn' | 'en'

const MOMENTS = [
  {
    time: '০৬:০০', timeEn: '06:00',
    chapter: 'ভোর', chapterEn: 'Dawn',
    bg: ['#0d0521', '#6B1A4A', '#C4523A'],
    textBn: 'ভোর হলো। চোখ খুললেন।\nপ্রথমেই কী করেন?',
    textEn: 'Dawn arrives. Your eyes open.\nWhat do you reach for first?',
    choices: [
      { bn: 'ফজরের নামাজ', en: 'Fajr prayer', color: '#0F5C42', icon: '🕌' },
      { bn: 'ফোনটা দেখি', en: 'Check my phone', color: '#4A1A6B', icon: '📱' },
      { bn: 'একটু শুয়ে থাকি', en: 'Stay in bed', color: '#8B4A0A', icon: '🌙' },
      { bn: 'চুপচাপ শুরু করি', en: 'Quiet start', color: '#8B1A4A', icon: '☕' },
    ]
  },
  {
    time: '০৮:০০', timeEn: '08:00',
    chapter: 'সকাল', chapterEn: 'Morning',
    bg: ['#1a0a2e', '#8B3A2A', '#E8824A'],
    textBn: 'সকালের নাস্তা।\nপাশে কে থাকে?',
    textEn: 'Breakfast time.\nWho is around you?',
    choices: [
      { bn: 'পরিবার একসাথে', en: 'Family together', color: '#0F5C42', icon: '👨‍👩‍👧' },
      { bn: 'একা, চুপচাপ', en: 'Just me, quietly', color: '#4A1A6B', icon: '🧘' },
      { bn: 'যে আছে তার সাথে', en: 'Whoever is home', color: '#8B4A0A', icon: '🏠' },
      { bn: 'নাস্তা বাদ দিই', en: 'Skip breakfast', color: '#8B1A4A', icon: '⏰' },
    ]
  },
  {
    time: '১২:০০', timeEn: '12:00',
    chapter: 'দুপুর', chapterEn: 'Noon',
    bg: ['#1a3a1a', '#2A6A2A', '#5AAA5A'],
    textBn: 'শুক্রবার দুপুর। আজান পড়ল।\nআপনি কোথায়?',
    textEn: 'Friday noon. The azaan calls.\nWhere are you?',
    choices: [
      { bn: 'মসজিদে', en: 'At the mosque', color: '#0F5C42', icon: '🕌' },
      { bn: 'বাড়িতে নামাজে', en: 'Praying at home', color: '#4A1A6B', icon: '🤲' },
      { bn: 'যাচ্ছি', en: 'On my way', color: '#8B4A0A', icon: '🚶' },
      { bn: 'বিশ্রামে', en: 'Resting', color: '#8B1A4A', icon: '😌' },
    ]
  },
  {
    time: '১৫:০০', timeEn: '15:00',
    chapter: 'বিকেল', chapterEn: 'Afternoon',
    bg: ['#2a1a0a', '#8B5A0A', '#F0A030'],
    textBn: 'বিকেলটা একদম ফাঁকা।\nমন কী চায়?',
    textEn: 'A free afternoon, no plans.\nWhat does your heart want?',
    choices: [
      { bn: 'আত্মীয়দের কাছে যাই', en: 'Visit family', color: '#0F5C42', icon: '👨‍👩‍👧' },
      { bn: 'বই পড়ি', en: 'Read or learn', color: '#4A1A6B', icon: '📚' },
      { bn: 'বাইরে হাঁটি', en: 'Fresh air walk', color: '#8B4A0A', icon: '🌿' },
      { bn: 'বিশ্রাম নিই', en: 'Rest at home', color: '#8B1A4A', icon: '🛋️' },
    ]
  },
  {
    time: '১৮:০০', timeEn: '18:00',
    chapter: 'সন্ধ্যা', chapterEn: 'Evening',
    bg: ['#0d0521', '#6B1A4A', '#C4523A'],
    textBn: 'সন্ধ্যায় মা ফোন করলেন।\nকতক্ষণ কথা বললেন?',
    textEn: 'Evening. Your mother calls.\nHow long do you talk?',
    choices: [
      { bn: 'যতক্ষণ মা চান', en: 'As long as she wants', color: '#0F5C42', icon: '💕' },
      { bn: 'দশ-পনেরো মিনিট', en: '10-15 minutes', color: '#4A1A6B', icon: '⏱️' },
      { bn: 'অল্প কথা', en: 'Quick check-in', color: '#8B4A0A', icon: '📞' },
      { bn: 'পরে কল করব', en: 'Call back later', color: '#8B1A4A', icon: '🔄' },
    ]
  },
  {
    time: '২০:০০', timeEn: '20:00',
    chapter: 'রাতের খাবার', chapterEn: 'Dinner',
    bg: ['#0a1a2a', '#1A3A6B', '#3A6AC4'],
    textBn: 'ভবিষ্যতের সংসারের কথা ভাবুন।\nরাতের খাবারে কেমন দৃশ্য?',
    textEn: 'Imagine your future home.\nWhat does dinner look like?',
    choices: [
      { bn: 'সবাই একসাথে', en: 'Everyone together', color: '#0F5C42', icon: '🍽️' },
      { bn: 'আমরা দুজন', en: 'Just us two', color: '#4A1A6B', icon: '🕯️' },
      { bn: 'শ্বশুরবাড়ির সাথে', en: 'With in-laws', color: '#8B4A0A', icon: '🏡' },
      { bn: 'দিন বুঝে হয়', en: 'Flexible', color: '#8B1A4A', icon: '✨' },
    ]
  },
  {
    time: '২১:০০', timeEn: '21:00',
    chapter: 'রাত', chapterEn: 'Night',
    bg: ['#0d0521', '#1A0A4A', '#3A1A8B'],
    textBn: 'সঙ্গী আজ কেমন চুপচাপ।\nআপনি কী করেন?',
    textEn: 'Your partner is unusually quiet.\nWhat do you do?',
    choices: [
      { bn: 'আলতো জিজ্ঞেস করি', en: 'Gently ask', color: '#0F5C42', icon: '💬' },
      { bn: 'একটু সময় দিই', en: 'Give space', color: '#4A1A6B', icon: '🌿' },
      { bn: 'মন ভালো করার চেষ্টা', en: 'Cheer them up', color: '#8B4A0A', icon: '😊' },
      { bn: 'নিজে বলবে অপেক্ষা', en: 'Wait for them', color: '#8B1A4A', icon: '🕰️' },
    ]
  },
  {
    time: '২২:০০', timeEn: '22:00',
    chapter: 'রাত ১০টা', chapterEn: 'Late Night',
    bg: ['#0a0a1a', '#1A1A4A', '#2A2A8B'],
    textBn: 'একটা ছোট কথায় মন খারাপ হলো।\nকী করেন?',
    textEn: 'A small thing was said that stung.\nWhat do you do?',
    choices: [
      { bn: 'এখনই বলে ফেলি', en: 'Talk right now', color: '#0F5C42', icon: '💭' },
      { bn: 'আজকের মতো ছেড়ে দিই', en: 'Let it go tonight', color: '#4A1A6B', icon: '🌙' },
      { bn: 'একা ভাবি', en: 'Think alone first', color: '#8B4A0A', icon: '🤔' },
      { bn: 'বড়দের সাথে কথা', en: 'Seek elder advice', color: '#8B1A4A', icon: '👴' },
    ]
  },
  {
    time: '২৩:০০', timeEn: '23:00',
    chapter: 'রাত ১১টা', chapterEn: 'Bedtime',
    bg: ['#050510', '#0A0A2A', '#1A1A4A'],
    textBn: 'ঘুমানোর আগে ভবিষ্যৎ দেখছেন।\nকেমন ছবি ভাসে?',
    textEn: 'Before sleep, you see the future.\nWhat do you see?',
    choices: [
      { bn: 'একটা শান্তির সংসার', en: 'A peaceful home', color: '#0F5C42', icon: '🏡' },
      { bn: 'সন্তান আর পরিবার', en: 'Children and family', color: '#4A1A6B', icon: '👨‍👩‍👧' },
      { bn: 'সাফল্য আর স্থিরতা', en: 'Success and stability', color: '#8B4A0A', icon: '⭐' },
      { bn: 'শুধু সুখ', en: 'Just happiness', color: '#8B1A4A', icon: '✨' },
    ]
  },
  {
    time: '২৩:৩০', timeEn: '23:30',
    chapter: 'মধ্যরাতের আগে', chapterEn: 'Almost Midnight',
    bg: ['#030308', '#08081A', '#10102A'],
    textBn: 'সঙ্গীর কাছে একটাই চাওয়া।\nসেটা কী?',
    textEn: 'One thing you need most\nfrom your life partner.',
    choices: [
      { bn: 'বোঝাপড়া', en: 'Understanding', color: '#0F5C42', icon: '🤝' },
      { bn: 'সম্মান', en: 'Respect', color: '#4A1A6B', icon: '👑' },
      { bn: 'বিশ্বস্ততা', en: 'Loyalty', color: '#8B4A0A', icon: '💎' },
      { bn: 'হাসি আর হালকা মন', en: 'Laughter and lightness', color: '#8B1A4A', icon: '😄' },
    ]
  },
  {
    time: '০০:০০', timeEn: '00:00',
    chapter: 'মধ্যরাত', chapterEn: 'Midnight',
    bg: ['#020205', '#05050F', '#0A0A1A'],
    textBn: 'বিয়ের পর পরিবারের সিদ্ধান্ত কীভাবে নেবেন?',
    textEn: 'After marriage, how will big decisions be made?',
    choices: [
      { bn: 'দুজনে মিলে', en: 'Together equally', color: '#0F5C42', icon: '🤝' },
      { bn: 'পরামর্শ করে', en: 'After discussion', color: '#4A1A6B', icon: '💬' },
      { bn: 'পরিবার সবাই মিলে', en: 'Family council', color: '#8B4A0A', icon: '👨‍👩‍👧' },
      { bn: 'পরিস্থিতি বুঝে', en: 'Case by case', color: '#8B1A4A', icon: '⚖️' },
    ]
  },
  {
    time: '০০:৩০', timeEn: '00:30',
    chapter: 'রাতের শেষে', chapterEn: 'End of Day',
    bg: ['#020205', '#030310', '#050515'],
    textBn: 'একটি কথায় আপনার স্বপ্নের জীবন।',
    textEn: 'One word for your dream life.',
    choices: [
      { bn: 'শান্তি', en: 'Peace', color: '#0F5C42', icon: '🕊️' },
      { bn: 'ভালোবাসা', en: 'Love', color: '#8B1A4A', icon: '❤️' },
      { bn: 'সমৃদ্ধি', en: 'Prosperity', color: '#8B4A0A', icon: '🌟' },
      { bn: 'বরকত', en: 'Blessing', color: '#4A1A6B', icon: '🤲' },
    ]
  },
]

const CHAPTER_NAMES_BN = ['ভোর','সকাল','দুপুর','বিকেল','সন্ধ্যা','রাতের খাবার','রাত','রাত ১০টা','রাত ১১টা','মধ্যরাতের আগে','মধ্যরাত','রাতের শেষে']
const CHAPTER_NAMES_EN = ['Dawn','Morning','Noon','Afternoon','Evening','Dinner','Night','Late Night','Bedtime','Almost Midnight','Midnight','End of Day']

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
  const pollRef = useRef<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('biyekori_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const startGame = async () => {
    if (!user) return
    const res = await fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', userId: user.id, partnerId })
    })
    const data = await res.json()
    if (data.success) {
      setGameId(data.game.id)
      setPhase('playing')
    }
  }

  const handleChoice = async (choiceIdx: number) => {
    if (selectedChoice !== null || animating) return
    setSelectedChoice(choiceIdx)
    setAnimating(true)

    // Save answer
    if (gameId && user) {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'answer',
          userId: user.id,
          gameId,
          momentIndex: currentMoment,
          choiceIndex: choiceIdx
        })
      })
    }

    const newAnswers = [...answers, choiceIdx]
    setAnswers(newAnswers)

    setTimeout(() => {
      setAnimating(false)
      setSelectedChoice(null)
      if (currentMoment + 1 >= MOMENTS.length) {
        setPhase('waiting')
        startPolling(newAnswers)
      } else {
        setCurrentMoment(currentMoment + 1)
      }
    }, 800)
  }

  const startPolling = (myAnswers: number[]) => {
    pollRef.current = setInterval(async () => {
      if (!gameId || !user) return
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', userId: user.id, partnerId, gameId })
      })
      const data = await res.json()
      setPartnerCount(data.partnerCount || 0)
      if (data.partnerCount >= 12) {
        clearInterval(pollRef.current)
        loadResults()
      }
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
    if (data.success) {
      setResults(data)
      setPhase('results')
    }
  }

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  const moment = MOMENTS[currentMoment]
  const progress = (currentMoment / MOMENTS.length) * 100
  const skyBg = moment?.bg || ['#0d0521', '#4A1A6B', '#8B1A4A']

  // ── LANDING ──
  if (phase === 'landing') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0d0521 0%, #4A1A6B 50%, #8B1A4A 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          {/* Stars */}
          <div style={{ fontSize: '32px', marginBottom: '24px', letterSpacing: '8px' }}>✦ ✦ ✦</div>
          <h1 style={{ margin: '0 0 8px', fontSize: '32px', fontWeight: 900, color: '#FAD95A', fontFamily: 'Georgia, serif' }}>
            {lang === 'bn' ? 'একটি দিন একসাথে' : 'A Day Together'}
          </h1>
          <p style={{ margin: '0 0 32px', fontSize: '16px', color: 'rgba(255,255,255,0.7)', fontFamily: 'Georgia, serif', lineHeight: 1.7 }}>
            {lang === 'bn'
              ? `আপনি এবং ${partnerName} — একই দিনটি আলাদাভাবে বাঁচবেন। তারপর দেখবেন কতটা মিলল।`
              : `You and ${partnerName} will each live the same day — separately, honestly. Then see how your days aligned.`}
          </p>

          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', marginBottom: '28px', textAlign: 'left' }}>
            {[
              { icon: '🔒', bn: '১২টি মুহূর্ত — একা একা উত্তর দিন', en: '12 moments — answered alone, in private' },
              { icon: '✨', bn: 'দুজনেই শেষ না করা পর্যন্ত কিছু দেখা যাবে না', en: 'Nothing revealed until both finish' },
              { icon: '💬', bn: 'ফলাফল হবে কথা শুরুর সুযোগ', en: 'Results become your first real conversation' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: i < 2 ? '14px' : 0 }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontFamily: 'Georgia, serif', lineHeight: 1.5 }}>
                  {lang === 'bn' ? item.bn : item.en}
                </p>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(250,217,90,0.1)', borderRadius: '12px', padding: '14px', marginBottom: '28px', border: '1px solid rgba(250,217,90,0.2)' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#FAD95A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6 }}>
              {lang === 'bn'
                ? '"এখানে ভুল বা সঠিক নেই। শুধু সৎ উত্তর দিন।"'
                : '"There is no right or wrong answer here. Only honest ones."'}
            </p>
          </div>

          <button onClick={startGame} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #C4523A, #8B1A4A)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '17px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Georgia, serif', marginBottom: '16px' }}>
            {lang === 'bn' ? 'শুরু করুন →' : 'Begin the Journey →'}
          </button>

          {/* Language toggle */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button onClick={() => setLang('bn')} style={{ padding: '8px 20px', background: lang === 'bn' ? '#FAD95A' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '20px', color: lang === 'bn' ? '#0d0521' : '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>বাংলা</button>
            <button onClick={() => setLang('en')} style={{ padding: '8px 20px', background: lang === 'en' ? '#FAD95A' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '20px', color: lang === 'en' ? '#0d0521' : '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>English</button>
          </div>
        </div>
      </div>
    )
  }

  // ── PLAYING ──
  if (phase === 'playing') {
    const lines = (lang === 'bn' ? moment.textBn : moment.textEn).split('\n')
    return (
      <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${skyBg[0]} 0%, ${skyBg[1]} 50%, ${skyBg[2]} 100%)`, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '20px', padding: '6px 14px' }}>
            <span style={{ fontSize: '14px', color: '#FAD95A', fontFamily: 'Georgia, serif', fontWeight: 700 }}>
              {lang === 'bn' ? moment.time : moment.timeEn}
            </span>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '20px', padding: '6px 14px' }}>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontFamily: 'Georgia, serif' }}>
              {lang === 'bn' ? moment.chapter : moment.chapterEn}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setLang('bn')} style={{ padding: '5px 10px', background: lang === 'bn' ? '#FAD95A' : 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '12px', color: lang === 'bn' ? '#0d0521' : '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>বাং</button>
            <button onClick={() => setLang('en')} style={{ padding: '5px 10px', background: lang === 'en' ? '#FAD95A' : 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '12px', color: lang === 'en' ? '#0d0521' : '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>EN</button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#FAD95A', borderRadius: '2px', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Georgia, serif' }}>
              {lang === 'bn' ? 'ভোর' : 'Dawn'}
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontFamily: 'Georgia, serif' }}>
              {currentMoment + 1} / {MOMENTS.length}
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Georgia, serif' }}>
              {lang === 'bn' ? 'মধ্যরাত' : 'Midnight'}
            </span>
          </div>
        </div>

        {/* Moment text */}
        <div style={{ padding: '24px 20px 20px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {lines.map((line, i) => (
              <p key={i} style={{ margin: i === 0 ? '0 0 8px' : '0', fontSize: i === 0 ? '24px' : '16px', fontWeight: i === 0 ? 900 : 400, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.7)', fontFamily: 'Georgia, serif', lineHeight: 1.4 }}>
                {line}
              </p>
            ))}
          </div>

          {/* 2x2 Choice grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
            {moment.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleChoice(idx)}
                disabled={selectedChoice !== null}
                style={{
                  padding: '20px 12px',
                  background: selectedChoice === idx ? '#FAD95A' : choice.color,
                  border: selectedChoice === idx ? '3px solid #FAD95A' : '2px solid rgba(255,255,255,0.15)',
                  borderRadius: '16px',
                  cursor: selectedChoice !== null ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                  transform: selectedChoice === idx ? 'scale(1.05)' : 'scale(1)',
                  opacity: selectedChoice !== null && selectedChoice !== idx ? 0.5 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '32px' }}>{choice.icon}</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: selectedChoice === idx ? '#0d0521' : '#fff', fontFamily: 'Georgia, serif', lineHeight: 1.3 }}>
                  {lang === 'bn' ? choice.bn : choice.en}
                </span>
              </button>
            ))}
          </div>

          {/* Partner status */}
          <div style={{ marginTop: '20px', padding: '10px 16px', background: 'rgba(0,0,0,0.25)', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E91E8C' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontFamily: 'Georgia, serif' }}>
              {lang === 'bn'
                ? `${partnerName} এখন খেলছেন`
                : `${partnerName} is also playing`}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // ── WAITING ──
  if (phase === 'waiting') {
    const chapterIdx = Math.min(partnerCount, 11)
    const chapterName = lang === 'bn' ? CHAPTER_NAMES_BN[chapterIdx] : CHAPTER_NAMES_EN[chapterIdx]
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0d0521 0%, #1A0A4A 50%, #0A0A2A 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '380px', width: '100%' }}>
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>🌙</div>
          <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 900, color: '#FAD95A', fontFamily: 'Georgia, serif' }}>
            {lang === 'bn' ? 'আপনার উত্তর সিল করা হয়েছে' : 'Your answers are sealed'}
          </h2>
          <p style={{ margin: '0 0 32px', fontSize: '15px', color: 'rgba(255,255,255,0.7)', fontFamily: 'Georgia, serif', lineHeight: 1.7 }}>
            {lang === 'bn'
              ? `${partnerName} এখনও তাদের দিন কাটাচ্ছেন...`
              : `${partnerName} is still living their day...`}
          </p>

          {/* Partner progress */}
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E91E8C', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontFamily: 'Georgia, serif' }}>
                {partnerName} {lang === 'bn' ? `— ${chapterName} অধ্যায়ে আছেন` : `— in the ${chapterName} chapter`}
              </span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
              <div style={{ height: '100%', width: `${(partnerCount / 12) * 100}%`, background: 'linear-gradient(90deg, #E91E8C, #FAD95A)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Georgia, serif' }}>{lang === 'bn' ? 'ভোর' : 'Dawn'}</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Georgia, serif' }}>{partnerCount} / 12</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Georgia, serif' }}>{lang === 'bn' ? 'মধ্যরাত' : 'Midnight'}</span>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            {lang === 'bn' ? 'সম্পন্ন হলেই ফলাফল দেখা যাবে' : 'Results will appear when they finish'}
          </p>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      </div>
    )
  }

  // ── RESULTS ──
  if (phase === 'results' && results) {
    const score = results.score
    const getChapterColor = (matched: boolean) => matched ? '#0F5C42' : '#8B1A4A'
    const getChapterBg = (matched: boolean) => matched ? '#E8F8F0' : '#FDF0F5'

    return (
      <div style={{ minHeight: '100vh', background: '#f8f0ff', paddingTop: '0', paddingBottom: '60px' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(160deg, #0d0521 0%, #4A1A6B 60%, #8B1A4A 100%)', padding: '40px 20px 32px', textAlign: 'center' }}>
          {/* Logo placeholder */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ width: '80px', height: '28px', border: '1px dashed rgba(250,217,90,0.3)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '9px', color: 'rgba(250,217,90,0.4)', fontFamily: 'Georgia, serif' }}>LOGO</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setLang('bn')} style={{ padding: '5px 10px', background: lang === 'bn' ? '#FAD95A' : 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '12px', color: lang === 'bn' ? '#0d0521' : '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>বাং</button>
              <button onClick={() => setLang('en')} style={{ padding: '5px 10px', background: lang === 'en' ? '#FAD95A' : 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '12px', color: lang === 'en' ? '#0d0521' : '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>EN</button>
            </div>
          </div>

          {/* Two avatars */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #8B1A4A, #C4523A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', border: '3px solid rgba(250,217,90,0.4)' }}>
              👩
            </div>
            <div style={{ fontSize: '24px' }}>❤️</div>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #0F5C42, #1a7a58)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', border: '3px solid rgba(250,217,90,0.4)' }}>
              👨
            </div>
          </div>

          <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 900, color: '#FAD95A', fontFamily: 'Georgia, serif' }}>
            {lang === 'bn' ? 'আপনাদের একটি দিন' : 'Your Day Together'}
          </h1>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Georgia, serif', letterSpacing: '2px' }}>
            {results.myName} & {partnerName}
          </p>

          {/* Score */}
          <div style={{ display: 'inline-block', background: 'rgba(250,217,90,0.1)', borderRadius: '20px', padding: '16px 32px', border: '2px solid rgba(250,217,90,0.3)' }}>
            <div style={{ fontSize: '48px', fontWeight: 900, color: '#FAD95A', fontFamily: 'Georgia, serif', lineHeight: 1 }}>{score}%</div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontFamily: 'Georgia, serif', marginTop: '4px' }}>
              {lang === 'bn' ? 'মিলে গেছে' : 'In Harmony'}
            </div>
          </div>
        </div>

        {/* Chapter results */}
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {results.matches.map((match: any, i: number) => {
            const m = MOMENTS[i]
            const matched = match.matched
            return (
              <div key={i} style={{ background: getChapterBg(matched), borderRadius: '14px', padding: '14px 16px', border: `1px solid ${matched ? '#bbf7d0' : '#fecdd3'}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: getChapterColor(matched), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '9px', color: '#fff', fontFamily: 'Georgia, serif', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
                    {lang === 'bn' ? m.time : m.timeEn}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 800, color: getChapterColor(matched), fontFamily: 'Georgia, serif' }}>
                    {lang === 'bn' ? m.chapter : m.chapterEn}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: matched ? '#2a7a58' : '#8B1A4A', fontFamily: 'Georgia, serif' }}>
                    {matched
                      ? (lang === 'bn' ? 'একই পথে হাঁটেন' : 'You walked the same path')
                      : (lang === 'bn' ? 'কথা বলার সুযোগ' : 'A conversation to have')}
                  </p>
                </div>
                <span style={{ fontSize: '20px' }}>{matched ? '✅' : '💬'}</span>
              </div>
            )
          })}
        </div>

        {/* AI Summary */}
        <div style={{ margin: '0 16px', background: '#0d0521', borderRadius: '16px', padding: '24px' }}>
          <div style={{ fontSize: '28px', color: '#4A1A6B', fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: '8px' }}>"</div>
          <p style={{ margin: '0 0 12px', fontSize: '15px', color: '#C9A0E8', fontFamily: 'Georgia, serif', lineHeight: 1.7, fontStyle: 'italic' }}>
            {lang === 'bn' ? results.aiSummaryBn : results.aiSummaryEn}
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: '#4A1A6B', fontFamily: 'Georgia, serif' }}>✦ Biyekori AI</p>
        </div>

        {/* Watermark */}
        <p style={{ textAlign: 'center', margin: '16px 0', fontSize: '12px', color: '#9a8aaa', fontFamily: 'Georgia, serif', letterSpacing: '1px' }}>
          biyekori.com
        </p>

        {/* Action buttons */}
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link href={`/messages`} style={{ display: 'block', padding: '16px', background: 'linear-gradient(135deg, #0F5C42, #1a7a58)', borderRadius: '14px', color: 'white', fontWeight: 800, fontSize: '15px', textDecoration: 'none', textAlign: 'center', fontFamily: 'Georgia, serif' }}>
            {lang === 'bn' ? 'কথা শুরু করুন →' : 'Start the Conversation →'}
          </Link>
          <button style={{ padding: '14px', background: 'linear-gradient(135deg, #C4523A, #8B1A4A)', border: 'none', borderRadius: '14px', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
            {lang === 'bn' ? 'পরিবারের সাথে শেয়ার করুন' : 'Share with Family'}
          </button>
          <button onClick={() => { setPhase('landing'); setCurrentMoment(0); setAnswers([]); setResults(null) }} style={{ padding: '12px', background: 'none', border: '1px solid #ddd', borderRadius: '14px', color: '#9a8aaa', fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
            {lang === 'bn' ? 'আবার খেলুন' : 'Play Again'}
          </button>
        </div>
      </div>
    )
  }

  return null
}
