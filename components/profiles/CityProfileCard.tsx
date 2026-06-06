'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CityProfileCard({ profile: p, cityName }: { profile: any, cityName: string }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    try {
      const user = localStorage.getItem('biyekori_user')
      if (user && JSON.parse(user)?.id) setIsLoggedIn(true)
    } catch(e) {}
  }, [])

  const displayName = isLoggedIn
    ? (p.full_name || (p.gender === 'Female' ? 'Bride' : 'Groom'))
    : (() => {
        const name = p.full_name || (p.gender === 'Female' ? 'Bride' : 'Groom')
        const parts = name.split(' ')
        return parts[0] + (parts.length > 1 ? ' ' + parts[parts.length - 1][0] + '.' : '')
      })()

  const displayLocation = isLoggedIn
    ? (p.city || p.district || p.location_detail || cityName)
    : cityName

  return (
    <Link href={`/profile/${p.id}`} style={{ textDecoration: 'none' }}>
      <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
        <div style={{ position: 'relative', aspectRatio: '3/4', background: '#f3f4f6' }}>
          {p.photo_url
            ? <img
                src={p.photo_url}
                alt="Profile"
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  filter: isLoggedIn ? 'none' : 'blur(8px)',
                  transform: isLoggedIn ? 'none' : 'scale(1.05)',
                  transition: 'filter 0.3s'
                }}
              />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                {p.gender === 'Female' ? '👩' : '👨'}
              </div>
          }
          {!isLoggedIn && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'rgba(0,0,0,0.55)', borderRadius: '10px', padding: '6px 12px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: 'white', fontWeight: 700 }}>Login to view</p>
              </div>
            </div>
          )}
          {(p.is_verified || p.selfie_status === 'approved') && (
            <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#10b981', borderRadius: '20px', padding: '2px 8px', fontSize: '10px', fontWeight: 700, color: 'white' }}>
              Verified
            </div>
          )}
          {p.package && p.package !== 'prottasha' && isLoggedIn && (
            <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: '20px', padding: '2px 8px', fontSize: '10px', fontWeight: 700, color: 'white' }}>
              Premium
            </div>
          )}
        </div>
        <div style={{ padding: '12px' }}>
          <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 800, color: '#111827' }}>
            {displayName}
          </p>
          <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6b7280' }}>
            {p.age ? `${p.age} yrs` : ''}{p.age ? ' · ' : ''}{displayLocation}
          </p>
          {p.profession && (
            <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isLoggedIn ? p.profession : p.profession.split(' ').slice(0, 2).join(' ')}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
