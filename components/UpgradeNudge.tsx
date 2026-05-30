"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

interface UpgradeNudgeProps {
  currentPage: number
}

export default function UpgradeNudge({ currentPage }: UpgradeNudgeProps) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (dismissed) return
    if (currentPage < 3) return

    // Page 3 - show after 30 seconds
    // Page 4 - show after 20 seconds
    // Page 5+ - show immediately
    const delay = currentPage === 3 ? 30000 : currentPage === 4 ? 20000 : 0

    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [currentPage, dismissed])

  if (!visible || dismissed) return null
  if (currentPage < 3) return null

  // Page 3 - small bottom banner
  if (currentPage === 3) {
    return (
      <div style={{
        position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
        background: "white", borderRadius: "16px", padding: "16px 24px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)", zIndex: 999,
        display: "flex", alignItems: "center", gap: "16px",
        border: "1px solid #fde68a", maxWidth: "520px", width: "90%",
        animation: "slideUp 0.4s ease"
      }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1f2937" }}>
            Someone from Dhaka just viewed a profile like yours.
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }}>
            Upgrade to see who is interested in you.
          </p>
        </div>
        <Link href="/pricing" style={{
          padding: "8px 16px", background: "linear-gradient(135deg,#e11d48,#db2777)",
          color: "white", borderRadius: "8px", fontSize: "12px", fontWeight: 700,
          textDecoration: "none", whiteSpace: "nowrap"
        }}>
          See Who
        </Link>
        <button onClick={() => setDismissed(true)} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#9ca3af", fontSize: "18px", padding: "0 4px"
        }}>x</button>
      </div>
    )
  }

  // Page 4 - slide-in popup
  if (currentPage === 4) {
    return (
      <div style={{
        position: "fixed", bottom: "24px", right: "24px",
        background: "white", borderRadius: "20px", padding: "24px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)", zIndex: 999,
        maxWidth: "320px", border: "2px solid #fce7f3",
        animation: "slideLeft 0.4s ease"
      }}>
        <button onClick={() => setDismissed(true)} style={{
          position: "absolute", top: "12px", right: "12px",
          background: "none", border: "none", cursor: "pointer",
          color: "#9ca3af", fontSize: "18px"
        }}>x</button>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>💌</div>
        <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 700, color: "#1f2937" }}>
          3 people sent interest to profiles like yours today.
        </h3>
        <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#6b7280", lineHeight: 1.5 }}>
          Are you missing your match? Premium members get 10x more responses.
        </p>
        <Link href="/pricing" style={{
          display: "block", textAlign: "center", padding: "10px",
          background: "linear-gradient(135deg,#e11d48,#db2777)",
          color: "white", borderRadius: "10px", fontSize: "13px",
          fontWeight: 700, textDecoration: "none"
        }}>
          Upgrade Now
        </Link>
      </div>
    )
  }

  // Page 5+ - full modal
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px"
    }}>
      <div style={{
        background: "white", borderRadius: "24px", padding: "40px",
        maxWidth: "480px", width: "100%", textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>💍</div>
        <h2 style={{ margin: "0 0 12px", fontSize: "24px", fontWeight: 700, color: "#1f2937" }}>
          You have discovered 60 potential matches.
        </h2>
        <p style={{ margin: "0 0 24px", fontSize: "15px", color: "#6b7280", lineHeight: 1.6 }}>
          Premium members find their partner 4x faster. Your perfect match may already be waiting for you.
        </p>
        <div style={{ marginBottom: "24px" }}>
          {["Unlimited verified profiles worldwide", "Send unlimited interests", "View contact details directly", "Priority placement in search"].map(item => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", textAlign: "left" }}>
              <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: "13px", color: "#374151" }}>{item}</span>
            </div>
          ))}
        </div>
        <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#9ca3af" }}>Starting at</p>
        <p style={{ margin: "0 0 20px", fontSize: "36px", fontWeight: 700, color: "#e11d48" }}>৳799/mo</p>
        <Link href="/pricing" style={{
          display: "block", padding: "14px",
          background: "linear-gradient(135deg,#e11d48,#db2777)",
          color: "white", borderRadius: "12px", fontSize: "15px",
          fontWeight: 700, textDecoration: "none", marginBottom: "12px"
        }}>
          Upgrade Now — Find Your Match
        </Link>
        <button onClick={() => setDismissed(true)} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#9ca3af", fontSize: "13px"
        }}>
          Maybe later
        </button>
      </div>
    </div>
  )
}

