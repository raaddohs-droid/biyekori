"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileFiltersProps {
  cities: string[];
  educations: string[];
  professions: string[];
  currentFilters: {
    gender: string;
    search: string;
    ageMin: number;
    ageMax: number;
    city: string;
    education: string;
    profession: string;
    sort: string;
  };
}

const BANGLADESH_DISTRICTS = [
  "Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh",
  "Comilla", "Gazipur", "Narayanganj", "Tangail", "Jamalpur", "Netrokona", "Sherpur",
  "Bogra", "Joypurhat", "Naogaon", "Natore", "Nawabganj", "Pabna", "Sirajganj",
  "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Thakurgaon",
  "Habiganj", "Moulvibazar", "Sunamganj",
  "Narsingdi", "Manikganj", "Munshiganj", "Kishoreganj", "Gopalganj", "Madaripur", "Shariatpur", "Rajbari", "Faridpur",
  "Brahmanbaria", "Chandpur", "Lakshmipur", "Noakhali", "Feni", "Khagrachhari", "Rangamati", "Bandarban", "Cox's Bazar",
  "Jessore", "Narail", "Magura", "Jhenaidah", "Chuadanga", "Kushtia", "Meherpur", "Satkhira", "Bagerhat",
  "Bhola", "Patuakhali", "Pirojpur", "Jhalokati", "Barguna"
].sort();

const MARITAL_STATUS_OPTIONS = [
  "Never married",
  "Divorced",
  "Widowed",
  "Separated",
  "Annulled",
  "Awaiting divorce"
];

const EDUCATION_OPTIONS = [
  "SSC",
  "HSC", 
  "Bachelor's",
  "Master's",
  "PhD",
  "MBBS/Medical",
  "Engineering",
  "Diploma",
  "Madrasa",
  "Other"
];

const PROFESSION_OPTIONS = [
  "Student",
  "Doctor",
  "Engineer", 
  "Teacher",
  "Business",
  "Banker",
  "Software Engineer",
  "Government Job",
  "Private Job",
  "Homemaker",
  "Army/Navy/Air Force",
  "Police",
  "Lawyer",
  "Accountant",
  "Nurse",
  "Pharmacist",
  "Other"
];

const RELIGION_OPTIONS = ["Islam", "Hinduism", "Buddhism", "Christianity", "Other"];

// Height - 1 inch increments for 5'0" to 5'8"
const HEIGHT_OPTIONS = [
  { label: "Any Height", min: "", max: "" },
  { label: "Below 5'0\"", min: "4'0", max: "5'0" },
  { label: "5'0\"", min: "5'0", max: "5'1" },
  { label: "5'1\"", min: "5'1", max: "5'2" },
  { label: "5'2\"", min: "5'2", max: "5'3" },
  { label: "5'3\"", min: "5'3", max: "5'4" },
  { label: "5'4\"", min: "5'4", max: "5'5" },
  { label: "5'5\"", min: "5'5", max: "5'6" },
  { label: "5'6\"", min: "5'6", max: "5'7" },
  { label: "5'7\"", min: "5'7", max: "5'8" },
  { label: "5'8\"", min: "5'8", max: "5'9" },
  { label: "5'9\" - 6'0\"", min: "5'9", max: "6'0" },
  { label: "6'0\" - 6'3\"", min: "6'0", max: "6'3" },
  { label: "Above 6'3\"", min: "6'3", max: "6'6" }
];

// Income ranges
const INCOME_OPTIONS = [
  { label: "Any Income", value: "" },
  { label: "৳0 - ৳20,000", value: "0-20000" },
  { label: "৳20,000 - ৳50,000", value: "20000-50000" },
  { label: "৳50,000 - ৳100,000", value: "50000-100000" },
  { label: "৳100,000 - ৳200,000", value: "100000-200000" },
  { label: "৳200,000 - ৳350,000", value: "200000-350000" },
  { label: "৳350,000 - ৳500,000", value: "350000-500000" },
  { label: "৳500,000 or more", value: "500000+" }
];

