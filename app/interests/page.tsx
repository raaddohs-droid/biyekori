"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function InterestsPage() {
  const [tab, setTab] = useState("received")
  const [received, setReceived] = useState<any[]>([])
  const [sent, setSent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("userId") || localStorage.getItem("user_id")
    if (stored) { setUserId(stored); fetchInterests(stored) }
    else setLoading(false)
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

  const statusBadge = (status: string) => {
    const styles: Record<string,string> = { pending: "bg-yellow-100 text-yellow-800", accepted: "bg-green-100 text-green-800", declined: "bg-red-100 text-red-800" }
    const labels: Record<string,string> = { pending: "Pending", accepted: "Accepted", declined: "Declined" }
    return <span className={"px-3 py-1 rounded-full text-xs font-bold " + (styles[status] || "bg-gray-100 text-gray-800")}>{labels[status] || status}</span>
  }

  const list = tab === "received" ? received : sent

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-6">Interests</h1>
        <div className="flex gap-2 mb-6">
          {["received","sent"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={"px-6 py-2.5 rounded-xl font-bold transition " + (tab === t ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg" : "bg-white text-gray-700 border-2 border-gray-200")}>
              {t === "received" ? "Received (" + received.length + ")" : "Sent (" + sent.length + ")"}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : list.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-5xl mb-4">{tab === "received" ? "💌" : "📤"}</div>
            <p className="text-gray-500 font-medium">{tab === "received" ? "No interests received yet." : "You have not sent any interests yet."}</p>
            {tab === "sent" && <Link href="/profiles" className="inline-block mt-4 px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold">Browse Profiles</Link>}
          </div>
        ) : (
          <div className="space-y-3">
            {list.map(interest => {
              const person = tab === "received" ? interest.sender : interest.receiver
              if (!person) return null
              return (
                <div key={interest.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {person.photo_url ? <img src={person.photo_url} alt={person.full_name} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{person.full_name}</h3>
                    <p className="text-sm text-gray-500">{person.age} yrs · {person.district} · {person.profession}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(interest.sent_at).toLocaleDateString("en-BD")}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {statusBadge(interest.status)}
                    {tab === "received" && interest.status === "pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => respond(interest.id, "accepted")} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600">Accept</button>
                        <button onClick={() => respond(interest.id, "declined")} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-300">Decline</button>
                      </div>
                    )}
                    <Link href={"/profile/" + (tab === "received" ? interest.sender_id : interest.receiver_id)} className="text-xs text-blue-500 hover:underline">View Profile</Link>
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





