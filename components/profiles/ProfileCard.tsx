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
  degree?: string;
  profession: string;
  personality_type?: string;
  monthlyIncome?: number;
  monthly_income?: number;
  religion: string;
  maritalStatus?: string;
  marital_status?: string;
  photoUrl?: string;
  photo_url?: string;
  additional_photos?: string[];
  isVerified?: boolean;
  is_verified?: boolean;
  isPremium?: boolean;
  is_premium?: boolean;
  package?: string;
  phone?: string;
  email?: string;
}

interface ProfileCardProps {
  profile: Profile;
  currentUserPackage?: string;
  currentUserVerified?: boolean;
}

// Personality type descriptions
const personalityDescriptions: Record<string, { bn: string; en: string; example: string }> = {
  'Traditional': {
    bn: 'পারিবারিক মূল্যবোধে বিশ্বাসী',
    en: 'Values family traditions and home life',
    example: 'Respects elders, follows traditions, focuses on family'
  },
  'Modern': {
    bn: 'আধুনিক ও প্রগতিশীল মনের',
    en: 'Open-minded and forward-thinking',
    example: 'Career-focused, enjoys social life, independent'
  },
  'Ambitious': {
    bn: 'লক্ষ্য নির্ধারণ করে এগিয়ে যান',
    en: 'Goal-oriented and career-driven',
    example: 'Hardworking, motivated, success-focused'
  },
  'Balanced': {
    bn: 'পরিবার ও ক্যারিয়ার সমান গুরুত্ব দেন',
    en: 'Balances family and career equally',
    example: 'Neither too traditional nor too modern'
  },
  'Creative': {
    bn: 'শিল্প ও সৃজনশীল কাজে আগ্রহী',
    en: 'Artistic and imaginative',
    example: 'Loves music, art, writing or design'
  },
  'Intellectual': {
    bn: 'জ্ঞান অর্জন ও গবেষণায় আগ্রহী',
    en: 'Loves learning and deep thinking',
    example: 'Enjoys reading, discussing ideas, academic'
  },
  'Analytical': {
    bn: 'যুক্তিভিত্তিক ও সমস্যা সমাধানে দক্ষ',
    en: 'Logical and problem-solving minded',
    example: 'Tech-savvy, methodical, detail-oriented'
  },
  'Family-Oriented': {
    bn: 'পরিবারকে সবচেয়ে বেশি প্রাধান্য দেন',
    en: 'Family comes first, always',
    example: 'Caring, nurturing, devoted to loved ones'
  },
};

