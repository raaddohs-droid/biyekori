"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function InterestsPage() {
  const [tab, setTab] = useState("sent")
  const [received, setReceived] = useState<any[]>([])
  const [sent, setSent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState("")
  const [userPackage, setUserPackage] = useState("")
  const [showChat, setShowChat] = useState<string | null>(null)
  const [chatWith, setChatWith] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [msgInput, setMsgInput] = useState("")
  const [sendingMsg, setSendingMsg] = useState(false)

  useEffect(() => {
    let stored = null
    try {
      const userStr = localStorage.getItem("biyekori_user")
      const parsed = userStr ? JSON.parse(userStr) : null
      stored = parsed ? String(parsed.id) : null
    } catch(e) {}
    if (stored) {
      setUserId(stored)
      fetchInterests(stored)
      try {
        const userStr = localStorage.getItem("biyekori_user")
        const parsed = userStr ? JSON.parse(userStr) : null
        setUserPackage(parsed?.package || "prottasha")
      } catch(e) {}
    } else { setLoading(false) }
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

  async function openChat(person: any, profileId: string) {
    const isPaid = userPackage && userPackage !== "prottasha"
    if (!isPaid) {
      alert("Upgrade to Premium to send messages.")
      return
    }
    setChatWith({ ...person, id: profileId })
    setShowChat(profileId)
    setMessages([])
    const res = await fetch(`/api/messages/list?userId=${userId}&withUserId=${profileId}`)
    const data = await res.json()
    setMessages(data.messages || [])
  }

  async function sendMessage() {
    if (!msgInput.trim() || !chatWith) return
    setSendingMsg(true)
    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: parseInt(userId), receiverId: parseInt(chatWith.id), content: msgInput })
    })
    const data = await res.json()
    if (data.success) {
      setMessages(prev => [...prev, { sender_id: userId, content: msgInput, created_at: new Date().toISOString() }])
      setMsgInput("")
    } else if (data.upgrade) {
      alert("Upgrade to Premium to send messages.")
    }
    setSendingMsg(false)
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

                    {interest.status === "accepted" && (
                      <button onClick={() => openChat(person, profileId)} style={{ padding: "6px 14px", background: "linear-gradient(135deg,#7c3aed,#db2777)", color: "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                        Send Message
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {showChat && chatWith && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 16px 0" }}>
          <div style={{ background: "white", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: "680px", height: "70vh", display: "flex", flexDirection: "column" }}>
            {/* Chat header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", background: "#f3f4f6" }}>
                  {chatWith.photo_url ? <img src={chatWith.photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>👤</div>}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#111827" }}>{chatWith.full_name || "Unknown"}</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af" }}>Premium messaging</p>
                </div>
              </div>
              <button onClick={() => { setShowChat(null); setChatWith(null); setMessages([]) }} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9ca3af" }}>×</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "13px", marginTop: "40px" }}>No messages yet. Say hello!</div>
              ) : messages.map((msg: any, i: number) => {
                const isMine = String(msg.sender_id) === String(userId)
                return (
                  <div key={i} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "70%", padding: "10px 14px", borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: isMine ? "linear-gradient(135deg,#e11d48,#db2777)" : "#f3f4f6", color: isMine ? "white" : "#111827", fontSize: "13px", lineHeight: 1.5 }}>
                      {msg.content}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid #f3f4f6", display: "flex", gap: "8px" }}>
              <input
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Type a message..."
                style={{ flex: 1, padding: "10px 14px", borderRadius: "12px", border: "1.5px solid #e5e7eb", fontSize: "13px", outline: "none", color: "#111827", background: "white" }}
              />
              <button onClick={sendMessage} disabled={sendingMsg || !msgInput.trim()} style={{ padding: "10px 18px", background: "linear-gradient(135deg,#e11d48,#db2777)", color: "white", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

