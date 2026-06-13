'use client'
import { useState, useEffect } from 'react'

const VAPID_PUBLIC_KEY = 'BDOHjNE2mfeVCGVwMhtfK38lpzzSRojLdd848Ya_0W231lm5H7WleCue1NVg3nyBGMkMFP1EdtNk_KEjJiUi8rs'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export default function PushNotificationSetup({ userId }: { userId: string }) {
  const [status, setStatus] = useState<'idle'|'subscribed'|'denied'|'loading'>('idle')

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    if (Notification.permission === 'granted') setStatus('subscribed')
    if (Notification.permission === 'denied') setStatus('denied')
  }, [])

  const subscribe = async () => {
    if (!('serviceWorker' in navigator)) return
    setStatus('loading')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setStatus('denied'); return }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscription: sub.toJSON() })
      })

      setStatus('subscribed')
    } catch (e) {
      console.error('Push subscribe failed:', e)
      setStatus('idle')
    }
  }

  if (status === 'subscribed') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
      <span style={{ fontSize: '18px' }}>🔔</span>
      <div>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#15803d' }}>নোটিফিকেশন চালু আছে</p>
        <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>নতুন ম্যাচ ও বার্তার আপডেট পাবেন</p>
      </div>
    </div>
  )

  if (status === 'denied') return (
    <div style={{ padding: '12px 16px', background: '#fff7ed', borderRadius: '12px', border: '1px solid #fed7aa' }}>
      <p style={{ margin: 0, fontSize: '13px', color: '#c2410c' }}>🔕 নোটিফিকেশন বন্ধ আছে — ব্রাউজার সেটিংস থেকে চালু করুন</p>
    </div>
  )

  return (
    <button
      onClick={subscribe}
      disabled={status === 'loading'}
      style={{
        width: '100%', padding: '13px 16px',
        background: 'linear-gradient(135deg, #7B1D2E, #4A1A6B)',
        color: 'white', border: 'none', borderRadius: '12px',
        fontSize: '14px', fontWeight: 700, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        opacity: status === 'loading' ? 0.7 : 1
      }}
    >
      <span style={{ fontSize: '18px' }}>🔔</span>
      {status === 'loading' ? 'সেটআপ হচ্ছে...' : 'নোটিফিকেশন চালু করুন'}
    </button>
  )
}
