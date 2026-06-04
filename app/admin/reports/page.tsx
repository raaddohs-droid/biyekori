"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'

const REASONS: Record<string, string> = {
  fake_profile: '🎭 Fake profile',
  inappropriate_photos: '📷 Inappropriate photos',
  harassment: '🚫 Harassment',
  married_claiming_single: '💍 Married claiming single',
  scam: '💰 Scam',
  underage: '⚠️ Underage',
  other: '📝 Other'
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('biyekori_user') || '{}')
      if (String(u.id) !== '1241') { window.location.href = '/dashboard'; return }
      setUserId(u.id)
      fetchReports(u.id)
    } catch { window.location.href = '/login' }
  }, [])

  async function fetchReports(uid: string) {
    setLoading(true)
    const res = await fetch(`/api/report?adminId=${uid}`)
    const data = await res.json()
    setReports(data.reports || [])
    setLoading(false)
  }

  async function updateStatus(reportId: number, status: string) {
    await fetch('/api/report', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, status, adminId: userId })
    })
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r))
  }

  const filtered = reports.filter(r => filter === 'all' ? true : r.status === filter)

  const statusColor: Record<string, string> = {
    pending: '#d97706',
    reviewed: '#0891b2',
    resolved: '#10b981',
    dismissed: '#9ca3af'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', paddingTop: '80px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px' }}>

        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 800, color: '#111827' }}>Reports</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>{reports.filter(r => r.status === 'pending').length} pending review</p>
          </div>
          <Link href="/admin" style={{ fontSize: '13px', color: '#e11d48', fontWeight: 700, textDecoration: 'none' }}>← Admin Panel</Link>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: 'white', padding: '6px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {['pending', 'reviewed', 'resolved', 'dismissed', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: filter === f ? 'linear-gradient(135deg,#e11d48,#db2777)' : 'transparent',
              color: filter === f ? 'white' : '#6b7280',
              fontSize: '12px', fontWeight: 700, textTransform: 'capitalize'
            }}>
              {f} {f !== 'all' && `(${reports.filter(r => r.status === f).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading reports...</div>
        ) : filtered.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>No {filter} reports.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map((report: any) => (
              <div key={report.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: report.status === 'pending' ? '1.5px solid #fde68a' : '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>

                  {/* Reported profile photo */}
                  <div style={{ width: '52px', height: '52px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#f3f4f6' }}>
                    {report.reported?.photo_url
                      ? <img src={report.reported.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
                    }
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>
                        {report.reported?.full_name || 'Unknown'}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: statusColor[report.status] || '#9ca3af', background: '#f8fafc', padding: '2px 8px', borderRadius: '20px', border: `1px solid ${statusColor[report.status] || '#e5e7eb'}` }}>
                        {report.status}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>
                      Reported by: <strong>{report.reporter?.full_name || 'Unknown'}</strong> ({report.reporter?.phone || ''})
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
                      {new Date(report.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <Link href={'/profile/' + report.reported_id} target="_blank" style={{ fontSize: '11px', color: '#e11d48', fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
                    View Profile →
                  </Link>
                </div>

                {/* Reason */}
                <div style={{ padding: '10px 14px', background: '#fff7ed', borderRadius: '10px', marginBottom: '10px', border: '1px solid #fed7aa' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#92400e' }}>
                    {REASONS[report.reason] || report.reason}
                  </p>
                  {report.details && <p style={{ margin: 0, fontSize: '12px', color: '#78350f' }}>{report.details}</p>}
                </div>

                {/* Proof */}
                {report.proof_url && (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#374151' }}>Proof:</p>
                    <a href={report.proof_url} target="_blank" rel="noopener noreferrer">
                      <img src={report.proof_url} alt="Proof" style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid #e5e7eb' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['reviewed', 'resolved', 'dismissed'].map(s => (
                    <button key={s} onClick={() => updateStatus(report.id, s)} disabled={report.status === s} style={{
                      padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: report.status === s ? 'default' : 'pointer', fontSize: '12px', fontWeight: 700,
                      background: report.status === s ? '#f3f4f6' : s === 'resolved' ? '#d1fae5' : s === 'reviewed' ? '#e0f2fe' : '#f3f4f6',
                      color: report.status === s ? '#9ca3af' : s === 'resolved' ? '#065f46' : s === 'reviewed' ? '#0369a1' : '#6b7280',
                      textTransform: 'capitalize'
                    }}>
                      {s}
                    </button>
                  ))}
                  <Link href={'/profile/' + report.reported_id} target="_blank" style={{ padding: '7px 14px', borderRadius: '8px', background: '#fff1f2', color: '#e11d48', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                    View & Take Action
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
