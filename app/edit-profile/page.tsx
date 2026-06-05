"use client"
import VerificationTab from '@/components/VerificationTab'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FilesetResolver, FaceDetector } from '@mediapipe/tasks-vision'

const DISTRICTS = ['Dhaka','Chittagong','Rajshahi','Khulna','Barisal','Sylhet','Rangpur','Mymensingh','Comilla','Gazipur','Narayanganj','Narsingdi','Tangail','Jamalpur','Sherpur','Netrokona','Brahmanbaria','Chandpur','Lakshmipur','Noakhali','Feni',"Cox's Bazar",'Bandarban','Rangamati','Khagrachhari','Bogra','Chapainawabganj','Joypurhat','Naogaon','Natore','Pabna','Sirajganj','Jessore','Jhenaidah','Kushtia','Magura','Meherpur','Narail','Chuadanga','Satkhira','Bagerhat','Barguna','Bhola','Jhalokathi','Patuakhali','Pirojpur','Dinajpur','Gaibandha','Kurigram','Lalmonirhat','Nilphamari','Panchagarh','Thakurgaon','Habiganj','Moulvibazar','Sunamganj','Faridpur','Gopalganj','Madaripur','Rajbari','Shariatpur','Kishoreganj','Manikganj','Munshiganj']
const EDUCATIONS = ['SSC','HSC',"Bachelor's","Master's",'Medical','Engineering','Law','PhD','Diploma','Other']
const PROFESSIONS = ['Student','Doctor','Engineer','Teacher','Banker','Lawyer','Business','Government Officer','NGO Worker','Homemaker','IT Professional','Accountant','Military','Police','Other']
const RELIGIONS = ['Islam','Hinduism','Christianity','Buddhism','Other']
const RELIGION_LEVELS = ['Very Religious','Religious','Moderate','Liberal']
const MARITAL_STATUSES = ['Never married','Divorced','Widowed','Separated']
const HEIGHTS = ["4'6\"","4'8\"","4'10\"","4'11\"","5'0\"","5'1\"","5'2\"","5'3\"","5'4\"","5'5\"","5'6\"","5'7\"","5'8\"","5'9\"","5'10\"","5'11\"","6'0\"","6'1\"","6'2\""]
const INCOMES = ['Under ৳15,000','৳15,000–25,000','৳25,000–50,000','৳50,000–1,00,000','Over ৳1,00,000','Not specified']
const MARRIAGE_TIMELINES = ['Within 3 months','Within 6 months','Within 1 year','Within 2 years','Not decided yet']
const LIVING_ARRANGEMENTS = ['With in-laws','Nuclear family','Flexible','Depends on partner']
const WORK_AFTER_MARRIAGE = ['Will continue working','Will stop working','Depends on situation','Not decided']
const CONTACT_PREFERENCES = ['Self managed','Guardian first','Both acceptable']
const ENGLISH_COMFORTS = ['Basic','Conversational','Fluent','Native']
const MOTHER_TONGUES = ['Bangla','Chittagonian','Sylheti','Noakhali','Rajshahi dialect','Other']
const FAMILY_VALUES_OPTIONS = ['Conservative','Moderate','Liberal','Very Liberal']

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default function EditProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  // Basic fields
  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [education, setEducation] = useState('')
  const [profession, setProfession] = useState('')
  const [maritalStatus, setMaritalStatus] = useState('')
  const [aboutMe, setAboutMe] = useState('')

  // Personal fields
  const [religion, setReligion] = useState('')
  const [religionLevel, setReligionLevel] = useState('')
  const [height, setHeight] = useState('')
  const [income, setIncome] = useState('')
  const [hobbies, setHobbies] = useState('')

  // Lifestyle fields
  const [marriageTimeline, setMarriageTimeline] = useState('')
  const [livingArrangement, setLivingArrangement] = useState('')
  const [workAfterMarriage, setWorkAfterMarriage] = useState('')
  const [contactPreference, setContactPreference] = useState('')
  const [motherTongue, setMotherTongue] = useState('')
  const [englishComfort, setEnglishComfort] = useState('')
  const [smoking, setSmoking] = useState('false')
  const [drinking, setDrinking] = useState('false')
  const [diet, setDiet] = useState('')
  const [familyValues, setFamilyValues] = useState('')
  const [hasChildren, setHasChildren] = useState('false')
  const [willingToRelocate, setWillingToRelocate] = useState(false)

  // Partner preference fields
  const [partnerAgeMin, setPartnerAgeMin] = useState('')
  const [partnerAgeMax, setPartnerAgeMax] = useState('')
  const [partnerDistrict, setPartnerDistrict] = useState('')
  const [partnerEducation, setPartnerEducation] = useState('')
  const [expectedReligion, setExpectedReligion] = useState('')
  const [expectedMaritalStatus, setExpectedMaritalStatus] = useState('')
  const [expectedMarriageTimeline, setExpectedMarriageTimeline] = useState('')
  const [expectedLivingArrangement, setExpectedLivingArrangement] = useState('')
  const [expectedWorkAfterMarriage, setExpectedWorkAfterMarriage] = useState('')
  const [expectedContactPreference, setExpectedContactPreference] = useState('')
  const [expectedSmoking, setExpectedSmoking] = useState('')
  const [expectedDiet, setExpectedDiet] = useState('')
  const [expectedFamilyValues, setExpectedFamilyValues] = useState('')
  const [acceptsChildren, setAcceptsChildren] = useState(true)
  const [expectedReligiousLevel, setExpectedReligiousLevel] = useState('')

  // Privacy fields
  const [photoPrivacy, setPhotoPrivacy] = useState(false)
  const [deactivated, setDeactivated] = useState(false)
  const [guardianMode, setGuardianMode] = useState(false)

  // Photo states
  const [currentMainPhoto, setCurrentMainPhoto] = useState('')
  const [mainPhotoProcessing, setMainPhotoProcessing] = useState(false)
  const [mainPhotoPreview, setMainPhotoPreview] = useState('')
  const [mainPhotoFile, setMainPhotoFile] = useState<File | null>(null)
  const [mainPhotoSaving, setMainPhotoSaving] = useState(false)
  const [mainPhotoSaved, setMainPhotoSaved] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([])
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [galleryError, setGalleryError] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('biyekori_user')
    if (!stored) { router.push('/login'); return }
    const u = JSON.parse(stored)
    setUser(u)

    fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${u.id}&select=*`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    }).then(r => r.json()).then(data => {
      const p = Array.isArray(data) ? data[0] : data
      if (p) {
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
        setPhotoPrivacy(p.photo_privacy || false)
        setDeactivated(p.is_deactivated || false)
        setGuardianMode(p.guardian_mode || false)
        setCurrentMainPhoto(p.photo_url || '')
        // Lifestyle
        setMarriageTimeline(p.marriage_timeline || '')
        setLivingArrangement(p.living_arrangement || '')
        setWorkAfterMarriage(p.work_after_marriage || '')
        setContactPreference(p.contact_preference || '')
        setMotherTongue(p.mother_tongue || '')
        setEnglishComfort(p.english_comfort || '')
        setSmoking(p.smoking || 'false')
        setDrinking(p.drinking || 'false')
        setDiet(p.diet || '')
        setFamilyValues(p.family_values || '')
        setHasChildren(p.has_children || 'false')
        setWillingToRelocate(p.willing_to_relocate || false)
        // Partner prefs
        setPartnerAgeMin(p.expected_age_min ? String(p.expected_age_min) : '')
        setPartnerAgeMax(p.expected_age_max ? String(p.expected_age_max) : '')
        setPartnerDistrict(p.expected_districts || '')
        setPartnerEducation(p.expected_education || '')
        setExpectedReligion(p.expected_religion || '')
        setExpectedMaritalStatus(p.expected_marital_status || '')
        setExpectedMarriageTimeline(p.expected_marriage_timeline || '')
        setExpectedLivingArrangement(p.expected_living_arrangement || '')
        setExpectedWorkAfterMarriage(p.expected_work_after_marriage || '')
        setExpectedContactPreference(p.expected_contact_preference || '')
        setExpectedSmoking(p.expected_smoking || '')
        setExpectedDiet(p.expected_diet || '')
        setExpectedFamilyValues(p.expected_family_values || '')
        setAcceptsChildren(p.accepts_partner_with_children !== false)
        setExpectedReligiousLevel(p.expected_religious_level || '')
      }
    })

    fetch(`${SUPABASE_URL}/rest/v1/profile_photos?profile_id=eq.${u.id}&order=created_at.asc`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    }).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setGalleryPhotos(data)
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const updates = {
        full_name: fullName, city, district: city, education, profession,
        religion, religious_level: religionLevel, marital_status: maritalStatus,
        height, about_me: aboutMe, photo_privacy: photoPrivacy,
        hobbies, family_values: familyValues,
        guardian_mode: guardianMode,
        // Lifestyle
        marriage_timeline: marriageTimeline, living_arrangement: livingArrangement,
        work_after_marriage: workAfterMarriage, contact_preference: contactPreference,
        mother_tongue: motherTongue, english_comfort: englishComfort,
        smoking, drinking, diet, has_children: hasChildren,
        willing_to_relocate: willingToRelocate,
        // Partner prefs
        expected_age_min: partnerAgeMin ? parseInt(partnerAgeMin) : null,
        expected_age_max: partnerAgeMax ? parseInt(partnerAgeMax) : null,
        expected_districts: partnerDistrict, expected_education: partnerEducation,
        expected_religion: expectedReligion, expected_marital_status: expectedMaritalStatus,
        expected_marriage_timeline: expectedMarriageTimeline,
        expected_living_arrangement: expectedLivingArrangement,
        expected_work_after_marriage: expectedWorkAfterMarriage,
        expected_contact_preference: expectedContactPreference,
        expected_smoking: expectedSmoking, expected_diet: expectedDiet,
        expected_family_values: expectedFamilyValues,
        accepts_partner_with_children: acceptsChildren,
        expected_religious_level: expectedReligiousLevel,
      }
      const res = await fetch('/api/update-profile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, updates })
      })
      const result = await res.json()
      if (result.success) {
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

  // Main photo AI crop
  const handleMainPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMainPhotoPreview(''); setMainPhotoFile(null); setMainPhotoProcessing(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const imageUrl = event.target?.result as string
      try {
        const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm')
        const faceDetector = await FaceDetector.createFromOptions(vision, {
          baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite', delegate: 'GPU' },
          runningMode: 'IMAGE'
        })
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = async () => {
          const detections = faceDetector.detect(img)
          const canvas = canvasRef.current
          if (!canvas) return
          const ctx = canvas.getContext('2d')
          if (!ctx) return
          canvas.width = 500; canvas.height = 500
          if (detections.detections.length > 0) {
            const face = detections.detections[0].boundingBox
            if (face) {
              const padding = 0.3
              const paddedWidth = face.width * (1 + padding)
              const paddedHeight = face.height * (1 + padding)
              const x = Math.max(0, face.originX - (paddedWidth - face.width) / 2)
              const y = Math.max(0, face.originY - (paddedHeight - face.height) / 2)
              const size = Math.min(Math.min(paddedWidth, img.width - x), Math.min(paddedHeight, img.height - y))
              ctx.drawImage(img, x, y, size, size, 0, 0, 500, 500)
            } else { const size = Math.min(img.width, img.height); ctx.drawImage(img, (img.width-size)/2, (img.height-size)/2, size, size, 0, 0, 500, 500) }
          } else { const size = Math.min(img.width, img.height); ctx.drawImage(img, (img.width-size)/2, (img.height-size)/2, size, size, 0, 0, 500, 500) }
          const croppedUrl = canvas.toDataURL('image/jpeg', 0.9)
          setMainPhotoPreview(croppedUrl); setMainPhotoProcessing(false)
          canvas.toBlob((blob) => { if (blob) setMainPhotoFile(new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' })) }, 'image/jpeg', 0.9)
        }
        img.src = imageUrl
      } catch (err) { setMainPhotoProcessing(false); alert('Face detection failed. Please try another photo.') }
    }
    reader.readAsDataURL(file)
  }

  const handleMainPhotoSave = async () => {
    if (!mainPhotoFile || !user) return
    setMainPhotoSaving(true)
    try {
      const fileName = `${user.id}/main-${Date.now()}.jpg`
      const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/profile-photos/${fileName}`, {
        method: 'POST', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
        body: mainPhotoFile
      })
      if (!uploadRes.ok) throw new Error('Upload failed')
      const photoUrl = `${SUPABASE_URL}/storage/v1/object/public/profile-photos/${fileName}`
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`, {
        method: 'PATCH', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ photo_url: photoUrl })
      })
      const stored = localStorage.getItem('biyekori_user')
      if (stored) { const u = JSON.parse(stored); u.photo_url = photoUrl; localStorage.setItem('biyekori_user', JSON.stringify(u)) }
      setCurrentMainPhoto(photoUrl); setMainPhotoPreview(''); setMainPhotoFile(null)
      setMainPhotoSaved(true); setTimeout(() => setMainPhotoSaved(false), 3000)
    } catch (err) { alert('Failed to save photo. Please try again.') }
    setMainPhotoSaving(false)
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length || !user) return
    const remaining = 8 - galleryPhotos.length
    if (remaining <= 0) { setGalleryError('Maximum 8 gallery photos reached.'); return }
    const toUpload = files.slice(0, remaining)
    setGalleryError(''); setGalleryUploading(true)
    for (const file of toUpload) {
      try {
        const fileName = `${user.id}/gallery-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
        const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/profile-photos/${fileName}`, {
          method: 'POST', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': file.type || 'image/jpeg', 'x-upsert': 'true' },
          body: file
        })
        if (!uploadRes.ok) continue
        const photoUrl = `${SUPABASE_URL}/storage/v1/object/public/profile-photos/${fileName}`
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/profile_photos`, {
          method: 'POST', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
          body: JSON.stringify({ profile_id: Number(user.id), photo_url: photoUrl, order_index: galleryPhotos.length, is_primary: false })
        })
        const inserted = await insertRes.json()
        if (Array.isArray(inserted) && inserted[0]) setGalleryPhotos(prev => [...prev, inserted[0]])
        else setGalleryPhotos(prev => [...prev, { photo_url: photoUrl, profile_id: user.id }])
      } catch (err) {}
    }
    setGalleryUploading(false); e.target.value = ''
  }

  const handleGalleryDelete = async (photoId: string) => {
    if (!user) return
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/profile_photos?id=eq.${photoId}`, {
        method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      })
      setGalleryPhotos(prev => prev.filter(p => p.id !== photoId))
    } catch (err) {}
  }

  if (!user) return null

  const inputClass = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:outline-none bg-white text-gray-900 text-sm"
  const labelClass = "block text-sm font-bold text-gray-700 mb-2"

  // Guardian Mode: simplified labels
  const gm = guardianMode

  const tabs = [
    { id: 'basic', label: gm ? 'মূল তথ্য' : 'Basic Info' },
    { id: 'photos', label: gm ? 'ছবি' : 'Photos' },
    { id: 'personal', label: gm ? 'ব্যক্তিগত' : 'Personal' },
    { id: 'lifestyle', label: gm ? 'জীবনধারা' : 'Lifestyle' },
    { id: 'partner', label: gm ? 'পাত্র/পাত্রী' : 'Partner Prefs' },
    { id: 'verification', label: gm ? 'যাচাই' : 'Verification' },
    { id: 'privacy', label: gm ? 'গোপনীয়তা' : 'Privacy' },
  ]

  // Guardian Mode font size modifier
  const gmFontStyle = gm ? { fontSize: '16px', lineHeight: '1.6' } : {}

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '80px', paddingBottom: '60px' }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 16px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: '0 0 4px', fontSize: gm ? '28px' : '24px', fontWeight: 800, color: '#111827' }}>
                {gm ? 'প্রোফাইল সম্পাদনা' : 'Edit Profile'}
              </h1>
              {guardianMode && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: 'white', fontSize: '11px', fontWeight: 700,
                  padding: '3px 10px', borderRadius: '20px',
                  boxShadow: '0 2px 8px rgba(124,58,237,0.35)'
                }}>
                  পরিবার পরিচালিত
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: gm ? '14px' : '13px', color: '#9ca3af' }}>
              {gm ? 'আপনার প্রোফাইল আপডেট রাখুন' : 'Keep your profile updated for better matches'}
            </p>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: saved ? '#10b981' : 'linear-gradient(135deg,#e11d48,#db2777)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
            {saving ? (gm ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : saved ? (gm ? 'সংরক্ষিত!' : 'Saved!') : (gm ? 'সংরক্ষণ করুন' : 'Save Changes')}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: activeTab === tab.id ? 'linear-gradient(135deg,#e11d48,#db2777)' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6b7280',
              fontSize: gm ? '12px' : '11px', fontWeight: 700, whiteSpace: 'nowrap'
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* BASIC TAB */}
        {activeTab === 'basic' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'পূর্ণ নাম' : 'Full Name'}</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass} style={gmFontStyle} placeholder={gm ? 'আপনার পূর্ণ নাম' : 'Your full name'} />
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'জেলা' : 'District'}</label>
                <select value={city} onChange={e => setCity(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'জেলা বেছে নিন' : 'Select District'}</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'শিক্ষাগত যোগ্যতা' : 'Education'}</label>
                <select value={education} onChange={e => setEducation(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'বেছে নিন' : 'Select'}</option>
                  {EDUCATIONS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'পেশা' : 'Profession'}</label>
                <select value={profession} onChange={e => setProfession(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'বেছে নিন' : 'Select'}</option>
                  {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'বৈবাহিক অবস্থা' : 'Marital Status'}</label>
                <select value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'বেছে নিন' : 'Select'}</option>
                  {MARITAL_STATUSES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'নিজের সম্পর্কে' : 'About Me'}</label>
                <textarea value={aboutMe} onChange={e => setAboutMe(e.target.value)} className={inputClass} rows={4} placeholder={gm ? 'নিজের সম্পর্কে কিছু লিখুন...' : 'Write something about yourself...'} style={{ resize: 'vertical', ...gmFontStyle }} />
              </div>
            </div>
          </div>
        )}

        {/* PHOTOS TAB */}
        {activeTab === 'photos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: gm ? '17px' : '15px', fontWeight: 800, color: '#111827' }}>{gm ? 'মূল প্রোফাইল ছবি' : 'Main Profile Photo'}</h3>
              <p style={{ margin: '0 0 20px', fontSize: gm ? '13px' : '12px', color: '#9ca3af' }}>{gm ? 'AI স্বয়ংক্রিয়ভাবে মুখ ক্রপ করে।' : 'AI automatically crops to your face.'}</p>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{gm ? 'বর্তমান' : 'Current'}</p>
                  {currentMainPhoto ? <img src={currentMainPhoto} alt="Current" style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #e5e7eb' }} />
                    : <div style={{ width: '100px', height: '100px', borderRadius: '12px', background: '#f3f4f6', border: '2px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>?</div>}
                </div>
                {mainPhotoPreview && <>
                  <div style={{ display: 'flex', alignItems: 'center', paddingTop: '36px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, color: '#10b981', textTransform: 'uppercase' }}>{gm ? 'নতুন প্রিভিউ' : 'New Preview'}</p>
                    <img src={mainPhotoPreview} alt="Preview" style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #10b981' }} />
                  </div>
                </>}
                {mainPhotoProcessing && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '36px' }}>
                  <div style={{ width: '16px', height: '16px', border: '2px solid #e11d48', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span style={{ fontSize: gm ? '14px' : '13px', color: '#6b7280' }}>{gm ? 'AI মুখ শনাক্ত করছে...' : 'AI detecting face...'}</span>
                </div>}
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <label style={{ cursor: 'pointer' }}>
                  <div style={{ padding: '10px 20px', background: '#f8fafc', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: gm ? '14px' : '13px', fontWeight: 700, color: '#374151', display: 'inline-block' }}>{gm ? 'ছবি বেছে নিন' : 'Choose Photo'}</div>
                  <input type="file" accept="image/*" onChange={handleMainPhotoSelect} style={{ display: 'none' }} />
                </label>
                {mainPhotoFile && <button onClick={handleMainPhotoSave} disabled={mainPhotoSaving} style={{ padding: '10px 20px', background: mainPhotoSaved ? '#10b981' : 'linear-gradient(135deg,#e11d48,#db2777)', color: 'white', border: 'none', borderRadius: '10px', fontSize: gm ? '14px' : '13px', fontWeight: 700, cursor: 'pointer' }}>
                  {mainPhotoSaving ? (gm ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : mainPhotoSaved ? (gm ? 'সংরক্ষিত!' : 'Saved!') : (gm ? 'মূল ছবি হিসেবে সংরক্ষণ' : 'Save as Main Photo')}
                </button>}
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: gm ? '17px' : '15px', fontWeight: 800, color: '#111827' }}>{gm ? 'গ্যালারি ছবি' : 'Gallery Photos'}</h3>
                <span style={{ fontSize: '12px', fontWeight: 700, color: galleryPhotos.length >= 8 ? '#e11d48' : '#9ca3af' }}>{galleryPhotos.length}/8</span>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: gm ? '13px' : '12px', color: '#9ca3af' }}>{gm ? 'পূর্ণ শরীর বা পরিবারের ছবি। সর্বোচ্চ ৮টি।' : 'Full body, candid or family photos. Max 8.'}</p>
              {galleryError && <div style={{ padding: '10px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', fontSize: '13px', color: '#e11d48', marginBottom: '16px' }}>{galleryError}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
                {galleryPhotos.map((photo: any) => (
                  <div key={photo.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                    <img src={photo.photo_url} alt="Gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={() => handleGalleryDelete(photo.id)} style={{ position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                ))}
                {galleryPhotos.length < 8 && <label style={{ cursor: galleryUploading ? 'not-allowed' : 'pointer', aspectRatio: '1' }}>
                  <div style={{ width: '100%', height: '100%', border: '2px dashed #d1d5db', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', minHeight: '80px' }}>
                    {galleryUploading ? <div style={{ width: '20px', height: '20px', border: '2px solid #e11d48', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      : <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg><span style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px', fontWeight: 600 }}>{gm ? 'যোগ করুন' : 'Add'}</span></>}
                  </div>
                  <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} style={{ display: 'none' }} disabled={galleryUploading} />
                </label>}
              </div>
            </div>
          </div>
        )}

        {/* PERSONAL TAB */}
        {activeTab === 'personal' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'ধর্ম' : 'Religion'}</label>
                <select value={religion} onChange={e => setReligion(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'বেছে নিন' : 'Select'}</option>
                  {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'ধার্মিকতার মাত্রা' : 'Religiosity'}</label>
                <select value={religionLevel} onChange={e => setReligionLevel(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'বেছে নিন' : 'Select'}</option>
                  {RELIGION_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'উচ্চতা' : 'Height'}</label>
                <select value={height} onChange={e => setHeight(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'বেছে নিন' : 'Select'}</option>
                  {HEIGHTS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'মাসিক আয়' : 'Monthly Income'}</label>
                <select value={income} onChange={e => setIncome(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'বেছে নিন' : 'Select'}</option>
                  {INCOMES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'শখ ও আগ্রহ' : 'Hobbies & Interests'}</label>
                <input value={hobbies} onChange={e => setHobbies(e.target.value)} className={inputClass} style={gmFontStyle} placeholder={gm ? 'যেমন: পড়া, রান্না, ভ্রমণ, ক্রিকেট' : 'e.g. Reading, Cooking, Travel, Cricket'} />
              </div>
            </div>
          </div>
        )}

        {/* LIFESTYLE TAB */}
        {activeTab === 'lifestyle' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ margin: '0 0 20px', fontSize: gm ? '14px' : '13px', color: '#6b7280' }}>{gm ? 'সব তথ্য ঐচ্ছিক। যত বেশি পূরণ করবেন, ম্যাচ তত ভালো।' : 'All fields are optional. The more you fill, the better your matches.'}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'বিয়ের সময়সীমা' : 'Marriage Timeline'}</label>
                <select value={marriageTimeline} onChange={e => setMarriageTimeline(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'বেছে নিন' : 'Select'}</option>
                  {MARRIAGE_TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'বাসস্থান ব্যবস্থা' : 'Living Arrangement'}</label>
                <select value={livingArrangement} onChange={e => setLivingArrangement(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'বেছে নিন' : 'Select'}</option>
                  {LIVING_ARRANGEMENTS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'বিয়ের পর কাজ' : 'Work After Marriage'}</label>
                <select value={workAfterMarriage} onChange={e => setWorkAfterMarriage(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'বেছে নিন' : 'Select'}</option>
                  {WORK_AFTER_MARRIAGE.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'যোগাযোগের পছন্দ' : 'Contact Preference'}</label>
                <select value={contactPreference} onChange={e => setContactPreference(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'বেছে নিন' : 'Select'}</option>
                  {CONTACT_PREFERENCES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'মাতৃভাষা' : 'Mother Tongue'}</label>
                <select value={motherTongue} onChange={e => setMotherTongue(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'বেছে নিন' : 'Select'}</option>
                  {MOTHER_TONGUES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'ইংরেজি দক্ষতা' : 'English Comfort'}</label>
                <select value={englishComfort} onChange={e => setEnglishComfort(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'বেছে নিন' : 'Select'}</option>
                  {ENGLISH_COMFORTS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'ধূমপান' : 'Smoking'}</label>
                <select value={smoking} onChange={e => setSmoking(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="false">{gm ? 'না' : 'No'}</option>
                  <option value="occasionally">{gm ? 'মাঝে মাঝে' : 'Occasionally'}</option>
                  <option value="true">{gm ? 'হ্যাঁ' : 'Yes'}</option>
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'খাদ্যাভ্যাস' : 'Diet'}</label>
                <select value={diet} onChange={e => setDiet(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'বেছে নিন' : 'Select'}</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Halal only">Halal only</option>
                  <option value="No restriction">No restriction</option>
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'পারিবারিক মূল্যবোধ' : 'Family Values'}</label>
                <select value={familyValues} onChange={e => setFamilyValues(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'বেছে নিন' : 'Select'}</option>
                  {FAMILY_VALUES_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'সন্তান আছে?' : 'Have Children'}</label>
                <select value={hasChildren} onChange={e => setHasChildren(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="false">{gm ? 'না' : 'No'}</option>
                  <option value="living_with">{gm ? 'হ্যাঁ, আমার সাথে থাকে' : 'Yes, living with me'}</option>
                  <option value="not_living_with">{gm ? 'হ্যাঁ, আলাদা থাকে' : 'Yes, not living with me'}</option>
                  <option value="sometimes">{gm ? 'হ্যাঁ, মাঝে মাঝে' : 'Yes, sometimes with me'}</option>
                </select>
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: gm ? '16px' : '14px', fontWeight: 700, color: '#111827' }}>{gm ? 'স্থানান্তরে ইচ্ছুক' : 'Willing to Relocate'}</p>
                  <p style={{ margin: 0, fontSize: gm ? '13px' : '12px', color: '#6b7280' }}>{gm ? 'বিয়ের পর অন্য জায়গায় যেতে রাজি' : 'Open to moving after marriage'}</p>
                </div>
                <button onClick={() => setWillingToRelocate(!willingToRelocate)} style={{ width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', background: willingToRelocate ? '#e11d48' : '#d1d5db', position: 'relative', transition: 'background 0.2s' }}>
                  <span style={{ position: 'absolute', top: '3px', left: willingToRelocate ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PARTNER PREFS TAB */}
        {activeTab === 'partner' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ margin: '0 0 20px', fontSize: gm ? '14px' : '13px', color: '#6b7280' }}>{gm ? 'এই তথ্যগুলো AI ম্যাচ স্কোর উন্নত করে। সব ঐচ্ছিক।' : 'These preferences improve your AI Match Score. All optional.'}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'পাত্র/পাত্রীর ন্যূনতম বয়স' : 'Partner Min Age'}</label>
                <select value={partnerAgeMin} onChange={e => setPartnerAgeMin(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'যেকোনো' : 'Any'}</option>
                  {Array.from({length: 48}, (_, i) => i + 18).map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'পাত্র/পাত্রীর সর্বোচ্চ বয়স' : 'Partner Max Age'}</label>
                <select value={partnerAgeMax} onChange={e => setPartnerAgeMax(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'যেকোনো' : 'Any'}</option>
                  {Array.from({length: 48}, (_, i) => i + 18).map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'পছন্দের জেলা' : 'Preferred District'}</label>
                <select value={partnerDistrict} onChange={e => setPartnerDistrict(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'যেকোনো জেলা' : 'Any District'}</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'ন্যূনতম শিক্ষাগত যোগ্যতা' : 'Minimum Education'}</label>
                <select value={partnerEducation} onChange={e => setPartnerEducation(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'যেকোনো' : 'Any'}</option>
                  {EDUCATIONS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'পছন্দের ধর্ম' : 'Expected Religion'}</label>
                <select value={expectedReligion} onChange={e => setExpectedReligion(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'যেকোনো' : 'Any'}</option>
                  {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'পছন্দের ধার্মিকতা' : 'Expected Religiosity'}</label>
                <select value={expectedReligiousLevel} onChange={e => setExpectedReligiousLevel(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'যেকোনো' : 'Any'}</option>
                  {RELIGION_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'গৃহীত বৈবাহিক অবস্থা' : 'Accepted Marital Status'} <span style={{fontSize:'11px',color:'#9ca3af',fontWeight:400}}>{gm ? '(একাধিক বেছে নিন)' : '(select all that apply)'}</span></label>
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginTop:'4px'}}>
                  {MARITAL_STATUSES.map(m => (
                    <label key={m} style={{display:'flex',alignItems:'center',gap:'6px',padding:'6px 12px',border:`2px solid ${expectedMaritalStatus.includes(m) ? '#e11d48' : '#e5e7eb'}`,borderRadius:'8px',cursor:'pointer',background:expectedMaritalStatus.includes(m) ? '#fff1f2' : 'white',fontSize: gm ? '14px' : '13px',fontWeight:expectedMaritalStatus.includes(m) ? 700 : 400,color:expectedMaritalStatus.includes(m) ? '#e11d48' : '#374151'}}>
                      <input type="checkbox" checked={expectedMaritalStatus.includes(m)} onChange={e => {
                        const current = expectedMaritalStatus ? expectedMaritalStatus.split(',').filter(Boolean) : []
                        if (e.target.checked) setExpectedMaritalStatus([...current, m].join(','))
                        else setExpectedMaritalStatus(current.filter(x => x !== m).join(','))
                      }} style={{display:'none'}} />
                      {m}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'পছন্দের বিয়ের সময়সীমা' : 'Expected Marriage Timeline'}</label>
                <select value={expectedMarriageTimeline} onChange={e => setExpectedMarriageTimeline(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'যেকোনো' : 'Any'}</option>
                  {MARRIAGE_TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'পছন্দের বাসস্থান' : 'Expected Living Arrangement'}</label>
                <select value={expectedLivingArrangement} onChange={e => setExpectedLivingArrangement(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'যেকোনো' : 'Any'}</option>
                  {LIVING_ARRANGEMENTS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'বিয়ের পর কাজ (পাত্র/পাত্রী)' : 'Partner Work After Marriage'}</label>
                <select value={expectedWorkAfterMarriage} onChange={e => setExpectedWorkAfterMarriage(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'যেকোনো' : 'Any'}</option>
                  {WORK_AFTER_MARRIAGE.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'যোগাযোগের পছন্দ' : 'Contact Preference'}</label>
                <select value={expectedContactPreference} onChange={e => setExpectedContactPreference(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'যেকোনো' : 'Any'}</option>
                  {CONTACT_PREFERENCES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'ধূমপানের পছন্দ' : 'Smoking Preference'}</label>
                <select value={expectedSmoking} onChange={e => setExpectedSmoking(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'কোনো পছন্দ নেই' : 'No preference'}</option>
                  <option value="no">{gm ? 'অধূমপায়ী চাই' : 'Non-smoker only'}</option>
                  <option value="occasionally">{gm ? 'মাঝে মাঝে চলবে' : 'Occasionally OK'}</option>
                  <option value="any">{gm ? 'যেকোনো' : 'Any'}</option>
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'খাদ্যাভ্যাসের পছন্দ' : 'Diet Preference'}</label>
                <select value={expectedDiet} onChange={e => setExpectedDiet(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'কোনো পছন্দ নেই' : 'No preference'}</option>
                  <option value="Halal only">Halal only</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="No restriction">No restriction</option>
                </select>
              </div>
              <div>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'পারিবারিক মূল্যবোধ' : 'Family Values'}</label>
                <select value={expectedFamilyValues} onChange={e => setExpectedFamilyValues(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'যেকোনো' : 'Any'}</option>
                  {FAMILY_VALUES_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: gm ? '16px' : '14px', fontWeight: 700, color: '#111827' }}>{gm ? 'সন্তানসহ পাত্র/পাত্রী গ্রহণযোগ্য' : 'Accepts Partner With Children'}</p>
                  <p style={{ margin: 0, fontSize: gm ? '13px' : '12px', color: '#6b7280' }}>{gm ? 'সন্তান আছে এমন পাত্র/পাত্রী গ্রহণযোগ্য' : 'Open to partners who have children'}</p>
                </div>
                <button onClick={() => setAcceptsChildren(!acceptsChildren)} style={{ width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', background: acceptsChildren ? '#e11d48' : '#d1d5db', position: 'relative', transition: 'background 0.2s' }}>
                  <span style={{ position: 'absolute', top: '3px', left: acceptsChildren ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VERIFICATION TAB */}
        {activeTab === 'verification' && user && (
          <VerificationTab user={user} profile={{ full_name: fullName, selfie_status: (user as any).selfie_status, education_verified: false, job_verified: false }} onUpdate={() => {}} />
        )}

        {/* PRIVACY TAB */}
        {activeTab === 'privacy' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Guardian Mode — top of privacy, most prominent */}
            <div style={{
              padding: '20px',
              background: guardianMode
                ? 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(168,85,247,0.08))'
                : '#f8fafc',
              borderRadius: '14px',
              border: `2px solid ${guardianMode ? '#a855f7' : '#e5e7eb'}`,
              transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '18px' }}>👨‍👩‍👧</span>
                    <p style={{ margin: 0, fontSize: gm ? '17px' : '15px', fontWeight: 800, color: '#111827' }}>
                      {gm ? 'পরিবার পরিচালিত মোড' : 'Guardian Mode'}
                    </p>
                    {guardianMode && (
                      <span style={{
                        fontSize: '10px', fontWeight: 700, color: '#7c3aed',
                        background: '#ede9fe', padding: '2px 8px', borderRadius: '20px'
                      }}>চালু</span>
                    )}
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: gm ? '14px' : '13px', color: '#6b7280', lineHeight: '1.5' }}>
                    {gm
                      ? 'এই প্রোফাইলটি পরিবারের পক্ষ থেকে পরিচালিত হচ্ছে। প্রোফাইল কার্ডে "পরিবার পরিচালিত" ব্যাজ দেখাবে।'
                      : 'This profile is managed by a family member or guardian. A "Family Managed" badge will appear on your profile card.'}
                  </p>
                  {guardianMode && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', padding: '8px 12px', background: 'white', borderRadius: '8px', border: '1px solid #e9d5ff', width: 'fit-content' }}>
                      <span style={{ fontSize: '13px' }}>👨‍👩‍👧</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#7c3aed' }}>পরিবার পরিচালিত</span>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>{gm ? '— ব্যাজটি এভাবে দেখাবে' : '— badge preview'}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setGuardianMode(!guardianMode)}
                  style={{
                    width: '52px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                    background: guardianMode ? '#7c3aed' : '#d1d5db',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0
                  }}
                >
                  <span style={{
                    position: 'absolute', top: '4px',
                    left: guardianMode ? '27px' : '4px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: 'white', transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </button>
              </div>
            </div>

            {/* Photo Privacy */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: gm ? '16px' : '14px', fontWeight: 700, color: '#111827' }}>{gm ? 'ছবির গোপনীয়তা' : 'Photo Privacy'}</p>
                <p style={{ margin: 0, fontSize: gm ? '13px' : '12px', color: '#6b7280' }}>{gm ? 'শুধুমাত্র গৃহীত আগ্রহের মানুষরা ছবি দেখতে পাবে' : 'Only show my photo to people whose interest I accept'}</p>
              </div>
              <button onClick={() => setPhotoPrivacy(!photoPrivacy)} style={{ width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', background: photoPrivacy ? '#e11d48' : '#d1d5db', position: 'relative', transition: 'background 0.2s' }}>
                <span style={{ position: 'absolute', top: '3px', left: photoPrivacy ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>

            {/* Deactivate */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: deactivated ? '#fff1f2' : '#f8fafc', borderRadius: '12px', border: `1px solid ${deactivated ? '#fecdd3' : '#e5e7eb'}` }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: gm ? '16px' : '14px', fontWeight: 700, color: '#111827' }}>{gm ? 'প্রোফাইল নিষ্ক্রিয় করুন' : 'Deactivate Profile'}</p>
                <p style={{ margin: 0, fontSize: gm ? '13px' : '12px', color: '#6b7280' }}>{gm ? 'প্রোফাইল লুকান। যেকোনো সময় পুনরায় সক্রিয় করা যাবে।' : 'Hide your profile from browse. You can reactivate anytime.'}</p>
              </div>
              <button onClick={() => setDeactivated(!deactivated)} style={{ width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', background: deactivated ? '#e11d48' : '#d1d5db', position: 'relative', transition: 'background 0.2s' }}>
                <span style={{ position: 'absolute', top: '3px', left: deactivated ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>

            {/* Delete account */}
            <div style={{ padding: '16px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
              <p style={{ margin: '0 0 4px', fontSize: gm ? '16px' : '14px', fontWeight: 700, color: '#92400e' }}>{gm ? 'অ্যাকাউন্ট মুছে ফেলতে চান?' : 'Want to delete your account?'}</p>
              <p style={{ margin: '0 0 12px', fontSize: gm ? '13px' : '12px', color: '#92400e' }}>{gm ? 'support@biyekori.com-এ ইমেইল করুন। ৪৮ ঘণ্টার মধ্যে আপনার সব তথ্য মুছে ফেলা হবে।' : 'Email us at support@biyekori.com and we will delete all your data within 48 hours.'}</p>
              <a href="mailto:support@biyekori.com?subject=Account Deletion Request" style={{ fontSize: gm ? '14px' : '13px', color: '#e11d48', fontWeight: 700 }}>{gm ? 'অ্যাকাউন্ট মুছে ফেলার অনুরোধ করুন' : 'Request Account Deletion'}</a>
            </div>
          </div>
        )}

        {/* Save button */}
        {activeTab !== 'photos' && (
          <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '14px', background: saved ? '#10b981' : 'linear-gradient(135deg,#e11d48,#db2777)', color: 'white', border: 'none', borderRadius: '12px', fontSize: gm ? '16px' : '15px', fontWeight: 700, cursor: 'pointer' }}>
              {saving ? (gm ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : saved ? (gm ? 'সংরক্ষিত!' : 'Saved!') : (gm ? 'সংরক্ষণ করুন' : 'Save Changes')}
            </button>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '14px 24px', background: 'white', color: '#6b7280', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: gm ? '15px' : '14px', fontWeight: 600, cursor: 'pointer' }}>
              {gm ? 'বাতিল' : 'Cancel'}
            </button>
          </div>
        )}

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
