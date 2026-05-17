"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    height: "",
    religion: "",
    marital_status: "",
    education: "",
    profession: "",
    city: "",
    blood_group: "",
    nrb: false,
    about_me: "",
    partner_preference: "",
    guardian_name: "",
    guardian_phone: "",
    family_managed: false,
    photo_visible_to: "all",
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) { router.push("/login"); return; }
    setUser(data.user);
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", data.user.email)
      .single();
    if (profileData) {
      setProfile(profileData);
      setFormData({
        full_name: profileData.full_name || "",
        age: profileData.age || "",
        height: profileData.height || "",
        religion: profileData.religion || "",
        marital_status: profileData.marital_status || "",
        education: profileData.education || "",
        profession: profileData.profession || "",
        city: profileData.city || "",
        blood_group: profileData.blood_group || "",
        nrb: profileData.nrb || false,
        about_me: profileData.about_me || "",
        partner_preference: profileData.partner_preference || "",
        guardian_name: profileData.guardian_name || "",
        guardian_phone: profileData.guardian_phone || "",
        family_managed: profileData.family_managed || false,
        photo_visible_to: profileData.photo_visible_to || "all",
      });
    }
    setLoading(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setMessage("❌ Photo must be under 5MB"); return; }
    setUploading(true);
    const fileName = `${user.id}-${Date.now()}.${file.name.split(".").pop()}`;
    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(fileName, file, { upsert: true });
    if (uploadError) { setMessage("❌ Upload failed: " + uploadError.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("profile-photos").getPublicUrl(fileName);
    await supabase.from("profiles").update({ photo_url: urlData.publicUrl }).eq("email", user.email);
    setProfile({ ...profile, photo_url: urlData.publicUrl });
    setMessage("✅ Photo uploaded successfully!");
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        ...formData,
        age: parseInt(formData.age as string),
      })
      .eq("email", user.email);
    if (error) {
      setMessage("❌ Error: " + error.message);
    } else {
      setMessage("✅ Profile saved successfully!");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">💍</div>
        <p className="text-red-700 font-bold">Loading your profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-800 text-white py-4 px-8 flex justify-between items-center shadow-lg">
        <Link href="/" className="text-2xl font-bold">💍 BandhanBD</Link>
        <div className="flex items-center gap-4">
          <span className="bg-white text-red-700 px-4 py-2 rounded-full font-bold text-sm">
            👤 {user?.user_metadata?.full_name || user?.email}
          </span>
          <button onClick={handleLogout} className="text-red-200 hover:text-white text-sm">Logout</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-8">
            {/* Photo Upload */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-red-200 shadow-lg">
                {profile?.photo_url ? (
                  <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                    <span className="text-5xl">{profile?.gender === "Male" ? "👨" : "👩"}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 bg-red-700 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg hover:bg-red-800"
              >
                {uploading ? "⏳" : "📷"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-gray-800">{profile?.full_name || "Complete Your Profile"}</h2>
                {profile?.is_verified && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">✅ Verified</span>}
                {profile?.is_premium && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-bold">⭐ Premium</span>}
              </div>
              <p className="text-gray-500 mb-3">{profile?.city} • {profile?.religion} • {profile?.profession}</p>
              
              {/* Profile completion */}
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 font-medium">Profile Completion</span>
                  <span className="text-red-700 font-bold">
                    {Math.round([profile?.full_name, profile?.photo_url, profile?.religion, profile?.education, profile?.profession, profile?.about_me, profile?.city, profile?.height].filter(Boolean).length / 8 * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-700 h-2 rounded-full transition-all"
                    style={{width: `${Math.round([profile?.full_name, profile?.photo_url, profile?.religion, profile?.education, profile?.profession, profile?.about_me, profile?.city, profile?.height].filter(Boolean).length / 8 * 100)}%`}}>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400">Complete your profile to get 5x more matches!</p>
            </div>

            {/* Quick stats */}
            <div className="hidden md:flex flex-col gap-3 text-center">
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-red-700">0</p>
                <p className="text-xs text-gray-500">Interests Received</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-red-700">0</p>
                <p className="text-xs text-gray-500">Profile Views</p>
              </div>
            </div>
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded-xl text-center font-bold text-sm ${message.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {message}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl shadow p-2">
          {[
            { id: "profile", label: "👤 My Profile" },
            { id: "personal", label: "📋 Personal Details" },
            { id: "partner", label: "💑 Partner Preference" },
            { id: "family", label: "👨‍👩‍👧 Family Info" },
            { id: "privacy", label: "🔒 Privacy" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? "bg-red-700 text-white shadow" : "text-gray-500 hover:bg-red-50"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl shadow-lg p-8">

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Basic Information</h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Full Name</label>
                  <input type="text" className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none"
                    value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Age</label>
                  <input type="number" min="18" className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none"
                    value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Height</label>
                  <select className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none"
                    value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})}>
                    <option value="">Select Height</option>
                    {["4'10\"","4'11\"","5'0\"","5'1\"","5'2\"","5'3\"","5'4\"","5'5\"","5'6\"","5'7\"","5'8\"","5'9\"","5'10\"","5'11\"","6'0\"","6'1\"","6'2\""].map(h => (
                      <option key={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Blood Group 🩸</label>
                  <select className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none"
                    value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})}>
                    <option value="">Select Blood Group</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">City</label>
                  <select className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none"
                    value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                    <option value="">Select City</option>
                    {["Dhaka","Chittagong","Sylhet","Rajshahi","Khulna","Barisal","Rangpur","Mymensingh","Comilla","Narayanganj","Gazipur","Cox's Bazar"].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <input type="checkbox" id="nrb" className="w-5 h-5 accent-red-700"
                    checked={formData.nrb} onChange={e => setFormData({...formData, nrb: e.target.checked})} />
                  <label htmlFor="nrb" className="text-sm font-semibold text-gray-600">🌍 I am NRB (Non-Resident Bangladeshi)</label>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">About Me</label>
                <textarea rows={4} placeholder="Write something about yourself..."
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none resize-none"
                  value={formData.about_me} onChange={e => setFormData({...formData, about_me: e.target.value})} />
              </div>
            </div>
          )}

          {/* PERSONAL DETAILS TAB */}
          {activeTab === "personal" && (
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Personal Details</h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Religion</label>
                  <select className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none"
                    value={formData.religion} onChange={e => setFormData({...formData, religion: e.target.value})}>
                    <option value="">Select Religion</option>
                    <option>Islam</option>
                    <option>Hinduism</option>
                    <option>Christianity</option>
                    <option>Buddhism</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Marital Status</label>
                  <select className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none"
                    value={formData.marital_status} onChange={e => setFormData({...formData, marital_status: e.target.value})}>
                    <option value="">Select Status</option>
                    <option>Never Married</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Education</label>
                  <select className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none"
                    value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})}>
                    <option value="">Select Education</option>
                    <option>SSC / O-Level</option>
                    <option>HSC / A-Level</option>
                    <option>Diploma</option>
                    <option>Bachelor's Degree</option>
                    <option>Master's Degree</option>
                    <option>PhD / Doctorate</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Profession</label>
                  <select className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none"
                    value={formData.profession} onChange={e => setFormData({...formData, profession: e.target.value})}>
                    <option value="">Select Profession</option>
                    <option>Government Employee</option>
                    <option>Private Job</option>
                    <option>Business / Self Employed</option>
                    <option>Doctor</option>
                    <option>Engineer</option>
                    <option>Teacher / Professor</option>
                    <option>Lawyer</option>
                    <option>Student</option>
                    <option>Homemaker</option>
                    <option>Living Abroad</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* PARTNER PREFERENCE TAB */}
          {activeTab === "partner" && (
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Partner Preference</h3>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">What are you looking for in a partner?</label>
                <textarea rows={6} placeholder="Describe your ideal partner — personality, values, lifestyle, religion, education, profession..."
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none resize-none"
                  value={formData.partner_preference} onChange={e => setFormData({...formData, partner_preference: e.target.value})} />
              </div>
            </div>
          )}

          {/* FAMILY INFO TAB */}
          {activeTab === "family" && (
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Family Information</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-blue-700 text-sm font-medium">👨‍👩‍👧 Family involvement is very important in Bangladeshi marriages. You can allow a guardian to manage your profile.</p>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <input type="checkbox" id="family" className="w-5 h-5 accent-red-700"
                  checked={formData.family_managed} onChange={e => setFormData({...formData, family_managed: e.target.checked})} />
                <label htmlFor="family" className="text-sm font-semibold text-gray-700">This profile is managed by a family member / guardian</label>
              </div>
              {formData.family_managed && (
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1">Guardian Name</label>
                    <input type="text" placeholder="Father / Mother / Brother name"
                      className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none"
                      value={formData.guardian_name} onChange={e => setFormData({...formData, guardian_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1">Guardian Phone</label>
                    <input type="text" placeholder="+880 1XXX-XXXXXX"
                      className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none"
                      value={formData.guardian_phone} onChange={e => setFormData({...formData, guardian_phone: e.target.value})} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === "privacy" && (
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Privacy Settings</h3>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="text-green-700 text-sm font-medium">🔒 Your privacy is our top priority. Control who sees your photo and contact details.</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-2">Who can see my photo?</label>
                <div className="space-y-3">
                  {[
                    { value: "all", label: "Everyone", desc: "All registered members can see your photo" },
                    { value: "premium", label: "Premium Members Only", desc: "Only premium members can see your photo" },
                    { value: "interest", label: "After Mutual Interest", desc: "Photo visible only after both parties send interest" },
                    { value: "hidden", label: "Hide Photo", desc: "Your photo is hidden from everyone" },
                  ].map(opt => (
                    <label key={opt.value} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.photo_visible_to === opt.value ? "border-red-700 bg-red-50" : "border-gray-200"}`}>
                      <input type="radio" name="photo_visible" value={opt.value}
                        checked={formData.photo_visible_to === opt.value}
                        onChange={() => setFormData({...formData, photo_visible_to: opt.value})}
                        className="mt-1 accent-red-700" />
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{opt.label}</p>
                        <p className="text-gray-500 text-xs">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex gap-4">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 text-white py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50"
              style={{background: "linear-gradient(135deg, #7f0000, #c0392b)"}}>
              {saving ? "Saving..." : "💾 Save Profile"}
            </button>
            <Link href="/profiles" className="px-6 py-4 border-2 border-red-200 rounded-xl text-red-700 font-bold hover:bg-red-50 text-center">
              👥 Browse Profiles
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}