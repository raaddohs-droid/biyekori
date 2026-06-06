"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConvo, setActiveConvo] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [msgInput, setMsgInput] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<any>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("biyekori_user")
      if (!stored) { window.location.href = "/login"; return }
      const u = JSON.parse(stored)
      setUser(u)
      setIsPremium(u.package && u.package !== "prottasha")
      if (u.id) loadConversations(u.id)
    } catch(e) {}
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function loadConversations(userId: string) {
    setLoading(true)
    try {
      // Get all accepted interests to find conversation partners
      const res = await fetch("/api/interests/list?userId=" + userId)
      const data = await res.json()
      const all = [
        ...(data.sent || []).filter((i: any) => i.status === "accepted").map((i: any) => ({ person: i.receiver, personId: String(i.receiver_id) })),
        ...(data.received || []).filter((i: any) => i.status === "accepted").map((i: any) => ({ person: i.sender, personId: String(i.sender_id) }))
      ]
      // Deduplicate by personId
      const seen = new Set()
      const accepted = all.filter((c: any) => {
        if (seen.has(c.personId)) return false
        seen.add(c.personId)
        return true
      })
      setConversations(accepted)
    } catch(e) {}
    setLoading(false)
  }

  async function fetchMessages(userId: string, personId: string) {
    try {
      const res = await fetch(`/api/messages/list?userId=${userId}&withUserId=${personId}`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch(e) {}
  }

  async function openConversation(convo: any) {
    setActiveConvo(convo)
    setMessages([])
    if (pollRef.current) clearInterval(pollRef.current)
    await fetchMessages(user.id, convo.personId)
    // Poll every 5 seconds
    pollRef.current = setInterval(() => {
      fetchMessages(user.id, convo.personId)
    }, 5000)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  async function sendMessage() {
    if (!msgInput.trim() || !activeConvo || sending) return
    setSending(true)
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: user.id, receiverId: activeConvo.personId, content: msgInput })
      })
      const data = await res.json()
      if (data.success) {
        setMessages(prev => [...prev, { sender_id: user.id, content: msgInput, created_at: new Date().toISOString() }])
        setMsgInput("")
      } else if (data.upgrade) {
        alert("Upgrade to Premium to send messages.")
      }
    } catch(e) {}
    setSending(false)
  }

  if (!user) return null

  if (!isPremium && !hasMutualMatches && !loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", paddingTop: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "48px 32px", textAlign: "center", maxWidth: "420px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ width: "64px", height: "64px", background: "#f5f3ff", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: 800, color: "#111827" }}>No Mutual Matches Yet</h2>
          <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#6b7280", lineHeight: 1.6 }}>Messaging is free once you have a mutual match — when both of you accept each other's interest.</p>
          <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#9ca3af" }}>Premium members can message anyone directly.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/profiles" style={{ display: "inline-block", padding: "12px 24px", background: "linear-gradient(135deg,#e11d48,#be185d)", color: "white", borderRadius: "12px", fontWeight: 700, textDecoration: "none", fontSize: "14px" }}>
              Browse Profiles
            </Link>
            <Link href="/pricing" style={{ display: "inline-block", padding: "12px 24px", background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "white", borderRadius: "12px", fontWeight: 700, textDecoration: "none", fontSize: "14px" }}>
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingTop: "80px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 16px 40px" }}>
        <h1 style={{ margin: "0 0 20px", fontSize: "24px", fontWeight: 800, color: "#111827" }}>Messages</h1>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "16px", height: "calc(100vh - 180px)" }}>

          {/* Conversations list */}
          <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px", borderBottom: "1px solid #f8fafc" }}>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#6b7280" }}>Conversations</p>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {loading ? (
                <div style={{ padding: "24px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>Loading...</div>
              ) : conversations.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center" }}>
                  <p style={{ color: "#9ca3af", fontSize: "13px", margin: "0 0 12px" }}>No conversations yet</p>
                  <Link href="/interests" style={{ fontSize: "12px", color: "#e11d48", fontWeight: 700, textDecoration: "none" }}>View accepted interests</Link>
                </div>
              ) : conversations.map((convo: any, i: number) => (
                <button key={i} onClick={() => openConversation(convo)} style={{
                  width: "100%", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px",
                  background: activeConvo?.personId === convo.personId ? "#faf5ff" : "white",
                  border: "none", borderBottom: "1px solid #f8fafc", cursor: "pointer", textAlign: "left"
                }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "50%", overflow: "hidden", background: "#f3f4f6", flexShrink: 0 }}>
                    {convo.person?.photo_url ? (
                      <img src={convo.person.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>?</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{convo.person?.full_name || "Unknown"}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af" }}>{convo.person?.age} yrs · {convo.person?.district}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column" }}>
            {!activeConvo ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <p style={{ color: "#9ca3af", fontSize: "14px" }}>Select a conversation to start messaging</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", overflow: "hidden", background: "#f3f4f6" }}>
                    {activeConvo.person?.photo_url ? (
                      <img src={activeConvo.person.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>?</div>
                    )}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#111827" }}>{activeConvo.person?.full_name}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af" }}>Premium messaging</p>
                  </div>
                  <Link href={"/profile/" + activeConvo.personId} style={{ marginLeft: "auto", fontSize: "12px", color: "#e11d48", fontWeight: 700, textDecoration: "none" }}>View Profile</Link>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "13px", marginTop: "40px" }}>No messages yet. Say hello!</div>
                  ) : messages.map((msg: any, i: number) => {
                    const isMine = String(msg.sender_id) === String(user.id)
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                        <div style={{
                          maxWidth: "65%", padding: "10px 14px",
                          borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          background: isMine ? "linear-gradient(135deg,#e11d48,#db2777)" : "#f3f4f6",
                          color: isMine ? "white" : "#111827", fontSize: "13px", lineHeight: 1.5
                        }}>
                          {msg.content}
                          <p style={{ margin: "4px 0 0", fontSize: "10px", opacity: 0.7, textAlign: "right" }}>
                            {new Date(msg.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div style={{ padding: "12px 16px", borderTop: "1px solid #f8fafc", display: "flex", gap: "8px" }}>
                  <input
                    value={msgInput}
                    onChange={e => setMsgInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: "10px 14px", borderRadius: "12px", border: "1.5px solid #e5e7eb", fontSize: "13px", outline: "none", color: "#111827", background: "white" }}
                  />
                  <button onClick={sendMessage} disabled={sending || !msgInput.trim()} style={{
                    padding: "10px 20px", background: "linear-gradient(135deg,#e11d48,#db2777)",
                    color: "white", border: "none", borderRadius: "12px", fontWeight: 700,
                    fontSize: "13px", cursor: "pointer", opacity: sending || !msgInput.trim() ? 0.6 : 1
                  }}>
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
