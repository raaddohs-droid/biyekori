"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AIPhotoCropper from "@/components/profiles/AIPhotoCropper";
import { supabase } from "@/lib/supabase";

export default function QuickRegister() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    photo: "",
    lookingFor: "" as "bride" | "groom" | "",
    name: "",
    age: "",
    city: "",
    education: "",
    profession: "",
    phone: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    // Validate current step
    if (step === 1) {
      if (!formData.photo || !formData.lookingFor) {
        setError("Please upload a photo and select what you're looking for");
        return;
      }
    }
    if (step === 2) {
      if (!formData.name || !formData.age || !formData.city || !formData.education || !formData.profession) {
        setError("Please fill in all fields");
        return;
      }
      if (parseInt(formData.age) < 18 || parseInt(formData.age) > 80) {
        setError("Age must be between 18 and 80");
        return;
      }
    }
    
    setError("");
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Handle photo selection and upload to Supabase
  const handlePhotoSelect = async (file: File, croppedDataUrl: string) => {
    setUploadingPhoto(true);
    setError("");

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

      console.log('Uploading photo:', fileName);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload photo: ' + uploadError.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      const photoUrl = urlData.publicUrl;
      console.log('Photo uploaded successfully:', photoUrl);

      // Update formData with photo URL
      updateField("photo", photoUrl);
      
      alert("✅ Photo uploaded successfully!");
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.phone) {
      setOtpError("Please enter your phone number");
      return;
    }

    // Remove any spaces, dashes, or +880 prefix
    let cleanPhone = formData.phone.replace(/[\s\-+]/g, '');
    
    // If starts with 880, remove it to get 01XXXXXXXXX format
    if (cleanPhone.startsWith('880')) {
      cleanPhone = '0' + cleanPhone.substring(3);
    }

    // Validate: must be exactly 11 digits starting with 01
    if (!/^01[0-9]{9}$/.test(cleanPhone)) {
      setOtpError(`Invalid phone number. Must be 11 digits starting with 01 (you entered: ${cleanPhone})`);
      return;
    }

    setSendingOtp(true);
    setOtpError("");

    try {
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store in global
      if (typeof window !== 'undefined') {
        (window as any).currentOTP = otp;
        (window as any).otpPhone = cleanPhone;
      }

      // Format for BulkSMS API: 01XXXXXXXXX -> +8801XXXXXXXXX
      const formattedPhone = '+880' + cleanPhone.substring(1);

      console.log('=== OTP SEND DEBUG ===');
      console.log('Original input:', formData.phone);
      console.log('Clean phone:', cleanPhone);
      console.log('Formatted for API:', formattedPhone);
      console.log('Generated OTP:', otp);

      // Send via send-sms API
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: formattedPhone,
          message: `Your Biyekori OTP is ${otp}. Valid for 5 minutes.`
        })
      });

      const result = await response.json();

      console.log('SMS API Status:', response.status);
      console.log('SMS API Response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to send OTP');
      }

      // Update formData with clean phone
      updateField("phone", cleanPhone);
      
      setOtpSent(true);
      alert("📱 OTP sent to " + cleanPhone + "!\n\n(Check browser console for OTP if SMS doesn't arrive)");
    } catch (err: any) {
      console.error("Send OTP error:", err);
      setOtpError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError("Please enter the 6-digit OTP");
      return;
    }

    setVerifyingOtp(true);
    setOtpError("");

    try {
      // Verify against stored OTP
      const storedOTP = typeof window !== 'undefined' ? (window as any).currentOTP : null;
      const storedPhone = typeof window !== 'undefined' ? (window as any).otpPhone : null;

      console.log('=== OTP VERIFY DEBUG ===');
      console.log('Entered OTP:', otpCode);
      console.log('Stored OTP:', storedOTP);
      console.log('Current phone:', formData.phone);
      console.log('Stored phone:', storedPhone);

      if (!storedOTP || storedPhone !== formData.phone) {
        throw new Error('OTP expired or invalid. Please request a new one.');
      }

      if (storedOTP !== otpCode) {
        throw new Error('Invalid OTP. Please try again.');
      }

      setOtpVerified(true);
      alert("✅ Phone verified successfully!");
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      setOtpError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async () => {
    // Validate Step 3
    if (!formData.phone || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (!otpVerified) {
      setError("Please verify your phone number first");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      console.log("=== REGISTRATION SUBMIT ===");
      console.log("Sending registration to API...");

      // Determine gender based on lookingFor
      const gender = formData.lookingFor === 'bride' ? 'male' : 'female';
      
      // Call our backend API
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.name,
          age: formData.age,
          city: formData.city,
          education: formData.education,
          profession: formData.profession,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          looking_for: formData.lookingFor,
          gender: gender,
          photo_url: formData.photo,
          package: 'prottasha'
        })
      });

      const result = await response.json();

      console.log("Registration API Response:", result);

      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      console.log("Profile created successfully:", result.profile);
      alert("🎉 Profile created successfully! Welcome to Biyekori!");
      
      router.push('/');

    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-bold text-gray-900">Step {step} of 3</span>
            <span className="text-sm font-bold text-rose-600">{Math.round((step / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-rose-500 to-pink-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-sm text-red-800">⚠️ {error}</p>
            </div>
          )}

          {/* STEP 1: Photo + Gender */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome to Biyekori! 🎉</h1>
                <p className="text-gray-600">Let's create your profile in just 2 minutes</p>
                <p className="text-sm text-green-600 font-bold mt-2">✨ 100% FREE to join!</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">📸 Upload Your Photo</h3>
                <p className="text-sm text-gray-700 mb-4">Our AI will detect your face and crop it perfectly!</p>
                
                {uploadingPhoto && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Uploading photo...</p>
                  </div>
                )}
                
                {formData.photo && !uploadingPhoto && (
                  <div className="mb-4 text-center">
                    <img src={formData.photo} alt="Profile" className="w-32 h-32 rounded-full mx-auto border-4 border-green-500" />
                    <p className="text-sm text-green-600 font-bold mt-2">✅ Photo uploaded!</p>
                  </div>
                )}
                
                <AIPhotoCropper 
                  onPhotoSelect={handlePhotoSelect}
                  uploadCount={0}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">I am looking for *</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => updateField("lookingFor", "bride")}
                    className={`p-4 rounded-xl border-2 font-bold transition-all ${
                      formData.lookingFor === "bride"
                        ? "border-rose-500 bg-rose-50 text-rose-700"
                        : "border-gray-300 text-gray-700 hover:border-rose-300"
                    }`}
                  >
                    👰 Bride<br/>
                    <span className="text-sm">(পাত্রী)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField("lookingFor", "groom")}
                    className={`p-4 rounded-xl border-2 font-bold transition-all ${
                      formData.lookingFor === "groom"
                        ? "border-rose-500 bg-rose-50 text-rose-700"
                        : "border-gray-300 text-gray-700 hover:border-rose-300"
                    }`}
                  >
                    🤵 Groom<br/>
                    <span className="text-sm">(পাত্র)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Basic Info */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Tell us about yourself</h2>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none text-gray-900"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Age *</label>
                  <input
                    type="number"
                    min="18"
                    max="80"
                    value={formData.age}
                    onChange={(e) => updateField("age", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none text-gray-900"
                    placeholder="Age"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none text-gray-900"
                    placeholder="e.g., Dhaka"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Education *</label>
                <select
                  value={formData.education}
                  onChange={(e) => updateField("education", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select Education</option>
                  <option value="SSC">SSC</option>
                  <option value="HSC">HSC</option>
                  <option value="Bachelor">Bachelor's</option>
                  <option value="Masters">Master's</option>
                  <option value="PhD">PhD</option>
                  <option value="Medical">MBBS/Medical</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Profession *</label>
                <select
                  value={formData.profession}
                  onChange={(e) => updateField("profession", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none text-gray-900"
                >
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
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Contact + OTP Verification */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Almost done!</h2>
              
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6">
                <p className="text-sm text-green-800 font-bold">🎉 Registration is 100% FREE! Start browsing matches immediately!</p>
              </div>

              {/* Phone Number + OTP */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number *</label>
                <p className="text-xs text-gray-600 mb-2">Enter as: 01XXXXXXXXX (11 digits)</p>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    disabled={otpVerified}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none text-gray-900 disabled:bg-gray-100"
                    placeholder="01XXXXXXXXX"
                  />
                  {!otpVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendingOtp}
                      className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50 whitespace-nowrap"
                    >
                      {sendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
                    </button>
                  )}
                  {otpVerified && (
                    <div className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold flex items-center gap-2">
                      ✓ Verified
                    </div>
                  )}
                </div>
                
                {/* OTP Input */}
                {otpSent && !otpVerified && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-gray-700 mb-3">Enter the 6-digit OTP sent to your phone:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 text-center text-2xl tracking-widest"
                        placeholder="000000"
                        autoComplete="one-time-code"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={verifyingOtp || otpCode.length !== 6}
                        className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 disabled:opacity-50"
                      >
                        {verifyingOtp ? "Verifying..." : "Verify"}
                      </button>
                    </div>
                  </div>
                )}

                {otpError && (
                  <p className="text-sm text-red-600 mt-2">⚠️ {otpError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none text-gray-900"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none text-gray-900"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t-2">
            {step > 1 && (
              <button
                onClick={prevStep}
                disabled={isSubmitting || uploadingPhoto}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-900 hover:bg-gray-50 disabled:opacity-50"
              >
                ← Back
              </button>
            )}
            
            {step < 3 ? (
              <button
                onClick={nextStep}
                disabled={uploadingPhoto}
                className={`px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold hover:from-rose-600 hover:to-pink-700 disabled:opacity-50 ${step === 1 ? 'w-full' : 'ml-auto'}`}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !otpVerified}
                className="ml-auto px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
              >
                {isSubmitting ? "Creating Profile..." : "🎉 Complete Registration"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}