function PersonalityTooltip({ type }: { type: string }) {
  const [show, setShow] = useState(false);
  const info = personalityDescriptions[type];
  if (!info) return <span>{type}</span>;

  return (
    <div className="relative inline-flex items-center gap-1">
      <span>{type}</span>
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="w-4 h-4 bg-purple-200 text-purple-700 rounded-full text-xs font-bold flex items-center justify-center hover:bg-purple-300 transition"
        aria-label="What does this mean?"
      >
        ?
      </button>
      {show && (
        <div className="absolute bottom-full left-0 mb-2 bg-gray-900 text-white rounded-xl shadow-2xl p-3 w-64 z-30 text-left">
          <p className="font-bold text-yellow-400 text-sm mb-1">{type}</p>
          <p className="text-xs text-gray-300 mb-1">{info.bn}</p>
          <p className="text-xs text-gray-400 mb-2">{info.en}</p>
          <p className="text-xs text-gray-500 italic">📌 {info.example}</p>
          <div className="absolute bottom-[-6px] left-4 w-3 h-3 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
}

export default function ProfileCard({ 
  profile, 
  currentUserPackage = 'prottasha',
  currentUserVerified = false 
}: ProfileCardProps) {
  const [showGiftMenu, setShowGiftMenu] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const name = profile.full_name || profile.name || "Anonymous";
  const location = profile.location || profile.city || "Bangladesh";
  const maritalStatus = profile.maritalStatus || profile.marital_status || "Not specified";
  
  const photoUrl = profile.photo_url || profile.photoUrl;
  const additionalPhotos = profile.additional_photos || [];
  const allPhotos = photoUrl ? [photoUrl, ...additionalPhotos] : additionalPhotos;
  
  const isVerified = profile.isVerified || profile.is_verified || false;
  const isPremium = profile.isPremium || profile.is_premium || profile.package !== 'prottasha';
  const monthlyIncome = profile.monthlyIncome || profile.monthly_income;

  const isUserFree = currentUserPackage === 'prottasha';
  const isUserPremium = currentUserPackage === 'bondhon';
  const isUserElite = currentUserPackage === 'milon';
  const canViewContact = currentUserVerified || isUserPremium || isUserElite;

  // FIX: Hide degree when it's same as education (SSC/HSC)
  const showDegree = profile.degree && 
    profile.degree !== profile.education &&
    !['SSC', 'HSC'].includes(profile.education);

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 8) return '***-***-***';
    return phone.substring(0, 3) + '***' + phone.substring(phone.length - 2);
  };

  const maskEmail = (email: string) => {
    if (!email) return '***@***.com';
    const [user, domain] = email.split('@');
    return user.substring(0, 2) + '***@' + domain;
  };

  const handleSendInterest = () => {
    setInterestSent(true);
    alert('💌 Interest sent successfully!\n\nThey will be notified. If they accept, you can view their full profile and contact details!');
  };

  const handleSendGift = (gift: string, price: number) => {
    alert(`🎁 Send ${gift} for ৳${price}?\n\nThis feature requires premium membership!\n\nUpgrade now to send virtual gifts and stand out!`);
    setShowGiftMenu(false);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group">
        
        {isPremium && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              ⭐ PREMIUM
            </div>
          </div>
        )}

        {isVerified && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              ✓ VERIFIED
            </div>
          </div>
        )}

        {/* Photo Section */}
        <div className="relative h-80 bg-gradient-to-br from-rose-50 to-pink-50 overflow-hidden">
          {photoUrl ? (
            <>
              <img 
                src={photoUrl} 
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                onClick={() => setShowPhotoGallery(true)}
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+QpDwvdGV4dD48L3N2Zz4=';
                }}
              />
              {allPhotos.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold">
                  📸 {allPhotos.length} photos
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-8xl">👤</div>
            </div>
          )}
        </div>

        <div className="p-6">
          
          <div className="mb-4">
            <h3 className="text-2xl font-black text-gray-900 mb-2">{name}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
              <span className="flex items-center gap-1">🎂 {profile.age} years</span>
              <span className="flex items-center gap-1">📏 {profile.height}</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                {maritalStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">📍 Location</p>
              <p className="font-bold text-gray-900 text-sm">{location}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">🎓 Education</p>
              <p className="font-bold text-gray-900 text-sm">
                {profile.education}
                {/* FIX: Only show degree if different from education and not SSC/HSC */}
                {showDegree && (
                  <span className="text-gray-500 font-normal"> ({profile.degree})</span>
                )}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">💼 Profession</p>
              <p className="font-bold text-gray-900 text-sm">{profile.profession}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">🕌 Religion</p>
              <p className="font-bold text-gray-900 text-sm">{profile.religion}</p>
            </div>

            {/* Personality with tooltip */}
            {profile.personality_type && (
              <div className="bg-purple-50 p-3 rounded-xl col-span-2">
                <p className="text-xs text-gray-500 mb-1">🧠 Personality</p>
                <p className="font-bold text-purple-900 text-sm">
                  <PersonalityTooltip type={profile.personality_type} />
                </p>
              </div>
            )}
          </div>

          {monthlyIncome && (
            <div className="bg-green-50 p-4 rounded-xl mb-4 relative overflow-hidden">
              <p className="text-xs text-green-700 mb-1 font-bold">💰 Monthly Income</p>
              <p className="text-lg font-black text-green-900">
                {canViewContact ? `৳${monthlyIncome.toLocaleString()}` : '৳ ****'}
              </p>
              {!canViewContact && (
                <div className="absolute inset-0 backdrop-blur-sm bg-white/60 flex items-center justify-center rounded-xl">
                  <span className="text-xs font-bold text-gray-700">🔒 Premium Only</span>
                </div>
              )}
            </div>
          )}

          {profile.phone && (
            <div className={`rounded-xl p-4 mb-4 border-2 ${
              canViewContact ? 'bg-green-50 border-green-300' : 'bg-rose-50 border-rose-300'
            }`}>
              <p className="text-xs font-bold mb-2 text-gray-900">
                📞 Contact Details {!canViewContact && '🔒'}
              </p>
              {canViewContact ? (
                <>
                  <p className="text-sm text-gray-800"><strong>Phone:</strong> {profile.phone}</p>
                  {profile.email && (
                    <p className="text-sm text-gray-800 mt-1"><strong>Email:</strong> {profile.email}</p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-700 mb-1"><strong>Phone:</strong> {maskPhone(profile.phone)}</p>
                  {profile.email && (
                    <p className="text-sm text-gray-700 mb-3"><strong>Email:</strong> {maskEmail(profile.email)}</p>
                  )}
                  <Link 
                    href="/pricing"
                    className="block w-full px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-bold text-center hover:shadow-lg transition text-sm mt-3"
                  >
                    Upgrade to View Contact - ৳99
                  </Link>
                </>
              )}
            </div>
          )}

          <div className="space-y-3">
            {!interestSent ? (
              <button 
                onClick={handleSendInterest}
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white py-4 px-4 rounded-xl font-bold text-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                💌 Send Interest
              </button>
            ) : (
              <div className="w-full bg-green-100 border-2 border-green-500 text-green-800 py-4 px-4 rounded-xl font-bold text-sm text-center">
                ✓ Interest Sent! Waiting for response...
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Link 
                href={`/profile/${profile.id}`}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-1"
              >
                👁️ View Full
              </Link>
              
              <div className="relative">
                <button
                  onClick={() => setShowGiftMenu(!showGiftMenu)}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-xl font-bold text-sm hover:shadow-lg transition-all"
                >
                  🎁 Send Gift
                </button>
                
                {showGiftMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-2xl border-2 border-pink-200 p-3 w-64 z-20">
                    <p className="text-xs font-bold text-gray-900 mb-3">Send Virtual Gift 🎁</p>
                    <div className="space-y-2">
                      <button onClick={() => handleSendGift('Single Rose 🌹', 50)} className="w-full text-left px-3 py-2 hover:bg-pink-50 rounded-lg text-sm flex items-center justify-between">
                        <span>🌹 Single Rose</span><span className="font-bold text-rose-600">৳50</span>
                      </button>
                      <button onClick={() => handleSendGift('Bouquet 💐', 150)} className="w-full text-left px-3 py-2 hover:bg-pink-50 rounded-lg text-sm flex items-center justify-between">
                        <span>💐 Bouquet</span><span className="font-bold text-rose-600">৳150</span>
                      </button>
                      <button onClick={() => handleSendGift('Love Card 💌', 100)} className="w-full text-left px-3 py-2 hover:bg-pink-50 rounded-lg text-sm flex items-center justify-between">
                        <span>💌 Love Card</span><span className="font-bold text-rose-600">৳100</span>
                      </button>
                      <button onClick={() => handleSendGift('Heart Gift 💝', 200)} className="w-full text-left px-3 py-2 hover:bg-pink-50 rounded-lg text-sm flex items-center justify-between">
                        <span>💝 Heart Gift</span><span className="font-bold text-rose-600">৳200</span>
                      </button>
                    </div>
                    <button onClick={() => setShowGiftMenu(false)} className="w-full mt-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200">
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isUserFree && !currentUserVerified && (
            <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl">
              <p className="text-xs text-yellow-900 font-bold mb-2">🔔 Unlock Full Access</p>
              <p className="text-xs text-gray-700 mb-3">
                • View all contact details<br/>
                • Send unlimited messages<br/>
                • See who viewed your profile
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/pricing" className="px-3 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg text-xs font-bold hover:shadow-lg transition text-center">
                  Upgrade ৳999/mo
                </Link>
                <Link href="/verify" className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-bold hover:shadow-lg transition text-center">
                  Verify NID ৳200
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Gallery Modal */}
      {showPhotoGallery && allPhotos.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setShowPhotoGallery(false)}>
          <button onClick={() => setShowPhotoGallery(false)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl">
            ✕
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={allPhotos[currentPhotoIndex]} alt={`Photo ${currentPhotoIndex + 1}`} className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
            {allPhotos.length > 1 && (
              <>
                {currentPhotoIndex > 0 && (
                  <button onClick={() => setCurrentPhotoIndex(currentPhotoIndex - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl">←</button>
                )}
                {currentPhotoIndex < allPhotos.length - 1 && (
                  <button onClick={() => setCurrentPhotoIndex(currentPhotoIndex + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl">→</button>
                )}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-bold">
                  {currentPhotoIndex + 1} / {allPhotos.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
