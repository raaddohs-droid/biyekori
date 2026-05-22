'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase, getCurrentUser, signOut } from '@/lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [pathname])

  const checkUser = async () => {
    const { user } = await getCurrentUser()
    setUser(user)
    
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .single()
      setProfile(data)
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    setProfile(null)
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              💍 Biyekori
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link 
              href="/profiles" 
              className={`hover:text-rose-500 transition-colors ${pathname === '/profiles' ? 'text-rose-500 font-medium' : 'text-gray-700'}`}
            >
              Browse Profiles
            </Link>

            {user ? (
              <>
                {/* Verification Status Badge */}
                {profile && (
                  <Link 
                    href="/verify"
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border hover:border-rose-500 transition-colors"
                  >
                    {profile.phone_verified && profile.nid_verified ? (
                      <span className="text-green-600 text-sm">✓ Verified</span>
                    ) : (
                      <span className="text-yellow-600 text-sm">⚠️ Verify Account</span>
                    )}
                  </Link>
                )}

                {/* User Menu */}
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">
                    Hi, {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login"
                  className="text-gray-700 hover:text-rose-500 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/register"
                  className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}