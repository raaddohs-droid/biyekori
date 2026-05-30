"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function InterestsPage() {
  const [tab, setTab] = useState("sent")
  const [received, setReceived] = useState<any[]>([])
  const [sent, setSent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState("")

  useEffect(() => {
    let stored = null
    try {
      const userStr = localStorage.getItem("biyekori_user")
      const parsed = userStr ? JSON.parse(userStr) : null
      stored = parsed ? String(parsed.id) : null
    } catch(e) {}
    if (stored) { setUserId(stored); fetchInterests(stored) } else { setLoading(false) }
  }, [])

  async function fetchInterests(uid: string) {
    setLoading(true)
    try {
      const res = await fetch("/api/interests/list?userId=" + uid)
      const data = await res.json()
      setReceived(data.received || [])
      setSent(data.sent || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function respond(interestId: number, action: string) {
    const res = await fetch("/api/interests/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interestId, userId, action })
    })
    if (res.ok) fetchInterests(userId)
    else alert("Error. Please try again.")
  }

  const list = tab === "received" ? received : sent

  const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
    pending:  { label: "Waiting for Response",  bg: "#FEF3C7", color: "#92400E" },
    accepted: { label: "Accepted", bg: "#D1FAE5", color: "#065F46" },
    declined: { label: "Declined", bg: "#FEE2E2", color: "#991B1B" },
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fff5f7 0%, #fdf2f8 50%, #f5f3ff 100%)", fontFamily: "Georgia, serif" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "120px 16px 40px" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#1a1a2e", margin: "0 0 4px" }}>💌 Interests</h1>
          <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>Manage your matrimony connections</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", background: "white", padding: "6px", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          {["sent", "received"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "12px", borderRadius: "12px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "14px", fontFamily: "Georgia, serif", transition: "all 0.2s",
              background: tab === t ? "linear-gradient(135deg, #e11d48, #db2777)" : "transparent",
              color: tab === t ? "white" : "#6b7280"
            }}>
              {t === "sent" ? `Sent (${sent.length})` : `Received (${received.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>💫</div>
            Loading...
          </div>
        ) : list.length === 0 ? (
          <div style={{ background: "white", borderRadius: "20px", padding: "60px 24px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>{tab === "received" ? "💌" : "📤"}</div>
            <p style={{ color: "#6b7280", fontSize: "16px", margin: "0 0 20px" }}>
              {tab === "received" ? "No interests received yet." : "You haven't sent any interests yet."}
            </p>
            {tab === "sent" && (
              <Link href="/profiles" style={{ display: "inline-block", padding: "12px 28px", background: "linear-gradient(135deg, #e11d48, #db2777)", color: "white", borderRadius: "12px", fontWeight: 700, textDecoration: "none", fontSize: "14px" }}>
                Browse Profiles →
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {list.map((interest: any) => {
              const person = tab === "received" ? interest.sender : interest.receiver
              const status = statusConfig[interest.status] || statusConfig.pending
              const profileId = tab === "received" ? interest.sender_id : interest.receiver_id
              return (
                <div key={interest.id} style={{ background: "white", borderRadius: "20px", padding: "16px", display: "flex", gap: "14px", alignItems: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6" }}>
                  
                  {/* Photo */}
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#f3f4f6" }}>
                    {person?.photo_url
                      ? <img src={person.photo_url} alt={person?.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>👤</div>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: "0 0 2px", fontSize: "16px", fontWeight: 700, color: "#1a1a2e" }}>{person?.full_name || "Unknown"}</h3>
                    <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#6b7280" }}>
                      {person?.age} yrs · {person?.district} · {person?.profession}
                    </p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af" }}>
                      {new Date(interest.created_at || interest.sent_at).toLocaleDateString("en-GB")}
                    </p>
                  </div>

                  {/* Right side */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
                    <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, background: status.bg, color: status.color }}>
                      {status.label}
                    </span>

                    {tab === "received" && interest.status === "pending" && (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => respond(interest.id, "accepted")} style={{ padding: "6px 14px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Accept</button>
                        <button onClick={() => respond(interest.id, "declined")} style={{ padding: "6px 14px", background: "#f3f4f6", color: "#6b7280", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Decline</button>
                      </div>
                    )}

                    <Link href={"/profile/" + profileId} style={{ fontSize: "12px", color: "#e11d48", textDecoration: "none", fontWeight: 600 }}>
                      View Profile →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