export default function ProfileFilters({ cities, educations, professions, currentFilters }: ProfileFiltersProps) {
  const router = useRouter();
  const [ageMin, setAgeMin] = useState(currentFilters.ageMin);
  const [ageMax, setAgeMax] = useState(currentFilters.ageMax);
  const [city, setCity] = useState(currentFilters.city);
  const [education, setEducation] = useState(currentFilters.education);
  const [customEducation, setCustomEducation] = useState('');
  const [profession, setProfession] = useState(currentFilters.profession);
  const [customProfession, setCustomProfession] = useState('');
  const [heightRange, setHeightRange] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [religion, setReligion] = useState('');
  const [incomeRange, setIncomeRange] = useState('');

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (currentFilters.gender) params.set('gender', currentFilters.gender);
    if (ageMin !== 18) params.set('ageMin', String(ageMin));
    if (ageMax !== 80) params.set('ageMax', String(ageMax));
    if (city) params.set('city', city);
    
    const finalEducation = education === 'Other' && customEducation ? customEducation : education;
    if (finalEducation) params.set('education', finalEducation);
    
    const finalProfession = profession === 'Other' && customProfession ? customProfession : profession;
    if (finalProfession) params.set('profession', finalProfession);
    
    if (heightRange) params.set('heightRange', heightRange);
    if (maritalStatus) params.set('maritalStatus', maritalStatus);
    if (religion) params.set('religion', religion);
    if (incomeRange) params.set('incomeRange', incomeRange);
    
    router.push(`/profiles?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/profiles');
  };

  const hasActiveFilters = city || education || profession || heightRange || maritalStatus || religion || incomeRange || ageMin !== 18 || ageMax !== 80;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-gray-900">
          🔍 Smart Filters
        </h2>
        {hasActiveFilters && (
          <span className="px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full animate-pulse">
            Active
          </span>
        )}
      </div>

      {/* Age Range */}
      <div className="mb-5 p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl">
        <label className="block text-sm font-bold text-gray-900 mb-3">
          🎂 Age: <span className="text-rose-600">{ageMin} - {ageMax} years</span>
        </label>
        <div className="space-y-3">
          <input
            type="range"
            min="18"
            max="80"
            value={ageMin}
            onChange={(e) => setAgeMin(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <input
            type="range"
            min="18"
            max="80"
            value={ageMax}
            onChange={(e) => setAgeMax(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
        </div>
      </div>

      {/* Height - DROPDOWN with 1-inch increments */}
      <div className="mb-5">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          📏 Height
        </label>
        <select
          value={heightRange}
          onChange={(e) => setHeightRange(e.target.value)}
          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none text-gray-900 bg-white"
        >
          {HEIGHT_OPTIONS.map((option) => (
            <option key={option.label} value={option.label}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* District */}
      <div className="mb-5">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          📍 District
        </label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none text-gray-900 bg-white"
        >
          <option value="">All Districts</option>
          {BANGLADESH_DISTRICTS.map((district) => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>
      </div>

      {/* Religion */}
      <div className="mb-5">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          🕌 Religion
        </label>
        <select
          value={religion}
          onChange={(e) => setReligion(e.target.value)}
          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none text-gray-900 bg-white"
        >
          <option value="">All Religions</option>
          {RELIGION_OPTIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Marital Status */}
      <div className="mb-5">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          💍 Marital Status
        </label>
        <select
          value={maritalStatus}
          onChange={(e) => setMaritalStatus(e.target.value)}
          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none text-gray-900 bg-white"
        >
          <option value="">All Status</option>
          {MARITAL_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Education */}
      <div className="mb-5">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          🎓 Education
        </label>
        <select
          value={education}
          onChange={(e) => setEducation(e.target.value)}
          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none text-gray-900 bg-white mb-2"
        >
          <option value="">All Education</option>
          {EDUCATION_OPTIONS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        {education === 'Other' && (
          <input
            type="text"
            value={customEducation}
            onChange={(e) => setCustomEducation(e.target.value)}
            placeholder="Type your education..."
            className="w-full px-4 py-2.5 border-2 border-rose-300 rounded-xl focus:border-rose-500 focus:outline-none text-gray-900 placeholder-gray-400"
          />
        )}
      </div>

      {/* Profession */}
      <div className="mb-5">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          💼 Profession
        </label>
        <select
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none text-gray-900 bg-white mb-2"
        >
          <option value="">All Professions</option>
          {PROFESSION_OPTIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {profession === 'Other' && (
          <input
            type="text"
            value={customProfession}
            onChange={(e) => setCustomProfession(e.target.value)}
            placeholder="Type your profession..."
            className="w-full px-4 py-2.5 border-2 border-rose-300 rounded-xl focus:border-rose-500 focus:outline-none text-gray-900 placeholder-gray-400"
          />
        )}
      </div>

      {/* Monthly Income */}
      <div className="mb-5">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          💰 Monthly Income
        </label>
        <select
          value={incomeRange}
          onChange={(e) => setIncomeRange(e.target.value)}
          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none text-gray-900 bg-white"
        >
          {INCOME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div className="space-y-3">
        <button
          onClick={applyFilters}
          className="w-full px-6 py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl transition transform hover:scale-105"
        >
          ✨ Apply Filters
        </button>
        <button
          onClick={clearFilters}
          className="w-full px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition"
        >
          🔄 Reset All
        </button>
      </div>

      {/* Upgrade Banner */}
      <div className="mt-5 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl">
        <p className="text-xs font-bold text-orange-900 mb-2">
          ⭐ Unlock Premium Features
        </p>
        <ul className="text-xs text-gray-700 mb-3 space-y-1">
          <li>• See full profiles</li>
          <li>• Send virtual gifts</li>
          <li>• View contact details</li>
        </ul>
        <button className="w-full px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg font-bold text-sm hover:shadow-lg transition">
          Upgrade - ৳100/mo
        </button>
      </div>
    </div>
  );
}