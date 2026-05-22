'use client'

import { useState, useEffect } from 'react'
import ProfileCard from "@/components/profiles/ProfileCard"

export default function BrowseProfiles() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const response = await fetch('/api/profiles')
        const data = await response.json()
        setProfiles(data.profiles || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfiles()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold mb-8">Browse Profiles</h1>
        <p>Loading profiles...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Browse Profiles ({profiles.length})</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
    </div>
  )
}