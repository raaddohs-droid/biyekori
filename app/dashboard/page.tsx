"use client";
function dashMaskName(n: string,ok: boolean): string{if(!n)return "Anonymous";if(ok)return n;return n.trim().split(" ").map(function(p){return p[0]+"*".repeat(Math.max(p.length-1,3))}).join(" ")}
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfileCompletion from '@/components/ProfileCompletion';
import UpgradeNudge from '@/components/UpgradeNudge';

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

async function fetchSuggestedProfiles(gender: string, excludeId: string) {
  const showGender = gender === 'male' ? 'female' : 'male';
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?gender=eq.${showGender}&id=neq.${excludeId}&select=id,full_name,photo_url,age,city,district,profession&order=id.desc&limit=4`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  return res.json();
}

async function fetchMutualMatches(userId: string) {
  const res = await fetch(`/api/interests/list?userId=${userId}`);
  const data = await res.json();
  const sent = (data.sent || []).filter((s: any) => s.status === 'accepted');
  const received = (data.received || []).filter((r: any) => r.status === 'accepted');
  const sentIds = new Set(sent.map((s: any) => String(s.receiver_id)));
  const receivedIds = new Set(received.map((r: any) => String(r.sender_id)));
  const mutualIds = [...sentIds].filter(id => receivedIds.has(id));
  // Fetch profile details for mutual matches
  if (mutualIds.length === 0) return [];
  const idList = mutualIds.slice(0, 6).join(',');
  const profileRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=in.(${idList})&select=id,full_name,photo_url,age,city,profession`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  return profileRes.json();
}

