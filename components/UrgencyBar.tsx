"use client"
import { useState, useEffect } from "react"

const SIGNALS = [
  { icon: "💕", text: "1,811 women and 1,199 men are looking for matches" },
  { icon: "🌍", text: "Profiles from UK, USA, Canada and 60+ districts" },
  { icon: "🛡️", text: "Every profile is phone-verified before going live" },
  { icon: "✨", text: "AI match score — know why you match before you say hello" },
  { icon: "📞", text: "Talk safely before you meet — no phone numbers shared" },
]

export default function UrgencyBar() {
  const [current, setCurrent] = useState(0)
  const [fade, setFade] = useState(true)
  const [live, setLive] = useState(Math.floor(Math.random()*12)+4)

  useEffect(() => {
    const iv = setInterval(() => setLive(p => Math.max(3, Math.min(20, p + Math.floor(Math.random()*3)-1))), 8000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false)
      setTimeout(() => { setCurrent(p => (p+1) % (SIGNALS.length+1)); setFade(true) }, 300)
    }, 4000)
    return () => clearInterval(t)
  }, [])

  const all = [{ icon: "👁️", text: live + " people browsing profiles right now" }, ...SIGNALS]
  const signal = all[current % all.length]

  return (
    <div style={{ background: "linear-gradient(135deg, #7B1D2E, #9D174D)", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", minHeight: "40px" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#fca5a5", flexShrink: 0, animation: "pulse 2s ease-in-out infinite" }}/>
      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.92)", fontFamily: "system-ui", fontWeight: 500, opacity: fade ? 1 : 0, transition: "opacity 0.3s ease", textAlign: "center" }}>
        <span style={{ marginRight: "6px" }}>{signal.icon}</span>{signal.text}
      </span>
      <div style={{ display: "flex", gap: "4px", marginLeft: "8px" }}>
        {all.map((_,i) => <div key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", background: i===current%all.length ? "white" : "rgba(255,255,255,0.3)", transition: "background 0.3s" }}/>)}
      </div>
    </div>
  )
}
