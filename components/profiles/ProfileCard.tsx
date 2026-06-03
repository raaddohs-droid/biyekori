"use client";
import { useState } from "react";

interface Profile {
  id: string;
  lookingFor: "bride" | "groom";
  name: string;
  age: number;
  height: string;
  location: string;
  education: string;
  profession: string;
  monthlyIncome?: number;
  religion: string;
  maritalStatus: string;
  photoUrl?: string;
  isVerified: boolean;
  isPremium: boolean;
  isPhotoVisible: boolean;
  lastActive: string;
  managedBy: string;
  familyType: string;
  religiousPractice: string;
}

export default function ProfileCard({ profile }: { profile: Profile }) {
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 relative group">
      
      {/* Premium Badge */}
      {profile.isPremium && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <span>⭐</span>
            <span>Premium</span>
          </div>
        </div>
      )}

      {/* Verification Badge */}
      {profile.isVerified && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <span>✓</span>
            <span>Verified</span>
          </div>
        </div>
      )}

      {/* Photo Section */}
      <div className="relative bg-gradient-to-br from-red-50 to-rose-50 h-80">
        {profile.isPhotoVisible && profile.photoUrl ? (
          <img 
            src={profile.photoUrl} 
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-3">
              <span className="text-5xl">
                {profile.lookingFor === "bride" ? "👰" : "🤵"}
              </span>
            </div>
            <p className="text-sm font-medium">Photo available on request</p>
          </div>
        )}
        
        {/* Active Status */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-lg flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>{profile.lastActive}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        
        {/* Name & Basic Info */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">Profile managed by {profile.managedBy}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
              {profile.age} years
            </span>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
              {profile.height}
            </span>
            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
              {profile.maritalStatus}
            </span>
          </div>
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1">📍 Location</p>
            <p className="text-sm font-semibold text-gray-900">{profile.location}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">🎓 Education</p>
            <p className="text-sm font-semibold text-gray-900">{profile.education}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">💼 Profession</p>
            <p className="text-sm font-semibold text-gray-900">{profile.profession}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">🕌 Religion</p>
            <p className="text-sm font-semibold text-gray-900">{profile.religion}</p>
          </div>
        </div>

        {/* Family & Religious Info */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div className="bg-gray-50 p-2.5 rounded-lg">
            <p className="text-gray-600 mb-1">Family</p>
            <p className="font-semibold text-gray-900">{profile.familyType}</p>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-lg">
            <p className="text-gray-600 mb-1">Religious</p>
            <p className="font-semibold text-gray-900">{profile.religiousPractice}</p>
          </div>
        </div>

        {/* Income (if available) */}
        {profile.monthlyIncome && (
          <div className="bg-green-50 p-3 rounded-lg mb-4">
            <p className="text-xs text-green-700 mb-1">💰 Monthly Income</p>
            <p className="text-sm font-bold text-green-900">৳{profile.monthlyIncome.toLocaleString()}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setShowContact(!showContact)}
            className="bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 px-4 rounded-xl font-semibold text-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            💌 Send Interest
          </button>
          <button className="bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all duration-300">
            👁️ View Full Profile
          </button>
        </div>

        {/* Contact Info (if shown) */}
        {showContact && (
          <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 animate-fadeIn">
            <p className="text-xs font-semibold text-red-900 mb-2">📞 Contact Information</p>
            <p className="text-sm text-gray-700">Contact details will be shown after mutual interest is confirmed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
