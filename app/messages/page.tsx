"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"

const MAROON = "#7B1D2E"

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConvo, setActiveConvo] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [msgInput, setMsgInput] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"list"|"chat">("list")
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
      const res = await fetch("/api/interests/list?userId=" + userId)
      const data = await res.json()
      const all = [
        ...(data.sent || []).filter((i: any) => i.status === "accepted").map((i: any) => ({ person: i.receiver, personId: String(i.receiver_id) })),
        ...(data.received || []).filter((i: any) => i.status === "accepted").map((i: any) => ({ person: i.sender, personId: String(i.sender_id) }))
      ]
      const seen = new Set()
      const accepted = all.filter((c: any) => { if (seen.has(c.personId)) return false; seen.add(c.personId); return true })
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
    setView("chat")
    if (pollRef.current) clearInterval(pollRef.current)
    await fetchMessages(user.id, convo.personId)
    pollRef.current = setInterval(() => fetchMessages(user.id, convo.personId), 5000)
    setTimeout(() => inputRef.current?.focus(), 300)
  }

  function goBack() {
    setView("list")
    setActiveConvo(null)
    if (pollRef.current) clearInterval(pollRef.current)
  }

  useEffect(() => { return () => { if (pollRef.current) clearInterval(pollRef.current) } }, [])

  async function sendMessage() {
    if (!msgInput.trim() || !activeConvo || sending) return
    setSending(true)
    const text = msgInput.trim()
    setMsgInput("")
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: user.id, receiverId: activeConvo.personId, content: text })
      })
      const data = await res.json()
      if (data.success) {
        setMessages(prev => [...prev, { sender_id: user.id, content: text, created_at: new Date().toISOString() }])
      } else if (data.upgrade) {
        alert("Upgrade to Premium to send messages.")
      }
    } catch(e) {}
    setSending(false)
  }

  if (!user) return null

  // No mutual matches + free user
  if (!isPremium && conversations.length === 0 && !loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#FDF6EE", paddingTop: "80px", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 20px 40px" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "clamp(24px,6vw,48px)", textAlign: "center", maxWidth: "420px", width: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ width: "64px", height: "64px", background: "#fff1f2", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={MAROON} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: 800, color: "#111827" }}>এখনো কোনো ম্যাচ নেই</h2>
          <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#6b7280", lineHeight: 1.6 }}>মিউচুয়াল ম্যাচ হলে বিনামূল্যে মেসেজ করতে পারবেন। প্রিমিয়াম সদস্যরা যেকাউকে মেসেজ করতে পারেন।</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link href="/profiles" style={{ display: "block", padding: "13px", background: MAROON, color: "white", borderRadius: "12px", fontWeight: 700, textDecoration: "none", fontSize: "14px" }}>
              প্রোফাইল দেখুন
            </Link>
            <Link href="/pricing" style={{ display: "block", padding: "13px", background: "white", color: MAROON, border: `1.5px solid ${MAROON}`, borderRadius: "12px", fontWeight: 700, textDecoration: "none", fontSize: "14px" }}>
              আপগ্রেড করুন
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @media (min-width: 769px) {
          .msg-layout { display: grid !important; grid-template-columns: 300px 1fr !important; }
          .msg-list { display: flex !important; }
          .msg-chat { display: flex !important; }
          .msg-back { display: none !important; }
        }
        @media (max-width: 768px) {
          .msg-layout { display: block !important; }
          .msg-list-mobile-hidden { display: none !important; }
          .msg-chat-mobile-hidden { display: none !important; }
        }
      `}</style>

      <div style={{ height: "100vh", background: "#FDF6EE", paddingTop: "60px", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Mobile header */}
        <div style={{ background: MAROON, padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          {view === "chat" && activeConvo && (
            <button onClick={goBack} style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            </button>
          )}
          {view === "chat" && activeConvo ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", overflow: "hidden", background: "rgba(255,255,255,0.2)", flexShrink: 0 }}>
                {activeConvo.person?.photo_url
                  ? <img src={activeConvo.person.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>👤</div>
                }
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "white" }}>{activeConvo.person?.full_name || "Unknown"}</p>
                <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>{activeConvo.person?.age} yrs · {activeConvo.person?.district}</p>
              </div>
              <Link href={"/profile/" + activeConvo.personId} style={{ marginLeft: "auto", fontSize: "12px", color: "#F0C040", fontWeight: 700, textDecoration: "none" }}>Profile</Link>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "white" }}>বার্তা</p>
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>

          {/* Conversation list — hidden on mobile when chat is open */}
          <div className={view === "chat" ? "msg-chat-mobile-hidden" : ""} style={{
            width: "100%", maxWidth: "100%", background: "white",
            overflowY: "auto", borderRight: "1px solid #f1f5f9",
            display: "flex", flexDirection: "column"
          }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #f5f5f5" }}>
              <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px" }}>
                {conversations.length} কথোপকথন
              </p>
            </div>
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>লোড হচ্ছে...</div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <p style={{ color: "#9ca3af", fontSize: "14px", margin: "0 0 12px" }}>কোনো কথোপকথন নেই</p>
                <Link href="/interests" style={{ fontSize: "13px", color: MAROON, fontWeight: 700, textDecoration: "none" }}>আগ্রহ দেখুন →</Link>
              </div>
            ) : conversations.map((convo: any, i: number) => (
              <button key={i} onClick={() => openConversation(convo)} style={{
                width: "100%", padding: "14px 16px",
                display: "flex", alignItems: "center", gap: "12px",
                background: activeConvo?.personId === convo.personId ? "#fff5f5" : "white",
                border: "none", borderBottom: "1px solid #f9fafb",
                cursor: "pointer", textAlign: "left", minHeight: "72px"
              }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", background: "#f3f4f6", flexShrink: 0 }}>
                  {convo.person?.photo_url
                    ? <img src={convo.person.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>👤</div>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 3px", fontSize: "15px", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {convo.person?.full_name || "Unknown"}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
                    {convo.person?.age} বছর · {convo.person?.district || "Bangladesh"}
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            ))}
          </div>

          {/* Chat area — hidden on mobile when list is showing */}
          {activeConvo && (
            <div className={view === "list" ? "msg-list-mobile-hidden" : ""} style={{
              flex: 1, display: "flex", flexDirection: "column",
              background: "#FDF6EE", width: "100%", overflow: "hidden"
            }}>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "14px", marginTop: "60px" }}>
                    <p style={{ fontSize: "40px", margin: "0 0 12px" }}>👋</p>
                    <p style={{ margin: 0 }}>প্রথম বার্তা পাঠান!</p>
                  </div>
                ) : messages.map((msg: any, i: number) => {
                  const isMine = String(msg.sender_id) === String(user.id)
                  const msgDate = new Date(msg.created_at).toDateString()
                  const prevDate = i > 0 ? new Date(messages[i-1].created_at).toDateString() : null
                  const showDate = msgDate !== prevDate
                  const today = new Date().toDateString()
                  const yesterday = new Date(Date.now() - 86400000).toDateString()
                  const dateLabel = msgDate === today ? "আজ" : msgDate === yesterday ? "গতকাল" : new Date(msg.created_at).toLocaleDateString("bn-BD", { day: "numeric", month: "long" })
                  const time = new Date(msg.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                  return (
                    <div key={i}>
                      {showDate && (
                        <div style={{ textAlign: "center", margin: "12px 0 8px" }}>
                          <span style={{ fontSize: "11px", color: "#9ca3af", background: "rgba(255,255,255,0.8)", padding: "3px 12px", borderRadius: "20px" }}>{dateLabel}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", marginBottom: "2px" }}>
                        <div style={{
                          maxWidth: "75%", padding: "10px 14px",
                          borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          background: isMine ? MAROON : "white",
                          color: isMine ? "white" : "#111827",
                          fontSize: "14px", lineHeight: 1.5,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.08)"
                        }}>
                          <p style={{ margin: "0 0 4px" }}>{msg.content}</p>
                          <p style={{ margin: 0, fontSize: "10px", opacity: 0.6, textAlign: "right" }}>{time}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input bar */}
              <div style={{ padding: "10px 12px", background: "white", borderTop: "1px solid #f1f5f9", display: "flex", gap: "8px", alignItems: "center", paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}>
                <input
                  ref={inputRef}
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="বার্তা লিখুন..."
                  style={{ flex: 1, padding: "11px 16px", borderRadius: "24px", border: "1.5px solid #e5e7eb", fontSize: "15px", outline: "none", color: "#111827", background: "#f9fafb" }}
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !msgInput.trim()}
                  style={{
                    width: "44px", height: "44px", borderRadius: "50%",
                    background: msgInput.trim() ? MAROON : "#e5e7eb",
                    border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "background 0.2s"
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* Desktop: show placeholder when no convo selected */}
          {!activeConvo && (
            <div className="msg-chat-mobile-hidden" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", background: "#FDF6EE" }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <p style={{ color: "#9ca3af", fontSize: "14px" }}>একটি কথোপকথন বেছে নিন</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