async function fetchRecentMessages(userId: string) {
  const res = await fetch(`/api/messages/list?userId=${userId}&limit=3`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.conversations || data.messages || [];
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
  const [suggestedProfiles, setSuggestedProfiles] = useState<any[]>([]);
  const [mutualIds, setMutualIds] = useState<Set<string>>(new Set());
  const [mutualMatches, setMutualMatches] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [mutualCount, setMutualCount] = useState(0);
  const [shortlistCount, setShortlistCount] = useState(0);
  const [shortlistProfiles, setShortlistProfiles] = useState<any[]>([]);
  const [liveActivity, setLiveActivity] = useState<any[]>([]);

  // Listen for activity toast events → bump profile views counter
  useEffect(() => {
    function handleActivity() {
      setViewCount(prev => String(parseInt(prev || '0') + 1));
    }
    window.addEventListener('biyekori-activity', handleActivity);
    return () => window.removeEventListener('biyekori-activity', handleActivity);
  }, []);
  const [dailyMatch, setDailyMatch] = useState<any>(null);
  const [dailyMatchReason, setDailyMatchReason] = useState<string>('');
  const [dailyMatchLoading, setDailyMatchLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('biyekori_user');
    if (!userData) { router.push('/login'); return; }
    const parsed = JSON.parse(userData);
    setUser(parsed);
    if (parsed.id) {
      // Update last active timestamp
      fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parsed.id, updates: { last_active_at: new Date().toISOString() } })
      }).catch(() => {});
      fetchViewCount(parsed.id).then(setViewCount);
      fetch('/api/shortlists?userId=' + parsed.id)
        .then(r => r.json())
        .then(data => {
          const list = data.shortlists || [];
          setShortlistCount(list.length);
          setShortlistProfiles(list.slice(0, 4));
        }).catch(() => {});
      fetch('/api/interests/list?userId=' + parsed.id)
        .then(r => r.json())
        .then(data => {
          setInterestsSent((data.sent || []).length);
          setInterestsReceived((data.received || []).length);
          setFilteredCount((data.filtered || []).length);
          // Calculate mutuals
          const sentAccepted = new Set<string>((data.sent || []).filter((s: any) => s.status === 'accepted').map((s: any) => String(s.receiver_id)));
          const receivedAccepted = new Set<string>((data.received || []).filter((r: any) => r.status === 'accepted').map((r: any) => String(r.sender_id)));
          const mutuals = [...sentAccepted].filter(id => receivedAccepted.has(id));
          setMutualCount(mutuals.length);
          setMutualIds(new Set([...sentAccepted, ...receivedAccepted]));
        }).catch(() => {});
      if (parsed.gender) {
        // Daily Best Match — refresh once per day
        const dmKey = 'biyekori_daily_match_' + parsed.id
        const dmDate = 'biyekori_daily_match_date_' + parsed.id
        const today = new Date().toDateString()
        const stored = localStorage.getItem(dmKey)
        const storedDate = localStorage.getItem(dmDate)
        if (stored && storedDate === today) {
          try { const dm = JSON.parse(stored); setDailyMatch(dm.profile); setDailyMatchReason(dm.reason) } catch(e) {}
        } else {
          setDailyMatchLoading(true)
          const showGender = parsed.gender === 'male' ? 'female' : 'male'
          fetch(`${SUPABASE_URL}/rest/v1/profiles?gender=eq.${showGender}&id=neq.${parsed.id}&select=id,full_name,photo_url,age,city,profession,education,religious_level,marital_status&order=id.desc&limit=20`, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } })
            .then(r => r.json())
            .then(async (profiles) => {
              if (!profiles || profiles.length === 0) return
              const pick = profiles[Math.floor(Math.random() * Math.min(profiles.length, 10))]
              const prompt = `You are a Bangladeshi matrimony matchmaker. A ${parsed.age || 25} year old ${parsed.gender} is looking for a match. You selected: ${pick.full_name?.split(' ')[0] || 'this person'}, ${pick.age} yrs, ${pick.profession}, ${pick.city}. Write ONE warm sentence (max 15 words) explaining why this could be a great match. Be specific and encouraging.`
              try {
                const aiRes = await fetch('/api/game', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, maxTokens: 60 }) })
                const aiData = await aiRes.json()
                const reason = aiData.result || 'A promising match based on your preferences.'
                setDailyMatch(pick)
                setDailyMatchReason(reason)
                localStorage.setItem(dmKey, JSON.stringify({ profile: pick, reason }))
                localStorage.setItem(dmDate, today)
              } catch(e) {
                setDailyMatch(pick)
                setDailyMatchReason('A promising match based on your preferences.')
              }
              setDailyMatchLoading(false)
            })
        }
        fetchSuggestedProfiles(parsed.gender, parsed.id)
          .then((data: any[]) => setSuggestedProfiles(data || []));
        // Live activity feed
        const actGender = parsed.gender === 'female' ? 'Male' : 'Female';
        fetch('/api/live-activity?gender=' + actGender)
          .then(r => r.json())
          .then(data => {
            if (Array.isArray(data.profiles)) {
              setLiveActivity(data.profiles.slice(0, 5));
            }
          })
          .catch(() => {});

        fetchMutualMatches(parsed.id)
          .then(data => setMutualMatches(Array.isArray(data) ? data : []))
          .catch(() => {});
        fetchRecentMessages(parsed.id)
          .then(data => setRecentMessages(Array.isArray(data) ? data : []))
          .catch(() => {});
      }
    }
  }, [router]);

  const handleShowViewers = async () => {
    const isPremium = user?.package && user.package !== 'prottasha';
    if (!isPremium) { window.location.href = '/pricing'; return; }
    setLoadingViewers(true);
    setShowViewers(true);
    const data = await fetchViewers(user.id);
    setViewers(Array.isArray(data) ? data : []);
    setLoadingViewers(false);
  };

  if (!user) {
    return <div style={{ minHeight: '100vh', overflowX: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontSize: '14px', color: '#9ca3af' }}>Loading...</div></div>;
  }

  const isPremium = user?.package && user.package !== 'prottasha';
  const planLabel = !user.package || user.package === 'prottasha' ? 'Free' : user.package.charAt(0).toUpperCase() + user.package.slice(1);
  const firstName = user.full_name?.split(' ')[0] || 'there';
  const gm = !!user.guardian_mode;

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .dash-main { padding: 12px !important; }
        .dash-card { padding: 16px !important; }
        .dash-suggested img { height: 140px !important; }
      }
    `}</style>
    <div style={{ minHeight: '100vh', overflowX: 'hidden', background: '#f1f5f9', paddingTop: '80px' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 20px 60px' }}>

        {/* Hero welcome bar */}
        <div style={{ background: gm ? 'linear-gradient(135deg, #7B1D2E 0%, #a855f7 100%)' : 'linear-gradient(135deg, #7B1D2E 0%, #7B1D2E 100%)', borderRadius: '20px', padding: '24px 32px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{gm ? 'পারিবারিক ড্যাশবোর্ড' : 'Dashboard'}</p>
              {gm && <span style={{ fontSize: '11px', fontWeight: 700, color: '#7B1D2E', background: 'rgba(255,255,255,0.9)', padding: '2px 8px', borderRadius: '20px' }}>👨‍👩‍👧 পরিবার পরিচালিত</span>}
            </div>
            <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800, color: 'white' }}>
              {gm ? `স্বাগতম, ${firstName}!` : `Welcome back, ${firstName}!`}
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>
              {gm
                ? (interestsReceived > 0 ? `${interestsReceived}টি নতুন আগ্রহ অপেক্ষা করছে` : 'আপনার সন্তানের জন্য উপযুক্ত পাত্র/পাত্রী খুঁজুন')
                : (interestsReceived > 0 ? `You have ${interestsReceived} new interest${interestsReceived > 1 ? 's' : ''} waiting` : 'Your perfect match could be one click away')
              }
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            <Link href={'/profiles?userGender=' + (user.gender || '')} style={{ padding: '10px 20px', background: 'white', color: gm ? '#7B1D2E' : '#7B1D2E', borderRadius: '10px', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
              {gm ? 'প্রোফাইল দেখুন' : 'Browse Profiles'}
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '20px' }}>
          <div>

            {/* Stats row - 4 compact cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: gm ? 'আগ্রহ পাঠানো' : 'Interests Sent', value: interestsSent, color: '#7B1D2E', bg: '#fff1f2', border: '#fecdd3' },
                { label: gm ? 'আগ্রহ পাওয়া' : 'Received', value: interestsReceived, color: '#7B1D2E', bg: '#f5f3ff', border: '#FDF6EE' },
                { label: gm ? 'মিউচুয়াল ম্যাচ' : 'Mutual Matches', value: mutualCount, color: '#1D9E75', bg: '#E1F5EE', border: '#9FE1CB' },
                { label: gm ? 'প্রোফাইল দেখেছে' : 'Profile Views', value: viewCount, color: '#7B1D2E', bg: '#ecfeff', border: '#9FE1CB' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid ' + s.border }}>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: '6px' }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>{s.label}</div>
                  <div style={{ marginTop: '8px', height: '3px', background: s.bg, borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: '60%', background: s.color, borderRadius: '2px', opacity: 0.4 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* NID banner - slim */}
            {!user.is_verified && (
              <div style={{ background: 'white', borderRadius: '14px', padding: '14px 20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', background: '#fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B1D2E" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 1px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>Get your verified badge</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>5x more views · top search results · 80% more responses</p>
                  </div>
                </div>
                <Link href="/verify" style={{ flexShrink: 0, padding: '7px 16px', background: '#7B1D2E', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '12px', textDecoration: 'none' }}>
                  Verify — ৳200
                </Link>
              </div>
            )}

            {/* Selfie Verification Card */}
            {user && user.selfie_status === 'approved' && (
              <div style={{ background: '#E1F5EE', borderRadius: '16px', padding: '14px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 1px', fontSize: '13px', fontWeight: 700, color: '#0F6E56' }}>Selfie Verified</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#1D9E75' }}>Your identity is verified · families trust your profile more</p>
                </div>
              </div>
            )}
            {user && user.selfie_status !== 'approved' && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e0f2fe' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: user.selfie_status !== 'pending' ? '16px' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 1px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                        {user.selfie_status === 'pending' ? 'Selfie verification pending' : 'Verify your identity — Free'}
                      </p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
                        {user.selfie_status === 'pending' ? 'Under review — we will notify you within 24 hours' : 'Builds 4x more trust with families'}
                      </p>
                    </div>
                  </div>
                  {user.selfie_status !== 'pending' && (
                    <Link href="/verify-selfie" style={{ flexShrink: 0, padding: '7px 16px', background: '#0F6E56', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '12px', textDecoration: 'none' }}>
                      Verify Now
                    </Link>
                  )}
                </div>
                {user.selfie_status !== 'pending' && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', background: '#E1F5EE', borderRadius: '10px', padding: '12px' }}>
                    {[
                      { icon: '📷', label: 'ক্যামেরা' },
                      { icon: '→', label: '' },
                      { icon: '🤳', label: 'সেলফি তুলুন' },
                      { icon: '→', label: '' },
                      { icon: '✅', label: 'Verified!' },
                    ].map((step, i) => (
                      step.icon === '→' ? (
                        <span key={i} style={{ color: '#94a3b8', fontSize: '16px' }}>→</span>
                      ) : (
                        <div key={i} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '28px', marginBottom: '4px' }}>{step.icon}</div>
                          <div style={{ fontSize: '11px', color: '#0F6E56', fontWeight: 700, whiteSpace: 'nowrap' }}>{step.label}</div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            )}

            {gm && (
            <div style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', borderRadius: '16px', padding: '20px', border: '1.5px solid #c4b5fd' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '22px' }}>🤲</span>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#7B1D2E' }}>পারিবারিক পরামর্শ</p>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
                পাত্র/পাত্রীর সাথে যোগাযোগের আগে তাদের প্রোফাইল ভালোভাবে দেখুন এবং পরিবারের সাথে আলোচনা করুন।
              </p>
              <Link href="/interests" style={{ display: 'inline-block', padding: '8px 18px', background: '#7B1D2E', color: 'white', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                আগ্রহ দেখুন →
              </Link>
            </div>
            )}

            {/* Filtered interests alert */}
            {filteredCount > 0 && (
              <div style={{ background: '#FFFBEB', borderRadius: '14px', padding: '14px 20px', marginBottom: '20px', border: '1.5px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>🔍</span>
                  <div>
                    <p style={{ margin: '0 0 1px', fontSize: '13px', fontWeight: 700, color: '#7B1D2E' }}>{filteredCount} filtered interest{filteredCount > 1 ? 's' : ''}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9B2D3E' }}>Outside your contact filter criteria — you can still accept them</p>
                  </div>
                </div>
                <Link href="/interests" style={{ flexShrink: 0, padding: '7px 14px', background: '#7B1D2E', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '12px', textDecoration: 'none' }}>View</Link>
              </div>
            )}

            {/* Daily Best Match */}
            <div style={{ background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius: '16px', padding: '20px', marginBottom: '20px', border: '1.5px solid #F0C040', boxShadow: '0 2px 12px rgba(240,192,64,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <h2 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 800, color: '#7B1D2E' }}>⭐ {gm ? 'আজকের সেরা মিল' : "Today's Best Match"}</h2>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9B2D3E', fontWeight: 600 }}>AI-picked · Refreshes daily</p>
                </div>
                <span style={{ fontSize: '10px', color: '#7B1D2E', background: 'rgba(240,192,64,0.3)', padding: '3px 8px', borderRadius: '20px', fontWeight: 700 }}>NEW</span>
              </div>
              {dailyMatchLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(240,192,64,0.2)', animation: 'pulse 1.5s infinite' }}/>
                  <p style={{ margin: 0, fontSize: '13px', color: '#7B1D2E' }}>Finding your best match today...</p>
                </div>
              ) : dailyMatch ? (
                <Link href={`/profile/${dailyMatch.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {dailyMatch.photo_url ? (
                      <img src={dailyMatch.photo_url} alt="" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #F0C040' }}/>
                    ) : (
                      <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#F0C040,#C07800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'white', fontWeight: 800, border: '2px solid #F0C040' }}>
                        {dailyMatch.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: '#F0C040', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>⭐</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 800, color: '#7B1D2E' }}>{dailyMatch.full_name?.split(' ')[0] || 'Anonymous'}, {dailyMatch.age}</p>
                    <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#9B2D3E' }}>{dailyMatch.profession} · {dailyMatch.city}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#78350f', fontStyle: 'italic', lineHeight: 1.5 }}>"{dailyMatchReason}"</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B1D2E" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </Link>
              ) : null}
            </div>
            {/* Mutual urgency nudge — show if mutual match exists and user is free */}
            {mutualMatches.length > 0 && !isPremium && (
              <UpgradeNudge type="mutual_urgency" data={{
                name: mutualMatches[0]?.full_name,
                lastActive: '2h ago',
                competitorCount: 2
              }} />
            )}

            {/* Porichiti dashboard card */}
            {mutualMatches.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg,#0d0521,#4A1A6B)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>✦</span>
                  <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#FAD95A' }}>{gm ? 'পরিচিতি' : 'Porichiti'}</h2>
                </div>
                <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                  {gm ? 'আপনার match এর সাথে একটি দিন কাটান — আলাদাভাবে। দেখুন কতটুকু মেলে।' : 'Spend a day with your match — separately. See how much you align.'}
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {mutualMatches.slice(0, 3).map((p: any) => (
                    <div key={p.id} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                      {p.full_name ? p.full_name.split(' ')[0][0] + '*** ' + (p.full_name.split(' ')[1]?.[0] || '') + '***' : 'Match'} — অপেক্ষায়
                    </div>
                  ))}
                </div>
                <a href={mutualMatches[0] ? `/game?with=${mutualMatches[0].id}` : '/profiles'} style={{ display: 'block', textAlign: 'center', background: '#FAD95A', borderRadius: '10px', padding: '10px', color: '#0d0521', fontSize: '14px', fontWeight: 800, textDecoration: 'none', fontFamily: 'Georgia, serif' }}>
                  {gm ? 'এখনই খেলুন →' : 'Play Now →'}
                </a>
              </div>
            )}

            {/* Mutual Matches */}
            {mutualMatches.length > 0 && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1.5px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 800, color: '#111827' }}>🎉 {gm ? 'মিউচুয়াল ম্যাচ' : 'Mutual Matches'}</h2>
                    <p style={{ margin: 0, fontSize: '11px', color: '#1D9E75', fontWeight: 600 }}>Both of you accepted each other's interest</p>
                  </div>
                  <Link href="/interests" style={{ fontSize: '12px', color: '#1D9E75', fontWeight: 700, textDecoration: 'none' }}>See all →</Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '10px' }}>
                  {mutualMatches.slice(0, 6).map((p: any) => (
                    <Link key={p.id} href={'/profile/' + p.id} style={{ textDecoration: 'none', display: 'block' }}>
                      <div style={{ borderRadius: '12px', overflow: 'hidden', border: '2px solid #bbf7d0', background: '#E1F5EE', position: 'relative' }}>
                        <div style={{ width: '100%', paddingBottom: '100%', position: 'relative', background: '#E1F5EE' }}>
                          {p.photo_url ? (
                            <img src={p.photo_url} alt={p.full_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }} />
                          ) : (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>💚</div>
                          )}
                          <div style={{ position: 'absolute', top: '6px', right: '6px', background: '#1D9E75', borderRadius: '20px', padding: '2px 6px', fontSize: '9px', fontWeight: 700, color: 'white' }}>✓ Mutual</div>
                        </div>
                        <div style={{ padding: '8px' }}>
                          <p style={{ margin: '0 0 1px', fontSize: '12px', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.full_name || 'Anonymous'}</p>
                          <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>{p.age} yrs{p.city ? ' · ' + p.city : ''}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Messages */}
            {recentMessages.length > 0 && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#111827' }}>💬 Recent Messages</h2>
                  <Link href="/messages" style={{ fontSize: '12px', color: '#7B1D2E', fontWeight: 700, textDecoration: 'none' }}>See all →</Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentMessages.slice(0, 3).map((msg: any, i: number) => (
                    <Link key={i} href="/messages" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', textDecoration: 'none', border: '1px solid #f1f5f9' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#FDF6EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                        {msg.photo_url ? <img src={msg.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '14px' }}>💬</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: '0 0 1px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>{msg.full_name || msg.sender_name || 'Message'}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.last_message || msg.content || 'View conversation'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Live Activity Feed */}
            {liveActivity.length > 0 && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.6)', animation: 'pulse 2s infinite', flexShrink: 0 }} />
                  <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#111827' }}>Live Activity</h2>
                  <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '4px' }}>right now on Biyekori</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {liveActivity.map((p: any, i: number) => {
                    const actions = ['এইমাত্র যোগ দিয়েছেন', 'এখন সক্রিয়', 'এইমাত্র যোগ দিয়েছেন', 'এখন সক্রিয়', 'প্রোফাইল দেখেছেন'];
                    const action = actions[i % actions.length];
                    const nameParts = (p.full_name || '').trim().split(' ');
                    const masked = nameParts.length > 1 ? nameParts[0] + ' ' + nameParts[1].charAt(0).toUpperCase() + '.' : nameParts[0];
                    return (
                      <Link key={p.id} href={'/profile/' + p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: '#f8fafc', borderRadius: '10px', textDecoration: 'none', border: '1px solid #f1f5f9' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1.5px solid #7B1D2E', background: '#f0e8ec' }}>
                          {p.photo_url
                            ? <img src={p.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#7B1D2E,#9D174D)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="rgba(255,255,255,0.7)"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="rgba(255,255,255,0.5)"/></svg>
                              </div>
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{masked}, {p.age}</p>
                          <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#7B1D2E', fontFamily: 'Hind Siliguri, system-ui, sans-serif' }}>{action}</p>
                        </div>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', flexShrink: 0 }}>{p.district || 'Bangladesh'}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Suggested Matches */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 800, color: '#111827' }}>{gm ? 'উপযুক্ত প্রোফাইল' : 'Suggested for You'}</h2>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{gm ? 'আপনার সন্তানের জন্য উপযুক্ত পাত্র/পাত্রী' : 'Profiles that may interest you'}</p>
                </div>
                <Link href={'/profiles?userGender=' + (user.gender || '')} style={{ fontSize: '12px', color: '#7B1D2E', fontWeight: 700, textDecoration: 'none' }}>See all</Link>
              </div>
              {suggestedProfiles.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '10px' }}>
                  {suggestedProfiles.map((p: any) => (
                    <Link key={p.id} href={'/profile/' + p.id} style={{ textDecoration: 'none', display: 'block' }}>
                      <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #f1f5f9', background: '#f8fafc' }}>
                        <div style={{ width: '100%', paddingBottom: '120%', position: 'relative', background: '#f1f5f9' }}>
                          {p.photo_url ? (
                            <img src={p.photo_url} alt={p.full_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }} />
                          ) : (
                            <div style={{ position: 'absolute', inset: 0, background: user?.gender === 'male' ? '#FFF0F6' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {user?.gender === 'male' ? (
                                <img src="https://cdn.jsdelivr.net/npm/@mdi/svg@7.4.47/svg/face-woman.svg" width="80" height="80" style={{ filter: 'invert(27%) sepia(80%) saturate(1500%) hue-rotate(300deg) brightness(90%)', opacity: 0.55 }} alt=""/>
                              ) : (
                                <img src="https://cdn.jsdelivr.net/npm/@mdi/svg@7.4.47/svg/account-tie.svg" width="80" height="80" style={{ filter: 'invert(27%) sepia(80%) saturate(500%) hue-rotate(180deg) brightness(90%)', opacity: 0.55 }} alt=""/>
                              )}
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '8px' }}>
                          <p style={{ margin: '0 0 1px', fontSize: '12px', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dashMaskName(p.full_name || 'Anonymous', mutualIds.has(String(p.id)))}</p>
                          <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af' }}>{p.age} yrs{p.city || p.district ? ' · ' + (p.city || p.district) : ''}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '13px' }}>
                  Complete your profile to see better suggestions
                </div>
              )}
            </div>

            {/* Shortlisted by Me */}
            <div style={{ background: "white", borderRadius: "16px", padding: "20px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #fce7f3" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div>
                  <h2 style={{ margin: "0 0 2px", fontSize: "15px", fontWeight: 800, color: "#111827" }}>Shortlisted</h2>
                  <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af" }}>{shortlistCount} profile{shortlistCount !== 1 ? "s" : ""} saved</p>
                </div>
                <Link href="/interests" style={{ fontSize: "12px", color: "#7B1D2E", fontWeight: 700, textDecoration: "none" }}
                  onClick={() => { try { localStorage.setItem("interests_tab", "shortlisted") } catch(e) {} }}>
                  See all →
                </Link>
              </div>
              {shortlistCount === 0 ? (
                <p style={{ fontSize: "13px", color: "#9ca3af", textAlign: "center", padding: "12px 0" }}>
                  Tap the heart on any profile to shortlist them
                </p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "8px" }}>
                  {shortlistProfiles.map((s: any) => {
                    const p = s.profile;
                    if (!p) return null;
                    return (
                      <Link key={s.profile_id} href={"/profile/" + s.profile_id} style={{ textDecoration: "none", display: "block" }}>
                        <div style={{ borderRadius: "10px", overflow: "hidden", border: "1.5px solid #fce7f3", background: "#fff5f7" }}>
                          <div style={{ width: "100%", paddingBottom: "100%", position: "relative", background: "#f3f4f6" }}>
                            {p.photo_url
                              ? <img src={p.photo_url} alt={p.full_name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%" }} />
                              : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#fce7f3,#ede9fe)", fontSize: "22px" }}>?</div>
                            }
                            <div style={{ position: "absolute", top: "4px", right: "4px" }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="#7B1D2E" stroke="#7B1D2E" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                            </div>
                          </div>
                          <div style={{ padding: "6px 8px" }}>
                            <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.full_name || "Anonymous"}</p>
                            <p style={{ margin: 0, fontSize: "10px", color: "#9ca3af" }}>{p.age} yrs</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Who Viewed Me */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <h2 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 800, color: '#111827' }}>{gm ? 'কে প্রোফাইল দেখেছে' : 'Who Viewed My Profile'}</h2>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{viewCount} total views</p>
                </div>
                {isPremium ? (
                  <button onClick={handleShowViewers} style={{ padding: '6px 14px', background: 'linear-gradient(135deg,#7B1D2E,#9B2D3E)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    দেখুন →
                  </button>
                ) : (
                  <Link href="/pricing" style={{ padding: '6px 14px', background: 'linear-gradient(135deg,#7B1D2E,#9B2D3E)', color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    Gold এ আপগ্রেড করুন →
                  </Link>
                )}
              </div>

              {!isPremium ? (
                <div style={{ background: '#fdf6ee', borderRadius: '12px', padding: '16px', border: '1px solid #f0d9c0' }}>
                  <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#9B2D3E', fontWeight: 700 }}>🔒 Gold এ আপগ্রেড করুন — কে দেখেছে জানুন</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', filter: 'blur(2px)', pointerEvents: 'none', userSelect: 'none' }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'white', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#bbb', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ width: '120px', height: '12px', background: '#aaa', borderRadius: '4px', marginBottom: '6px' }} />
                          <div style={{ width: '80px', height: '10px', background: '#ccc', borderRadius: '4px' }} />
                        </div>
                        <div style={{ width: '44px', height: '10px', background: '#ccc', borderRadius: '4px' }} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : showViewers && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {loadingViewers ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '13px' }}>Loading...</div>
                  ) : viewers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '13px' }}>No views yet. Share your profile!</div>
                  ) : viewers.map((view: any, i: number) => {
                    const viewer = view.viewer;
                    if (!viewer) return null;
                    return (
                      <Link key={i} href={'/profile/' + viewer.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', textDecoration: 'none', border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e=>(e.currentTarget.style.background='#f1f5f9')} onMouseLeave={e=>(e.currentTarget.style.background='#f8fafc')}>
                        {viewer.photo_url ? (
                          <img src={viewer.photo_url} alt={viewer.full_name} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#FDF6EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>?</div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: '0 0 1px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>{viewer.full_name || 'Anonymous'}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{viewer.age} yrs · {viewer.city} · {viewer.profession}</p>
                        </div>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', flexShrink: 0 }}>{new Date(view.viewed_at).toLocaleDateString('en-GB')}</p>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions - list style */}
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f8fafc' }}>
                <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#111827' }}>{gm ? 'দ্রুত কার্যক্রম' : 'Quick Actions'}</h2>
              </div>
              {(gm ? [
                { href: '/profiles?userGender=' + (user.gender || ''), color: '#7B1D2E', bg: '#f5f3ff', title: 'প্রোফাইল দেখুন', sub: 'উপযুক্ত পাত্র/পাত্রী খুঁজুন' },
                { href: '/interests', color: '#7B1D2E', bg: '#fff1f2', title: 'আগ্রহ', sub: interestsReceived > 0 ? interestsReceived + 'টি নতুন আগ্রহ অপেক্ষা করছে' : 'পাঠানো ও পাওয়া আগ্রহ দেখুন' },
                { href: '/edit-profile', color: '#7B1D2E', bg: '#ecfeff', title: 'প্রোফাইল সম্পাদনা', sub: 'তথ্য আপডেট করুন' },
                { href: '/pricing', color: '#7B1D2E', bg: '#FDF6EE', title: isPremium ? 'প্ল্যান ব্যবস্থাপনা' : 'প্রিমিয়ামে আপগ্রেড', sub: isPremium ? 'বর্তমান: ' + planLabel : 'সব সুবিধা আনলক করুন' },
              ] : [
                { href: '/profiles?userGender=' + (user.gender || ''), color: '#7B1D2E', bg: '#fff1f2', title: 'Browse Profiles', sub: 'Find your perfect match' },
                { href: '/interests', color: '#7B1D2E', bg: '#f5f3ff', title: 'My Interests', sub: interestsReceived > 0 ? interestsReceived + ' new interest waiting' : 'View sent and received' },
                { href: '/verify', color: '#7B1D2E', bg: '#FDF6EE', title: 'Verify NID', sub: user.is_verified ? 'Already verified' : 'Get your verified badge' },
                { href: '/pricing', color: '#7B1D2E', bg: '#ecfeff', title: isPremium ? 'Manage Plan' : 'Upgrade to Premium', sub: isPremium ? 'Current: ' + planLabel : 'Unlock all features' },
                { href: 'mailto:support@biyekori.com?subject=Spotlight Request - ' + (user.full_name || '') + '&body=Please activate Spotlight for my profile.%0A%0AName: ' + (user.full_name || '') + '%0AProfile ID: ' + (user.id || '') + '%0APhone: ' + (user.phone || '') + '%0A%0AI have sent ৳99 via bKash to: 017XXXXXXXX', color: '#f59e0b', bg: '#FFFBEB', title: 'Get Spotlight', sub: 'Appear at top for 24hrs — ৳99' },
              ]).map((a, i) => (
                <Link key={i} href={a.href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: i < 3 ? '1px solid #f8fafc' : 'none', background: 'white', transition: 'background 0.15s' }}>
                  <div style={{ width: '38px', height: '38px', background: a.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: a.color, opacity: 0.8 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 1px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>{a.title}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{a.sub}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                </Link>
              ))}
            </div>

          </div>

          {/* Sidebar */}
          <div>
            <ProfileCompletion user={user} />
          </div>

        </div>
      </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </>
  );
}

