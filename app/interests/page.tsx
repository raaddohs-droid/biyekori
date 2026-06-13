"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import CallModal from "@/components/CallModal"

export default function InterestsPage() {
  const [tab, setTab] = useState("sent")
  const [callTarget, setCallTarget] = useState<any>(null)
  const [showCallModal, setShowCallModal] = useState(false)
  const [received, setReceived] = useState<any[]>([])
  const [sent, setSent] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [shortlisted, setShortlisted] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userPackage, setUserPackage] = useState("")
  const [showChat, setShowChat] = useState<string | null>(null)
  const [chatWith, setChatWith] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [msgInput, setMsgInput] = useState("")
  const [sendingMsg, setSendingMsg] = useState(false)
  const [guardianWarningFor, setGuardianWarningFor] = useState<string | null>(null)

  useEffect(() => {
    let stored = null
    try {
      const userStr = localStorage.getItem("biyekori_user")
      if (userStr) { try { setCurrentUser(JSON.parse(userStr)) } catch(e) {} }
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
      setFiltered(data.filtered || [])
    } catch (e) { console.error(e) }
    try {
      const sr = await fetch("/api/shortlists?userId=" + uid)
      const sd = await sr.json()
      setShortlisted(sd.shortlists || [])
    } catch (e) {}
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

  function tryOpenChat(person: any, profileId: string, isMutual?: boolean) {
    const isPaid = userPackage && userPackage !== "prottasha"
    if (!isPaid && !isMutual) {
      alert("Messaging is free for mutual matches. Upgrade to Premium to message anyone.")
      return
    }
    // If guardian managed, show warning first
    if (person?.guardian_mode) {
      setGuardianWarningFor(profileId)
      setChatWith({ ...person, id: profileId })
      return
    }
    openChat(person, profileId)
  }

  async function openChat(person: any, profileId: string) {
    setGuardianWarningFor(null)
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

  const list = tab === "received" ? received : tab === "filtered" ? filtered : tab === "shortlisted" ? shortlisted : sent

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
          {["received", "shortlisted", "sent", "filtered"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "12px", borderRadius: "12px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "13px", fontFamily: "Georgia, serif", transition: "all 0.2s",
              background: tab === t ? (t === "filtered" ? "linear-gradient(135deg, #f59e0b, #d97706)" : t === "shortlisted" ? "linear-gradient(135deg, #7B1D2E, #7B1D2E)" : "linear-gradient(135deg, #7B1D2E, #7B1D2E)") : "transparent",
              color: tab === t ? "white" : "#6b7280"
            }}>
              {t === "received" ? `Received (${received.length})` : t === "shortlisted" ? `Shortlisted (${shortlisted.length})` : t === "sent" ? `Sent (${sent.length})` : `Filtered (${filtered.length})`}
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
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>{tab === "received" ? "💌" : tab === "filtered" ? "🔍" : "📤"}</div>
            <p style={{ color: "#6b7280", fontSize: "16px", margin: "0 0 20px" }}>
              {tab === "received" ? "No interests received yet." : tab === "filtered" ? "No filtered interests. Your contact filter criteria is not excluding anyone yet." : "You haven't sent any interests yet."}
            </p>
            {tab === "sent" && (
              <Link href="/profiles" style={{ display: "inline-block", padding: "12px 28px", background: "linear-gradient(135deg, #7B1D2E, #7B1D2E)", color: "white", borderRadius: "12px", fontWeight: 700, textDecoration: "none", fontSize: "14px" }}>
                Browse Profiles →
              </Link>
            )}
          </div>
        ) : tab === "shortlisted" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
            {shortlisted.length === 0 ? (
              <p style={{ gridColumn: "span 2", textAlign: "center", color: "#9ca3af", fontSize: "13px", padding: "40px 0" }}>No profiles shortlisted yet. Tap the heart on any profile to save it.</p>
            ) : shortlisted.map((s: any) => {
              const p = s.profile
              if (!p) return null
              return (
                <a key={s.profile_id} href={"/profile/" + s.profile_id} style={{ textDecoration: "none", display: "block", background: "white", borderRadius: "16px", overflow: "hidden", border: "1.5px solid #fce7f3", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ width: "100%", paddingBottom: "75%", position: "relative", background: "#f3f4f6" }}>
                    {p.photo_url
                      ? <img src={p.photo_url} alt={p.full_name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%" }} />
                      : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", background: "linear-gradient(135deg,#fce7f3,#ede9fe)" }}>?</div>
                    }
                    <div style={{ position: "absolute", top: "8px", right: "8px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#7B1D2E" stroke="#7B1D2E" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </div>
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 700, color: "#111827" }}>{p.full_name || "Anonymous"}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#6b7280" }}>{p.age} yrs · {p.city || p.district || "Bangladesh"}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#9ca3af" }}>{p.profession}</p>
                  </div>
                </a>
              )
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {list.map((interest: any) => {
              const person = tab === "received" ? interest.sender : interest.receiver
              const status = statusConfig[interest.status] || statusConfig.pending
              const profileId = tab === "received" ? interest.sender_id : interest.receiver_id
              const isMutual = interest.status === "accepted"
              const isGuardian = !!person?.guardian_mode

              return (
                <div key={interest.id} style={{ background: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: isMutual ? "2px solid #d1fae5" : "1px solid #f3f4f6" }}>

                  {/* Top row: photo + info + status */}
                  <div style={{ padding: "16px", display: "flex", gap: "14px", alignItems: "center" }}>

                    {/* Photo */}
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#f3f4f6" }}>
                      {person?.photo_url
                        ? <img src={person.photo_url} alt={person?.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>👤</div>
                      }
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <h3 style={{ margin: "0", fontSize: "16px", fontWeight: 700, color: "#1a1a2e" }}>{person?.full_name || "Unknown"}</h3>
                        {isGuardian ? (
                          <span style={{ fontSize: "10px", fontWeight: 700, color: "#7B1D2E", background: "#ede9fe", padding: "2px 7px", borderRadius: "20px", border: "1px solid #c4b5fd" }}>
                            👨‍👩‍👧 পরিবার পরিচালিত
                          </span>
                        ) : (
                          <span style={{ fontSize: "10px", fontWeight: 700, color: "#0369a1", background: "#e0f2fe", padding: "2px 7px", borderRadius: "20px", border: "1px solid #bae6fd" }}>
                            👤 নিজে পরিচালিত
                          </span>
                        )}
                      </div>
                      <p style={{ margin: "4px 0 6px", fontSize: "13px", color: "#6b7280" }}>
                        {person?.age} yrs · {person?.district} · {person?.profession}
                      </p>
                      <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af" }}>
                        {new Date(interest.created_at || interest.sent_at).toLocaleDateString("en-GB")}
                      </p>
                    </div>

                    {/* Filter reason badge for filtered tab */}
                    {tab === "filtered" && interest.filterReason && (
                      <div style={{ padding: "8px 16px", background: "#fffbeb", borderTop: "1px solid #fde68a" }}>
                        <p style={{ margin: 0, fontSize: "12px", color: "#92400e", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>⚠️</span>
                          <span><strong>Filtered:</strong> {interest.filterReason}. You can still accept this interest.</span>
                        </p>
                      </div>
                    )}

                    {/* Status + view */}
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

                      <Link href={"/profile/" + profileId} style={{ fontSize: "12px", color: "#7B1D2E", textDecoration: "none", fontWeight: 600 }}>
                        View Profile →
                      </Link>
                    </div>
                  </div>

                  {/* ── MUTUAL ACCEPTANCE PANEL ── */}
                  {isMutual && (
                    <div style={{ borderTop: "1px solid #f0fdf4", background: "linear-gradient(135deg, #f0fdf4, #f5f3ff)", padding: "16px" }}>
                      <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 700, color: "#065f46", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "16px" }}>🎉</span>
                        Mutual interest! Choose how to connect:
                      </p>

                      {/* Guardian notice */}
                      {isGuardian && (
                        <div style={{ marginBottom: "12px", padding: "10px 14px", background: "#faf5ff", borderRadius: "10px", border: "1px solid #e9d5ff", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                          <span style={{ fontSize: "16px", flexShrink: 0 }}>👨‍👩‍👧</span>
                          <p style={{ margin: 0, fontSize: "12px", color: "#7B1D2E", lineHeight: "1.5" }}>
                            <strong>পরিবার পরিচালিত প্রোফাইল</strong> — This profile is managed by a family guardian. Please keep your messages respectful and formal. Introduce yourself clearly.
                          </p>
                        </div>
                      )}

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>

                        {/* Voice Call */}
                        <button onClick={() => { setCallTarget({ id: profileId, full_name: person?.full_name, photo_url: person?.photo_url }); setShowCallModal(true); }} style={{
                          display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                          padding: "14px 8px", borderRadius: "12px",
                          background: "white", border: "1.5px solid #d1fae5",
                          transition: "all 0.15s", cursor: "pointer"
                        }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textAlign: "center" }}>Voice Call</span>
                        </button>

                        {/* Message */}
                        <button onClick={() => tryOpenChat(person, String(profileId), true)} style={{
                          display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                          padding: "14px 8px", borderRadius: "12px",
                          background: "white", border: "1.5px solid #e9d5ff",
                          transition: "all 0.15s", cursor: "pointer"
                        }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#7B1D2E,#7B1D2E)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#7B1D2E", textAlign: "center" }}>Message</span>
                        </button>

                        {/* A Day Together game */}
                        <a href={`/game?with=${profileId}`} style={{
                          display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                          padding: "14px 8px", borderRadius: "12px", textDecoration: "none",
                          background: "linear-gradient(135deg,#0d0521,#4A1A6B)", border: "1.5px solid #4A1A6B",
                          transition: "all 0.15s", cursor: "pointer"
                        }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(250,217,90,0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(250,217,90,0.4)" }}>
                            <span style={{ fontSize: "16px" }}>✦</span>
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#FAD95A", textAlign: "center", fontFamily: "Georgia, serif" }}>একটি দিন</span>
                        </a>
                      </div>

                      <p style={{ margin: "10px 0 0", fontSize: "11px", color: "#9ca3af", textAlign: "center" }}>
                        Voice Call · Message (Premium) · A Day Together game
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Guardian Warning Modal */}
      {guardianWarningFor && chatWith && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "28px 24px", maxWidth: "380px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>👨‍👩‍👧</div>
              <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 800, color: "#111827" }}>পরিবার পরিচালিত প্রোফাইল</h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#6b7280", lineHeight: "1.6" }}>
                This profile is managed by a family guardian, not the person themselves.
              </p>
            </div>

            <div style={{ background: "#faf5ff", borderRadius: "12px", padding: "14px", marginBottom: "20px", border: "1px solid #e9d5ff" }}>
              <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 700, color: "#7B1D2E" }}>Please keep in mind:</p>
              <ul style={{ margin: 0, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.5" }}>Introduce yourself clearly with your name and background</li>
                <li style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.5" }}>Keep language respectful and formal</li>
                <li style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.5" }}>A guardian may be reading — treat this like meeting the family</li>
              </ul>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => { setGuardianWarningFor(null); setChatWith(null) }}
                style={{ flex: 1, padding: "12px", background: "#f3f4f6", color: "#6b7280", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={() => openChat(chatWith, guardianWarningFor)}
                style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#7B1D2E,#7B1D2E)", color: "white", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#111827" }}>{chatWith.full_name || "Unknown"}</p>
                    {chatWith.guardian_mode && (
                      <span style={{ fontSize: "10px", fontWeight: 700, color: "#7B1D2E", background: "#ede9fe", padding: "1px 6px", borderRadius: "20px" }}>পরিবার পরিচালিত</span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af" }}>
                    {chatWith.guardian_mode ? "Family managed profile — be respectful" : "Premium messaging"}
                  </p>
                </div>
              </div>
              <button onClick={() => { setShowChat(null); setChatWith(null); setMessages([]) }} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9ca3af" }}>×</button>
            </div>

            {/* Guardian reminder banner inside chat */}
            {chatWith.guardian_mode && (
              <div style={{ padding: "8px 16px", background: "#faf5ff", borderBottom: "1px solid #e9d5ff", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px" }}>👨‍👩‍👧</span>
                <p style={{ margin: 0, fontSize: "11px", color: "#7B1D2E" }}>This profile is family managed. Please introduce yourself and keep language respectful.</p>
              </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "13px", marginTop: "40px" }}>
                  {chatWith.guardian_mode
                    ? "Start by introducing yourself — name, profession, and what you're looking for."
                    : "No messages yet. Say hello!"}
                </div>
              ) : messages.map((msg: any, i: number) => {
                const isMine = String(msg.sender_id) === String(userId)
                return (
                  <div key={i} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "70%", padding: "10px 14px", borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: isMine ? "linear-gradient(135deg,#7B1D2E,#7B1D2E)" : "#f3f4f6", color: isMine ? "white" : "#111827", fontSize: "13px", lineHeight: 1.5 }}>
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
                placeholder={chatWith.guardian_mode ? "Introduce yourself respectfully..." : "Type a message..."}
                style={{ flex: 1, padding: "10px 14px", borderRadius: "12px", border: "1.5px solid #e5e7eb", fontSize: "13px", outline: "none", color: "#111827", background: "white" }}
              />
              <button onClick={sendMessage} disabled={sendingMsg || !msgInput.trim()} style={{ padding: "10px 18px", background: "linear-gradient(135deg,#7B1D2E,#7B1D2E)", color: "white", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Call Modal */}
      {showCallModal && callTarget && currentUser && (
        <CallModal
          currentUser={currentUser}
          targetProfile={callTarget}
          mode="outgoing"
          onClose={() => { setShowCallModal(false); setCallTarget(null); }}
        />
      )}
    </div>
  )
}