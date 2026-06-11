'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function HomeCTA() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('biyekori_user')
    setIsLoggedIn(!!stored)
  }, [])

  if (isLoggedIn) {
    return (
      <Link href="/profiles" style={{ display: 'inline-block', padding: '16px 56px', background: '#6D1F2F', color: '#080604', fontSize: '14px', fontWeight: 700, textDecoration: 'none', borderRadius: '4px', letterSpacing: '3px', position: 'relative', zIndex: 2, marginBottom: '48px' }}>
        BROWSE PROFILES
      </Link>
    )
  }

  return (
    <Link href="/register" style={{ display: 'inline-block', padding: '16px 56px', background: '#6D1F2F', color: '#080604', fontSize: '14px', fontWeight: 700, textDecoration: 'none', borderRadius: '4px', letterSpacing: '3px', position: 'relative', zIndex: 2, marginBottom: '48px' }}>
      JOIN FREE
    </Link>
  )
}
