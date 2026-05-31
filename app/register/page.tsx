"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AIPhotoCropper from '@/components/profiles/AIPhotoCropper';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<File[]>([]);
  const [photoPrivacy, setPhotoPrivacy] = useState(false);
  const [iAm, setIAm] = useState(''); // 'bride' or 'groom'
  const [managedBy, setManagedBy] = useState('');

  // Step 2
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [city, setCity] = useState('');
  const [education, setEducation] = useState('');
  const [profession, setProfession] = useState('');

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
          phone_verified: true
        })
      });
      const data = await response.json();
      if (data.success) { alert('Registration successful! Please login.'); router.push('/login'); }
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

        {/* Progress */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
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
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Create Your Profile</h2>

            {/* I am a */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-900 mb-2">I am a...</label>
              <select
                value={iAm}
                onChange={(e) => setIAm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none bg-white text-gray-900"
                required
              >
                <option value="">Select one</option>
                <option value="bride">Bride (Patri) - I am a woman looking for a groom</option>
                <option value="groom">Groom (Patro) - I am a man looking for a bride</option>
              </select>
            </div>

            {/* Managed by */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-900 mb-2">This profile is managed by...</label>
              <select
                value={managedBy}
                onChange={(e) => setManagedBy(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none bg-white text-gray-900"
                required
              >
                <option value="">Select one</option>
                <option value="Self">Myself</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Relative">Relative</option>
                <option value="Friend">Friend</option>
              </select>
            </div>

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
              disabled={!selectedPhoto || !iAm || !managedBy}
              className={`w-full py-4 rounded-xl font-bold transition ${selectedPhoto && iAm && managedBy ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-xl' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
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
                <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none bg-white text-gray-900" placeholder="Enter your full name" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Date of Birth</label>
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
                  <label className="block text-sm font-bold text-gray-900 mb-2">District</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none bg-white text-gray-900" required>
                    <option value="">Select District</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Education</label>
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
                <label className="block text-sm font-bold text-gray-900 mb-2">Profession</label>
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

      </div>
    </div>
  );
}

