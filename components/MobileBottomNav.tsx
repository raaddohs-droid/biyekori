'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileBottomNav() {
  const [user, setUser] = useState<any>(null)
  const [unread, setUnread] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    try {
      const stored = localStorage.getItem('biyekori_user')
      if (stored) setUser(JSON.parse(stored))
    } catch {}
  }, [])

  if (!user) return null

  const tabs = [
    {
      href: '/',
      label: 'হোম',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#7B1D2E' : 'none'} stroke={active ? '#7B1D2E' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      href: '/profiles',
      label: 'খুঁজুন',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#7B1D2E' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      )
    },
    {
      href: '/interests',
      label: 'আগ্রহ',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#7B1D2E' : 'none'} stroke={active ? '#7B1D2E' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
      )
    },
    {
      href: '/messages',
      label: 'বার্তা',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#7B1D2E' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      )
    },
    {
      href: '/dashboard',
      label: 'প্রোফাইল',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#7B1D2E' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
  ]

  return (
    <nav className="bk-bottom-nav" aria-label="Mobile navigation">
      {tabs.map(tab => {
        const active = pathname === tab.href || (tab.href !== '/' && pathname?.startsWith(tab.href))
        return (
          <Link key={tab.href} href={tab.href} className={`bk-bottom-nav-item${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
            {tab.icon(active)}
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
