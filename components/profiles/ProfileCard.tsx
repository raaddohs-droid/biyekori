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
  const hasPrefs = viewer && (
    viewer.expected_age_min || viewer.expected_age_max ||
    viewer.religion || viewer.expected_education ||
    viewer.expected_religious_level || viewer.expected_family_type
  )
  if (!hasPrefs) return getGenericScore(profile)

  let total = 0
  let maxTotal = 0

  // 1. AGE MATCH (15 pts)
  maxTotal += 15
  const age = profile.age || 0
  const ageMin = viewer.expected_age_min || 18
  const ageMax = viewer.expected_age_max || 60
  if (age >= ageMin && age <= ageMax) {
    total += 15
  } else {
    const diff = Math.min(Math.abs(age - ageMin), Math.abs(age - ageMax))
    total += Math.max(0, 15 - diff * 2)
  }

  // 2. RELIGION MATCH (15 pts)
  maxTotal += 15
  if (viewer.religion && profile.religion) {
    if (viewer.religion === profile.religion) total += 15
    else total += 0
  } else {
    total += 10
    maxTotal -= 5
  }

  // 3. RELIGIOSITY MATCH (10 pts)
  maxTotal += 10
  const relLevels = ['Liberal', 'Moderate', 'Religious', 'Very Religious']
  const viewerRelIdx = relLevels.indexOf(viewer.expected_religious_level || '')
  const profileRelIdx = relLevels.indexOf(profile.religious_level || '')
  if (viewerRelIdx >= 0 && profileRelIdx >= 0) {
    const diff = Math.abs(viewerRelIdx - profileRelIdx)
    total += diff === 0 ? 10 : diff === 1 ? 6 : diff === 2 ? 2 : 0
  } else {
    total += 6
  }

  // 4. EDUCATION MATCH (10 pts)
  maxTotal += 10
  const expectedEduRank = EDU_RANK[viewer.expected_education || ''] || 0
  const profileEduRank = EDU_RANK[profile.education || ''] || 0
  if (expectedEduRank === 0) {
    total += 7
  } else if (profileEduRank >= expectedEduRank) {
    total += 10
  } else {
    const diff = expectedEduRank - profileEduRank
    total += Math.max(0, 10 - diff * 3)
  }

  // 5. DISTRICT/LOCATION (8 pts)
  maxTotal += 8
  const viewerDistrict = viewer.district || viewer.city || ''
  const profileDistrict = profile.district || profile.city || ''
  const preferredDistrict = viewer.partner_district || ''
  if (preferredDistrict && profileDistrict) {
    if (profileDistrict === preferredDistrict) total += 8
    else if (profileDistrict === viewerDistrict) total += 5
    else total += 2
  } else if (profileDistrict === viewerDistrict) {
    total += 8
  } else {
    total += 4
  }

  // 6. FAMILY TYPE (7 pts)
  maxTotal += 7
  if (viewer.expected_family_type && profile.family_type) {
    total += viewer.expected_family_type === profile.family_type ? 7 : 2
  } else {
    total += 4
  }

  // 7. INCOME COMPATIBILITY (7 pts)
  maxTotal += 7
  const expectedIncome = parseFloat(viewer.expected_income || '0')
  const profileIncome = profile.monthly_income || 0
  if (expectedIncome > 0 && profileIncome > 0) {
    const ratio = profileIncome / expectedIncome
    if (ratio >= 1.0) total += 7
    else if (ratio >= 0.8) total += 5
    else if (ratio >= 0.6) total += 3
    else total += 1
  } else {
    total += 4
  }

  // 8. MARITAL STATUS (5 pts)
  maxTotal += 5
  const ms = (profile.marital_status || '').toLowerCase()
  if (ms === 'never married' || ms === 'never_married') total += 5
  else if (ms === 'divorced' || ms === 'widowed') total += 3
  else total += 2

  // 9. HEIGHT MATCH (5 pts)
  maxTotal += 5
  const profileHeightCm = parseHeightToCm(profile.height || '')
  const minH = parseHeightToCm(viewer.expected_height_min || '')
  const maxH = parseHeightToCm(viewer.expected_height_max || '')
  if (profileHeightCm > 0 && minH > 0 && maxH > 0) {
    if (profileHeightCm >= minH && profileHeightCm <= maxH) total += 5
    else {
      const diff = Math.min(Math.abs(profileHeightCm - minH), Math.abs(profileHeightCm - maxH))
      total += diff < 5 ? 3 : diff < 10 ? 1 : 0
    }
  } else {
    total += 3
  }

  // 10. LIFESTYLE MATCH (6 pts)
  maxTotal += 6
  let lifestyleScore = 0
  const profileSmoking = String(profile.smoking || 'false').toLowerCase()
  if (profileSmoking === 'false' || profileSmoking === 'no') lifestyleScore += 2
  const profileDrinking = String(profile.drinking || 'false').toLowerCase()
  if (profileDrinking === 'false' || profileDrinking === 'no') lifestyleScore += 2
  if (profile.diet) lifestyleScore += 2
  total += lifestyleScore

  // 11. PERSONALITY COMPATIBILITY (4 pts)
  maxTotal += 4
  if (profile.personality_type && viewer.personality_type) {
    const compatible: Record<string, string[]> = {
      'Modern': ['Modern', 'Liberal'],
      'Traditional': ['Traditional', 'Religious'],
      'Liberal': ['Modern', 'Liberal'],
      'Religious': ['Traditional', 'Religious', 'Moderate'],
      'Moderate': ['Moderate', 'Traditional', 'Religious']
    }
    const viewerPersonality = viewer.personality_type || ''
    const profilePersonality = profile.personality_type || ''
    const compatList = compatible[viewerPersonality] || []
    total += compatList.includes(profilePersonality) ? 4 : viewerPersonality === profilePersonality ? 4 : 1
  } else {
    total += 2
  }

  // 12. PROFILE COMPLETENESS BONUS (8 pts)
  maxTotal += 8
  const completeness = profile.profile_completion || 0
  total += Math.round((completeness / 100) * 8)

  // 13. VERIFICATION BONUS (5 pts)
  maxTotal += 5
  if (profile.is_verified) total += 5
  else if (profile.phone_verified) total += 2

  // Normalize to 100
  const raw = Math.round((total / maxTotal) * 100)
  return Math.max(30, Math.min(99, raw))
}

