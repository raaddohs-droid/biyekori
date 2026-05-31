"use client";
import { useState } from "react";
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

function getQuickScore(profile: any): number {
  let score = 0
  if (profile.religion === 'Islam') score += 25
  else score += 5
  const age = profile.age || 0
  if (age >= 20 && age <= 35) score += 15
  else if (age >= 18 && age <= 40) score += 8
  else score += 3
  const eduRank: Record<string, number> = { 'SSC': 1, 'HSC': 2, "Bachelor's": 3, "Master's": 4, 'Medical': 5, 'Engineering': 5, 'Law': 4 }
  score += (eduRank[profile.education] || 3) >= 3 ? 15 : (eduRank[profile.education] || 3) === 2 ? 8 : 5
  score += 7
  score += profile.personality_type ? 8 : 5
  score += profile.religious_level === 'Religious' ? 10 : 5
  score += profile.family_values ? 8 : 5
  score += profile.hobbies ? 4 : 2
  return Math.min(Math.round(score), 100)
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#10b981'
  if (score >= 70) return '#3b82f6'
  if (score >= 55) return '#f59e0b'
  return '#e11d48'
}

const GIFTS: [string, number][] = [
  ["Rose", 50], ["Bouquet", 99], ["Chocolate", 49], ["Ring Hint", 199], ["Dua Card", 29]
];

export default function ProfileCard({ profile, currentUserPackage = "prottasha", currentUserVerified = false }: { profile: any, currentUserPackage?: string, currentUserVerified?: boolean }) {
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
  const monthlyIncome = profile.monthly_income || profile.monthlyIncome;
  const canViewContact = currentUserVerified || currentUserPackage === "bondhon" || currentUserPackage === "milon";
  const showDegree = profile.degree && profile.degree !== profile.education && !["SSC","HSC"].includes(profile.education);
  const activity = getActivityStatus(profile.id);

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
          <div className="w-full h-full flex items-center justify-center text-6xl">👤</div>
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
        {(() => {
          const score = getQuickScore(profile)
          return (
            <div style={{
              position: 'absolute', top: '10px', right: '10px',
              background: getScoreColor(score),
              borderRadius: '20px', padding: '4px 10px',
              display: 'flex', alignItems: 'center', gap: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              <span style={{ fontSize: '10px', color: 'white', fontWeight: 600, opacity: 0.85 }}>AI</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>{score}%</span>
            </div>
          )
        })()}
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
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-gray-900">{name}</h3>
              {isPremium && (
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#b45309', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '6px', padding: '2px 6px', letterSpacing: '0.3px' }}>
                  Premium
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
