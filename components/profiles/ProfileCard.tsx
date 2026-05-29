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
    if (!userId) { alert("Please login first!"); window.location.href = "/login"; return; }
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
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="relative h-64 bg-gradient-to-br from-rose-100 to-purple-100">
        {allPhotos.length > 0 ? (
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
        {isPremium && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full text-xs font-bold">Premium</div>
        )}
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
            <h3 className="text-lg font-black text-gray-900">{name}</h3>
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

        {monthlyIncome && (
          <div className="bg-green-50 p-3 rounded-xl mb-3 relative overflow-hidden">
            <p className="text-xs text-green-700 mb-0.5 font-bold">Monthly Income</p>
            <p className="text-base font-black text-green-900">{canViewContact ? "BDT " + monthlyIncome.toLocaleString() : "BDT ****"}</p>
            {!canViewContact && (
              <div className="absolute inset-0 backdrop-blur-sm bg-white/60 flex items-center justify-center rounded-xl">
                <span className="text-xs font-bold text-gray-700">Premium Only</span>
              </div>
            )}
          </div>
        )}

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
              Interest Sent! Waiting...
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Link href={"/profile/" + profile.id} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2.5 rounded-xl font-bold text-sm text-center">
              View Profile
            </Link>
            <div className="relative">
              <button onClick={() => setShowGiftMenu(!showGiftMenu)} className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2.5 rounded-xl font-bold text-sm">
                Send Gift
              </button>
              {showGiftMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-2xl border-2 border-pink-200 p-3 w-48 z-20">
                  {GIFTS.map(([g, p]) => (
                    <button key={g} onClick={() => handleSendGift(g, p)} className="w-full text-left px-3 py-2 hover:bg-pink-50 rounded-lg text-sm flex justify-between">
                      <span>{g}</span><span className="font-bold text-rose-600">BDT {p}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
