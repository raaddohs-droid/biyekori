"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    gender: "",
    age: "",
    height: "",
    religion: "",
    marital_status: "",
    education: "",
    profession: "",
    city: "",
    terms: false,
  });
  const [errors, setErrors] = useState<any>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: any) =>
    setFormData({ ...formData, [field]: value });

  const validateStep1 = () => {
    const e: any = {};
    if (!formData.full_name.trim()) e.full_name = "Full name is required";
    if (!formData.email.includes("@")) e.email = "Enter a valid email";
    if (formData.password.length < 8) e.password = "Minimum 8 characters";
    if (!/[A-Z]/.test(formData.password)) e.password = "Must include an uppercase letter";
    if (!/[0-9]/.test(formData.password)) e.password = "Must include a number";
    if (formData.password !== formData.confirm_password) e.confirm_password = "Passwords do not match";
    if (!formData.gender) e.gender = "Please select your gender";
    return e;
  };

  const validateStep2 = () => {
    const e: any = {};
    if (!formData.age || parseInt(formData.age) < 18) e.age = "Must be at least 18 years old";
    if (!formData.height) e.height = "Please enter your height";
    if (!formData.religion) e.religion = "Please select your religion";
    if (!formData.marital_status) e.marital_status = "Please select marital status";
    if (!formData.city.trim()) e.city = "City is required";
    return e;
  };

  const validateStep3 = () => {
    const e: any = {};
    if (!formData.education) e.education = "Please select education level";
    if (!formData.profession.trim()) e.profession = "Profession is required";
    if (!formData.terms) e.terms = "You must accept the terms";
    return e;
  };

  const nextStep = () => {
    let errs = {};
    if (step === 1) errs = validateStep1();
    if (step === 2) errs = validateStep2();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    const errs = validateStep3();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.full_name,
          gender: formData.gender,
          age: formData.age,
          height: formData.height,
          religion: formData.religion,
          marital_status: formData.marital_status,
          education: formData.education,
          profession: formData.profession,
          city: formData.city,
        }
      }
    });
    setLoading(false);
    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setMessage("success");
    }
  };

  if (message === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-4">💌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email!</h2>
          <p className="text-gray-500 mb-6">We sent a confirmation link to <strong>{formData.email}</strong>. Click it to activate your account.</p>
          <div className="bg-red-50 rounded-xl p-4 text-sm text-red-700 mb-6">
            ⚠️ Please check your spam folder if you don't see it within 2 minutes.
          </div>
          <Link href="/login" className="block bg-red-700 text-white py-3 rounded-full font-bold hover:bg-red-800">
            Go to Login →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12 text-white" style={{background: "linear-gradient(160deg, #6b0000, #c0392b)"}}>
        <Link href="/" className="text-2xl font-bold">💍 BandhanBD</Link>
        <div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Find Your Perfect Life Partner
          </h2>
          <p className="text-red-200 mb-8">Join 50,000+ verified profiles from across Bangladesh.</p>
          <div className="space-y-4">
            {[
              { icon: "✅", text: "100% Verified Profiles" },
              { icon: "🔒", text: "Your Privacy is Protected" },
              { icon: "💑", text: "12,000+ Successful Matches" },
              { icon: "📱", text: "Available on All Devices" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-red-100">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white bg-opacity-10 rounded-2xl p-5">
          <p className="text-sm text-red-100 italic">"I found my husband on BandhanBD in just 2 months. Highly recommended!"</p>
          <p className="text-white font-bold mt-2">— Nadia, Dhaka</p>
          <div className="text-yellow-400 mt-1">⭐⭐⭐⭐⭐</div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">

          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-6">
            <Link href="/" className="text-2xl font-bold text-red-700">💍 BandhanBD</Link>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {["Basic Info", "Personal Details", "Education & Job"].map((label, i) => (
                <div key={i} className={`text-xs font-bold ${step > i ? "text-red-700" : "text-gray-400"}`}>
                  {label}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-700 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              ></div>
            </div>
            <p className="text-right text-xs text-gray-400 mt-1">Step {step} of 3</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">

            {/* STEP 1 */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Your Account</h2>
                <p className="text-gray-400 text-sm mb-6">Start your journey to finding your life partner</p>
                <div className="space-y-4">

                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Full Name</label>
                    <input type="text" placeholder="e.g. Mohammad Rahman"
                      className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none text-gray-800 bg-gray-50"
                      value={formData.full_name}
                      onChange={e => update("full_name", e.target.value)} />
                    {errors.full_name && <p className="text-red-500 text-xs mt-1">⚠️ {errors.full_name}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Email Address</label>
                    <input type="email" placeholder="your@email.com"
                      className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none text-gray-800 bg-gray-50"
                      value={formData.email}
                      onChange={e => update("email", e.target.value)} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">⚠️ {errors.email}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Password</label>
                    <input type="password" placeholder="Min 8 chars, 1 uppercase, 1 number"
                      className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none text-gray-800 bg-gray-50"
                      value={formData.password}
                      onChange={e => update("password", e.target.value)} />
                    {errors.password && <p className="text-red-500 text-xs mt-1">⚠️ {errors.password}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Confirm Password</label>
                    <input type="password" placeholder="Re-enter your password"
                      className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none text-gray-800 bg-gray-50"
                      value={formData.confirm_password}
                      onChange={e => update("confirm_password", e.target.value)} />
                    {errors.confirm_password && <p className="text-red-500 text-xs mt-1">⚠️ {errors.confirm_password}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">I am a</label>
                    <div className="grid grid-cols-2 gap-3">
                      {["Male", "Female"].map(g => (
                        <button key={g} type="button"
                          onClick={() => update("gender", g)}
                          className={`py-3 rounded-xl border-2 font-bold transition-all ${formData.gender === g ? "border-red-700 bg-red-700 text-white" : "border-gray-200 text-gray-600 hover:border-red-300"}`}>
                          {g === "Male" ? "👨 Male" : "👩 Female"}
                        </button>
                      ))}
                    </div>
                    {errors.gender && <p className="text-red-500 text-xs mt-1">⚠️ {errors.gender}</p>}
                  </div>

                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Personal Details</h2>
                <p className="text-gray-400 text-sm mb-6">Help others find the right match for you</p>
                <div className="space-y-4">

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600 mb-1 block">Age</label>
                      <input type="number" placeholder="e.g. 25" min="18" max="60"
                        className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none text-gray-800 bg-gray-50"
                        value={formData.age}
                        onChange={e => update("age", e.target.value)} />
                      {errors.age && <p className="text-red-500 text-xs mt-1">⚠️ {errors.age}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600 mb-1 block">Height</label>
                      <select className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none text-gray-800 bg-gray-50"
                        value={formData.height}
                        onChange={e => update("height", e.target.value)}>
                        <option value="">Select</option>
                        {["4'10\"","4'11\"","5'0\"","5'1\"","5'2\"","5'3\"","5'4\"","5'5\"","5'6\"","5'7\"","5'8\"","5'9\"","5'10\"","5'11\"","6'0\"","6'1\"","6'2\""].map(h => (
                          <option key={h}>{h}</option>
                        ))}
                      </select>
                      {errors.height && <p className="text-red-500 text-xs mt-1">⚠️ {errors.height}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Religion</label>
                    <select className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none text-gray-800 bg-gray-50"
                      value={formData.religion}
                      onChange={e => update("religion", e.target.value)}>
                      <option value="">Select Religion</option>
                      <option>Islam</option>
                      <option>Hinduism</option>
                      <option>Christianity</option>
                      <option>Buddhism</option>
                      <option>Other</option>
                    </select>
                    {errors.religion && <p className="text-red-500 text-xs mt-1">⚠️ {errors.religion}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Marital Status</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Never Married", "Divorced", "Widowed"].map(s => (
                        <button key={s} type="button"
                          onClick={() => update("marital_status", s)}
                          className={`py-2 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${formData.marital_status === s ? "border-red-700 bg-red-700 text-white" : "border-gray-200 text-gray-600 hover:border-red-300"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    {errors.marital_status && <p className="text-red-500 text-xs mt-1">⚠️ {errors.marital_status}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">City / District</label>
                    <select className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none text-gray-800 bg-gray-50"
                      value={formData.city}
                      onChange={e => update("city", e.target.value)}>
                      <option value="">Select City</option>
                      {["Dhaka","Chittagong","Sylhet","Rajshahi","Khulna","Barisal","Rangpur","Mymensingh","Comilla","Narayanganj","Gazipur","Cox's Bazar"].map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    {errors.city && <p className="text-red-500 text-xs mt-1">⚠️ {errors.city}</p>}
                  </div>

                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Education & Profession</h2>
                <p className="text-gray-400 text-sm mb-6">Almost done! Just a few more details.</p>
                <div className="space-y-4">

                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Highest Education</label>
                    <select className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none text-gray-800 bg-gray-50"
                      value={formData.education}
                      onChange={e => update("education", e.target.value)}>
                      <option value="">Select Education</option>
                      <option>SSC / O-Level</option>
                      <option>HSC / A-Level</option>
                      <option>Diploma</option>
                      <option>Bachelor's Degree</option>
                      <option>Master's Degree</option>
                      <option>PhD / Doctorate</option>
                      <option>Other</option>
                    </select>
                    {errors.education && <p className="text-red-500 text-xs mt-1">⚠️ {errors.education}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Profession</label>
                    <select className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:border-red-500 outline-none text-gray-800 bg-gray-50"
                      value={formData.profession}
                      onChange={e => update("profession", e.target.value)}>
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
                    {errors.profession && <p className="text-red-500 text-xs mt-1">⚠️ {errors.profession}</p>}
                  </div>

                  {/* Trust badges */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-green-700 font-bold text-sm mb-2">
                      🔒 Your Information is Safe
                    </div>
                    <ul className="text-green-600 text-xs space-y-1">
                      <li>✅ Your contact details are never shown publicly</li>
                      <li>✅ Profile reviewed before going live</li>
                      <li>✅ You control who sees your profile</li>
                    </ul>
                  </div>

                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 accent-red-700"
                        checked={formData.terms}
                        onChange={e => update("terms", e.target.checked)} />
                      <span className="text-sm text-gray-500">
                        I agree to the <Link href="#" className="text-red-700 font-semibold">Terms of Service</Link> and <Link href="#" className="text-red-700 font-semibold">Privacy Policy</Link>. I confirm all information provided is accurate.
                      </span>
                    </label>
                    {errors.terms && <p className="text-red-500 text-xs mt-1">⚠️ {errors.terms}</p>}
                  </div>

                  {message && !message.includes("success") && (
                    <p className="text-red-600 text-sm text-center">{message}</p>
                  )}

                </div>
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)}
                  className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-bold hover:border-red-300 transition-all">
                  ← Back
                </button>
              )}
              {step < 3 ? (
                <button onClick={nextStep}
                  className="flex-1 text-white py-3 rounded-xl font-bold shadow-lg transition-all hover:opacity-90"
                  style={{background: "linear-gradient(135deg, #7f0000, #c0392b)"}}>
                  Continue →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 text-white py-3 rounded-xl font-bold shadow-lg transition-all hover:opacity-90"
                  style={{background: "linear-gradient(135deg, #7f0000, #c0392b)"}}>
                  {loading ? "Creating Account..." : "💍 Complete Registration"}
                </button>
              )}
            </div>

            <p className="text-center text-gray-400 text-sm mt-4">
              Already have an account? <Link href="/login" className="text-red-700 font-bold">Login here</Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}