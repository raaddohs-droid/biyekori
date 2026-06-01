"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const DISTRICTS = ['Dhaka','Chittagong','Rajshahi','Khulna','Barisal','Sylhet','Rangpur','Mymensingh','Comilla','Gazipur','Narayanganj','Narsingdi','Tangail','Jamalpur','Sherpur','Netrokona','Brahmanbaria','Chandpur','Lakshmipur','Noakhali','Feni',"Cox's Bazar",'Bandarban','Rangamati','Khagrachhari','Bogra','Chapainawabganj','Joypurhat','Naogaon','Natore','Pabna','Sirajganj','Jessore','Jhenaidah','Kushtia','Magura','Meherpur','Narail','Chuadanga','Satkhira','Bagerhat','Barguna','Bhola','Jhalokathi','Patuakhali','Pirojpur','Dinajpur','Gaibandha','Kurigram','Lalmonirhat','Nilphamari','Panchagarh','Thakurgaon','Habiganj','Moulvibazar','Sunamganj','Faridpur','Gopalganj','Madaripur','Rajbari','Shariatpur','Kishoreganj','Manikganj','Munshiganj']

const EDUCATIONS = ['SSC','HSC',"Bachelor's","Master's",'Medical','Engineering','Law','PhD','Diploma','Other']
const PROFESSIONS = ['Student','Doctor','Engineer','Teacher','Banker','Lawyer','Business','Government Officer','NGO Worker','Homemaker','IT Professional','Accountant','Military','Police','Other']
const RELIGIONS = ['Islam','Hinduism','Christianity','Buddhism','Other']
const RELIGION_LEVELS = ['Very Religious','Religious','Moderate','Liberal']
const MARITAL_STATUSES = ['Never married','Divorced','Widowed','Separated']
const HEIGHTS = ["4'6\"","4'8\"","4'10\"","4'11\"","5'0\"","5'1\"","5'2\"","5'3\"","5'4\"","5'5\"","5'6\"","5'7\"","5'8\"","5'9\"","5'10\"","5'11\"","6'0\"","6'1\"","6'2\""]
const INCOMES = ['Under ৳15,000','৳15,000–25,000','৳25,000–50,000','৳50,000–1,00,000','Over ৳1,00,000','Not specified']

