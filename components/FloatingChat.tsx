'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const MAROON = '#7B1D2E'
const IVORY = '#FFFBF5'

export default function FloatingChat() {
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ from: 'them', text: 'Assalamu alaikum 😊 Biyekori-te swagotom! Kono proshno ache?' }])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [msgCount, setMsgCount] = useState(0)
  const [ended, setEnded] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  // Show bubble after 45 seconds
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 45000)
    return () => clearTimeout(t)
  }, [])

  async function sendMsg() {
    if (!input.trim() || isTyping || ended) return
    const userMsg = input.trim()
    const newCount = msgCount + 1
    setMsgCount(newCount)
    setInput('')
    const newMsgs = [...messages, { from: 'me', text: userMsg }]
    setMessages(newMsgs)
    setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, 50)

    if (newCount >= 5) {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'them', text: 'Apnar shathe kotha bole onek valo laglo! 😊 Join korun free-te — real profiles er shathe connect korun. Inshallah apnar jonno keu ache!' }])
        setEnded(true)
      }, 800)
      return
    }

    setIsTyping(true)
    try {
      const msgs = newMsgs.slice(-6).map(m => ({ role: m.from === 'me' ? 'user' : 'assistant', content: m.text }))
      const res = await fetch('/api/demo-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: msgs }) })
      const data = await res.json()
      setIsTyping(false)
      setMessages(prev => [...prev, { from: 'them', text: data.reply || 'Apni ki Dhaka te achen? 😊' }])
      setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, 50)
    } catch {
      setIsTyping(false)
      setMessages(prev => [...prev, { from: 'them', text: 'Apnar katha shune valo laglo! 😊' }])
    }
  }

  if (!visible) return null

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '90px', right: '24px', zIndex: 998,
          width: '320px', maxWidth: 'calc(100vw - 48px)',
          background: IVORY, borderRadius: '20px',
          border: `1px solid rgba(123,29,46,0.15)`,
          boxShadow: '0 8px 40px rgba(123,29,46,0.15)',
          overflow: 'hidden',
          animation: 'chatSlideUp 0.3s ease',
        }}>
          {/* Header */}
          <div style={{ background: MAROON, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🧕</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'white', fontFamily: 'Georgia, serif' }}>Sumaiya</p>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontFamily: 'system-ui' }}>Biyekori AI · Demo</p>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '18px', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}>×</button>
          </div>

          {/* Messages */}
          <div ref={chatRef} style={{ height: '220px', overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'white' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                maxWidth: '85%', padding: '8px 12px',
                borderRadius: m.from === 'them' ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
                fontSize: '13px', lineHeight: 1.5,
                background: m.from === 'them' ? '#f8f0f2' : MAROON,
                color: m.from === 'them' ? '#1a0a0d' : 'white',
                alignSelf: m.from === 'them' ? 'flex-start' : 'flex-end',
                fontFamily: 'Hind Siliguri, system-ui, sans-serif',
                border: m.from === 'them' ? '1px solid rgba(123,29,46,0.1)' : 'none'
              }}>{m.text}</div>
            ))}
            {isTyping && <p style={{ margin: 0, fontSize: '12px', color: 'rgba(26,10,13,0.4)', fontStyle: 'italic', fontFamily: 'system-ui' }}>Sumaiya is typing...</p>}
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(123,29,46,0.08)', background: IVORY }}>
            {!ended ? (
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMsg()}
                  placeholder="Message..."
                  maxLength={200}
                  style={{ flex: 1, padding: '8px 12px', background: 'white', border: `1px solid rgba(123,29,46,0.2)`, borderRadius: '8px', color: '#1a0a0d', fontSize: '13px', fontFamily: 'system-ui', outline: 'none' }}
                />
                <button onClick={sendMsg} disabled={isTyping} style={{ padding: '8px 14px', background: MAROON, border: 'none', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: isTyping ? 0.5 : 1 }}>↑</button>
              </div>
            ) : (
              <Link href="/register" style={{ display: 'block', padding: '10px', background: MAROON, borderRadius: '8px', color: '#F0C040', fontSize: '13px', fontWeight: 700, textDecoration: 'none', textAlign: 'center', fontFamily: 'system-ui' }}>
                Join Free →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Floating bubble */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 999,
          width: '56px', height: '56px', borderRadius: '50%',
          background: MAROON, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(123,29,46,0.35)',
          animation: open ? 'none' : 'bubblePop 0.4s ease',
          transition: 'transform 0.2s',
        }}
        aria-label="Chat with Sumaiya"
      >
        {open
          ? <span style={{ fontSize: '20px', color: 'white' }}>×</span>
          : <span style={{ fontSize: '22px' }}>💬</span>
        }
        {/* Notification dot */}
        {!open && (
          <div style={{ position: 'absolute', top: '4px', right: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#F0C040', border: '2px solid white' }} />
        )}
      </button>

      <style>{`
        @keyframes chatSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bubblePop { 0% { transform: scale(0); } 70% { transform: scale(1.1); } 100% { transform: scale(1); } }
      `}</style>
    </>
  )
}
