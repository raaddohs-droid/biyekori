"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AIPhotoCropper from '@/components/profiles/AIPhotoCropper';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [guardianMode, setGuardianMode] = useState(false);

  // Step 1
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<File[]>([]);
  const [photoPrivacy, setPhotoPrivacy] = useState(false);
  const [iAm, setIAm] = useState(''); // 'bride' or 'groom'
  const [managedBy, setManagedBy] = useState('Self');

  // Step 2
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [city, setCity] = useState('');
  const [education, setEducation] = useState('');
  const [profession, setProfession] = useState('');
  const [aboutMe, setAboutMe] = useState('');

  // Step 3
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const DISTRICTS = ["Bagerhat","Bandarban","Barguna","Barishal","Bhola","Bogura","Brahmanbaria","Chandpur","Chapai Nawabganj","Chattogram","Chuadanga","Cox's Bazar","Cumilla","Dhaka","Dinajpur","Faridpur","Feni","Gaibandha","Gazipur","Gopalganj","Habiganj","Jamalpur","Jashore","Jhalokathi","Jhenaidah","Joypurhat","Khagrachhari","Khulna","Kishoreganj","Kurigram","Kushtia","Lakshmipur","Lalmonirhat","Madaripur","Magura","Manikganj","Meherpur","Moulvibazar","Munshiganj","Mymensingh","Naogaon","Narail","Narayanganj","Narsingdi","Natore","Netrokona","Nilphamari","Noakhali","Pabna","Panchagarh","Patuakhali","Pirojpur","Rajbari","Rajshahi","Rangamati","Rangpur","Satkhira","Shariatpur","Sherpur","Sirajganj","Sunamganj","Sylhet","Tangail","Thakurgaon"];

  const handlePhotoSelect = (file: File) => setSelectedPhoto(file);

  const handleAdditionalPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAdditionalPhotos([...additionalPhotos, ...files].slice(0, 8));
  };

  const removeAdditionalPhoto = (index: number) => {
    setAdditionalPhotos(additionalPhotos.filter((_, i) => i !== index));
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length !== 11) { alert('Please enter a valid 11-digit phone number'); return; }
    setLoading(true);
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setSentOtp(generatedOtp);
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.startsWith('0') ? `+880${phone.substring(1)}` : `+880${phone}`,
          message: `Your Biyekori OTP is: ${generatedOtp}`
        })
      });
      const data = await response.json();
      if (data.success) { alert(`OTP sent to ${phone}!`); }
      else { alert('Failed to send OTP. Please try again.'); }
    } catch { alert('Error sending OTP'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = () => {
    if (otp === sentOtp) { setOtpVerified(true); alert('Phone verified successfully!'); }
    else { alert('Invalid OTP. Please try again.'); }
  };

  const handleSubmit = async () => {
    if (!otpVerified) { alert('Please verify your phone number first'); return; }
    setLoading(true);
    try {
      let photoUrl = '';
      if (selectedPhoto) {
        const formData = new FormData();
        formData.append('file', selectedPhoto);
        const uploadResponse = await fetch('/api/upload-photo', { method: 'POST', body: formData });
        const uploadData = await uploadResponse.json();
        if (uploadData.success) photoUrl = uploadData.url;
      }
      const additionalPhotoUrls: string[] = [];
      for (const photo of additionalPhotos) {
        const formData = new FormData();
        formData.append('file', photo);
        const uploadResponse = await fetch('/api/upload-photo', { method: 'POST', body: formData });
        const uploadData = await uploadResponse.json();
        if (uploadData.success) additionalPhotoUrls.push(uploadData.url);
      }
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          age: dobDay && dobMonth && dobYear ? Math.floor((Date.now() - new Date(parseInt(dobYear), parseInt(dobMonth)-1, parseInt(dobDay)).getTime()) / (365.25*24*60*60*1000)) : parseInt(age),
          date_of_birth: dobDay && dobMonth && dobYear ? `${dobYear}-${dobMonth.padStart(2,'0')}-${dobDay.padStart(2,'0')}` : null,
          city,
          district: city,
          education,
          profession,
          about_me: aboutMe,
          phone,
          email,
          password,
          looking_for: iAm === 'bride' ? 'groom' : 'bride',
          gender: iAm === 'bride' ? 'female' : 'male',
          managed_by: managedBy,
          photo_url: photoUrl,
          additional_photos: additionalPhotoUrls,
          photo_privacy: photoPrivacy,
          package: 'prottasha',
          phone_verified: true,
          guardian_mode: guardianMode
        })
      });
      const data = await response.json();
      if (data.success) { setStep(4); }
      else {
        if (data.error && data.error.includes('duplicate') || data.error && data.error.includes('unique')) {
          alert('This phone number or email is already registered. Please login instead.');
        } else {
          alert(data.error || 'Registration failed. Please try again.');
        }
      }
    } catch { alert('Registration error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-12 px-4" style={{ paddingTop: '80px' }}>
      <div className="max-w-2xl mx-auto">

        {/* Step 0 — Mode Selection */}
        {step === 0 && (
          <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#111827', margin: '0 0 8px' }}>Welcome to Biyekori</h1>
              <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>How will this profile be managed?</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', maxWidth: '560px' }}>

              {/* Self Mode */}
              <button onClick={() => { setGuardianMode(false); setStep(1); }} style={{
                padding: '28px 20px', borderRadius: '20px', border: '2px solid #e5e7eb',
                background: 'white', cursor: 'pointer', textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transition: 'all 0.2s'
              }}
              onMouseOver={e => (e.currentTarget.style.borderColor = '#e11d48')}
              onMouseOut={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>👤</div>
                <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 800, color: '#111827' }}>নিজে পরিচালিত</h3>
                <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>I am the bride or groom and will manage this profile myself</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {['Full profile control', 'Direct messaging', 'Voice calls', 'A Day Together game'].map(f => (
                    <span key={f} style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>✓ {f}</span>
                  ))}
                </div>
                <div style={{ marginTop: '16px', padding: '10px', background: 'linear-gradient(135deg,#e11d48,#db2777)', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: 700 }}>
                  Choose Self Mode
                </div>
              </button>

              {/* Guardian Mode */}
              <button onClick={() => { setGuardianMode(true); setStep(1); }} style={{
                padding: '28px 20px', borderRadius: '20px', border: '2px solid #e5e7eb',
                background: 'white', cursor: 'pointer', textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transition: 'all 0.2s'
              }}
              onMouseOver={e => (e.currentTarget.style.borderColor = '#7c3aed')}
              onMouseOut={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>👨‍👩‍👧</div>
                <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 800, color: '#111827' }}>পরিবার পরিচালিত</h3>
                <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>A parent or family member is setting up this profile on behalf of the bride/groom</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {['Bengali interface', 'Formal messaging', 'Family-first approach', 'Guardian badge on profile'].map(f => (
                    <span key={f} style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 600 }}>✓ {f}</span>
                  ))}
                </div>
                <div style={{ marginTop: '16px', padding: '10px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: 700 }}>
                  Choose Guardian Mode
                </div>
              </button>
            </div>

            <p style={{ marginTop: '20px', fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
              You can switch modes later from Settings after OTP verification.
            </p>
          </div>
        )}

      {/* Progress */}
        {step > 0 && <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            {[1,2,3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</div>
                {s < 3 && <div className={`w-24 h-1 mx-2 ${step > s ? 'bg-rose-500' : 'bg-gray-200'}`}></div>}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs font-bold text-gray-600">
            <span>Photo & Info</span><span>Basic Details</span><span>Contact & Verify</span>
          </div>
        </div>}

        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Create Your Profile</h2>

            {/* I am a */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-900 mb-2">{guardianMode ? "Registering for a..." : "I am a..."}</label>
              <select
                value={iAm}
                onChange={(e) => setIAm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none bg-white text-gray-900"
                required
              >
                <option value="">Select one</option>
                <option value="bride">{guardianMode ? "Bride (Patri) - Registering a bride" : "Bride (Patri) - I am a woman looking for a groom"}</option>
                <option value="groom">{guardianMode ? "Groom (Patro) - Registering a groom" : "Groom (Patro) - I am a man looking for a bride"}</option>
              </select>
            </div>

            {/* Mode badge */}
            {guardianMode && (
              <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#ede9fe', borderRadius: '12px', border: '1.5px solid #c4b5fd', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>👨‍👩‍👧</span>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#7c3aed' }}>পরিবার পরিচালিত মোড চালু আছে</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>Profile will show "Family Managed" badge · <button onClick={() => setStep(0)} style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: '11px', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Change</button></p>
                </div>
              </div>
            )}

            {/* Main Photo */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-900 mb-2">Profile Photo</label>
              <AIPhotoCropper onPhotoSelect={handlePhotoSelect} uploadCount={0} />

              {/* Photo privacy toggle */}
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Photo Privacy</p>
                    <p className="text-xs text-gray-500 mt-0.5">Only show my photo to people whose interest I accept</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhotoPrivacy(!photoPrivacy)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${photoPrivacy ? 'bg-rose-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${photoPrivacy ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Photos */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-900 mb-2">Additional Photos (Optional, up to 8)</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {additionalPhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-rose-200">
                    <img src={URL.createObjectURL(photo)} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    <button onClick={() => removeAdditionalPhoto(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">x</button>
                  </div>
                ))}
                {additionalPhotos.length < 8 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-rose-500 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-rose-50 transition">
                    <span className="text-2xl text-gray-400">+</span>
                    <span className="text-xs text-gray-500">Add</span>
                    <input type="file" accept="image/*" multiple onChange={handleAdditionalPhotoUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!selectedPhoto || !iAm}
              className={`w-full py-4 rounded-xl font-bold transition ${selectedPhoto && iAm ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-xl' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">{guardianMode ? (iAm === "bride" ? "Her Full Name" : "His Full Name") : "Full Name"}</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none bg-white text-gray-900" placeholder={guardianMode ? (iAm === "bride" ? "Enter her full name" : "Enter his full name") : "Enter your full name"} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">{guardianMode ? (iAm === "bride" ? "Her Date of Birth" : "His Date of Birth") : "Date of Birth"}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <select value={dobDay} onChange={(e) => setDobDay(e.target.value)} className="px-2 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none bg-white text-gray-900 text-sm">
                      <option value="">Day</option>
                      {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <select value={dobMonth} onChange={(e) => setDobMonth(e.target.value)} className="px-2 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none bg-white text-gray-900 text-sm">
                      <option value="">Month</option>
                      {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                        <option key={i+1} value={i+1}>{m}</option>
                      ))}
                    </select>
                    <select value={dobYear} onChange={(e) => setDobYear(e.target.value)} className="px-2 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none bg-white text-gray-900 text-sm">
                      <option value="">Year</option>
                      {Array.from({length: 53}, (_, i) => new Date().getFullYear() - 18 - i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  {dobDay && dobMonth && dobYear && (
                    <p className="text-xs text-rose-500 font-semibold mt-1">
                      Age: {Math.floor((Date.now() - new Date(parseInt(dobYear), parseInt(dobMonth)-1, parseInt(dobDay)).getTime()) / (365.25*24*60*60*1000))} years
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">{guardianMode ? (iAm === "bride" ? "Her District" : "His District") : "District"}</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none bg-white text-gray-900" required>
                    <option value="">Select District</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">{guardianMode ? (iAm === "bride" ? "Her Education" : "His Education") : "Education"}</label>
                <select value={education} onChange={(e) => setEducation(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none bg-white text-gray-900" required>
                  <option value="">Select Education</option>
                  <option value="SSC">SSC</option>
                  <option value="HSC">HSC</option>
                  <option value="Bachelor">Bachelor</option>
                  <option value="Masters">Masters</option>
                  <option value="PhD">PhD</option>
                  <option value="MBBS">MBBS / Medical</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Diploma">Diploma</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">{guardianMode ? (iAm === "bride" ? "Her Profession" : "His Profession") : "Profession"}</label>
                <select value={profession} onChange={(e) => setProfession(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none bg-white text-gray-900" required>
                  <option value="">Select Profession</option>
                  <option value="Student">Student</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Business">Business</option>
                  <option value="Banker">Banker</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Government Job">Government Job</option>
                  <option value="Private Job">Private Job</option>
                  <option value="Homemaker">Homemaker</option>
                  <option value="NRB">NRB / Abroad</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-bold text-gray-900 mb-2">{guardianMode ? (iAm === "bride" ? "About Her" : "About Him") : "About Me"} <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} rows={3} placeholder={guardianMode ? (iAm === "bride" ? "Describe her background, character and what the family is looking for in a groom..." : "Describe his background, character and what the family is looking for in a bride...") : "Tell potential matches about yourself, your values, and what you are looking for..."} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none bg-white text-gray-900 resize-none" />
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 py-4 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200">Back</button>
              <button onClick={() => setStep(3)} disabled={!fullName || (!age && !(dobDay && dobMonth && dobYear)) || !city || !education || !profession} className={`flex-1 py-4 rounded-xl font-bold ${fullName && (age || (dobDay && dobMonth && dobYear)) && city && education && profession ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Next</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Contact & Verification</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none bg-white text-gray-900" placeholder="01XXXXXXXXX" maxLength={11} />
                  <button onClick={handleSendOtp} disabled={loading || otpVerified} className="px-4 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 disabled:bg-gray-300 text-sm">
                    {loading ? '...' : otpVerified ? 'Verified' : 'Send OTP'}
                  </button>
                </div>
              </div>
              {sentOtp && !otpVerified && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Enter OTP</label>
                  <div className="flex gap-2">
                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none bg-white text-gray-900" placeholder="6-digit OTP" maxLength={6} />
                    <button onClick={handleVerifyOtp} className="px-4 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 text-sm">Verify</button>
                  </div>
                </div>
              )}
              {otpVerified && <div className="p-3 bg-green-50 border-2 border-green-400 rounded-xl text-green-800 font-bold text-sm">Phone verified successfully!</div>}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Email (Optional)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none bg-white text-gray-900" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none bg-white text-gray-900" placeholder="Create a password" />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(2)} className="flex-1 py-4 bg-gray-100 text-gray-900 rounded-xl font-bold">Back</button>
              <button onClick={handleSubmit} disabled={loading || !otpVerified || !password} className={`flex-1 py-4 rounded-xl font-bold ${!loading && otpVerified && password ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            </div>
          </div>
        )}

      {/* STEP 4: Optional Verification */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">You're registered!</h2>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Add verifications now to build trust — or skip and do it later from your profile.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {[
                { icon: '🤳', title: 'Selfie Verification', desc: 'Live face check — 2 minutes — Free', href: '/verify-selfie', badge: 'Recommended' },
                { icon: '🎓', title: 'Education Certificate', desc: 'Upload your degree or certificate', href: '/edit-profile?tab=verification', badge: 'Optional' },
                { icon: '💼', title: 'Job / Business', desc: 'Upload trade license or employment letter', href: '/edit-profile?tab=verification', badge: 'Optional' },
              ].map((item, i) => (
                <a key={i} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e5e7eb', textDecoration: 'none' }}>
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>{item.title}</p>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: i === 0 ? '#e11d48' : '#6b7280', background: i === 0 ? '#fff1f2' : '#f3f4f6', padding: '1px 6px', borderRadius: '20px' }}>{item.badge}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{item.desc}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </a>
              ))}
            </div>

            <button onClick={() => router.push('/login')} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#e11d48,#db2777)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginBottom: '10px' }}>
              Go to Login
            </button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', margin: 0 }}>You can complete verifications anytime from Edit Profile</p>
          </div>
        )}

      </div>
    </div>
  );
}

