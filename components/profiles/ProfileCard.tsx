"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

function getActivityStatus(profileId: any) {
  const bdTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
  const hour = bdTime.getHours();
  const id = parseInt(String(profileId)) || 1;
  const seed = (id * 2654435761) % 100;
  let onlineChance: number, activeChance: number;
  if      (hour >= 0  && hour < 7)  { onlineChance = 1;  activeChance = 8;  }
  else if (hour >= 7  && hour < 9)  { onlineChance = 4;  activeChance = 18; }
  else if (hour >= 9  && hour < 12) { onlineChance = 7;  activeChance = 28; }
  else if (hour >= 12 && hour < 14) { onlineChance = 12; activeChance = 38; }
  else if (hour >= 14 && hour < 17) { onlineChance = 7;  activeChance = 28; }
  else if (hour >= 17 && hour < 22) { onlineChance = 15; activeChance = 42; }
  else                               { onlineChance = 5;  activeChance = 22; }
  if (seed < onlineChance)                     return { text: "Online now",       color: "#22c55e", pulse: true  };
  if (seed < onlineChance + activeChance)      return { text: "Active today",     color: "#f97316", pulse: false };
  if (seed < onlineChance + activeChance + 30) return { text: "Active this week", color: "#9ca3af", pulse: false };
  return                                              { text: "Recently active",  color: "#6b7280", pulse: false };
}

const EDU_RANK: Record<string, number> = {
  'SSC': 1, 'HSC': 2, 'Diploma': 2, "Bachelor's": 3,
  'Law': 4, "Master's": 4, 'Medical': 5, 'Engineering': 5, 'PhD': 6, 'Other': 2
}

