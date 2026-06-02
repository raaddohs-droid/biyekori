'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Admin user IDs - add your own user ID here
const ADMIN_IDS = [1241] // replace with your actual admin profile IDs

export default function AdminVerifications() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [actionMsg, setActionMsg] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('biyekori_user')
    if (!stored) { router.push('/login'); return }
    const u = JSON.parse(stored)
    if (!ADMIN_IDS.includes(Number(u.id)) && !u.is_admin) {
      router.push('/dashboard')
      return
    }
    setUser(u)
    loadVerifications('pending')
  }, [])

  const loadVerifications = async (status: string) => {
    setLoading(true)
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?selfie_status=eq.${status}&select=id,full_name,photo_url,selfie_url,selfie_notes,selfie_attempts,selfie_verified_at,created_at&order=created_at.desc&limit=50`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    )
    const data = await res.json()
    setPending(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const handleAction = async (profileId: number, action: 'approved' | 'rejected', reason?: string) => {
    const updates: any = {
      selfie_status: action,
    }
    if (action === 'approved') {
      updates.selfie_verified_at = new Date().toISOString()
    }
    if (reason) {
      updates.selfie_notes = (updates.selfie_notes || '') + ` | Admin: ${reason}`
    }

    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${profileId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(updates)
    })

    // Send notification to user
    const notifMsg = action === 'approved'
      ? 'Your selfie verification was approved! Your profile now shows a Selfie Verified badge.'
      : `Your selfie verification was not approved. Reason: ${reason || 'Please try again with a clearer photo.'}  You may re-submit if you have attempts remaining.`

    await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: profileId,
        type: action === 'approved' ? 'selfie_verified' : 'selfie_rejected',
        message: notifMsg,
        is_read: false
      })
    })

    setActionMsg(`Profile ${profileId} ${action}`)
    setTimeout(() => setActionMsg(''), 3000)
    setPending(prev => prev.filter(p => p.id !== profileId))
  }

  const counts = { pending: 0, approved: 0, rejected: 0 }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', paddingTop: '80px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 800, color: '#111827' }}>Selfie Verification Queue</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>Review and approve selfie verification requests</p>
          </div>
          <Link href="/dashboard" style={{ padding: '8px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', color: '#6b7280', textDecoration: 'none', fontWeight: 600 }}>
            Dashboard
          </Link>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', width: 'fit-content' }}>
          {(['pending', 'approved', 'rejected'] as const).map(tab => (
            <button key={tab} onClick={() => { setFilter(tab); loadVerifications(tab) }} style={{
              padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: filter === tab ? 'linear-gradient(135deg,#e11d48,#db2777)' : 'transparent',
              color: filter === tab ? 'white' : '#6b7280',
              fontSize: '13px', fontWeight: 700, textTransform: 'capitalize'
            }}>
              {tab}
            </button>
          ))}
        </div>

        {actionMsg && (
          <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#15803d', fontWeight: 600 }}>
            {actionMsg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', fontSize: '14px' }}>Loading...</div>
        ) : pending.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', color: '#9ca3af', fontSize: '14px' }}>
            No {filter} verifications
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pending.map((profile: any) => (
              <VerificationCard
                key={profile.id}
                profile={profile}
                filter={filter}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function VerificationCard({ profile, filter, onAction }: { profile: any, filter: string, onAction: Function }) {
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [zoomed, setZoomed] = useState<string | null>(null)

  // Parse AI notes
  const notes = profile.selfie_notes || ''
  const aiMatch = notes.match(/same_person=(\w+).*?liveness=(\w+).*?confidence=(\w+)/)
  const aiSamePerson = aiMatch?.[1] || 'unknown'
  const aiLiveness = aiMatch?.[2] || 'unknown'
  const aiConfidence = aiMatch?.[3] || 'unknown'
  const aiReason = notes.match(/Reason: ([^|]+)/)?.[1]?.trim() || ''

  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', alignItems: 'start' }}>

        {/* Profile photo */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Profile Photo</p>
          {profile.photo_url ? (
            <img src={profile.photo_url} alt="Profile" onClick={() => setZoomed(profile.photo_url)}
              style={{ width: '140px', height: '160px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #e5e7eb', cursor: 'zoom-in' }} />
          ) : (
            <div style={{ width: '140px', height: '160px', background: '#f3f4f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#9ca3af', fontSize: '13px' }}>No photo</div>
          )}
        </div>

        {/* Selfie */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Selfie</p>
          {profile.selfie_url ? (
            <img src={profile.selfie_url} alt="Selfie" onClick={() => setZoomed(profile.selfie_url)}
              style={{ width: '140px', height: '160px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #e5e7eb', cursor: 'zoom-in' }} />
          ) : (
            <div style={{ width: '140px', height: '160px', background: '#f3f4f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#9ca3af', fontSize: '13px' }}>No selfie</div>
          )}
        </div>

        {/* Info + actions */}
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: '#111827' }}>{profile.full_name || 'Anonymous'}</p>
          <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#9ca3af' }}>ID: {profile.id} · Attempts: {profile.selfie_attempts}</p>

          {/* AI analysis */}
          <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', marginBottom: '14px', fontSize: '12px' }}>
            <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#374151' }}>AI Analysis</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Same person:</span>
                <span style={{ fontWeight: 700, color: aiSamePerson === 'yes' ? '#10b981' : aiSamePerson === 'no' ? '#e11d48' : '#f59e0b' }}>{aiSamePerson}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Liveness:</span>
                <span style={{ fontWeight: 700, color: aiLiveness === 'yes' ? '#10b981' : '#e11d48' }}>{aiLiveness}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Confidence:</span>
                <span style={{ fontWeight: 700, color: aiConfidence === 'high' ? '#10b981' : aiConfidence === 'medium' ? '#f59e0b' : '#e11d48' }}>{aiConfidence}</span>
              </div>
            </div>
            {aiReason && <p style={{ margin: '8px 0 0', color: '#6b7280', fontStyle: 'italic', lineHeight: 1.4 }}>{aiReason}</p>}
          </div>

          {filter === 'pending' && (
            <>
              {showRejectInput ? (
                <div>
                  <input
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection (sent to user)"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => onAction(profile.id, 'rejected', rejectionReason || 'Photo did not meet verification requirements.')}
                      style={{ flex: 1, padding: '8px', background: '#e11d48', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      Confirm Reject
                    </button>
                    <button onClick={() => setShowRejectInput(false)}
                      style={{ padding: '8px 12px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => onAction(profile.id, 'approved')}
                    style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                    Approve
                  </button>
                  <button onClick={() => setShowRejectInput(true)}
                    style={{ flex: 1, padding: '10px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                    Reject
                  </button>
                </div>
              )}
            </>
          )}

          {filter === 'approved' && (
            <div style={{ padding: '8px 12px', background: '#dcfce7', borderRadius: '8px', fontSize: '12px', color: '#15803d', fontWeight: 600, textAlign: 'center' }}>
              Approved {profile.selfie_verified_at ? new Date(profile.selfie_verified_at).toLocaleDateString() : ''}
            </div>
          )}

          {filter === 'rejected' && (
            <div style={{ padding: '8px 12px', background: '#fff1f2', borderRadius: '8px', fontSize: '12px', color: '#e11d48', fontWeight: 600, textAlign: 'center' }}>
              Rejected
            </div>
          )}
        </div>
      </div>

      {/* Zoom modal */}
      {zoomed && (
        <div onClick={() => setZoomed(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          <img src={zoomed} alt="Zoomed" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px', objectFit: 'contain' }} />
        </div>
      )}
    </div>
  )
}
