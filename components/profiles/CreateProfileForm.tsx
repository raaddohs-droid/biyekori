"use client";
import { useState } from "react";
import AIPhotoCropper from "./AIPhotoCropper";

interface ProfileData {
  // Step 1: Basic Info
  profileManagedBy: string;
  lookingFor: "bride" | "groom" | "";
  name: string;
  age: string;
  dateOfBirth: string;
  height: string;
  weight: string;
  complexion: string;
  bodyType: string;
  bloodGroup: string;
  maritalStatus: string;
  hasChildren: string;
  numberOfChildren: string;
  childrenStayWith: string;
  
  // Step 2: Location
  country: string;
  division: string;
  district: string;
  area: string;
  grewUpIn: string;
  currentlyLivingIn: string;
  willingToRelocate: string;
  
  // Step 3: Education & Career
  education: string;
  educationDetails: string;
  profession: string;
  professionDetails: string;
  workSector: string;
  monthlyIncome: string;
  workAfterMarriage: string;
  
  // Step 4: Religion
  religion: string;
  sect: string;
  religiousPractice: string;
  performsPrayers: string;
  readsQuran: string;
  wearsHijab: string;
  wearsNiqab: string;
  hasBeard: string;
  attendsMosque: string;
  
  // Step 5: Family
  familyType: string;
  familyValues: string;
  familyStatus: string;
  fatherProfession: string;
  motherProfession: string;
  brothers: string;
  sisters: string;
  homeOwnership: string;
  financialStatus: string;
  
  // Step 6: Lifestyle & Health
  motherTongue: string;
  otherLanguages: string;
  diet: string;
  smoking: string;
  drinking: string;
  hasDisability: string;
  disabilityDetails: string;
  
  // Step 7: About & Preferences
  aboutMe: string;
  lookingForInPartner: string;
  hobbies: string;
  
  // Step 8: Contact & Photos
  phone: string;
  email: string;
  guardianName: string;
  guardianPhone: string;
  photoVisibility: string;
  wantVerification: string;
  communicationPreference: string;
  mainPhoto: string;
}

const initialData: ProfileData = {
  profileManagedBy: "",
  lookingFor: "",
  name: "",
  age: "",
  dateOfBirth: "",
  height: "",
  weight: "",
  complexion: "",
  bodyType: "",
  bloodGroup: "",
  maritalStatus: "",
  hasChildren: "",
  numberOfChildren: "",
  childrenStayWith: "",
  country: "Bangladesh",
  division: "",
  district: "",
  area: "",
  grewUpIn: "",
  currentlyLivingIn: "",
  willingToRelocate: "",
  education: "",
  educationDetails: "",
  profession: "",
  professionDetails: "",
  workSector: "",
  monthlyIncome: "",
  workAfterMarriage: "",
  religion: "Islam",
  sect: "",
  religiousPractice: "",
  performsPrayers: "",
  readsQuran: "",
  wearsHijab: "",
  wearsNiqab: "",
  hasBeard: "",
  attendsMosque: "",
  familyType: "",
  familyValues: "",
  familyStatus: "",
  fatherProfession: "",
  motherProfession: "",
  brothers: "",
  sisters: "",
  homeOwnership: "",
  financialStatus: "",
  motherTongue: "Bengali",
  otherLanguages: "",
  diet: "",
  smoking: "",
  drinking: "",
  hasDisability: "",
  disabilityDetails: "",
  aboutMe: "",
  lookingForInPartner: "",
  hobbies: "",
  phone: "",
  email: "",
  guardianName: "",
  guardianPhone: "",
  photoVisibility: "",
  wantVerification: "",
  communicationPreference: "",
  mainPhoto: ""
};