export default function EditProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  // Form fields
  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [education, setEducation] = useState('')
  const [profession, setProfession] = useState('')
  const [religion, setReligion] = useState('')
  const [religionLevel, setReligionLevel] = useState('')
  const [maritalStatus, setMaritalStatus] = useState('')
  const [height, setHeight] = useState('')
  const [income, setIncome] = useState('')
  const [aboutMe, setAboutMe] = useState('')
  const [hobbies, setHobbies] = useState('')
  const [partnerAgeMin, setPartnerAgeMin] = useState('')
  const [partnerAgeMax, setPartnerAgeMax] = useState('')
  const [partnerDistrict, setPartnerDistrict] = useState('')
  const [partnerEducation, setPartnerEducation] = useState('')
  const [photoPrivacy, setPhotoPrivacy] = useState(false)
  const [deactivated, setDeactivated] = useState(false)

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  useEffect(() => {
    const stored = localStorage.getItem('biyekori_user')
    if (!stored) { router.push('/login'); return }
    const u = JSON.parse(stored)
    setUser(u)

    // Fetch full profile from Supabase
    fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${u.id}&select=*`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    })
      .then(r => r.json())
      .then(data => {
        const p = Array.isArray(data) ? data[0] : data
        if (p) {
          setProfile(p)
          setFullName(p.full_name || '')
          setCity(p.city || p.district || '')
          setEducation(p.education || '')
          setProfession(p.profession || '')
          setReligion(p.religion || '')
          setReligionLevel(p.religious_level || '')
          setMaritalStatus(p.marital_status || '')
          setHeight(p.height || '')
          setIncome(p.monthly_income || '')
          setAboutMe(p.about_me || '')
          setHobbies(p.hobbies || '')
          setPartnerAgeMin(p.partner_age_min ? String(p.partner_age_min) : '')
          setPartnerAgeMax(p.partner_age_max ? String(p.partner_age_max) : '')
          setPartnerDistrict(p.partner_district || '')
          setPartnerEducation(p.partner_education || '')
          setPhotoPrivacy(p.photo_privacy || false)
          setDeactivated(p.is_deactivated || false)
        }
      })
  }, [])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const updates = {
        full_name: fullName,
        city, district: city,
        education, profession,
        religion,
        religious_level: religionLevel,
        marital_status: maritalStatus,
        height,
        monthly_income: income,
        about_me: aboutMe,
        hobbies,
        partner_age_min: partnerAgeMin ? parseInt(partnerAgeMin) : null,
        partner_age_max: partnerAgeMax ? parseInt(partnerAgeMax) : null,
        partner_district: partnerDistrict,
        partner_education: partnerEducation,
        photo_privacy: photoPrivacy,
        updated_at: new Date().toISOString()
      }

      const res = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, updates })
      })
      const result = await res.json()
      if (result.success) {
        // Update localStorage name
        const stored = localStorage.getItem('biyekori_user')
        if (stored) {
          const u = JSON.parse(stored)
          u.full_name = fullName
          localStorage.setItem('biyekori_user', JSON.stringify(u))
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch(e) {}
    setSaving(false)
  }

  if (!user) return null

  const inputClass = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:outline-none bg-white text-gray-900 text-sm"
  const labelClass = "block text-sm font-bold text-gray-700 mb-2"
  const sectionClass = "bg-white rounded-16px p-6 mb-4 shadow-sm border border-gray-100"

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'personal', label: 'Personal' },
    { id: 'partner', label: 'Partner Prefs' },
    { id: 'privacy', label: 'Privacy' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '80px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 16px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 800, color: '#111827' }}>Edit Profile</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>Keep your profile updated for better matches</p>
          </div>
          <button onClick={handleSave} disabled={saving} style={{
            padding: '10px 24px', background: saved ? '#10b981' : 'linear-gradient(135deg,#e11d48,#db2777)',
            color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer'
          }}>
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: activeTab === tab.id ? 'linear-gradient(135deg,#e11d48,#db2777)' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6b7280',
              fontSize: '12px', fontWeight: 700
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label className={labelClass}>Full Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass} placeholder="Your full name" />
              </div>
              <div>
                <label className={labelClass}>District</label>
                <select value={city} onChange={e => setCity(e.target.value)} className={inputClass}>
                  <option value="">Select District</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Education</label>
                <select value={education} onChange={e => setEducation(e.target.value)} className={inputClass}>
                  <option value="">Select</option>
                  {EDUCATIONS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Profession</label>
                <select value={profession} onChange={e => setProfession(e.target.value)} className={inputClass}>
                  <option value="">Select</option>
                  {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Marital Status</label>
                <select value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)} className={inputClass}>
                  <option value="">Select</option>
                  {MARITAL_STATUSES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className={labelClass}>About Me</label>
                <textarea value={aboutMe} onChange={e => setAboutMe(e.target.value)} className={inputClass} rows={4} placeholder="Write something about yourself, your values, and what you're looking for..." style={{ resize: 'vertical' }} />
              </div>
            </div>
          </div>
        )}

        {/* Personal Tab */}
        {activeTab === 'personal' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className={labelClass}>Religion</label>
                <select value={religion} onChange={e => setReligion(e.target.value)} className={inputClass}>
                  <option value="">Select</option>
                  {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Religiosity</label>
                <select value={religionLevel} onChange={e => setReligionLevel(e.target.value)} className={inputClass}>
                  <option value="">Select</option>
                  {RELIGION_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Height</label>
                <select value={height} onChange={e => setHeight(e.target.value)} className={inputClass}>
                  <option value="">Select</option>
                  {HEIGHTS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Monthly Income</label>
                <select value={income} onChange={e => setIncome(e.target.value)} className={inputClass}>
                  <option value="">Select</option>
                  {INCOMES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className={labelClass}>Hobbies & Interests</label>
                <input value={hobbies} onChange={e => setHobbies(e.target.value)} className={inputClass} placeholder="e.g. Reading, Cooking, Travel, Cricket" />
              </div>
            </div>
          </div>
        )}

        {/* Partner Preferences Tab */}
        {activeTab === 'partner' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6b7280' }}>These preferences improve your AI Match Score and help us suggest better profiles.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className={labelClass}>Partner Min Age</label>
                <select value={partnerAgeMin} onChange={e => setPartnerAgeMin(e.target.value)} className={inputClass}>
                  <option value="">Any</option>
                  {Array.from({length: 35}, (_, i) => i + 18).map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Partner Max Age</label>
                <select value={partnerAgeMax} onChange={e => setPartnerAgeMax(e.target.value)} className={inputClass}>
                  <option value="">Any</option>
                  {Array.from({length: 35}, (_, i) => i + 18).map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Preferred District</label>
                <select value={partnerDistrict} onChange={e => setPartnerDistrict(e.target.value)} className={inputClass}>
                  <option value="">Any District</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Minimum Education</label>
                <select value={partnerEducation} onChange={e => setPartnerEducation(e.target.value)} className={inputClass}>
                  <option value="">Any</option>
                  {EDUCATIONS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>Photo Privacy</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Only show my photo to people whose interest I accept</p>
              </div>
              <button onClick={() => setPhotoPrivacy(!photoPrivacy)} style={{
                width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer',
                background: photoPrivacy ? '#e11d48' : '#d1d5db', position: 'relative', transition: 'background 0.2s'
              }}>
                <span style={{ position: 'absolute', top: '3px', left: photoPrivacy ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: deactivated ? '#fff1f2' : '#f8fafc', borderRadius: '12px', border: `1px solid ${deactivated ? '#fecdd3' : '#e5e7eb'}` }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>Deactivate Profile</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Hide your profile from browse. You can reactivate anytime.</p>
              </div>
              <button onClick={() => setDeactivated(!deactivated)} style={{
                width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer',
                background: deactivated ? '#e11d48' : '#d1d5db', position: 'relative', transition: 'background 0.2s'
              }}>
                <span style={{ position: 'absolute', top: '3px', left: deactivated ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>

            <div style={{ padding: '16px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
              <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#92400e' }}>Want to delete your account?</p>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#92400e' }}>Email us at support@biyekori.com and we will delete all your data within 48 hours.</p>
              <a href="mailto:support@biyekori.com?subject=Account Deletion Request" style={{ fontSize: '13px', color: '#e11d48', fontWeight: 700 }}>Request Account Deletion</a>
            </div>
          </div>
        )}

        {/* Save button at bottom */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 1, padding: '14px', background: saved ? '#10b981' : 'linear-gradient(135deg,#e11d48,#db2777)',
            color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer'
          }}>
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
          <button onClick={() => router.push('/dashboard')} style={{
            padding: '14px 24px', background: 'white', color: '#6b7280',
            border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
          }}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  )
}
