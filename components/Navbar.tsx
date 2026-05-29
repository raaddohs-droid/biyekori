'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('biyekori_user')
      if (stored) setUser(JSON.parse(stored))
    } catch(e) {}
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('biyekori_user')
    setUser(null)
    setShowMenu(false)
    window.location.href = '/'
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Biye Kori
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/profiles" className={`${isActive('/profiles') ? 'text-pink-600 font-semibold' : 'text-gray-700 hover:text-pink-600'} transition-colors text-sm`}>
              Profiles
            </Link>
            <Link href="/pricing" className={`${isActive('/pricing') ? 'text-pink-600 font-semibold' : 'text-gray-700 hover:text-pink-600'} transition-colors text-sm`}>
              Pricing
            </Link>
            {user && (
              <Link href="/interests" className={`${isActive('/interests') ? 'text-pink-600 font-semibold' : 'text-gray-700 hover:text-pink-600'} transition-colors text-sm`}>
                Interests
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center">
                    {user.photo_url
                      ? <img src={user.photo_url} alt={user.full_name} className="w-full h-full object-cover" />
                      : <span className="text-white text-xs font-bold">{user.full_name?.charAt(0) || 'U'}</span>
                    }
                  </div>
                  <span className="text-sm font-semibold text-gray-800 hidden md:block max-w-24 truncate">{user.full_name?.split(' ')[0]}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-bold text-gray-900 text-sm truncate">{user.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email || user.phone}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full font-semibold">{user.package || 'prottasha'}</span>
                    </div>
                    <Link href="/dashboard" onClick={() => setShowMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                      📊 Dashboard
                    </Link>
                    <Link href="/interests" onClick={() => setShowMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                      💌 Interests
                    </Link>
                    <Link href="/pricing" onClick={() => setShowMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                      ⭐ Upgrade Plan
                    </Link>
                    <div className="border-t border-gray-100 mt-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition text-left">
                        🚪 Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-pink-600 transition px-3 py-2">
                  Login
                </Link>
                <Link href="/register" className="text-sm font-semibold px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition">
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
