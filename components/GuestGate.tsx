"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const GUEST_KEY = "bk_guest_first_visit"
const BLUR_AFTER_MS = 3 * 60 * 1000 // 3 minutes
const BLOCK_RETURN_MS = 24 * 60 * 60 * 1000 // 24 hours

export default function GuestGate({ page }: { page: number }) {
  const router = useRouter()
  const [blurred, setBlurred] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(180)

  useEffect(() => {
    // If logged in, do nothing
    try {
      const user = localStorage.getItem("biyekori_user")
      if (user && JSON.parse(user)?.id) return
    } catch(e) {}

    // Page 2+ — redirect immediately
    if (page > 1) {
      router.replace("/login?reason=guest")
      return
    }

    // Check if returning guest (visited before within 24hrs)
    const now = Date.now()
    const stored = localStorage.getItem(GUEST_KEY)

    if (stored) {
      const firstVisit = parseInt(stored)
      const elapsed = now - firstVisit

      if (elapsed >= BLUR_AFTER_MS) {
        // Already past 3 mins — blur immediately
        setBlurred(true)
        setSecondsLeft(0)
        return
      }

      // Resume countdown from where they left off
      const remaining = BLUR_AFTER_MS - elapsed
      setSecondsLeft(Math.ceil(remaining / 1000))

      const timer = setTimeout(() => setBlurred(true), remaining)
      const interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) { clearInterval(interval); return 0 }
          return prev - 1
        })
      }, 1000)
      return () => { clearTimeout(timer); clearInterval(interval) }
    } else {
      // First visit — store timestamp
      localStorage.setItem(GUEST_KEY, String(now))
      setSecondsLeft(180)

      const timer = setTimeout(() => setBlurred(true), BLUR_AFTER_MS)
      const interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) { clearInterval(interval); return 0 }
          return prev - 1
        })
      }, 1000)
      return () => { clearTimeout(timer); clearInterval(interval) }
    }
  }, [page])

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60

  if (!blurred) {
    // Show a subtle countdown banner
    if (secondsLeft > 0 && secondsLeft < 180) {
      return (
        <div style={{
          position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.75)", color: "white", borderRadius: "20px",
          padding: "8px 20px", fontSize: "12px", fontWeight: 600, zIndex: 999,
          display: "flex", alignItems: "center", gap: "8px", backdropFilter: "blur(8px)"
        }}>
          <span>Free preview ends in</span>
          <span style={{ color: "#fbbf24", fontWeight: 800 }}>{mins}:{String(secs).padStart(2,"0")}</span>
          <a href="/login" style={{ color: "#f9a8d4", fontWeight: 700, textDecoration: "none" }}>Login →</a>
        </div>
      )
    }
    return null
  }

  // Blurred overlay
  return (
    <>
      {/* Blur everything below navbar */}
      <style>{`
        .profiles-blurable {
          filter: blur(6px) !important;
          pointer-events: none !important;
          user-select: none !important;
        }
      `}</style>
      <script dangerouslySetInnerHTML={{ __html: `
        document.querySelectorAll('.profiles-blurable').forEach(el => el.classList.add('blurred'));
      `}} />

      {/* Full overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 998,
        background: "rgba(0,0,0,0.15)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        paddingTop: "80px"
      }}>
        <div style={{
          background: "white", borderRadius: "24px",
          padding: "40px 32px", maxWidth: "400px", width: "90%",
          textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>💌</div>
          <h2 style={{ margin: "0 0 10px", fontSize: "22px", fontWeight: 800, color: "#111827" }}>
            Your free preview has ended
          </h2>
          <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#6b7280", lineHeight: 1.6 }}>
            Login or create a free account to keep browsing profiles on Biyekori.
          </p>
          <a href="/login" style={{
            display: "block", padding: "14px",
            background: "linear-gradient(135deg,#e11d48,#db2777)",
            color: "white", borderRadius: "12px", fontWeight: 700,
            fontSize: "15px", textDecoration: "none", marginBottom: "10px"
          }}>
            Login
          </a>
          <a href="/register" style={{
            display: "block", padding: "14px",
            background: "#f3f4f6", color: "#374151",
            borderRadius: "12px", fontWeight: 700,
            fontSize: "15px", textDecoration: "none"
          }}>
            Create Free Account
          </a>
          <p style={{ margin: "16px 0 0", fontSize: "11px", color: "#9ca3af" }}>
            Free forever · No credit card required
          </p>
        </div>
      </div>
    </>
  )
}