function parseHeightToCm(h: string): number {
  if (!h) return 0
  const m = h.match(/(\d+)'(\d+)?/)
  if (!m) return 0
  return parseInt(m[1]) * 30.48 + (parseInt(m[2] || '0') * 2.54)
}

// Full scientific match score using viewer's preferences vs profile fields
function computeMatchScore(profile: any, viewer: any): number {
  const REL_LEVELS = ['Liberal', 'Moderate', 'Religious', 'Very Religious']
  const EDU_RANK: Record<string, number> = { 'SSC': 1, 'HSC': 2, "Bachelor's": 3, 'BBA': 3, 'Engineering': 4, 'B.Sc Engineering': 4, "Master's": 5, 'MBA': 5, 'MBBS': 5, 'Medical': 5, 'PhD': 6 }
  const hasViewer = !!(viewer && viewer.id)

  if (!hasViewer) {
    let score = 0
    score += profile.religion ? 12 : 4
    const age = profile.age || 0
    if (age >= 20 && age <= 35) score += 12
    else if (age >= 18 && age <= 40) score += 7
    else score += 3
    score += (EDU_RANK[profile.education || ''] || 2) >= 3 ? 12 : 6
    score += Math.round(((profile.profile_completion || 30) / 100) * 20)
    if (String(profile.smoking || 'false') === 'false') score += 5
    if (profile.is_verified) score += 8
    else if (profile.phone_verified) score += 4
    if (profile.photo_url) score += 8
    if (profile.about_me) score += 6
    return Math.max(30, Math.min(99, score))
  }

  let earned = 0; let possible = 0
  function add(w: number, s: number) { earned += s; possible += w }

  if (viewer.religion || profile.religion) add(15, viewer.religion === profile.religion ? 15 : 0)
  if (viewer.expected_religious_level || profile.religious_level) {
    const vRI = REL_LEVELS.indexOf(viewer.expected_religious_level || '')
    const pRI = REL_LEVELS.indexOf(profile.religious_level || '')
    let s = 6; if (vRI >= 0 && pRI >= 0) { const d = Math.abs(vRI-pRI); s = d===0?10:d===1?7:d===2?3:0 }
    add(10, s)
  }
  { const age=profile.age||0, mn=viewer.expected_age_min||18, mx=viewer.expected_age_max||60, inR=age>=mn&&age<=mx, diff=inR?0:Math.min(Math.abs(age-mn),Math.abs(age-mx)); add(12, inR?12:Math.max(0,12-diff*2)) }
  if (viewer.expected_education || profile.education) { const er=EDU_RANK[viewer.expected_education||'']||0, pr=EDU_RANK[profile.education||'']||0; add(8, er===0?6:pr>=er?8:Math.max(0,8-(er-pr)*2)) }
  { const pd=(profile.district||profile.city||'').toLowerCase(); let ed: string[]=[]; try{ed=(viewer.expected_districts||[]).map((d:string)=>d.toLowerCase())}catch{}; const sv=(viewer.district||'').toLowerCase()===pd; add(7, ed.includes(pd)||sv?7:ed.length>0?2:4) }
  if (viewer.expected_income || profile.monthly_income) { const ei=parseFloat(viewer.expected_income||'0'), pi=profile.monthly_income||0; let s=4; if(ei>0&&pi>0){const r=pi/ei;s=r>=1?7:r>=0.8?5:r>=0.6?3:1}; add(7,s) }
  { const em=(viewer.expected_marital_status||'Never Married').toLowerCase(), pm=(profile.marital_status||'').toLowerCase(); add(7, em==='any'||em===pm?7:pm==='never married'?5:2) }
  if (profile.height) { const ph=parseHeightToCm(profile.height), mn=parseHeightToCm(viewer.expected_height_min||''), mx=parseHeightToCm(viewer.expected_height_max||''); let s=3; if(ph>0&&mn>0&&mx>0){if(ph>=mn&&ph<=mx)s=5;else{const d=Math.min(Math.abs(ph-mn),Math.abs(ph-mx));s=d<5?3:1}}; add(5,s) }
  if (viewer.expected_family_values || profile.family_values) { const ef=(viewer.expected_family_values||'').toLowerCase(), pf=(profile.family_values||'').toLowerCase(); add(5, !ef||ef===pf?5:2) }
  { const es=(viewer.expected_smoking||'no').toLowerCase(), ps=String(profile.smoking||'false').toLowerCase()==='true'; add(4, es==='no'?(!ps?4:0):4) }
  if (viewer.expected_family_type || profile.family_type) { const eft=(viewer.expected_family_type||'').toLowerCase(), pft=(profile.family_type||'').toLowerCase(); add(4, !eft||eft===pft?4:2) }
  add(8, Math.round(((profile.profile_completion||30)/100)*8))
  add(5, profile.is_verified?5:profile.phone_verified?2:0)

  return Math.max(30, Math.min(99, possible>0?Math.round((earned/possible)*100):50))
}


// Generic score when no viewer context (fallback)
function getGenericScore(profile: any): number {
  let score = 0
  score += profile.religion ? 12 : 4
  score += (profile.working_with || profile.employer_name) ? 5 : 0
  score += (profile.father_profession || profile.mother_profession) ? 4 : 0
  score += profile.marriage_timeline ? 3 : 0
  score += profile.college_attended ? 3 : 0
  const age = profile.age || 0
  if (age >= 20 && age <= 35) score += 12
  else if (age >= 18 && age <= 40) score += 7
  else score += 3
  score += (EDU_RANK[profile.education || ''] || 2) >= 3 ? 12 : 6
  score += Math.round(((profile.profile_completion || 30) / 100) * 20)
  if (String(profile.smoking || 'false') === 'false') score += 5
  if (String(profile.drinking || 'false') === 'false') score += 5
  if (profile.is_verified) score += 8
  else if (profile.phone_verified) score += 4
  if (profile.photo_url) score += 8
  if (profile.about_me) score += 6
  if (profile.family_values) score += 4
  if (profile.hobbies) score += 4
  return Math.max(30, Math.min(99, score))
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#10b981'
  if (score >= 70) return '#3b82f6'
  if (score >= 55) return '#f59e0b'
  return '#e11d48'
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 55) return 'Fair'
  return 'Low'
}

