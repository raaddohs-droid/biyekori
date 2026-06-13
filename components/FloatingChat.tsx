'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const MAROON = '#7B1D2E'
const IVORY = '#FFFBF5'

export default function FloatingChat() {
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)
  const [sumaiyaTyping, setSumaiyaTyping] = useState(false)
  const hoverTimer = useRef<any>(null)
  const [messages, setMessages] = useState([{ from: 'them', text: 'Assalamu alaikum! 😊 Biyekori-te swagotom. Kono proshno thakle bolun.' }])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [msgCount, setMsgCount] = useState(0)
  const [ended, setEnded] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 8000)
    return () => clearTimeout(t)
  }, [])

  const handleHoverIn = () => {
    if (open) return
    setSumaiyaTyping(true)
    hoverTimer.current = setTimeout(() => setSumaiyaTyping(false), 2800)
  }
  const handleHoverOut = () => {
    clearTimeout(hoverTimer.current)
    setSumaiyaTyping(false)
  }

  async function sendMsg() {
    if (!input.trim() || isTyping || ended) return
    const userMsg = input.trim()
    const newCount = msgCount + 1
    setMsgCount(newCount)
    setInput('')
    const newMsgs = [...messages, { from: 'me', text: userMsg }]
    setMessages(newMsgs)
    setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, 50)
    if (newCount >= 8) {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'them', text: 'Biyekori-te join korun — bilkul free! 😊' }])
        setEnded(true)
      }, 800)
      return
    }
    setIsTyping(true)
    try {
      const msgs = newMsgs.slice(-6).map(m => ({ role: m.from === 'me' ? 'user' : 'assistant', content: m.text }))
      const res = await fetch('/api/helper-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: msgs, isHelper: true }) })
      const data = await res.json()
      setIsTyping(false)
      setMessages(prev => [...prev, { from: 'them', text: data.reply || 'Apnar katha shune valo laglo! 😊' }])
      setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, 50)
    } catch {
      setIsTyping(false)
      setMessages(prev => [...prev, { from: 'them', text: 'Apnar katha shune valo laglo! 😊' }])
    }
  }

  if (!visible) return null

  const bottomOffset = 'max(80px, calc(env(safe-area-inset-bottom, 0px) + 80px))'

  return (
    <>
      <style>{`
        @keyframes chatSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes bubblePop { 0%{transform:scale(0.8);} 70%{transform:scale(1.08);} 100%{transform:scale(1);} }
        @keyframes typingDot { 0%,60%,100%{transform:translateY(0);opacity:0.4;} 30%{transform:translateY(-5px);opacity:1;} }
        .bk-typing-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:${MAROON}; margin:0 2px; animation:typingDot 1.2s infinite; }
        .bk-typing-dot:nth-child(2){animation-delay:0.2s;}
        .bk-typing-dot:nth-child(3){animation-delay:0.4s;}
      `}</style>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: bottomOffset,
          right: '16px',
          zIndex: 998,
          width: 'min(320px, calc(100vw - 32px))',
          background: IVORY,
          borderRadius: '20px',
          border: `1px solid rgba(123,29,46,0.15)`,
          boxShadow: '0 8px 40px rgba(123,29,46,0.2)',
          overflow: 'hidden',
          animation: 'chatSlideUp 0.3s ease',
        }}>
          <div style={{ background: MAROON, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🌸</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'white' }}>Sumaiya</p>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Biyekori AI · Demo</p>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer', padding: '0', lineHeight: 1 }}>×</button>
          </div>
          <div ref={chatRef} style={{ height: '220px', overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'white' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                maxWidth: '85%', padding: '8px 12px',
                borderRadius: m.from === 'them' ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
                fontSize: '13px', lineHeight: 1.5,
                background: m.from === 'them' ? '#f8f0f2' : MAROON,
                color: m.from === 'them' ? '#1a0a0d' : 'white',
                alignSelf: m.from === 'them' ? 'flex-start' : 'flex-end',
              }}>{m.text}</div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 0' }}>
                <span className="bk-typing-dot" />
                <span className="bk-typing-dot" />
                <span className="bk-typing-dot" />
              </div>
            )}
          </div>
          <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(123,29,46,0.08)', background: IVORY }}>
            {!ended ? (
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMsg()}
                  placeholder="Ask anything..."
                  maxLength={200}
                  style={{ flex: 1, padding: '8px 12px', background: 'white', border: `1px solid rgba(123,29,46,0.2)`, borderRadius: '8px', color: '#1a0a0d', fontSize: '13px', outline: 'none' }}
                />
                <button onClick={sendMsg} disabled={isTyping} style={{ padding: '8px 14px', background: MAROON, border: 'none', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: isTyping ? 0.5 : 1 }}>↑</button>
              </div>
            ) : (
              <Link href="/register" style={{ display: 'block', padding: '10px', background: MAROON, borderRadius: '8px', color: '#F0C040', fontSize: '13px', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
                Join Free →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Typing bubble above button on hover */}
      {sumaiyaTyping && !open && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(max(80px, calc(env(safe-area-inset-bottom, 0px) + 80px)) + 64px)',
          right: '16px',
          zIndex: 997,
          background: 'white',
          borderRadius: '16px 16px 4px 16px',
          padding: '10px 14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          border: '1px solid #f0e0e4',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          animation: 'chatSlideUp 0.2s ease',
        }}>
          <span className="bk-typing-dot" />
          <span className="bk-typing-dot" />
          <span className="bk-typing-dot" />
          <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '4px' }}>Sumaiya is typing...</span>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={handleHoverIn}
        onMouseLeave={handleHoverOut}
        style={{
          position: 'fixed',
          bottom: bottomOffset,
          right: '16px',
          zIndex: 999,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: MAROON,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(123,29,46,0.4)',
          animation: open ? 'none' : 'bubblePop 0.4s ease',
        }}
        aria-label="Chat with Sumaiya"
      >
        {open
          ? <span style={{ fontSize: '20px', color: 'white' }}>×</span>
          : <span style={{ fontSize: '22px' }}>💬</span>
        }
        {!open && (
          <div style={{ position: 'absolute', top: '4px', right: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#F0C040', border: '2px solid white' }} />
        )}
      </button>
    </>
  )
}
