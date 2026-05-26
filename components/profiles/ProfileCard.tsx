"use client";
import { useState } from "react";
import Link from "next/link";

interface Profile {
  id: string;
  lookingFor?: "bride" | "groom";
  full_name?: string;
  name?: string;
  age: number;
  height: string;
  location?: string;
  city?: string;
  education: string;
  profession: string;
  monthlyIncome?: number;
  monthly_income?: number;
  religion: string;
  maritalStatus?: string;
  marital_status?: string;
  photoUrl?: string;
  photo_url?: string;
  isVerified?: boolean;
  is_verified?: boolean;
  isPremium?: boolean;
  is_premium?: boolean;
  package?: string;
  phone?: string;
  email?: string;
}

export default function ProfileCard({ profile }: { profile: Profile }) {
  const [showGiftMenu, setShowGiftMenu] = useState(false);
  const [interestSent, setInterestSent] = useState(false);

  const name = profile.full_name || profile.name || "Anonymous";
  const location = profile.location || profile.city || "Bangladesh";
  const maritalStatus = profile.maritalStatus || profile.marital_status || "Not specified";
  const photoUrl = profile.photoUrl || profile.photo_url;
  const isVerified = profile.isVerified || profile.is_verified || false;
  const isPremium = profile.isPremium || profile.is_premium || profile.package !== 'prottasha';
  const monthlyIncome = profile.monthlyIncome || profile.monthly_income;

  // FREE USER - Can only see limited info
  const isUserFree = true; // TODO: Get from localStorage
  const isUserVerified = false; // TODO: Get from localStorage

  // Contact details should be hidden unless user is premium OR verified
  const canViewContact = isUserVerified || !isUserFree;

  const handleSendInterest = () => {
    setInterestSent(true);
    alert('💌 Interest sent successfully!\n\nThey will be notified. If they accept, you can view their full profile and contact details!');
  };

  const handleSendGift = (gift: string, price: number) => {
    alert(`🎁 Send ${gift} for ৳${price}?\n\nThis feature requires premium membership!\n\nUpgrade now to send virtual gifts and stand out!`);
    setShowGiftMenu(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 relative group">
      
      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <span>⭐</span> PREMIUM
          </div>
        </div>
      )}

      {/* Verified Badge */}
      {isVerified && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <span>✓</span> VERIFIED
          </div>
        </div>
      )}

      {/* Photo Section */}
      <div className="relative h-64 bg-gradient-to-br from-rose-100 to-pink-100 overflow-hidden">
        {photoUrl ? (
          <img 
            src={photoUrl} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-6xl">👤</div>
          </div>
        )}
        
        {/* Photo Blur for Free Users */}
        {isUserFree && (
          <div className="absolute inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center">
            <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-bold">
              🔒 Send Interest to Unlock
            </div>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="p-5">
        {/* Name & Age */}
        <div className="mb-4">
          <h3 className="text-xl font-black text-gray-900 mb-1">
            {isUserFree ? name.charAt(0) + "***" : name}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>🎂 {profile.age} years</span>
            <span>📏 {profile.height}</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
              {maritalStatus}
            </span>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-1">📍 Location</p>
            <p className="font-semibold text-gray-900">{location}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">🎓 Education</p>
            <p className="font-semibold text-gray-900">{profile.education}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">💼 Profession</p>
            <p className="font-semibold text-gray-900">{profile.profession}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">🕌 Religion</p>
            <p className="font-semibold text-gray-900">{profile.religion}</p>
          </div>
        </div>

        {/* Income - Blurred for Free */}
        {monthlyIncome && (
          <div className="bg-green-50 p-3 rounded-lg mb-4 relative">
            <p className="text-xs text-green-700 mb-1">💰 Monthly Income</p>
            <p className="text-sm font-bold text-green-900">
              {isUserFree ? '৳ ****' : `৳${monthlyIncome.toLocaleString()}`}
            </p>
            {isUserFree && (
              <div className="absolute inset-0 backdrop-blur-sm bg-white/50 flex items-center justify-center rounded-lg">
                <span className="text-xs font-bold text-gray-700">🔒 Premium Only</span>
              </div>
            )}
          </div>
        )}

        {/* CONTACT DETAILS - BLOCKED UNTIL VERIFIED/PREMIUM */}
        {!canViewContact && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-4">
            <p className="text-sm font-bold text-red-900 mb-2">
              🔒 Contact Details Locked
            </p>
            <p className="text-xs text-red-800 mb-3">
              Verify your NID or upgrade to premium to unlock phone & email
            </p>
            <Link 
              href="/verify"
              className="block w-full px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-bold text-center hover:shadow-lg transition text-sm"
            >
              Verify NID to Unlock
            </Link>
          </div>
        )}

        {/* Show Contact if User is Verified/Premium */}
        {canViewContact && profile.phone && (
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-4">
            <p className="text-xs font-bold text-green-900 mb-2">📞 Contact Details</p>
            <p className="text-sm text-green-800">
              <strong>Phone:</strong> {profile.phone}
            </p>
            {profile.email && (
              <p className="text-sm text-green-800 mt-1">
                <strong>Email:</strong> {profile.email}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          
          {/* Send Interest Button */}
          {!interestSent ? (
            <button 
              onClick={handleSendInterest}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 px-4 rounded-xl font-semibold text-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              💌 Send Interest
            </button>
          ) : (
            <div className="w-full bg-green-100 border-2 border-green-500 text-green-800 py-3 px-4 rounded-xl font-semibold text-sm text-center">
              ✓ Interest Sent! Waiting for response...
            </div>
          )}

          {/* View Profile & Send Gift Row */}
          <div className="grid grid-cols-2 gap-3">
            <Link 
              href={`/profile/${profile.id}`}
              className="bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-1"
            >
              👁️ View
            </Link>
            
            {/* Send Gift Button */}
            <div className="relative">
              <button
                onClick={() => setShowGiftMenu(!showGiftMenu)}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
              >
                🎁 Gift
              </button>
              
              {/* Gift Menu Popup */}
              {showGiftMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-2xl border-2 border-pink-200 p-3 w-64 z-20">
                  <p className="text-xs font-bold text-gray-900 mb-3">Send Virtual Gift 🎁</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleSendGift('Single Rose 🌹', 50)}
                      className="w-full text-left px-3 py-2 hover:bg-pink-50 rounded-lg text-sm flex items-center justify-between"
                    >
                      <span>🌹 Single Rose</span>
                      <span className="font-bold text-rose-600">৳50</span>
                    </button>
                    <button
                      onClick={() => handleSendGift('Bouquet 💐', 150)}
                      className="w-full text-left px-3 py-2 hover:bg-pink-50 rounded-lg text-sm flex items-center justify-between"
                    >
                      <span>💐 Bouquet</span>
                      <span className="font-bold text-rose-600">৳150</span>
                    </button>
                    <button
                      onClick={() => handleSendGift('Love Card 💌', 100)}
                      className="w-full text-left px-3 py-2 hover:bg-pink-50 rounded-lg text-sm flex items-center justify-between"
                    >
                      <span>💌 Love Card</span>
                      <span className="font-bold text-rose-600">৳100</span>
                    </button>
                    <button
                      onClick={() => handleSendGift('Heart Gift 💝', 200)}
                      className="w-full text-left px-3 py-2 hover:bg-pink-50 rounded-lg text-sm flex items-center justify-between"
                    >
                      <span>💝 Heart Gift</span>
                      <span className="font-bold text-rose-600">৳200</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowGiftMenu(false)}
                    className="w-full mt-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Premium Upsell for Free Users */}
        {isUserFree && !canViewContact && (
          <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <p className="text-xs text-yellow-900 font-bold mb-1">
              🔓 Unlock Full Profile
            </p>
            <p className="text-xs text-gray-700 mb-2">
              Verify your NID (৳200) or upgrade to premium to unlock all features
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/verify"
                className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-bold hover:shadow-lg transition text-center"
              >
                Verify NID
              </Link>
              <button className="px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg text-xs font-bold hover:shadow-lg transition">
                Go Premium
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}