const GIFTS: [string, number][] = [
  ["Rose", 50], ["Bouquet", 99], ["Chocolate", 49], ["Ring Hint", 199], ["Dua Card", 29]
];

function maskName(n: string, ok: boolean): string {
  if (!n) return 'Anonymous';
  if (ok) return n;
  const p = n.trim().split(' ');
  return p.map(x => x[0] + '*'.repeat(Math.max(x.length - 1, 3))).join(' ');
}

export default function ProfileCard({ profile, currentUserPackage = "prottasha", currentUserVerified = false, viewerProfile = null, ...rest }: { profile: any, currentUserPackage?: string, currentUserVerified?: boolean, viewerProfile?: any, [key: string]: any }) {
  const [showGiftMenu, setShowGiftMenu] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('biyekori_user');
      if (!stored) return;
      const user = JSON.parse(stored);
      if (!user?.id) return;
      fetch('/api/shortlists?userId=' + user.id)
        .then(r => r.json())
        .then(data => {
          const found = (data.shortlists || []).some((s: any) => String(s.profile_id) === String(profile.id));
          setIsShortlisted(found);
        }).catch(() => {});
    } catch(e) {}
  }, [profile.id]);

  const handleShortlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const stored = localStorage.getItem('biyekori_user');
    if (!stored) { window.location.href = '/login'; return; }
    const user = JSON.parse(stored);
    if (!user?.id) return;
    if (isShortlisted) {
      await fetch('/api/shortlists', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, profileId: profile.id })
      });
      setIsShortlisted(false);
    } else {
      await fetch('/api/shortlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, profileId: profile.id })
      });
      setIsShortlisted(true);
    }
  };
  const [interestSent, setInterestSent] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoRequested, setPhotoRequested] = useState(false);

  const rawName = profile.full_name || profile.name || "Anonymous";

  const [isMutual, setIsMutual] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('biyekori_user');
      if (!stored) return;
      const user = JSON.parse(stored);
      if (!user?.id) return;
      fetch('/api/interests/list?userId=' + user.id)
        .then(r => r.json())
        .then(data => {
          const sent = (data.sent || []).find((s: any) =>
            String(s.receiver_id) === String(profile.id) && s.status === 'accepted'
          );
          const recv = (data.received || []).find((r: any) =>
            String(r.sender_id) === String(profile.id) && r.status === 'accepted'
          );
          if (sent || recv) setIsMutual(true);
        }).catch(() => {});
    } catch(e) {}
  }, [profile.id]);

  const name = maskName(rawName, isMutual);
  const location = profile.location || profile.city || profile.district || "Bangladesh";
  const maritalStatus = (profile.marital_status || profile.maritalStatus || "").trim();
  const photoUrl = profile.photo_url || profile.photoUrl;
  const additionalPhotos = profile.additional_photos || [];
  const allPhotos: string[] = photoUrl ? [photoUrl, ...additionalPhotos] : additionalPhotos;
  const isVerified = profile.is_verified || profile.isVerified || false;
  const isPremium = profile.package !== "prottasha";
  const isFeatured = profile.is_featured && profile.featured_until && new Date(profile.featured_until) > new Date();
  const canViewContact = currentUserVerified || currentUserPackage === "silver" || currentUserPackage === "milon";
  const showDegree = profile.degree && profile.degree !== profile.education && !["SSC","HSC"].includes(profile.education);
  const activity = getActivityStatus(profile.id);
  const isGuardianManaged = !!profile.guardian_mode;

  const score = computeMatchScore(profile, viewerProfile)
  const scoreColor = getScoreColor(score)
  const scoreLabel = getScoreLabel(score)

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 8) return "***-***-***";
    return phone.substring(0, 3) + "***" + phone.substring(phone.length - 2);
  };

  const handleSendInterest = async () => {
    const userStr = localStorage.getItem("biyekori_user"); const userId = userStr ? JSON.parse(userStr).id : null;
    if (!userId) { window.location.href = "/register?reason=interest"; return; }
    try {
      const res = await fetch("/api/interests/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: parseInt(userId), receiverId: parseInt(String(profile.id)) })
      });
      const data = await res.json();
      if (res.ok) { setInterestSent(true); }
      else if (data.upgrade) { alert("You have reached your monthly limit of 3 interests. Upgrade to send more!"); window.location.href = "/pricing"; }
      else if (res.status === 409) { setInterestSent(true); }
      else { alert("Error: " + data.error); }
    } catch (e) { alert("Something went wrong. Please try again."); }
  };

  const handleSendGift = (gift: string, price: number) => {
    alert("Send " + gift + " for BDT " + price + "? Upgrade to premium to send gifts!");
    setShowGiftMenu(false);
  };

  return (
    <div className={"bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden " + (isPremium ? "border-2 border-yellow-400" : "border border-gray-100")}>
      <div className="relative h-64 bg-gradient-to-br from-rose-100 to-purple-100">
        {profile.photo_privacy ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <p className="text-xs font-semibold text-purple-400">Photo Private</p>
          </div>
        ) : allPhotos.length > 0 ? (
          <img src={allPhotos[currentPhotoIndex]} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full relative overflow-hidden" style={{ background: profile.gender === 'female' ? '#FFF0F6' : '#EFF6FF' }}>
            {profile.gender === 'female' ? (
              <svg width="100%" height="100%" viewBox="0 0 200 256" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                <rect width="200" height="256" fill="#FFF0F6"/>
                <circle cx="100" cy="128" r="110" fill="#FCE7F3" opacity="0.45"/>
                <circle cx="20" cy="30" r="50" fill="#FBCFE8" opacity="0.2"/>
                <circle cx="185" cy="220" r="65" fill="#FBCFE8" opacity="0.2"/>
                <g transform="translate(100,118)">
                  <ellipse rx="9" ry="24" fill="#F9A8D4" opacity="0.3" transform="rotate(0)"/>
                  <ellipse rx="9" ry="24" fill="#F9A8D4" opacity="0.3" transform="rotate(45)"/>
                  <ellipse rx="9" ry="24" fill="#F9A8D4" opacity="0.3" transform="rotate(90)"/>
                  <ellipse rx="9" ry="24" fill="#F9A8D4" opacity="0.3" transform="rotate(135)"/>
                  <ellipse rx="9" ry="24" fill="#EC4899" opacity="0.14" transform="rotate(22.5)"/>
                  <ellipse rx="9" ry="24" fill="#EC4899" opacity="0.14" transform="rotate(67.5)"/>
                  <ellipse rx="9" ry="24" fill="#EC4899" opacity="0.14" transform="rotate(112.5)"/>
                  <ellipse rx="9" ry="24" fill="#EC4899" opacity="0.14" transform="rotate(157.5)"/>
                  <circle r="6" fill="#DB2777" opacity="0.28"/>
                </g>
                <circle cx="30" cy="78" r="2" fill="#F9A8D4" opacity="0.4"/>
                <circle cx="170" cy="58" r="1.5" fill="#F9A8D4" opacity="0.35"/>
                <circle cx="158" cy="208" r="2" fill="#F9A8D4" opacity="0.35"/>
                <path d="M78 96 Q62 118 60 152 Q60 172 64 188 Q72 200 80 208 Q85 190 84 168 Q83 144 84 118 Q82 108 78 96Z" fill="#9D174D" opacity="0.55"/>
                <path d="M122 96 Q138 118 140 152 Q140 172 136 188 Q128 200 120 208 Q115 190 116 168 Q117 144 116 118 Q118 108 122 96Z" fill="#9D174D" opacity="0.55"/>
                <ellipse cx="100" cy="100" rx="27" ry="28" fill="#9D174D" opacity="0.62"/>
                <line x1="100" y1="74" x2="100" y2="92" stroke="#7C1652" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                <rect x="93" y="126" width="14" height="6" rx="3" fill="#DB2777" opacity="0.58"/>
                <path d="M62 230 Q60 186 100 182 Q140 186 138 230 L138 242 Q120 235 100 234 Q80 235 62 242Z" fill="#DB2777" opacity="0.6"/>
                <rect x="88" y="130" width="24" height="22" rx="4" fill="#DB2777" opacity="0.6"/>
                <ellipse cx="82" cy="165" rx="10" ry="14" fill="#C81E6B" opacity="0.18"/>
                <ellipse cx="118" cy="165" rx="10" ry="14" fill="#C81E6B" opacity="0.18"/>
                <line x1="68" y1="248" x2="132" y2="248" stroke="#F0C040" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="68" cy="248" r="1.8" fill="#F0C040"/>
                <circle cx="132" cy="248" r="1.8" fill="#F0C040"/>
                <text x="100" y="256" textAnchor="middle" fontFamily="Georgia,serif" fontSize="8.5" fill="#9D174D" fontStyle="italic" letterSpacing="1.5">ছবি চাওয়া যাবে</text>
              </svg>
            ) : (
              <svg width="100%" height="100%" viewBox="0 0 200 256" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                <rect width="200" height="256" fill="#EFF6FF"/>
                <circle cx="100" cy="128" r="110" fill="#DBEAFE" opacity="0.45"/>
                <circle cx="175" cy="25" r="45" fill="#BFDBFE" opacity="0.16"/>
                <circle cx="15" cy="230" r="55" fill="#BFDBFE" opacity="0.16"/>
                <polygon points="100,28 118,58 82,58" fill="#3B82F6" opacity="0.08"/>
                <polygon points="26,98 46,132 8,132" fill="#1D4ED8" opacity="0.06"/>
                <polygon points="172,158 192,192 152,192" fill="#3B82F6" opacity="0.07"/>
                <rect x="154" y="48" width="26" height="26" rx="3" fill="#1D4ED8" opacity="0.06" transform="rotate(20 167 61)"/>
                <rect x="14" y="152" width="20" height="20" rx="3" fill="#3B82F6" opacity="0.06" transform="rotate(-15 24 162)"/>
                <circle cx="165" cy="106" r="1.8" fill="#93C5FD" opacity="0.38"/>
                <circle cx="35" cy="58" r="1.5" fill="#93C5FD" opacity="0.32"/>
                <ellipse cx="100" cy="100" rx="27" ry="26" fill="#0F3896" opacity="0.72"/>
                <path d="M82 88 Q100 82 118 88" fill="none" stroke="#0A2880" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
                <path d="M78 96 Q100 90 122 96" fill="none" stroke="#0A2880" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
                <rect x="91" y="124" width="18" height="6" rx="3" fill="#1D4ED8" opacity="0.65"/>
                <path d="M38 230 Q36 182 100 178 Q164 182 162 230 L162 242 Q134 235 100 234 Q66 235 38 242Z" fill="#1D4ED8" opacity="0.62"/>
                <rect x="86" y="128" width="28" height="22" rx="4" fill="#1D4ED8" opacity="0.62"/>
                <line x1="100" y1="148" x2="100" y2="195" stroke="#BFDBFE" strokeWidth="1.2" strokeLinecap="round" opacity="0.45"/>
                <ellipse cx="78" cy="168" rx="13" ry="17" fill="#1540A8" opacity="0.22"/>
                <ellipse cx="122" cy="168" rx="13" ry="17" fill="#1540A8" opacity="0.22"/>
                <line x1="68" y1="248" x2="132" y2="248" stroke="#F0C040" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="68" cy="248" r="1.8" fill="#F0C040"/>
                <circle cx="132" cy="248" r="1.8" fill="#F0C040"/>
                <text x="100" y="256" textAnchor="middle" fontFamily="Georgia,serif" fontSize="8.5" fill="#1E40AF" fontStyle="italic" letterSpacing="1.5">ছবি চাওয়া যাবে</text>
              </svg>
            )}
            {!photoUrl && (
              <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, whiteSpace: 'nowrap' }}>
                {photoRequested ? (
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#15803d', background: 'rgba(255,255,255,0.95)', padding: '3px 10px', borderRadius: '20px' }}>✓ Request sent</span>
                ) : (
                  <button onClick={e => {
                    e.stopPropagation()
                    setPhotoRequested(true)
                    try {
                      const u = JSON.parse(localStorage.getItem('biyekori_user') || '{}')
                      if (u.id) fetch('/api/photo-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requesterId: u.id, requestedId: profile.id }) })
                    } catch(e) {}
                  }} style={{ fontSize: '10px', fontWeight: 700, color: 'white', background: profile.gender === 'female' ? 'linear-gradient(135deg,#DB2777,#9D174D)' : 'linear-gradient(135deg,#1D4ED8,#1E40AF)', border: 'none', padding: '4px 10px', borderRadius: '20px', cursor: 'pointer' }}>Photo on Request</button>
                )}
              </div>
            )}
          </div>
        )}
        {allPhotos.length > 1 && (
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1">
            {allPhotos.map((_: string, i: number) => (
              <button key={i} onClick={() => setCurrentPhotoIndex(i)}
                className={"w-2 h-2 rounded-full " + (i === currentPhotoIndex ? "bg-white" : "bg-white/50")} />
            ))}
          </div>
        )}
        {isVerified && (
          <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">Verified</div>
        )}
        {isFeatured && (
          <div className="absolute top-3 left-3 z-10" style={{background:'linear-gradient(135deg,#f59e0b,#d97706)',borderRadius:'20px',padding:'3px 10px',display:'flex',alignItems:'center',gap:'4px',boxShadow:'0 2px 8px rgba(245,158,11,0.4)'}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span style={{fontSize:'10px',color:'white',fontWeight:800,letterSpacing:'0.3px'}}>Featured</span>
          </div>
        )}

        {/* AI Match Score badge */}
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          background: viewerProfile ? scoreColor : 'rgba(0,0,0,0.65)',
          borderRadius: '20px', padding: '4px 10px',
          display: 'flex', alignItems: 'center', gap: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          cursor: 'pointer'
        }} onClick={() => alert('Login to see your AI match score')}>
          <span style={{ fontSize: '9px', color: 'white', fontWeight: 700 }}>{viewerProfile ? 'Match ' + score + '%' : 'Login to see score'}</span>
        </div>

        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5">
          {activity.pulse ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{backgroundColor: activity.color}} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{backgroundColor: activity.color}} />
            </span>
          ) : (
            <span className="inline-flex rounded-full h-2 w-2" style={{backgroundColor: activity.color}} />
          )}
          <span className="text-white text-xs font-medium">{activity.text}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900">{name}</h3>
              {isPremium && (
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#b45309', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '6px', padding: '2px 6px', letterSpacing: '0.3px' }}>
                  Premium
                </span>
              )}
              {profile.selfie_status === 'approved' && (
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '2px 6px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                  Verified
                </span>
              )}
            </div>

            {/* Guardian Mode / Self Managed badge */}
            <div style={{ marginTop: '6px', marginBottom: '2px' }}>
              {isGuardianManaged ? (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  fontSize: '11px', fontWeight: 700,
                  color: '#7c3aed', background: '#ede9fe',
                  padding: '2px 8px', borderRadius: '20px',
                  border: '1px solid #c4b5fd'
                }}>
                  <span style={{ fontSize: '12px' }}>👨‍👩‍👧</span>
                  পরিবার পরিচালিত
                </span>
              ) : (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  fontSize: '11px', fontWeight: 700,
                  color: '#0369a1', background: '#e0f2fe',
                  padding: '2px 8px', borderRadius: '20px',
                  border: '1px solid #bae6fd'
                }}>
                  <span style={{ fontSize: '12px' }}>👤</span>
                  নিজে পরিচালিত
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-sm text-gray-600">{profile.age} yrs</span>
              {profile.height && <span className="text-sm text-gray-600">· {profile.height}</span>}
              {maritalStatus && maritalStatus !== "Not specified" && <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">{maritalStatus}</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
          {location && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#374151', background: '#f3f4f6', borderRadius: '20px', padding: '3px 10px', fontWeight: 500 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {location}
            </span>
          )}
          {profile.profession && (
            <span style={{ fontSize: '11px', color: '#374151', background: '#f3f4f6', borderRadius: '20px', padding: '3px 10px', fontWeight: 500 }}>
              {profile.profession}
            </span>
          )}
          {profile.education && (
            <span style={{ fontSize: '11px', color: '#374151', background: '#f0f9ff', borderRadius: '20px', padding: '3px 10px', fontWeight: 500 }}>
              {profile.education}{showDegree && ' (' + profile.degree + ')'}
            </span>
          )}
          {profile.religion && (
            <span style={{ fontSize: '11px', color: '#374151', background: '#fdf4ff', borderRadius: '20px', padding: '3px 10px', fontWeight: 500 }}>
              {profile.religion}
            </span>
          )}
        </div>

        {profile.phone && (
          <div className={"rounded-xl p-3 mb-3 border-2 " + (canViewContact ? "bg-green-50 border-green-300" : "bg-rose-50 border-rose-300")}>
            <p className="text-xs font-bold mb-1.5 text-gray-900">Contact {!canViewContact && "(Premium)"}</p>
            {canViewContact ? (
              <p className="text-sm text-gray-800">Phone: {profile.phone}</p>
            ) : (
              <>
                <p className="text-sm text-gray-700 mb-2">Phone: {maskPhone(profile.phone)}</p>
                <button onClick={() => setShowUpgradeModal(true)} className="block w-full py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-bold text-center text-xs" style={{ border: 'none', cursor: 'pointer' }}>
                  Upgrade to View Contact
                </button>
                {showUpgradeModal && (
                  <div onClick={() => setShowUpgradeModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px', padding: '32px 24px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
                      <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 900, color: '#111827' }}>Upgrade to Contact</h2>
                      <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>View contact details and connect with <strong>{name}</strong>.</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                        <a href="/pricing" style={{ display: 'block', padding: '14px', background: 'linear-gradient(135deg,#e11d48,#db2777)', color: 'white', borderRadius: '12px', fontWeight: 800, fontSize: '15px', textDecoration: 'none' }}>⭐ Upgrade to Silver — ৳499/mo</a>
                        <a href="/pricing" style={{ display: 'block', padding: '14px', background: 'linear-gradient(135deg,#7c3aed,#db2777)', color: 'white', borderRadius: '12px', fontWeight: 800, fontSize: '15px', textDecoration: 'none' }}>👑 Upgrade to Gold — ৳999/mo</a>
                      </div>
                      <button onClick={() => setShowUpgradeModal(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '13px', cursor: 'pointer' }}>Maybe later</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="space-y-2">
          {!interestSent ? (
            <button onClick={handleSendInterest} className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 rounded-xl font-bold text-sm hover:shadow-xl transition-all">
              Send Interest
            </button>
          ) : (
            <div className="w-full bg-green-100 border-2 border-green-500 text-green-800 py-3 rounded-xl font-bold text-sm text-center">
              Waiting for Response...
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link href={"/profile/" + profile.id} style={{ flex: 1, display: 'block', padding: '10px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontWeight: 700, fontSize: '13px', textAlign: 'center', textDecoration: 'none', color: '#374151', transition: 'all 0.2s' }}>
              View Profile
            </Link>
            <button
              onClick={handleShortlist}
              title={isShortlisted ? 'Shortlisted' : 'Shortlist'}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                padding: '8px 10px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: isShortlisted ? '#fff1f2' : '#f9fafb',
                transition: 'all 0.2s', flexShrink: 0
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24"
                fill={isShortlisted ? '#e11d48' : 'none'}
                stroke={isShortlisted ? '#e11d48' : '#9ca3af'}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span style={{ fontSize: '9px', fontWeight: 700, color: isShortlisted ? '#e11d48' : '#9ca3af', whiteSpace: 'nowrap' }}>
                {isShortlisted ? 'Shortlisted' : 'Shortlist'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
