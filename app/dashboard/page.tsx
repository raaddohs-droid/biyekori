"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfileCompletion from '@/components/ProfileCompletion';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('biyekori_user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('biyekori_user');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content - Left Side (2 columns) */}
          <div className="lg:col-span-2">
            
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-black text-gray-900">
                    Welcome, {user.full_name || user.name}!
                  </h1>
                  <p className="text-gray-600 mt-1">Manage your matrimony profile</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* NID Verification Banner - IF NOT VERIFIED */}
            {!user.is_verified && (
              <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 border-4 border-yellow-400 rounded-2xl p-6 mb-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">
                      🔒 Get Verified Badge - Stand Out!
                    </h2>
                    <p className="text-gray-700 mb-2">
                      ✓ 5x more profile views | ✓ Top search results | ✓ Build trust
                    </p>
                    <p className="text-sm text-gray-600">
                      Verified profiles get 80% more responses!
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-rose-600 mb-2">৳200</div>
                    <p className="text-xs text-gray-600 mb-3">One-time fee</p>
                    <Link
                      href="/verify"
                      className="inline-block px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-2xl transition transform hover:scale-105"
                    >
                      Verify My NID Now →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Verified Badge Display - IF VERIFIED */}
            {user.is_verified && (
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-400 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">✅</div>
                  <div>
                    <h2 className="text-2xl font-black text-green-900">
                      Your Profile is Verified!
                    </h2>
                    <p className="text-green-700 mt-1">
                      You have the trusted verified badge on your profile
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Link
                href="/profiles"
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:scale-105"
              >
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Browse Profiles</h3>
                <p className="text-gray-600 text-sm">Find your perfect match</p>
              </Link>

              <Link
                href="/verify"
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:scale-105"
              >
                <div className="text-4xl mb-3">✓</div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Verify NID</h3>
                <p className="text-gray-600 text-sm">Get verified badge</p>
              </Link>

              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:scale-105 cursor-pointer">
                <div className="text-4xl mb-3">⭐</div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Upgrade Plan</h3>
                <p className="text-gray-600 text-sm">Unlock premium features</p>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-4">Your Profile</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-rose-50 rounded-xl">
                  <div className="text-3xl font-black text-rose-600">0</div>
                  <p className="text-sm text-gray-600 mt-1">Interests Sent</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-3xl font-black text-blue-600">0</div>
                  <p className="text-sm text-gray-600 mt-1">Interests Received</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-3xl font-black text-green-600">0</div>
                  <p className="text-sm text-gray-600 mt-1">Matches</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-3xl font-black text-purple-600">
                    {user.package || 'Free'}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Current Plan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side (1 column) */}
          <div className="lg:col-span-1">
            <ProfileCompletion user={user} />
          </div>

        </div>
      </div>
    </div>
  );
}