"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfileCompletion from '@/components/ProfileCompletion';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function fetchViewers(profileId: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profile_views?viewed_profile_id=eq.${profileId}&select=*,viewer:viewer_id(id,full_name,photo_url,age,city,profession,gender)&order=viewed_at.desc&limit=20`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  return res.json();
}

async function fetchViewCount(profileId: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profile_views?viewed_profile_id=eq.${profileId}&select=count`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Prefer': 'count=exact', 'Range': '0-0' } }
  );
  const count = res.headers.get('content-range')?.split('/')[1] || '0';
  return count;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [viewers, setViewers] = useState<any[]>([]);
  const [viewCount, setViewCount] = useState('0');
  const [showViewers, setShowViewers] = useState(false);
  const [loadingViewers, setLoadingViewers] = useState(false);
  const [interestsSent, setInterestsSent] = useState(0);
  const [interestsReceived, setInterestsReceived] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [suggestedProfiles, setSuggestedProfiles] = useState<any[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('biyekori_user');
    if (!userData) { router.push('/login'); return; }
    const parsed = JSON.parse(userData);
    setUser(parsed);

    // Fetch view count
    if (parsed.id) {
      fetchViewCount(parsed.id).then(setViewCount);

      // Fetch interests counts
      fetch('/api/interests/list?userId=' + parsed.id)
        .then(r => r.json())
        .then(data => {
          setInterestsSent((data.sent || []).length);
          setInterestsReceived((data.received || []).length);
        }).catch(() => {});

      // Fetch notifications unread count
      fetch('/api/notifications?userId=' + parsed.id)
        .then(r => r.json())
        .then(data => setUnreadNotifs(data.unreadCount || 0))
        .catch(() => {});

      // Fetch suggested profiles (opposite gender, 3 profiles)
      const showGender = parsed.gender === 'male' ? 'female' : 'male';
      fetch('/api/profiles?gender=' + showGender + '&limit=3&excludeId=' + parsed.id)
        .then(r => r.json())
        .then(data => setSuggestedProfiles(Array.isArray(data) ? data.slice(0, 3) : []))
        .catch(() => {});
    }
  }, [router]);

  const handleShowViewers = async () => {
    const isPremium = user?.package && user.package !== 'prottasha';
    if (!isPremium) {
      alert('👑 Who Viewed Me is a Premium feature!\n\nUpgrade to Bondhon or Milon plan to see who viewed your profile.');
      return;
    }
    setLoadingViewers(true);
    setShowViewers(true);
    const data = await fetchViewers(user.id);
    setViewers(Array.isArray(data) ? data : []);
    setLoadingViewers(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('biyekori_user');
    router.push('/');
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Loading...</div></div>;
  }

  const isPremium = user?.package && user.package !== 'prottasha';

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50" style={{paddingTop:"70px"}}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content */}
          <div className="lg:col-span-2">

            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-black text-gray-900">Welcome, {user.full_name || user.name}!</h1>
                  <p className="text-gray-600 mt-1">Manage your matrimony profile</p>
                </div>
                
              </div>
            </div>

            {/* NID Banner */}
            {!user.is_verified && (
              <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 border-4 border-yellow-400 rounded-2xl p-6 mb-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">🔒 Get Verified Badge - Stand Out!</h2>
                    <p className="text-gray-700 mb-2">✓ 5x more profile views | ✓ Top search results | ✓ Build trust</p>
                    <p className="text-sm text-gray-600">Verified profiles get 80% more responses!</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-rose-600 mb-2">৳200</div>
                    <p className="text-xs text-gray-600 mb-3">One-time fee</p>
                    <Link href="/verify" className="inline-block px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-2xl transition">Verify My NID →</Link>
                  </div>
                </div>
              </div>
            )}

            {user.is_verified && (
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-400 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">✅</div>
                  <div>
                    <h2 className="text-2xl font-black text-green-900">Your Profile is Verified!</h2>
                    <p className="text-green-700 mt-1">You have the trusted verified badge on your profile</p>
                  </div>
                </div>
              </div>
            )}

            {/* ─── WHO VIEWED ME CARD ─── */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">👁️</div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Who Viewed My Profile</h2>
                    <p className="text-gray-500 text-sm">People who visited your profile</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-purple-600">{viewCount}</div>
                  <p className="text-xs text-gray-500">total views</p>
                </div>
              </div>

              {!isPremium ? (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800 mb-1">🔒 Premium Feature</p>
                      <p className="text-sm text-gray-600">Upgrade to see exactly who viewed your profile</p>
                    </div>
                    <Link href="/pricing" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition whitespace-nowrap">
                      Upgrade ৳799/mo
                    </Link>
                  </div>

                  {/* Blurred preview */}
                  <div className="mt-4 space-y-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-white rounded-lg blur-sm">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div>
                          <div className="w-24 h-3 bg-gray-200 rounded mb-1"></div>
                          <div className="w-16 h-2 bg-gray-100 rounded"></div>
                        </div>
                        <div className="ml-auto w-12 h-2 bg-gray-100 rounded"></div>
                      </div>
                    ))}
                    <p className="text-center text-xs text-purple-600 font-bold mt-2">🔒 Unlock to see real viewers</p>
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleShowViewers}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition mb-4"
                  >
                    👁️ See Who Viewed Me ({viewCount} views)
                  </button>

                  {showViewers && (
                    <div className="space-y-3">
                      {loadingViewers ? (
                        <div className="text-center py-8 text-gray-500">Loading viewers...</div>
                      ) : viewers.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-4xl mb-2">👀</div>
                          <p className="text-gray-500">No views yet. Share your profile to get more visibility!</p>
                        </div>
                      ) : (
                        viewers.map((view: any, i: number) => {
                          const viewer = view.viewer;
                          if (!viewer) return (
                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">👤</div>
                              <div className="flex-1">
                                <p className="font-bold text-gray-700">Anonymous Visitor</p>
                                <p className="text-xs text-gray-500">{new Date(view.viewed_at).toLocaleDateString('en-BD')}</p>
                              </div>
                            </div>
                          );
                          return (
                            <Link key={i} href={`/profile/${viewer.id}`} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition">
                              {viewer.photo_url ? (
                                <img src={viewer.photo_url} alt={viewer.full_name} className="w-12 h-12 rounded-full object-cover border-2 border-purple-200" />
                              ) : (
                                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center text-xl">
                                  {viewer.gender === 'male' ? '👨' : '👩'}
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="font-bold text-gray-900">{viewer.full_name || 'Anonymous'}</p>
                                <p className="text-xs text-gray-500">{viewer.age} yrs • {viewer.city} • {viewer.profession}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-400">{new Date(view.viewed_at).toLocaleDateString('en-BD')}</p>
                                <p className="text-xs text-purple-600 font-bold mt-1">View Profile →</p>
                              </div>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Suggested Matches */}
            {suggestedProfiles.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black text-gray-900">Suggested for You</h2>
                  <Link href={'/profiles?userGender=' + (user.gender || '')} className="text-sm text-rose-600 font-bold hover:underline">See all</Link>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {suggestedProfiles.map((p: any) => (
                    <Link key={p.id} href={'/profile/' + p.id} className="text-center group">
                      <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2">
                        {p.photo_url ? (
                          <img src={p.photo_url} alt={p.full_name} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 15%'}} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-pink-100 to-purple-100">
                            {p.gender === 'male' ? '👨' : '👩'}
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-bold text-gray-800 truncate group-hover:text-rose-600">{p.full_name || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">{p.age} yrs • {p.city || p.district || ''}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Link href={`/profiles?userGender=${typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('biyekori_user') || '{}').gender || '' : ''}`} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:scale-105">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Browse Profiles</h3>
                <p className="text-gray-600 text-sm">Find your perfect match</p>
              </Link>
              <Link href="/verify" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:scale-105 relative">
                <div className="text-4xl mb-3">✓</div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Verify NID</h3>
                <p className="text-gray-600 text-sm">Get verified badge</p>
              </Link>
              <Link href="/pricing" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:scale-105 cursor-pointer">
                <div className="text-4xl mb-3">⭐</div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Upgrade Plan</h3>
                <p className="text-gray-600 text-sm">Unlock premium features</p>
              </Link>
            </div>

            {/* Profile Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-4">Your Profile Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-rose-50 rounded-xl">
                  <div className="text-3xl font-black text-rose-600">{interestsSent}</div>
                  <p className="text-sm text-gray-600 mt-1">Interests Sent</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-3xl font-black text-blue-600">{interestsReceived}</div>
                  <p className="text-sm text-gray-600 mt-1">Interests Received</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl cursor-pointer hover:bg-purple-100 transition" onClick={handleShowViewers}>
                  <div className="text-3xl font-black text-purple-600">{viewCount}</div>
                  <p className="text-sm text-gray-600 mt-1">Profile Views {!isPremium && '🔒'}</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-xl">
                  <div className="text-2xl font-black text-yellow-600">{user.package || 'Free'}</div>
                  <p className="text-sm text-gray-600 mt-1">Current Plan</p>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProfileCompletion user={user} />
          </div>

        </div>
      </div>
    </div>
  );
}
