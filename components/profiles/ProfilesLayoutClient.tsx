'use client'
import { useEffect, useState } from 'react'

export default function ProfilesLayoutClient({ 
  sidebar, 
  content 
}: { 
  sidebar: React.ReactNode
  content: React.ReactNode 
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div style={{ display: 'flex', gap: isMobile ? '0' : '24px', alignItems: 'flex-start', overflow: 'hidden' }}>
      {!isMobile && (
        <div style={{ flexShrink: 0, width: '240px', minWidth: '240px', position: 'sticky', top: '100px' }}>
          {sidebar}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
        {content}
      </div>
    </div>
  )
}
