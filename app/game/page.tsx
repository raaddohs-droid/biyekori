'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import CompatibilityGame from '@/components/CompatibilityGame'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function GameInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const partnerId = searchParams.get('with')
  const [partnerName, setPartnerName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!partnerId) { setError('No partner specified'); setLoading(false); return }
    const stored = localStorage.getItem('biyekori_user')
    if (!stored) { router.push('/login'); return }

    // Fetch partner name
    fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${partnerId}&select=full_name`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    }).then(r => r.json()).then(data => {
      if (data[0]) {
        const name = data[0].full_name || 'Partner'
        // Mask name if not connected
        setPartnerName(name.split(' ').map((p: string) => p[0] + '***').join(' '))
      }
      setLoading(false)
    }).catch(() => { setError('Could not load partner'); setLoading(false) })
  }, [partnerId])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d0521', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(250,217,90,0.2)', borderTopColor: '#FAD95A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#0d0521', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FAD95A', fontFamily: 'Georgia, serif' }}>
      {error}
    </div>
  )

  return <CompatibilityGame partnerId={Number(partnerId)} partnerName={partnerName} />
}

export default function GamePage() {
  return <Suspense fallback={<div style={{minHeight:'100vh',background:'#0d0521'}}/>}><GameInner /></Suspense>
}