// Generic score when no viewer context (fallback)
function getGenericScore(profile: any): number {
  let score = 0
  score += profile.religion ? 12 : 4
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

export default function ProfileCard({ profile, currentUserPackage = "prottasha", currentUserVerified = false, viewerProfile = null, ...rest }: { profile: any, currentUserPackage?: string, currentUserVerified?: boolean, viewerProfile?: any, [key: string]: any }) {
  const [showGiftMenu, setShowGiftMenu] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const name = profile.full_name || profile.name || "Anonymous";
  const location = profile.location || profile.city || profile.district || "Bangladesh";
  const maritalStatus = profile.marital_status || profile.maritalStatus || "Not specified";
  const photoUrl = profile.photo_url || profile.photoUrl;
  const additionalPhotos = profile.additional_photos || [];
  const allPhotos: string[] = photoUrl ? [photoUrl, ...additionalPhotos] : additionalPhotos;
  const isVerified = profile.is_verified || profile.isVerified || false;
  const isPremium = profile.package !== "prottasha";
  const isFeatured = profile.is_featured && profile.featured_until && new Date(profile.featured_until) > new Date();
  const canViewContact = currentUserVerified || currentUserPackage === "bondhon" || currentUserPackage === "milon";
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
          <div className="w-full h-full flex items-center justify-center text-6xl">?</div>
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
          background: scoreColor,
          borderRadius: '20px', padding: '4px 10px',
          display: 'flex', alignItems: 'center', gap: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          cursor: 'pointer'
        }} onClick={() => alert('Login to see your AI match score')}>
          <span style={{ fontSize: '9px', color: 'white', fontWeight: 600, opacity: 0.85 }}>AI</span>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>{score}%</span>
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
              <h3 className="text-lg font-black text-gray-900">{name}</h3>
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
              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">{maritalStatus}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-50 p-2.5 rounded-xl">
            <p className="text-xs text-gray-500 mb-0.5">Location</p>
            <p className="font-bold text-gray-900 text-xs">{location}</p>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl">
            <p className="text-xs text-gray-500 mb-0.5">Education</p>
            <p className="font-bold text-gray-900 text-xs">{profile.education}{showDegree && " (" + profile.degree + ")"}</p>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl">
            <p className="text-xs text-gray-500 mb-0.5">Profession</p>
            <p className="font-bold text-gray-900 text-xs">{profile.profession}</p>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl">
            <p className="text-xs text-gray-500 mb-0.5">Religion</p>
            <p className="font-bold text-gray-900 text-xs">{profile.religion}</p>
          </div>
        </div>

        {profile.phone && (
          <div className={"rounded-xl p-3 mb-3 border-2 " + (canViewContact ? "bg-green-50 border-green-300" : "bg-rose-50 border-rose-300")}>
            <p className="text-xs font-bold mb-1.5 text-gray-900">Contact {!canViewContact && "(Premium)"}</p>
            {canViewContact ? (
              <p className="text-sm text-gray-800">Phone: {profile.phone}</p>
            ) : (
              <>
                <p className="text-sm text-gray-700 mb-2">Phone: {maskPhone(profile.phone)}</p>
                <Link href="/pricing" className="block w-full py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-bold text-center text-xs">
                  Upgrade to View Contact
                </Link>
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
          <Link href={"/profile/" + profile.id} className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2.5 rounded-xl font-bold text-sm text-center">
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
