'use client'

import { Profile } from '@/types/profile'
import Link from 'next/link'
import { Heart, Eye } from 'lucide-react'

interface ProfileCardProps {
  profile: Profile
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  // Generate initials for avatar
  const initials = profile.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Determine if profile is "premium" (for demo, every 3rd profile)
  const isPremium = profile.id % 3 === 0
  
  // Determine if profile is "verified" (for demo, profiles with even IDs)
  const isVerified = profile.id % 2 === 0

  // Gender emoji
  const genderEmoji = profile.gender === 'Male' ? '🤵' : '👰'

  // Calculate how long ago profile was created
  const getActiveStatus = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffMs = now.getTime() - created.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return 'Active recently'
  }

  // Format location display
  const locationDisplay = profile.location_detail 
    ? `${profile.location_detail}, ${profile.city || 'Bangladesh'}`
    : profile.city || 'Bangladesh'

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
      {/* Badges Row */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-200">
        {isPremium && (
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded flex items-center gap-1">
            ⭐ PREMIUM
          </span>
        )}
        {isVerified && (
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
            ✓ VERIFIED
          </span>
        )}
      </div>

      {/* Photo Section */}
      <div className="relative">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-rose-50 to-pink-50">
          {/* Avatar Circle - NOW WITH PHOTO SUPPORT */}
          <div className="flex-shrink-0">
            {profile.photo_url ? (
              <img 
                src={profile.photo_url} 
                alt={profile.full_name}
                className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-white"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-2xl mb-1">
              <span>{genderEmoji}</span>
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                {profile.photo_url ? 'Photo available' : 'Photo on request'}
              </span>
            </div>
            <p className="text-xs text-gray-500">{getActiveStatus(profile.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-4">
        {/* Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {profile.full_name}
        </h3>

        {/* Managed By */}
        <p className="text-xs text-gray-500 mb-3">By {profile.managed_by || 'Self'}</p>

        {/* Quick Stats */}
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
          <span className="font-medium">{profile.age ? `${profile.age}y` : 'N/A'}</span>
          <span>•</span>
          <span>{profile.height || 'N/A'}</span>
          <span>•</span>
          <span>{profile.marital_status || 'Never married'}</span>
        </div>

        {/* Details with Emojis - REAL DATA */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-start gap-2">
            <span>📍</span>
            <span className="text-gray-700">{locationDisplay}</span>
          </div>
          
          {profile.education && (
            <div className="flex items-start gap-2">
              <span>🎓</span>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Education</p>
                <p className="text-gray-700">{profile.education}</p>
              </div>
            </div>
          )}
          
          {profile.occupation && (
            <div className="flex items-start gap-2">
              <span>💼</span>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Work</p>
                <p className="text-gray-700">{profile.occupation}</p>
              </div>
            </div>
          )}
          
          {profile.family_type && (
            <div className="flex items-start gap-2">
              <span>👨‍👩‍👧</span>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Family</p>
                <p className="text-gray-700">{profile.family_type}</p>
              </div>
            </div>
          )}
          
          {profile.religious_level && (
            <div className="flex items-start gap-2">
              <span>🕌</span>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Religious</p>
                <p className="text-gray-700">{profile.religious_level}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2">
            <Heart className="w-4 h-4" />
            Interest
          </button>
          <Link 
            href={`/profiles/${profile.id}`}
            className="flex-1 border-2 border-rose-500 text-rose-500 hover:bg-rose-50 text-sm font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View
          </Link>
        </div>
      </div>
    </div>
  )
}