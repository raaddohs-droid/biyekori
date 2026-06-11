'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const ActivityToast = dynamic(() => import('./ActivityToast'), { ssr: false })

export default function ActivityToastWrapper() {
  const [viewerGender, setViewerGender] = useState<string | undefined>(undefined)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('biyekori_user')
      if (stored) {
        const u = JSON.parse(stored)
        setViewerGender(u?.gender || undefined)
      }
    } catch {}
    setReady(true)
  }, [])

  if (!ready) return null
  return <ActivityToast viewerGender={viewerGender} />
}
