'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

export default function DemoExperience() {
  const [tab, setTab] = useState<'call'|'chat'|'game'>('call')
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
        'Apni ki travel korte pochen? Ami photography o travel love kori!',
      ]
      return fallbacks[Math.floor(Math.random() * fallbacks.length)]
    }
  }

  function startCall() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    setCallState('ringing')
    setTimeout(() => {
      setCallState('connected')
      const audio = new Audio('/demo-call.mp3')
      audio.onerror = () => {
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
          if (idx >= lines.length) {
            setTimeout(() => setCallState('ended'), 1500)
            return
          }
          synth.cancel()
          const utt = new SpeechSynthesisUtterance(lines[idx])
          utt.lang = 'bn-BD'
          utt.rate = 0.82
          utt.pitch = 1.1
          if (voice) utt.voice = voice
          idx++
          utt.onend = () => setTimeout(sayNext, 6000)
          synth.speak(utt)
        }
        sayNext()
      }
      audio.onended = () => setCallState('ended')
      audio.play().catch(() => audio.onerror?.(new Event('error')))
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
        setMessages(prev => [...prev, { from: 'them', text: "Apnar shathe kotha bole onek valo laglo! 😊 Jodi real profiles er shathe connect korte chan — Biyekori-te join korun free-te. Apnar jonno onek match ache inshallah!" }])
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
    home: '🏠 A quiet day at home with family',
    nature: '🌿 A walk in the park',
    social: '👥 Meeting friends for lunch',
    travel: '🗺️ A day trip somewhere new'
  }
  const SUMAIYA_PICK: Record<string,string> = { home:'home', nature:'nature', social:'home', travel:'nature' }
  const COMPAT: Record<string,Record<string,number>> = {
    home:{home:98,nature:72,social:55,travel:60},
    nature:{home:72,nature:95,social:65,travel:88},
    social:{home:55,nature:65,social:92,travel:70},
    travel:{home:60,nature:88,social:70,travel:97}
  }

  const tabStyle = (t: string): React.CSSProperties => ({
    flex: 1, padding: '10px 6px', borderRadius: '8px',
    border: `1px solid ${tab===t ? 'rgba(240,192,64,0.5)' : 'rgba(240,192,64,0.15)'}`,
    background: tab===t ? 'rgba(240,192,64,0.1)' : 'transparent',
    color: tab===t ? '#F0C040' : 'rgba(253,246,238,0.5)',
    fontSize: '12px', cursor: 'pointer', fontFamily: 'system-ui',
    fontWeight: tab===t ? 600 : 400, transition: 'all 0.2s'
  })

  return (
    <div style={{ background:'#1a0a0d', borderRadius:'20px', padding:'24px', color:'#FDF6EE', maxWidth:'480px', margin:'0 auto', border:'1px solid rgba(240,192,64,0.15)' }}>
      <div style={{ textAlign:'center', marginBottom:'20px' }}>
        <div style={{ fontSize:'12px', color:'rgba(240,192,64,0.85)', letterSpacing:'2px', marginBottom:'6px', fontFamily:'system-ui', fontWeight:600 }}>LIVE DEMO · NO LOGIN NEEDED</div>
        <div style={{ fontSize:'17px', fontWeight:600 }}>Experience Biyekori right now</div>
      </div>
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
        {(['call','chat','game'] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} style={tabStyle(t)}>
            {t==='call'?'📞 Call':t==='chat'?'💬 Chat':'🎮 Game'}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'12px', background:'rgba(240,192,64,0.05)', border:'1px solid rgba(240,192,64,0.12)', borderRadius:'12px', padding:'14px', marginBottom:'16px' }}>
        <div style={{ width:'50px', height:'50px', borderRadius:'50%', background:'linear-gradient(135deg,#DB2777,#9D174D)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>🧕</div>
        <div>
          <div style={{ fontSize:'15px', fontWeight:600 }}>Sumaiya A., 26 · Dhaka</div>
          <div style={{ fontSize:'12px', color:'rgba(253,246,238,0.55)', marginTop:'2px', fontFamily:'system-ui' }}>Religious · Master&apos;s · Teacher</div>
        </div>
        <div style={{ marginLeft:'auto', background:'#7B1D2E', borderRadius:'20px', padding:'4px 10px', fontSize:'12px', fontWeight:700, color:'#F0C040', whiteSpace:'nowrap', border:'1px solid rgba(240,192,64,0.3)' }}>86% match</div>
      </div>

      {tab==='call' && (
        <div>
          <div style={{ textAlign:'center', padding:'12px', fontSize:'14px', color:'rgba(253,246,238,0.72)', fontFamily:'system-ui', minHeight:'44px' }}>
            {callState==='idle' && 'Click below to hear Sumaiya'}
            {callState==='ringing' && '🔔 Calling Sumaiya...'}
            {callState==='connected' && '✅ Connected — Sumaiya is speaking'}
            {callState==='ended' && 'Call ended. Ready to find your real match?'}
          </div>
          {callState==='connected' && (
            <>
              <style>{`@keyframes wave{0%,100%{height:8px}50%{height:28px}}`}</style>
              <div style={{ display:'flex', justifyContent:'center', gap:'4px', height:'36px', alignItems:'center', marginBottom:'12px' }}>
                {[0,1,2,3,4].map(i=>(
                  <div key={i} style={{ width:'4px', background:'#10b981', borderRadius:'2px', animation:`wave 1s ease-in-out ${i*0.1}s infinite` }}/>
                ))}
              </div>
            </>
          )}
          {(callState==='idle'||callState==='ended') && (
            <button onClick={startCall} style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#7B1D2E,#9D174D)', border:'none', borderRadius:'10px', color:'white', fontSize:'15px', fontWeight:600, cursor:'pointer', fontFamily:'system-ui' }}>
              {callState==='idle' ? '📞 Call Sumaiya' : '📞 Call Again'}
            </button>
          )}
          {callState==='ended' && (
            <Link href="/register" style={{ display:'block', marginTop:'12px', padding:'13px', background:'linear-gradient(135deg,#F0C040,#C07800)', borderRadius:'8px', color:'#080604', fontSize:'14px', fontWeight:700, textDecoration:'none', textAlign:'center', fontFamily:'system-ui', letterSpacing:'1px' }}>
              JOIN FREE — Find Real Matches
            </Link>
          )}
        </div>
      )}

      {tab==='chat' && (
        <div>
          <div ref={chatRef} style={{ height:'210px', overflowY:'auto', padding:'12px', background:'rgba(0,0,0,0.3)', borderRadius:'10px', marginBottom:'12px', display:'flex', flexDirection:'column', gap:'8px' }}>
            {messages.map((m,i) => (
              <div key={i} style={{ maxWidth:'82%', padding:'9px 13px', borderRadius:m.from==='them'?'12px 12px 12px 4px':'12px 12px 4px 12px', fontSize:'14px', lineHeight:1.55, background:m.from==='them'?'rgba(240,192,64,0.1)':'#DB2777', color:'#FDF6EE', alignSelf:m.from==='them'?'flex-start':'flex-end', fontFamily:'system-ui' }}>
                {m.text}
              </div>
            ))}
            {isTyping && (
              <div style={{ fontSize:'13px', color:'rgba(253,246,238,0.45)', fontStyle:'italic', fontFamily:'system-ui' }}>Sumaiya is typing...</div>
            )}
          </div>
          {!chatEnded ? (
            <div style={{ display:'flex', gap:'8px' }}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMsg()} placeholder="Type a message..." maxLength={200} style={{ flex:1, padding:'10px 14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(240,192,64,0.2)', borderRadius:'8px', color:'#FDF6EE', fontSize:'14px', fontFamily:'system-ui', outline:'none' }}/>
              <button onClick={sendMsg} disabled={isTyping} style={{ padding:'10px 16px', background:'#7B1D2E', border:'none', borderRadius:'8px', color:'white', fontSize:'14px', cursor:'pointer', fontFamily:'system-ui', opacity:isTyping?0.5:1 }}>Send</button>
            </div>
          ) : (
            <Link href="/register" style={{ display:'block', padding:'13px', background:'linear-gradient(135deg,#F0C040,#C07800)', borderRadius:'8px', color:'#080604', fontSize:'14px', fontWeight:700, textDecoration:'none', textAlign:'center', fontFamily:'system-ui', letterSpacing:'1px' }}>
              JOIN FREE — Talk to Real Profiles
            </Link>
          )}
          <div style={{ textAlign:'center', marginTop:'8px', fontSize:'11px', color:'rgba(253,246,238,0.3)', fontFamily:'system-ui' }}>AI-powered demo · 60 second conversation · Not a real profile</div>
        </div>
      )}

      {tab==='game' && (
        <div>
          <div style={{ fontSize:'15px', fontWeight:600, marginBottom:'16px', lineHeight:1.6 }}>You both have a free Sunday. What would you choose?</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {Object.entries(LABELS).map(([key,label]) => (
              <button key={key} onClick={()=>!gamePick&&setGamePick(key)} style={{ padding:'12px 16px', background:gamePick===key?'rgba(219,39,119,0.15)':gamePick?'rgba(240,192,64,0.02)':'rgba(240,192,64,0.04)', border:`1px solid ${gamePick===key?'#DB2777':'rgba(240,192,64,0.15)'}`, borderRadius:'8px', color:gamePick&&gamePick!==key?'rgba(253,246,238,0.38)':'rgba(253,246,238,0.85)', fontSize:'14px', cursor:gamePick?'default':'pointer', textAlign:'left', fontFamily:'system-ui', transition:'all 0.2s' }}>
                {label}
              </button>
            ))}
          </div>
          {gamePick && (
            <div style={{ background:'rgba(240,192,64,0.07)', border:'1px solid rgba(240,192,64,0.2)', borderRadius:'10px', padding:'16px', marginTop:'14px', fontFamily:'system-ui', fontSize:'14px', lineHeight:1.75 }}>
              <div style={{ marginBottom:'8px' }}><span style={{ color:'#F0C040', fontWeight:600 }}>Sumaiya chose:</span> {LABELS[SUMAIYA_PICK[gamePick]]}</div>
              <div style={{ marginBottom:'12px' }}><span style={{ color:'#F0C040', fontWeight:600 }}>Compatibility:</span> <span style={{ fontSize:'22px', fontWeight:700, color:'#F0C040' }}>{COMPAT[gamePick][SUMAIYA_PICK[gamePick]]}%</span></div>
              <div style={{ fontSize:'13px', color:'rgba(253,246,238,0.6)', marginBottom:'14px' }}>11 more questions reveal how your lives fit together. Join to play with real matches.</div>
              <Link href="/register" style={{ display:'block', padding:'13px', background:'linear-gradient(135deg,#F0C040,#C07800)', borderRadius:'8px', color:'#080604', fontSize:'14px', fontWeight:700, textDecoration:'none', textAlign:'center', letterSpacing:'1px' }}>
                JOIN FREE — Play the Full Game
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