export default function CreateProfileForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const totalSteps = 8;

  const updateField = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePhotoCrop = (croppedImageBase64: string) => {
    updateField("mainPhoto", croppedImageBase64);
  };

  const handleSubmit = () => {
    console.log("Profile Data:", formData);
    alert("Profile created successfully! 🎉");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-bold text-gray-900">Step {step} of {totalSteps}</span>
            <span className="text-sm font-bold text-pink-600">{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
{step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">👤 Basic Information</h2>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">This profile is managed by *</label>
                <select
                  value={formData.profileManagedBy}
                  onChange={(e) => updateField("profileManagedBy", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="Self">Self</option>
                  <option value="Parent">Parent/Guardian</option>
                  <option value="Sibling">Brother/Sister</option>
                  <option value="Relative">Relative</option>
                  <option value="Friend">Friend</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">I am looking for *</label>
                <select
                  value={formData.lookingFor}
                  onChange={(e) => updateField("lookingFor", e.target.value as "bride" | "groom")}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="bride">Bride (পাত্রী)</option>
                  <option value="groom">Groom (পাত্র)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Full name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  placeholder="Enter full name"
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                    placeholder="Age"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Date of birth *</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Height *</label>
                  <select
                    value={formData.height}
                    onChange={(e) => updateField("height", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  >
                    <option value="">Select</option>
                    <option value="4ft 6in">4ft 6in</option>
                    <option value="4ft 7in">4ft 7in</option>
                    <option value="4ft 8in">4ft 8in</option>
                    <option value="4ft 9in">4ft 9in</option>
                    <option value="4ft 10in">4ft 10in</option>
                    <option value="4ft 11in">4ft 11in</option>
                    <option value="5ft 0in">5ft 0in</option>
                    <option value="5ft 1in">5ft 1in</option>
                    <option value="5ft 2in">5ft 2in</option>
                    <option value="5ft 3in">5ft 3in</option>
                    <option value="5ft 4in">5ft 4in</option>
                    <option value="5ft 5in">5ft 5in</option>
                    <option value="5ft 6in">5ft 6in</option>
                    <option value="5ft 7in">5ft 7in</option>
                    <option value="5ft 8in">5ft 8in</option>
                    <option value="5ft 9in">5ft 9in</option>
                    <option value="5ft 10in">5ft 10in</option>
                    <option value="5ft 11in">5ft 11in</option>
                    <option value="6ft 0in">6ft 0in</option>
                    <option value="6ft 1in">6ft 1in</option>
                    <option value="6ft 2in">6ft 2in</option>
                    <option value="6ft 3in">6ft 3in</option>
                    <option value="6ft 4in">6ft 4in</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => updateField("weight", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                    placeholder="Weight"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Complexion (গায়ের রঙ) *</label>
                  <select
                    value={formData.complexion}
                    onChange={(e) => updateField("complexion", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  >
                    <option value="">Select</option>
                    <option value="Very Fair">Very Fair (অতি ফর্সা)</option>
                    <option value="Fair">Fair (ফর্সা)</option>
                    <option value="Wheatish">Wheatish (শ্যামলা)</option>
                    <option value="Dark">Dark (কালো)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Body Type</label>
                  <select
                    value={formData.bodyType}
                    onChange={(e) => updateField("bodyType", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  >
                    <option value="">Select</option>
                    <option value="Slim">Slim</option>
                    <option value="Average">Average</option>
                    <option value="Athletic">Athletic</option>
                    <option value="Heavy">Heavy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Blood group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => updateField("bloodGroup", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Marital status *</label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => updateField("maritalStatus", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  >
                    <option value="">Select</option>
                    <option value="Never married">Never married (অবিবাহিত)</option>
                    <option value="Divorced">Divorced (তালাকপ্রাপ্ত)</option>
                    <option value="Annulled">Annulled (বিবাহ বাতিল)</option>
                    <option value="Widowed">Widowed (বিধবা/বিপত্নীক)</option>
                    <option value="Separated">Separated (বিচ্ছিন্ন)</option>
                    <option value="Awaiting divorce">Awaiting divorce</option>
                  </select>
                </div>
              </div>

              {(formData.maritalStatus === "Divorced" || formData.maritalStatus === "Annulled" || formData.maritalStatus === "Widowed" || formData.maritalStatus === "Separated" || formData.maritalStatus === "Awaiting divorce") && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Do you have children? *</label>
                    <select
                      value={formData.hasChildren}
                      onChange={(e) => updateField("hasChildren", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                    >
                      <option value="">Select</option>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  {formData.hasChildren === "Yes" && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Number of children *</label>
                        <select
                          value={formData.numberOfChildren}
                          onChange={(e) => updateField("numberOfChildren", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                        >
                          <option value="">Select</option>
                          <option value="1">1 child</option>
                          <option value="2">2 children</option>
                          <option value="3">3 children</option>
                          <option value="4">4 children</option>
                          <option value="5+">5+ children</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Children currently living with *</label>
                        <select
                          value={formData.childrenStayWith}
                          onChange={(e) => updateField("childrenStayWith", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                        >
                          <option value="">Select</option>
                          <option value="Me">Living with me</option>
                          <option value="Ex-spouse">Living with ex-spouse</option>
                          <option value="Shared custody">Shared custody</option>
                          <option value="Grandparents">Living with grandparents</option>
                          <option value="Other guardian">Living with other guardian</option>
                          <option value="Independent">Children are independent/adults</option>
                        </select>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}{step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">📍 Location & Background</h2>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Country *</label>
                <select
                  value={formData.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="UAE">UAE</option>
                  <option value="Qatar">Qatar</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.country === "Bangladesh" && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Division *</label>
                    <select
                      value={formData.division}
                      onChange={(e) => updateField("division", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                    >
                      <option value="">Select Division</option>
                      <option value="Dhaka">Dhaka (ঢাকা)</option>
                      <option value="Chittagong">Chittagong (চট্টগ্রাম)</option>
                      <option value="Rajshahi">Rajshahi (রাজশাহী)</option>
                      <option value="Khulna">Khulna (খুলনা)</option>
                      <option value="Barisal">Barisal (বরিশাল)</option>
                      <option value="Sylhet">Sylhet (সিলেট)</option>
                      <option value="Rangpur">Rangpur (রংপুর)</option>
                      <option value="Mymensingh">Mymensingh (ময়মনসিংহ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">District *</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => updateField("district", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                      placeholder="e.g., Dhaka, Comilla, Noakhali"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Area/Thana</label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => updateField("area", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                      placeholder="e.g., Gulshan, Dhanmondi, Mirpur"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Grew up in *</label>
                <input
                  type="text"
                  value={formData.grewUpIn}
                  onChange={(e) => updateField("grewUpIn", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  placeholder="City/District where you spent childhood"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Currently living in *</label>
                <input
                  type="text"
                  value={formData.currentlyLivingIn}
                  onChange={(e) => updateField("currentlyLivingIn", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  placeholder="Current city/area"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Willing to relocate? *</label>
                <select
                  value={formData.willingToRelocate}
                  onChange={(e) => updateField("willingToRelocate", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="Yes, anywhere">Yes, anywhere</option>
                  <option value="Yes, within Bangladesh">Yes, within Bangladesh only</option>
                  <option value="Yes, abroad only">Yes, abroad only</option>
                  <option value="Maybe">Maybe, depends on situation</option>
                  <option value="No">No, prefer to stay here</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">🎓 Education & Career</h2>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Highest education *</label>
                <select
                  value={formData.education}
                  onChange={(e) => updateField("education", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="SSC">SSC</option>
                  <option value="HSC">HSC</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Bachelor">Bachelor's Degree</option>
                  <option value="Honors">Honors</option>
                  <option value="Masters">Master's Degree</option>
                  <option value="PhD">PhD/Doctorate</option>
                  <option value="Medical">MBBS/Medical</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Madrasa">Madrasa Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Education details</label>
                <input
                  type="text"
                  value={formData.educationDetails}
                  onChange={(e) => updateField("educationDetails", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  placeholder="e.g., BSc in CSE from BUET, MBA from DU"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Profession *</label>
                <select
                  value={formData.profession}
                  onChange={(e) => updateField("profession", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="Student">Student</option>
                  <option value="Homemaker">Homemaker</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Teacher">Teacher/Professor</option>
                  <option value="Business">Business/Entrepreneur</option>
                  <option value="Banker">Banker</option>
                  <option value="Software Engineer">Software Engineer/IT</option>
                  <option value="Lawyer">Lawyer</option>
                  <option value="Architect">Architect</option>
                  <option value="Accountant">Accountant/CA</option>
                  <option value="Civil Service">Civil Service/BCS</option>
                  <option value="Defense">Defense/Armed Forces</option>
                  <option value="NGO">NGO/Development Sector</option>
                  <option value="Private Job">Private Company Job</option>
                  <option value="Government Job">Government Job</option>
                  <option value="Self-employed">Self-employed</option>
                  <option value="Not working">Not working currently</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Profession details</label>
                <input
                  type="text"
                  value={formData.professionDetails}
                  onChange={(e) => updateField("professionDetails", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  placeholder="e.g., Senior Software Engineer at Pathao, Cardiologist at Square Hospital"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Work sector</label>
                <select
                  value={formData.workSector}
                  onChange={(e) => updateField("workSector", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                  <option value="Self-employed">Self-employed/Business</option>
                  <option value="NGO">NGO/Non-profit</option>
                  <option value="Not applicable">Not applicable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Monthly income (BDT)</label>
                <select
                  value={formData.monthlyIncome}
                  onChange={(e) => updateField("monthlyIncome", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select range</option>
                  <option value="Below 20,000">Below 20,000 BDT</option>
                  <option value="20,000-40,000">20,000-40,000 BDT</option>
                  <option value="40,000-60,000">40,000-60,000 BDT</option>
                  <option value="60,000-1,00,000">60,000-1,00,000 BDT</option>
                  <option value="1,00,000-2,00,000">1,00,000-2,00,000 BDT</option>
                  <option value="Above 2,00,000">Above 2,00,000 BDT</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {formData.lookingFor === "bride" && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Work after marriage? *</label>
                  <select
                    value={formData.workAfterMarriage}
                    onChange={(e) => updateField("workAfterMarriage", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  >
                    <option value="">Select</option>
                    <option value="Yes, will continue">Yes, will continue working</option>
                    <option value="Maybe, depends">Maybe, depends on situation</option>
                    <option value="No, will be homemaker">No, prefer to be homemaker</option>
                    <option value="Undecided">Not decided yet</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">🕌 Religious Background</h2>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Religion *</label>
                <select
                  value={formData.religion}
                  onChange={(e) => updateField("religion", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="Islam">Islam</option>
                  <option value="Hinduism">Hinduism</option>
                  <option value="Buddhism">Buddhism</option>
                  <option value="Christianity">Christianity</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.religion === "Islam" && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Sect (মাজহাব)</label>
                    <select
                      value={formData.sect}
                      onChange={(e) => updateField("sect", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                    >
                      <option value="">Select</option>
                      <option value="Sunni">Sunni (সুন্নি)</option>
                      <option value="Shia">Shia (শিয়া)</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Religious practice level *</label>
                    <select
                      value={formData.religiousPractice}
                      onChange={(e) => updateField("religiousPractice", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                    >
                      <option value="">Select</option>
                      <option value="Very religious">Very religious (অত্যন্ত ধর্মপরায়ণ)</option>
                      <option value="Moderately religious">Moderately religious (মধ্যম ধর্মপরায়ণ)</option>
                      <option value="Somewhat religious">Somewhat religious</option>
                      <option value="Not very religious">Not very religious</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Perform 5 daily prayers? *</label>
                    <select
                      value={formData.performsPrayers}
                      onChange={(e) => updateField("performsPrayers", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                    >
                      <option value="">Select</option>
                      <option value="Yes, all 5">Yes, all 5 prayers regularly</option>
                      <option value="Yes, mostly">Yes, mostly (sometimes miss)</option>
                      <option value="Sometimes">Sometimes</option>
                      <option value="Only Jumma">Only Jumma/Eid prayers</option>
                      <option value="No">No, don't pray regularly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Read/understand Quran?</label>
                    <select
                      value={formData.readsQuran}
                      onChange={(e) => updateField("readsQuran", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                    >
                      <option value="">Select</option>
                      <option value="Yes, with understanding">Yes, can read and understand</option>
                      <option value="Can read Arabic">Can read Arabic text</option>
                      <option value="Learning">Currently learning</option>
                      <option value="No">No, cannot read</option>
                    </select>
                  </div>

                  {formData.lookingFor === "bride" && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Wear hijab? *</label>
                        <select
                          value={formData.wearsHijab}
                          onChange={(e) => updateField("wearsHijab", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                        >
                          <option value="">Select</option>
                          <option value="Yes, always">Yes, always</option>
                          <option value="Yes, outside">Yes, when outside</option>
                          <option value="Sometimes">Sometimes</option>
                          <option value="No">No</option>
                          <option value="Planning to">Planning to start</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Wear niqab?</label>
                        <select
                          value={formData.wearsNiqab}
                          onChange={(e) => updateField("wearsNiqab", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Sometimes">Sometimes</option>
                        </select>
                      </div>
                    </>
                  )}

                  {formData.lookingFor === "groom" && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Have beard? *</label>
                        <select
                          value={formData.hasBeard}
                          onChange={(e) => updateField("hasBeard", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                        >
                          <option value="">Select</option>
                          <option value="Yes, full beard">Yes, full Sunnah beard</option>
                          <option value="Yes, trimmed">Yes, trimmed beard</option>
                          <option value="Sometimes">Sometimes</option>
                          <option value="No">No</option>
                          <option value="Planning to">Planning to keep</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Attend mosque regularly?</label>
                        <select
                          value={formData.attendsMosque}
                          onChange={(e) => updateField("attendsMosque", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                        >
                          <option value="">Select</option>
                          <option value="Yes, 5 times">Yes, all 5 prayers in mosque</option>
                          <option value="Yes, Jumma">Yes, at least Jumma</option>
                          <option value="Sometimes">Sometimes</option>
                          <option value="Rarely">Rarely</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}{step === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">👨‍👩‍👧‍👦 Family Background</h2>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Family type *</label>
                <select
                  value={formData.familyType}
                  onChange={(e) => updateField("familyType", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="Nuclear">Nuclear family (একক পরিবার)</option>
                  <option value="Joint">Joint family (যৌথ পরিবার)</option>
                  <option value="Extended">Extended family</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Family values *</label>
                <select
                  value={formData.familyValues}
                  onChange={(e) => updateField("familyValues", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="Very traditional">Very traditional (অত্যন্ত রক্ষণশীল)</option>
                  <option value="Traditional">Traditional (ঐতিহ্যবাহী)</option>
                  <option value="Moderate">Moderate (মধ্যপন্থী)</option>
                  <option value="Liberal">Liberal (উদারপন্থী)</option>
                  <option value="Very liberal">Very liberal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Family financial status</label>
                <select
                  value={formData.familyStatus}
                  onChange={(e) => updateField("familyStatus", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="Upper class">Upper class (উচ্চবিত্ত)</option>
                  <option value="Upper middle class">Upper middle class</option>
                  <option value="Middle class">Middle class (মধ্যবিত্ত)</option>
                  <option value="Lower middle class">Lower middle class</option>
                  <option value="Working class">Working class</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Father's profession</label>
                <input
                  type="text"
                  value={formData.fatherProfession}
                  onChange={(e) => updateField("fatherProfession", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  placeholder="e.g., Retired government officer, Businessman"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Mother's profession</label>
                <input
                  type="text"
                  value={formData.motherProfession}
                  onChange={(e) => updateField("motherProfession", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  placeholder="e.g., Homemaker, Teacher"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Number of brothers</label>
                  <select
                    value={formData.brothers}
                    onChange={(e) => updateField("brothers", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  >
                    <option value="">Select</option>
                    <option value="0">None</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4 or more</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Number of sisters</label>
                  <select
                    value={formData.sisters}
                    onChange={(e) => updateField("sisters", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  >
                    <option value="">Select</option>
                    <option value="0">None</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4 or more</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Home ownership</label>
                <select
                  value={formData.homeOwnership}
                  onChange={(e) => updateField("homeOwnership", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="Own house">Own house/apartment</option>
                  <option value="Rented">Rented</option>
                  <option value="Family property">Living in family property</option>
                  <option value="Multiple properties">Family has multiple properties</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Family's financial condition</label>
                <select
                  value={formData.financialStatus}
                  onChange={(e) => updateField("financialStatus", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="Very well off">Very well off</option>
                  <option value="Well off">Well off</option>
                  <option value="Comfortable">Comfortable</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Below average">Below average</option>
                </select>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">🏃 Lifestyle & Health</h2>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Mother tongue *</label>
                <select
                  value={formData.motherTongue}
                  onChange={(e) => updateField("motherTongue", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="Bengali">Bengali (বাংলা)</option>
                  <option value="Chittagonian">Chittagonian (চাটগাঁইয়া)</option>
                  <option value="Sylheti">Sylheti (সিলেটি)</option>
                  <option value="Urdu">Urdu</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Other languages known</label>
                <input
                  type="text"
                  value={formData.otherLanguages}
                  onChange={(e) => updateField("otherLanguages", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  placeholder="e.g., English, Hindi, Arabic"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Diet preference *</label>
                <select
                  value={formData.diet}
                  onChange={(e) => updateField("diet", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="Non-vegetarian">Non-vegetarian (মাংসাহারী)</option>
                  <option value="Vegetarian">Vegetarian (নিরামিষভোজী)</option>
                  <option value="Eggetarian">Eggetarian</option>
                  <option value="Occasionally non-veg">Occasionally non-veg</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Smoking *</label>
                <select
                  value={formData.smoking}
                  onChange={(e) => updateField("smoking", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="No">No, never</option>
                  <option value="Occasionally">Occasionally/Socially</option>
                  <option value="Yes">Yes, regularly</option>
                  <option value="Trying to quit">Trying to quit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Drinking *</label>
                <select
                  value={formData.drinking}
                  onChange={(e) => updateField("drinking", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="No">No, never</option>
                  <option value="Occasionally">Occasionally/Socially</option>
                  <option value="Yes">Yes, regularly</option>
                  <option value="Trying to quit">Trying to quit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Any disability or health condition? *</label>
                <select
                  value={formData.hasDisability}
                  onChange={(e) => updateField("hasDisability", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              {formData.hasDisability === "Yes" && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Please specify (optional)</label>
                  <textarea
                    value={formData.disabilityDetails}
                    onChange={(e) => updateField("disabilityDetails", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                    placeholder="Brief description if you're comfortable sharing"
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">✍️ About Me & What I'm Looking For</h2>
              
              <div className="bg-blue-50 p-4 rounded-xl mb-6">
                <p className="text-sm text-gray-700">💡 <strong>Tip:</strong> A well-written profile gets 5x more responses! Be genuine, specific, and positive.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">About me * (250-500 characters)</label>
                <textarea
                  value={formData.aboutMe}
                  onChange={(e) => updateField("aboutMe", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  placeholder="Write about yourself: your personality, values, interests, what makes you unique... Be authentic!"
                  rows={6}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.aboutMe.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Looking for in a partner * (250-500 characters)</label>
                <textarea
                  value={formData.lookingForInPartner}
                  onChange={(e) => updateField("lookingForInPartner", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  placeholder="Describe your ideal partner: qualities, values, lifestyle... Be specific but realistic!"
                  rows={6}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.lookingForInPartner.length}/500 characters</p>
              </div>

              <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
                <h3 className="font-bold text-gray-900 mb-3">🎯 Optional: Help us find better matches!</h3>
                <p className="text-sm text-gray-700 mb-4">These fields are optional but help our AI suggest more compatible matches.</p>
                
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Hobbies & interests</label>
                  <input
                    type="text"
                    value={formData.hobbies}
                    onChange={(e) => updateField("hobbies", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                    placeholder="e.g., Reading, traveling, photography, cooking, sports"
                  />
                  <p className="text-xs text-gray-500 mt-1">We'll remind you to complete this later for better matches!</p>
                </div>
              </div>
            </div>
          )}{step === 8 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">📞 Contact & Photos</h2>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                <p className="text-sm font-bold text-gray-900">⚠️ Important: Phone and email are required for verification</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Phone number * (for verification)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  placeholder="01XXXXXXXXX"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">We'll send an OTP to verify</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Email address * (for login)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">👨‍👩‍👧 Guardian/Family Contact (Optional but recommended)</h3>
                <p className="text-sm text-gray-700 mb-4">For family-managed profiles or additional verification</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Guardian name</label>
                    <input
                      type="text"
                      value={formData.guardianName}
                      onChange={(e) => updateField("guardianName", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                      placeholder="e.g., Father's/Mother's name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Guardian phone</label>
                    <input
                      type="tel"
                      value={formData.guardianPhone}
                      onChange={(e) => updateField("guardianPhone", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">📸 AI Photo Cropper</h3>
                <p className="text-sm text-gray-700 mb-4">Upload your photo and our AI will automatically crop it to professional passport style!</p>
                
                <AIPhotoCropper onPhotoCropped={handlePhotoCrop} />
                
                {formData.mainPhoto && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <p className="text-sm font-bold text-green-700">✅ Photo cropped successfully!</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Photo visibility *</label>
                <select
                  value={formData.photoVisibility}
                  onChange={(e) => updateField("photoVisibility", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="Visible to all">Visible to all verified users</option>
                  <option value="On request">Only after I approve request</option>
                  <option value="Private">Keep private (conservative/privacy)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Want profile verification?</label>
                <select
                  value={formData.wantVerification}
                  onChange={(e) => updateField("wantVerification", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes, verify my profile (recommended)</option>
                  <option value="No">No, not now</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Verified profiles get 10x more responses!</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">How should people contact you? *</label>
                <select
                  value={formData.communicationPreference}
                  onChange={(e) => updateField("communicationPreference", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="Direct">Direct messages welcome</option>
                  <option value="After interest">After sending interest first</option>
                  <option value="Through guardian">Through guardian/family only</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t-2">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-900 hover:bg-gray-50"
              >
                ← Previous
              </button>
            )}
            
            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="ml-auto px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg"
              >
                🎉 Create Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}