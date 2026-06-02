'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const ADMIN_IDS = [1241]

const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }

async function sb(path: string, opts?: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers, ...opts })
  return res.json()
}

async function sbPatch(path: string, body: any) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'PATCH', headers: { ...headers, 'Prefer': 'return=minimal' },
    body: JSON.stringify(body)
  })
}

async function sbDelete(path: string) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, { method: 'DELETE', headers })
}

const PACKAGES = ['prottasha', 'bondhon', 'milon', 'biswas']
const PACKAGE_LABELS: Record<string, string> = {
  prottasha: 'Free', bondhon: 'Bondhon', milon: 'Milon', biswas: 'Biswas'
}
const PACKAGE_COLORS: Record<string, string> = {
  prottasha: '#9ca3af', bondhon: '#3b82f6', milon: '#7c3aed', biswas: '#f59e0b'
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(false)

  // Overview stats
  const [stats, setStats] = useState<any>({})

  // Users tab
  const [users, setUsers] = useState<any[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [userPage, setUserPage] = useState(0)

  // Verifications tab
  const [verifications, setVerifications] = useState<any[]>([])
  const [verifyFilter, setVerifyFilter] = useState('pending')

  // SMS tab
  const [smsTarget, setSmsTarget] = useState('all')
  const [smsMessage, setSmsMessage] = useState('')
  const [smsSending, setSmsSending] = useState(false)
  const [smsResult, setSmsResult] = useState('')

  // Reports tab
  const [reports, setReports] = useState<any[]>([])

  // Action feedback
  const [actionMsg, setActionMsg] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('biyekori_user')
    if (!stored) { router.push('/login'); return }
    const u = JSON.parse(stored)
    if (!ADMIN_IDS.includes(Number(u.id)) && !u.is_admin) { router.push('/dashboard'); return }
    setUser(u)
    loadStats()
  }, [])

  useEffect(() => {
    if (!user) return
    if (tab === 'users') loadUsers()
    if (tab === 'verifications') loadVerifications()
  }, [tab, user])

  const showMsg = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 4000) }

  const loadStats = async () => {
    const [total, male, female, premium, active, pending] = await Promise.all([
      sb('profiles?select=count', { headers: { ...headers, 'Prefer': 'count=exact', 'Range': '0-0' } }).then(() => fetch(`${SUPABASE_URL}/rest/v1/profiles?select=count`, { headers: { ...headers, 'Prefer': 'count=exact', 'Range': '0-0' } }).then(r => r.headers.get('content-range')?.split('/')[1] || '0')),
      fetch(`${SUPABASE_URL}/rest/v1/profiles?gender=eq.male&select=count`, { headers: { ...headers, 'Prefer': 'count=exact', 'Range': '0-0' } }).then(r => r.headers.get('content-range')?.split('/')[1] || '0'),
      fetch(`${SUPABASE_URL}/rest/v1/profiles?gender=eq.female&select=count`, { headers: { ...headers, 'Prefer': 'count=exact', 'Range': '0-0' } }).then(r => r.headers.get('content-range')?.split('/')[1] || '0'),
      fetch(`${SUPABASE_URL}/rest/v1/profiles?package=neq.prottasha&select=count`, { headers: { ...headers, 'Prefer': 'count=exact', 'Range': '0-0' } }).then(r => r.headers.get('content-range')?.split('/')[1] || '0'),
      fetch(`${SUPABASE_URL}/rest/v1/profiles?last_active_at=gte.${new Date(Date.now() - 86400000).toISOString()}&select=count`, { headers: { ...headers, 'Prefer': 'count=exact', 'Range': '0-0' } }).then(r => r.headers.get('content-range')?.split('/')[1] || '0'),
      fetch(`${SUPABASE_URL}/rest/v1/profiles?selfie_status=eq.pending&select=count`, { headers: { ...headers, 'Prefer': 'count=exact', 'Range': '0-0' } }).then(r => r.headers.get('content-range')?.split('/')[1] || '0'),
    ])
    setStats({ total, male, female, premium, active, pending })
  }

  const loadUsers = async () => {
    setLoading(true)
    let query = `profiles?select=id,full_name,email,phone,gender,package,is_banned,is_verified,selfie_status,created_at,profile_completion&order=created_at.desc&limit=20&offset=${userPage * 20}`
    if (userSearch) query += `&or=(full_name.ilike.*${userSearch}*,email.ilike.*${userSearch}*,phone.ilike.*${userSearch}*)`
    if (userFilter === 'premium') query += `&package=neq.prottasha`
    if (userFilter === 'banned') query += `&is_banned=eq.true`
    if (userFilter === 'verified') query += `&is_verified=eq.true`
    if (userFilter === 'male') query += `&gender=eq.male`
    if (userFilter === 'female') query += `&gender=eq.female`
    const data = await sb(query)
    setUsers(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const loadVerifications = async () => {
    setLoading(true)
    const data = await sb(`profiles?selfie_status=eq.${verifyFilter}&select=id,full_name,photo_url,selfie_url,selfie_notes,selfie_attempts,selfie_verified_at&order=created_at.desc&limit=30`)
    setVerifications(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const banUser = async (id: number, ban: boolean) => {
    await sbPatch(`profiles?id=eq.${id}`, { is_banned: ban })
    showMsg(`User ${ban ? 'banned' : 'unbanned'} successfully`)
    loadUsers()
  }

  const deleteUser = async (id: number, name: string) => {
    if (!confirm(`Delete profile of ${name}? This cannot be undone.`)) return
    await sbDelete(`profiles?id=eq.${id}`)
    showMsg(`Profile ${name} deleted`)
    loadUsers()
  }

  const changePackage = async (id: number, pkg: string) => {
    await sbPatch(`profiles?id=eq.${id}`, { package: pkg })
    showMsg(`Package updated to ${PACKAGE_LABELS[pkg]}`)
    loadUsers()
  }

  const approveVerification = async (id: number) => {
    await sbPatch(`profiles?id=eq.${id}`, {
      selfie_status: 'approved',
      selfie_verified_at: new Date().toISOString()
    })
    await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
      method: 'POST', headers,
      body: JSON.stringify({ user_id: id, type: 'selfie_verified', message: 'Your selfie verification was approved! Your profile now shows a Selfie Verified badge.', is_read: false })
    })
    showMsg('Verification approved')
    loadVerifications()
  }

  const rejectVerification = async (id: number, reason: string) => {
    await sbPatch(`profiles?id=eq.${id}`, { selfie_status: 'rejected' })
    await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
      method: 'POST', headers,
      body: JSON.stringify({ user_id: id, type: 'selfie_rejected', message: `Your selfie verification was not approved. ${reason || 'Please try again with a clearer photo.'}`, is_read: false })
    })
    showMsg('Verification rejected')
    loadVerifications()
  }

  const sendBulkSMS = async () => {
    if (!smsMessage.trim()) { showMsg('Please enter a message'); return }
    if (!confirm(`Send SMS to ${smsTarget === 'all' ? 'ALL users' : smsTarget + ' users'}?`)) return
    setSmsSending(true)

    // Get phone numbers
    let query = 'profiles?select=phone,full_name&phone=not.is.null&phone_verified=eq.true'
    if (smsTarget === 'premium') query += '&package=neq.prottasha'
    if (smsTarget === 'free') query += '&package=eq.prottasha'
    if (smsTarget === 'male') query += '&gender=eq.male'
    if (smsTarget === 'female') query += '&gender=eq.female'

    const profiles = await sb(query)
    const phones = Array.isArray(profiles) ? profiles.map((p: any) => p.phone).filter(Boolean) : []

    if (phones.length === 0) { setSmsResult('No phone numbers found for this group.'); setSmsSending(false); return }

    // Send via BulkSMS API
    try {
      const res = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phones, message: smsMessage, bulk: true })
      })
      const data = await res.json()
      setSmsResult(`SMS sent to ${phones.length} numbers. ${data.message || ''}`)
    } catch (e) {
      setSmsResult('SMS sending failed. Check BulkSMS API key.')
    }
    setSmsSending(false)
  }

  if (!user) return null

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'verifications', label: 'Verifications', icon: '🛡️' },
    { id: 'packages', label: 'Packages', icon: '💎' },
    { id: 'sms', label: 'SMS Broadcast', icon: '📱' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Top bar */}
      <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px', fontWeight: 900, color: 'white' }}>Biyekori</span>
          <span style={{ background: '#e11d48', color: 'white', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', letterSpacing: '0.5px' }}>ADMIN</span>
        </div>
        <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Exit Admin</Link>
      </div>

      <div style={{ paddingTop: '60px', display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <div style={{ width: '200px', background: 'white', borderRight: '1px solid #e5e7eb', position: 'fixed', top: '60px', bottom: 0, overflowY: 'auto', padding: '16px 0' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              width: '100%', padding: '12px 20px', border: 'none', cursor: 'pointer', textAlign: 'left',
              background: tab === t.id ? '#fff1f2' : 'transparent',
              borderLeft: tab === t.id ? '3px solid #e11d48' : '3px solid transparent',
              color: tab === t.id ? '#e11d48' : '#6b7280',
              fontSize: '13px', fontWeight: tab === t.id ? 700 : 500,
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
          <div style={{ margin: '16px 20px 0', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
            <Link href="/admin/verifications" style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>Old Verify Panel</Link>
            <Link href="/profiles" style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'none', display: 'block' }}>Browse Profiles</Link>
          </div>
        </div>

        {/* Main content */}
        <div style={{ marginLeft: '200px', flex: 1, padding: '24px', maxWidth: 'calc(100vw - 200px)' }}>

          {actionMsg && (
            <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#15803d', fontWeight: 600 }}>
              {actionMsg}
            </div>
          )}

          {/* OVERVIEW TAB */}
          {tab === 'overview' && (
            <div>
              <h1 style={{ margin: '0 0 24px', fontSize: '22px', fontWeight: 800, color: '#111827' }}>Admin Overview</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Total Profiles', value: stats.total, color: '#e11d48', bg: '#fff1f2' },
                  { label: 'Male', value: stats.male, color: '#3b82f6', bg: '#eff6ff' },
                  { label: 'Female', value: stats.female, color: '#ec4899', bg: '#fdf2f8' },
                  { label: 'Premium Users', value: stats.premium, color: '#7c3aed', bg: '#f5f3ff' },
                  { label: 'Active Today', value: stats.active, color: '#10b981', bg: '#f0fdf4' },
                  { label: 'Pending Verify', value: stats.pending, color: '#f59e0b', bg: '#fffbeb' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${s.bg}` }}>
                    <div style={{ fontSize: '30px', fontWeight: 900, color: s.color, marginBottom: '4px' }}>{s.value || '—'}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 800, color: '#111827' }}>Quick Actions</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'View Pending Verifications', action: () => { setTab('verifications'); setVerifyFilter('pending') }, color: '#f59e0b' },
                    { label: 'Browse All Users', action: () => setTab('users'), color: '#3b82f6' },
                    { label: 'Send SMS Broadcast', action: () => setTab('sms'), color: '#10b981' },
                    { label: 'Manage Packages', action: () => setTab('packages'), color: '#7c3aed' },
                  ].map((a, i) => (
                    <button key={i} onClick={a.action} style={{ padding: '10px 18px', background: a.color, color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {tab === 'users' && (
            <div>
              <h1 style={{ margin: '0 0 20px', fontSize: '22px', fontWeight: 800, color: '#111827' }}>User Management</h1>

              {/* Search + filter */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadUsers()}
                  placeholder="Search name, email, phone..."
                  style={{ flex: 1, minWidth: '200px', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px' }}
                />
                <select value={userFilter} onChange={e => { setUserFilter(e.target.value); setUserPage(0) }}
                  style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px' }}>
                  <option value="all">All Users</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="premium">Premium</option>
                  <option value="banned">Banned</option>
                  <option value="verified">NID Verified</option>
                </select>
                <button onClick={loadUsers} style={{ padding: '10px 18px', background: '#e11d48', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                  Search
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading...</div>
              ) : (
                <div style={{ background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                        {['ID', 'Name', 'Email/Phone', 'Gender', 'Package', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u: any, i: number) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6', background: u.is_banned ? '#fff1f2' : 'white' }}>
                          <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{u.id}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 700, color: '#111827' }}>{u.full_name || 'N/A'}</div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{u.profile_completion}% complete</div>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                            <div>{u.email}</div>
                            <div>{u.phone}</div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '2px 8px', background: u.gender === 'male' ? '#eff6ff' : '#fdf2f8', color: u.gender === 'male' ? '#3b82f6' : '#ec4899', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                              {u.gender}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <select value={u.package || 'prottasha'} onChange={e => changePackage(u.id, e.target.value)}
                              style={{ padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px', color: PACKAGE_COLORS[u.package || 'prottasha'], fontWeight: 700 }}>
                              {PACKAGES.map(p => <option key={p} value={p}>{PACKAGE_LABELS[p]}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {u.is_verified && <span style={{ padding: '2px 6px', background: '#dcfce7', color: '#15803d', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>NID</span>}
                              {u.selfie_status === 'approved' && <span style={{ padding: '2px 6px', background: '#dbeafe', color: '#1d4ed8', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>Selfie</span>}
                              {u.is_banned && <span style={{ padding: '2px 6px', background: '#fff1f2', color: '#e11d48', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>Banned</span>}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <Link href={`/profile/${u.id}`} target="_blank"
                                style={{ padding: '4px 8px', background: '#f3f4f6', color: '#374151', borderRadius: '6px', fontSize: '11px', fontWeight: 600, textDecoration: 'none' }}>
                                View
                              </Link>
                              <button onClick={() => banUser(u.id, !u.is_banned)}
                                style={{ padding: '4px 8px', background: u.is_banned ? '#dcfce7' : '#fff1f2', color: u.is_banned ? '#15803d' : '#e11d48', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                                {u.is_banned ? 'Unban' : 'Ban'}
                              </button>
                              <button onClick={() => deleteUser(u.id, u.full_name)}
                                style={{ padding: '4px 8px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                                Del
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '13px' }}>No users found</div>}
                </div>
              )}

              {/* Pagination */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
                <button onClick={() => { setUserPage(Math.max(0, userPage - 1)); loadUsers() }} disabled={userPage === 0}
                  style={{ padding: '8px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', opacity: userPage === 0 ? 0.5 : 1 }}>
                  Previous
                </button>
                <span style={{ padding: '8px 16px', fontSize: '13px', color: '#6b7280' }}>Page {userPage + 1}</span>
                <button onClick={() => { setUserPage(userPage + 1); loadUsers() }} disabled={users.length < 20}
                  style={{ padding: '8px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', opacity: users.length < 20 ? 0.5 : 1 }}>
                  Next
                </button>
              </div>
            </div>
          )}

          {/* VERIFICATIONS TAB */}
          {tab === 'verifications' && (
            <div>
              <h1 style={{ margin: '0 0 20px', fontSize: '22px', fontWeight: 800, color: '#111827' }}>Selfie Verifications</h1>

              <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '10px', marginBottom: '16px', width: 'fit-content', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                {(['pending', 'approved', 'rejected'] as const).map(f => (
                  <button key={f} onClick={() => { setVerifyFilter(f); setTimeout(loadVerifications, 0) }} style={{
                    padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: verifyFilter === f ? 'linear-gradient(135deg,#e11d48,#db2777)' : 'transparent',
                    color: verifyFilter === f ? 'white' : '#6b7280',
                    fontSize: '12px', fontWeight: 700, textTransform: 'capitalize'
                  }}>{f}</button>
                ))}
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading...</div>
              ) : verifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '14px', color: '#9ca3af', fontSize: '14px' }}>No {verifyFilter} verifications</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {verifications.map((v: any) => (
                    <VerifyCard key={v.id} v={v} filter={verifyFilter} onApprove={approveVerification} onReject={rejectVerification} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PACKAGES TAB */}
          {tab === 'packages' && (
            <div>
              <h1 style={{ margin: '0 0 20px', fontSize: '22px', fontWeight: 800, color: '#111827' }}>Package Management</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {PACKAGES.map(pkg => (
                  <div key={pkg} style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `4px solid ${PACKAGE_COLORS[pkg]}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: PACKAGE_COLORS[pkg] }}>{PACKAGE_LABELS[pkg]}</h3>
                      <span style={{ fontSize: '11px', background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>{pkg}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                      {pkg === 'prottasha' && 'Free plan — pages 1-5, 3 interests/month'}
                      {pkg === 'bondhon' && 'Basic paid — unlimited browse, contact view'}
                      {pkg === 'milon' && 'Mid tier — messaging, 15min calls'}
                      {pkg === 'biswas' && 'Premium — all features, priority listing'}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 800, color: '#111827' }}>Manually Assign Package</h3>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6b7280' }}>Search for a user in the Users tab and use the package dropdown to change their plan directly.</p>
                <button onClick={() => setTab('users')} style={{ padding: '10px 20px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                  Go to Users
                </button>
              </div>
            </div>
          )}

          {/* SMS TAB */}
          {tab === 'sms' && (
            <div>
              <h1 style={{ margin: '0 0 20px', fontSize: '22px', fontWeight: 800, color: '#111827' }}>SMS Broadcast</h1>

              <div style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Send To</label>
                  <select value={smsTarget} onChange={e => setSmsTarget(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px' }}>
                    <option value="all">All verified phone users</option>
                    <option value="premium">Premium users only</option>
                    <option value="free">Free users only</option>
                    <option value="male">Male users</option>
                    <option value="female">Female users</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                    Message <span style={{ color: '#9ca3af', fontWeight: 400 }}>({smsMessage.length}/160 characters)</span>
                  </label>
                  <textarea
                    value={smsMessage}
                    onChange={e => setSmsMessage(e.target.value.slice(0, 160))}
                    rows={4}
                    placeholder="Type your message here... Keep it under 160 characters for single SMS."
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ background: '#fffbeb', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '12px', color: '#92400e' }}>
                  <strong>Warning:</strong> This will send SMS to real phone numbers and will use your BulkSMS credits. Make sure your message is correct before sending.
                </div>

                <button onClick={sendBulkSMS} disabled={smsSending || !smsMessage.trim()}
                  style={{ width: '100%', padding: '14px', background: smsSending ? '#9ca3af' : 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: smsSending ? 'not-allowed' : 'pointer' }}>
                  {smsSending ? 'Sending...' : 'Send SMS Broadcast'}
                </button>

                {smsResult && (
                  <div style={{ marginTop: '12px', padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '13px', color: '#15803d', fontWeight: 600 }}>
                    {smsResult}
                  </div>
                )}
              </div>

              <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 800, color: '#111827' }}>SMS Templates</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    'Biyekori: আপনার প্রোফাইলে নতুন ইন্টারেস্ট এসেছে! দেখুন: biyekori.com',
                    'Biyekori: আপনার পছন্দের কেউ আপনার প্রোফাইল দেখেছে। লগইন করুন: biyekori.com',
                    'Biyekori: আজকের সেরা ম্যাচ দেখতে লগইন করুন: biyekori.com',
                  ].map((t, i) => (
                    <button key={i} onClick={() => setSmsMessage(t)}
                      style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', color: '#374151', cursor: 'pointer', textAlign: 'left' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function VerifyCard({ v, filter, onApprove, onReject }: { v: any, filter: string, onApprove: Function, onReject: Function }) {
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [zoomed, setZoomed] = useState<string | null>(null)

  const notes = v.selfie_notes || ''
  const aiSame = notes.match(/same_person=(\w+)/)?.[1] || '?'
  const aiLive = notes.match(/liveness=(\w+)/)?.[1] || '?'
  const aiConf = notes.match(/confidence=(\w+)/)?.[1] || '?'
  const aiReason = notes.match(/Reason: ([^|]+)/)?.[1]?.trim() || ''

  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'grid', gridTemplateColumns: '140px 140px 1fr', gap: '20px', alignItems: 'start' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: '0 0 6px', fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Profile Photo</p>
        {v.photo_url ? <img src={v.photo_url} onClick={() => setZoomed(v.photo_url)} alt="" style={{ width: '120px', height: '140px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #e5e7eb', cursor: 'zoom-in' }} />
          : <div style={{ width: '120px', height: '140px', background: '#f3f4f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#9ca3af' }}>No photo</div>}
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: '0 0 6px', fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Live Selfie</p>
        {v.selfie_url ? <img src={v.selfie_url} onClick={() => setZoomed(v.selfie_url)} alt="" style={{ width: '120px', height: '140px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #e11d48', cursor: 'zoom-in' }} />
          : <div style={{ width: '120px', height: '140px', background: '#f3f4f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#9ca3af' }}>No selfie</div>}
      </div>
      <div>
        <p style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 800, color: '#111827' }}>{v.full_name || 'Anonymous'}</p>
        <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#9ca3af' }}>ID: {v.id} · Attempts: {v.selfie_attempts}</p>
        <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '12px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Same: <strong style={{ color: aiSame === 'yes' ? '#10b981' : aiSame === 'no' ? '#e11d48' : '#f59e0b' }}>{aiSame}</strong></span>
            <span>Live: <strong style={{ color: aiLive === 'yes' ? '#10b981' : '#e11d48' }}>{aiLive}</strong></span>
            <span>Conf: <strong style={{ color: aiConf === 'high' ? '#10b981' : aiConf === 'medium' ? '#f59e0b' : '#e11d48' }}>{aiConf}</strong></span>
          </div>
          {aiReason && <p style={{ margin: '6px 0 0', color: '#6b7280', fontStyle: 'italic', fontSize: '11px' }}>{aiReason}</p>}
        </div>
        {filter === 'pending' && (
          showReject ? (
            <div>
              <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Rejection reason (sent to user)"
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => onReject(v.id, rejectReason)} style={{ flex: 1, padding: '8px', background: '#e11d48', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Confirm Reject</button>
                <button onClick={() => setShowReject(false)} style={{ padding: '8px 12px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => onApprove(v.id)} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Approve</button>
              <button onClick={() => setShowReject(true)} style={{ flex: 1, padding: '10px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Reject</button>
            </div>
          )
        )}
        {filter === 'approved' && <div style={{ padding: '8px 12px', background: '#dcfce7', borderRadius: '8px', fontSize: '12px', color: '#15803d', fontWeight: 600, textAlign: 'center' }}>Approved {v.selfie_verified_at ? new Date(v.selfie_verified_at).toLocaleDateString() : ''}</div>}
        {filter === 'rejected' && <div style={{ padding: '8px 12px', background: '#fff1f2', borderRadius: '8px', fontSize: '12px', color: '#e11d48', fontWeight: 600, textAlign: 'center' }}>Rejected</div>}
      </div>
      {zoomed && <div onClick={() => setZoomed(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
        <img src={zoomed} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px', objectFit: 'contain' }} />
      </div>}
    </div>
  )
}
