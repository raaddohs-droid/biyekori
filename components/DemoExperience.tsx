'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

export default function DemoExperience() {
  const [tab, setTab] = useState<'chat'|'call'|'game'>('chat')
  const [callState, setCallState] = useState<'idle'|'ringing'|'connected'|'ended'>('idle')
  const [messages, setMessages] = useState([{ from: 'them', text: 'Assalamu alaikum 😊' }])
  const [input, setInput] = useState('')
  const [msgCount, setMsgCount] = useState(0)
  const [chatEnded, setChatEnded] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [gamePick, setGamePick] = useState<string|null>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const startTime = useRef<number>(0)

  async function getAIReply(userMsg: string, history: {from:string,text:string}[]): Promise<string> {
    const msgs = history.slice(-8).map(m => ({ role: m.from==='me'?'user':'assistant', content: m.text }))
    msgs.push({ role: 'user', content: userMsg })
    try {
      const res = await fetch('/api/demo-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs })
      })
      const data = await res.json()
      return data.reply || 'Onek valo laglo! 😊'
    } catch {
      const fallbacks = [
        'Apni ki Dhaka te achen? Ami Dhanmondi te thaki. 😊',
        'Onek valo laglo! Apnar profession ki?',
        'Mashallah! Apnar family kemon achen?',
      ]
      return fallbacks[Math.floor(Math.random() * fallbacks.length)]
    }
  }

  function startCall() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    setCallState('ringing')
    setTimeout(() => {
      setCallState('connected')
      const lines = [
        'Hello, assalamu alaikum. Kemon achen apni?',
        'Ami Sumaiya bolchi. Apnar profile ta dekhlam, khub shundor laglo.',
        'Apni ki Dhaka te achen? Ami Dhanmondi te thaki.',
        'Biyekori te apnake pele khushi holam. Inshallah valo kichhu hobe.'
      ]
      const synth = window.speechSynthesis
      const voices = synth.getVoices()
      const voice = voices.find(v => v.lang.startsWith('bn')) || voices.find(v => v.lang.startsWith('hi')) || null
      let idx = 0
      function sayNext() {
        if (idx >= lines.length) { setTimeout(() => setCallState('ended'), 1500); return }
        synth.cancel()
        const utt = new SpeechSynthesisUtterance(lines[idx])
        utt.lang = 'bn-BD'; utt.rate = 0.82; utt.pitch = 1.1
        if (voice) utt.voice = voice
        idx++
        utt.onend = () => setTimeout(sayNext, 5000)
        synth.speak(utt)
      }
      sayNext()
    }, 2000)
  }

  async function sendMsg() {
    if (!input.trim() || isTyping || chatEnded) return
    if (!startTime.current) startTime.current = Date.now()
    const elapsed = Date.now() - startTime.current
    const userMsg = input.trim()
    const newCount = msgCount + 1
    setMsgCount(newCount)
    setInput('')
    const newMsgs = [...messages, { from: 'me', text: userMsg }]
    setMessages(newMsgs)
    setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, 50)
    if (elapsed > 60000 || newCount >= 6) {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'them', text: 'Apnar shathe kotha bole onek valo laglo! 😊 Jodi real profiles er shathe connect korte chan — Biyekori-te join korun free-te. Apnar jonno onek match ache inshallah!' }])
        setChatEnded(true)
      }, 800)
      return
    }
    setIsTyping(true)
    try {
      const reply = await getAIReply(userMsg, newMsgs)
      setIsTyping(false)
      setMessages(prev => [...prev, { from: 'them', text: reply }])
      setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, 50)
    } catch {
      setIsTyping(false)
      setMessages(prev => [...prev, { from: 'them', text: 'Apni ki Dhaka te achen? 😊' }])
    }
  }

  const LABELS: Record<string,string> = {
    home: 'A quiet day at home with family',
    nature: 'A walk in the park',
    social: 'Meeting friends for lunch',
    travel: 'A day trip somewhere new'
  }
  const SUMAIYA_PICK: Record<string,string> = { home:'home', nature:'nature', social:'home', travel:'nature' }
  const COMPAT: Record<string,Record<string,number>> = {
    home:{home:98,nature:72,social:55,travel:60},
    nature:{home:72,nature:95,social:65,travel:88},
    social:{home:55,nature:65,social:92,travel:70},
    travel:{home:60,nature:88,social:70,travel:97}
  }

  // Ivory + maroon design
  const BG = '#FFFBF5'
  const MAROON = '#7B1D2E'
  const MAROON_LIGHT = '#f8f0f2'
  const MAROON_BORDER = 'rgba(123,29,46,0.15)'
  const TEXT = '#1a0a0d'
  const TEXT_MUTED = 'rgba(26,10,13,0.5)'
  const GOLD = '#C07800'

  return (
    <div style={{ background: BG, borderRadius: '20px', padding: '28px 24px', maxWidth: '480px', margin: '0 auto', border: `1px solid ${MAROON_BORDER}`, boxShadow: '0 4px 32px rgba(123,29,46,0.08)' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <p style={{ margin: '0 0 6px', fontSize: '11px', color: MAROON, letterSpacing: '3px', fontFamily: 'system-ui', textTransform: 'uppercase', fontWeight: 600 }}>Live Demo — No login needed</p>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: TEXT, fontFamily: 'Georgia, serif', lineHeight: 1.2 }}>Meet Sumaiya</h3>
      </div>

      {/* Profile card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: MAROON_LIGHT, border: `1px solid ${MAROON_BORDER}`, borderRadius: '14px', padding: '14px 16px', marginBottom: '20px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: `linear-gradient(135deg,${MAROON},#9D174D)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, border: `2px solid ${MAROON_BORDER}` }}>🧕</div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 700, color: TEXT, fontFamily: 'Georgia, serif' }}>Sumaiya A., 26</p>
          <p style={{ margin: 0, fontSize: '12px', color: TEXT_MUTED, fontFamily: 'system-ui' }}>Teacher · Dhaka · Islam</p>
        </div>
        <div style={{ background: MAROON, borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, color: '#F0C040', border: '1px solid rgba(240,192,64,0.2)', whiteSpace: 'nowrap' }}>86% match</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: 'rgba(123,29,46,0.06)', borderRadius: '10px', padding: '4px' }}>
        {(['chat','call','game'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '9px 6px', borderRadius: '8px', border: 'none',
            background: tab===t ? 'white' : 'transparent',
            color: tab===t ? MAROON : TEXT_MUTED,
            fontSize: '13px', cursor: 'pointer', fontFamily: 'system-ui',
            fontWeight: tab===t ? 700 : 400,
            boxShadow: tab===t ? '0 1px 4px rgba(123,29,46,0.1)' : 'none',
            transition: 'all 0.2s'
          }}>
            {t==='chat' ? '💬 Chat' : t==='call' ? '📞 Call' : '🎮 Game'}
          </button>
        ))}
      </div>

      {/* CHAT TAB */}
      {tab==='chat' && (
        <div>
          <div ref={chatRef} style={{ height: '200px', overflowY: 'auto', padding: '12px', background: 'white', border: `1px solid ${MAROON_BORDER}`, borderRadius: '12px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                maxWidth: '80%', padding: '9px 13px',
                borderRadius: m.from==='them' ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
                fontSize: '14px', lineHeight: 1.55,
                background: m.from==='them' ? MAROON_LIGHT : MAROON,
                color: m.from==='them' ? TEXT : 'white',
                alignSelf: m.from==='them' ? 'flex-start' : 'flex-end',
                fontFamily: 'system-ui',
                border: m.from==='them' ? `1px solid ${MAROON_BORDER}` : 'none'
              }}>
                {m.text}
              </div>
            ))}
            {isTyping && <p style={{ margin: 0, fontSize: '12px', color: TEXT_MUTED, fontStyle: 'italic', fontFamily: 'system-ui' }}>Sumaiya is typing...</p>}
          </div>
          {!chatEnded ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key==='Enter' && sendMsg()}
                placeholder="Type a message..."
                maxLength={200}
                style={{ flex: 1, padding: '10px 14px', background: 'white', border: `1.5px solid ${MAROON_BORDER}`, borderRadius: '10px', color: TEXT, fontSize: '14px', fontFamily: 'system-ui', outline: 'none' }}
              />
              <button onClick={sendMsg} disabled={isTyping} style={{ padding: '10px 18px', background: MAROON, border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui', opacity: isTyping ? 0.5 : 1 }}>Send</button>
            </div>
          ) : (
            <Link href="/register" style={{ display: 'block', padding: '13px', background: MAROON, borderRadius: '10px', color: '#F0C040', fontSize: '14px', fontWeight: 700, textDecoration: 'none', textAlign: 'center', fontFamily: 'system-ui', letterSpacing: '1px' }}>
              Join Free — Talk to Real Profiles →
            </Link>
          )}
          <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '11px', color: TEXT_MUTED, fontFamily: 'system-ui' }}>AI demo · not a real profile</p>
        </div>
      )}

      {/* CALL TAB */}
      {tab==='call' && (
        <div>
          <div style={{ textAlign: 'center', padding: '16px', fontSize: '14px', color: TEXT_MUTED, fontFamily: 'system-ui', minHeight: '52px' }}>
            {callState==='idle' && 'Hear how Sumaiya speaks — click below'}
            {callState==='ringing' && '🔔 Calling Sumaiya...'}
            {callState==='connected' && '✅ Connected — Sumaiya is speaking'}
            {callState==='ended' && 'Call ended. Ready to find your real match?'}
          </div>
          {callState==='connected' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', height: '36px', alignItems: 'center', marginBottom: '14px' }}>
              <style>{`@keyframes wave{0%,100%{height:8px}50%{height:28px}}`}</style>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ width: '4px', background: MAROON, borderRadius: '2px', animation: `wave 1s ease-in-out ${i*0.1}s infinite` }} />
              ))}
            </div>
          )}
          {(callState==='idle' || callState==='ended') && (
            <button onClick={startCall} style={{ width: '100%', padding: '14px', background: MAROON, border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui' }}>
              {callState==='idle' ? '📞 Call Sumaiya' : '📞 Call Again'}
            </button>
          )}
          {callState==='ended' && (
            <Link href="/register" style={{ display: 'block', marginTop: '10px', padding: '13px', background: MAROON, borderRadius: '10px', color: '#F0C040', fontSize: '14px', fontWeight: 700, textDecoration: 'none', textAlign: 'center', fontFamily: 'system-ui', letterSpacing: '1px' }}>
              Join Free — Find Real Matches →
            </Link>
          )}
        </div>
      )}

      {/* GAME TAB */}
      {tab==='game' && (
        <div>
          <p style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 600, color: TEXT, fontFamily: 'Georgia, serif', lineHeight: 1.6 }}>You both have a free Sunday. What would you choose?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(LABELS).map(([key, label]) => (
              <button key={key} onClick={() => !gamePick && setGamePick(key)} style={{
                padding: '12px 16px',
                background: gamePick===key ? MAROON_LIGHT : 'white',
                border: `1.5px solid ${gamePick===key ? MAROON : MAROON_BORDER}`,
                borderRadius: '10px',
                color: gamePick && gamePick!==key ? TEXT_MUTED : TEXT,
                fontSize: '14px', cursor: gamePick ? 'default' : 'pointer',
                textAlign: 'left', fontFamily: 'system-ui', transition: 'all 0.2s',
                fontWeight: gamePick===key ? 600 : 400
              }}>
                {label}
              </button>
            ))}
          </div>
          {gamePick && (
            <div style={{ background: MAROON_LIGHT, border: `1px solid ${MAROON_BORDER}`, borderRadius: '12px', padding: '16px', marginTop: '14px', fontFamily: 'system-ui' }}>
              <p style={{ margin: '0 0 6px', fontSize: '13px', color: TEXT_MUTED }}><span style={{ color: MAROON, fontWeight: 700 }}>Sumaiya chose:</span> {LABELS[SUMAIYA_PICK[gamePick]]}</p>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: TEXT_MUTED }}><span style={{ color: MAROON, fontWeight: 700 }}>Compatibility:</span> <span style={{ fontSize: '24px', fontWeight: 800, color: MAROON }}>{COMPAT[gamePick][SUMAIYA_PICK[gamePick]]}%</span></p>
              <p style={{ margin: '0 0 14px', fontSize: '13px', color: TEXT_MUTED, lineHeight: 1.6 }}>11 more questions reveal how your lives fit together.</p>
              <Link href="/register" style={{ display: 'block', padding: '13px', background: MAROON, borderRadius: '10px', color: '#F0C040', fontSize: '14px', fontWeight: 700, textDecoration: 'none', textAlign: 'center', letterSpacing: '1px' }}>
                Join Free — Play the Full Game →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
