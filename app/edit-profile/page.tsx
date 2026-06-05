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
const CONTACT_PREFERENCES = ['Self managed','Guardian first','Both acceptable']
const MOTHER_TONGUES = ['Bangla','Chittagonian','Sylheti','Noakhali','Rajshahi dialect','Other']
const ENGLISH_COMFORTS = ['Basic','Conversational','Fluent','Native']

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type Priority = 'flexible' | 'prefer' | 'must'

function PrioritySelector({ value, onChange, mustMatchCount }: {
  value: Priority
  onChange: (v: Priority) => void
  mustMatchCount: number
}) {
  const options: { val: Priority; label: string; color: string; bg: string }[] = [
    { val: 'flexible', label: 'Flexible', color: '#6b7280', bg: '#f3f4f6' },
    { val: 'prefer', label: 'Prefer', color: '#0ea5e9', bg: '#e0f2fe' },
    { val: 'must', label: 'Must Match', color: '#e11d48', bg: '#fff1f2' },
  ]
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {options.map(opt => {
        const active = value === opt.val
        const disabled = opt.val === 'must' && value !== 'must' && mustMatchCount >= 5
        return (
          <button key={opt.val} type="button"
            onClick={() => !disabled && onChange(opt.val)}
            title={disabled ? 'Maximum 5 Must Match selections allowed' : ''}
            style={{
              padding: '4px 8px', borderRadius: '6px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
              background: active ? opt.bg : 'transparent',
              color: active ? opt.color : '#9ca3af',
              fontSize: '10px', fontWeight: active ? 700 : 500,
              outline: active ? `1.5px solid ${opt.color}` : '1.5px solid transparent',
              opacity: disabled ? 0.4 : 1, transition: 'all 0.15s'
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} type="button" style={{ width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', background: value ? '#e11d48' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: '3px', left: value ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </button>
  )
}

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
  const [motherTongue, setMotherTongue] = useState('')
  const [englishComfort, setEnglishComfort] = useState('')

  // Personal fields
  const [religion, setReligion] = useState('')
  const [religionLevel, setReligionLevel] = useState('')
  const [height, setHeight] = useState('')
  const [income, setIncome] = useState('')
  const [hobbies, setHobbies] = useState('')
  const [hasChildren, setHasChildren] = useState('false')

  // Lifestyle fields
  const [marriageTimeline, setMarriageTimeline] = useState('')
  const [livingArrangement, setLivingArrangement] = useState('')
  const [workAfterMarriage, setWorkAfterMarriage] = useState('')
  const [smoking, setSmoking] = useState('false')
  const [drinking, setDrinking] = useState('false') // reused for vaping
  const [diet, setDiet] = useState('')
  const [familyValues, setFamilyValues] = useState('')
  const [willingToRelocate, setWillingToRelocate] = useState(false)
  const [showMoreLifestyle, setShowMoreLifestyle] = useState(false)

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
  const [acceptsChildren, setAcceptsChildren] = useState<any>(true)
  const [expectedReligiousLevel, setExpectedReligiousLevel] = useState('')

  // Priority selectors
  const [priorityReligion, setPriorityReligion] = useState<Priority>('flexible')
  const [priorityLocation, setPriorityLocation] = useState<Priority>('flexible')
  const [priorityChildren, setPriorityChildren] = useState<Priority>('flexible')
  const [priorityLiving, setPriorityLiving] = useState<Priority>('flexible')
  const [prioritySmoking, setPrioritySmoking] = useState<Priority>('flexible')
  const [priorityCareer, setPriorityCareer] = useState<Priority>('flexible')
  const [showOptional, setShowOptional] = useState(false)

  const mustMatchCount = [priorityReligion, priorityLocation, priorityChildren, priorityLiving, prioritySmoking, priorityCareer].filter(p => p === 'must').length

  // Privacy fields
  const [photoPrivacy, setPhotoPrivacy] = useState(false)
  const [incomeHidden, setIncomeHidden] = useState(false)
  const [dobPrivacy, setDobPrivacy] = useState('age_only')
  const [contactMinAge, setContactMinAge] = useState(18)
  const [contactMaxAge, setContactMaxAge] = useState(60)
  const [contactReligion, setContactReligion] = useState('any')
  const [smsOnMutual, setSmsOnMutual] = useState(true)
  const [deactivated, setDeactivated] = useState(false)
  const [guardianMode, setGuardianMode] = useState(false)
  const [contactPreference, setContactPreference] = useState('')

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
        setMotherTongue(p.mother_tongue || '')
        setEnglishComfort(p.english_comfort || '')
        setHasChildren(p.has_children || 'false')
        setPhotoPrivacy(p.photo_privacy || false)
        setIncomeHidden(p.income_hidden || false)
        setDobPrivacy(p.dob_privacy || 'age_only')
        setContactMinAge(p.contact_min_age || 18)
        setContactMaxAge(p.contact_max_age || 60)
        setContactReligion(p.contact_religion || 'any')
        setSmsOnMutual(p.sms_on_mutual !== false)
        setDeactivated(p.is_deactivated || false)
        setGuardianMode(p.guardian_mode || false)
        setCurrentMainPhoto(p.photo_url || '')
        setContactPreference(p.contact_preference || '')
        setMarriageTimeline(p.marriage_timeline || '')
        setLivingArrangement(p.living_arrangement || '')
        setWorkAfterMarriage(p.work_after_marriage || '')
        setSmoking(p.smoking || 'false')
        setDrinking(p.drinking || 'false')
        setDiet(p.diet || '')
        setFamilyValues(p.family_values || '')
        setWillingToRelocate(p.willing_to_relocate || false)
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
        income_hidden: incomeHidden, dob_privacy: dobPrivacy,
        contact_min_age: contactMinAge, contact_max_age: contactMaxAge,
        contact_religion: contactReligion, sms_on_mutual: smsOnMutual,
        hobbies, family_values: familyValues, guardian_mode: guardianMode,
        mother_tongue: motherTongue, english_comfort: englishComfort,
        has_children: hasChildren, contact_preference: contactPreference,
        marriage_timeline: marriageTimeline, living_arrangement: livingArrangement,
        work_after_marriage: workAfterMarriage, smoking, drinking, diet,
        willing_to_relocate: willingToRelocate,
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
        accepts_partner_with_children: acceptsChildren === 'discussion' ? true : acceptsChildren,
        expected_religious_level: expectedReligiousLevel,
      }
      const res = await fetch('/api/update-profile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, updates })
      })
      const result = await res.json()
      if (result.success) {
        const stored = localStorage.getItem('biyekori_user')
        if (stored) { const u = JSON.parse(stored); u.full_name = fullName; localStorage.setItem('biyekori_user', JSON.stringify(u)) }
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch(e) {}
    setSaving(false)
  }

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
  const gm = guardianMode
  const gmFontStyle = gm ? { fontSize: '16px', lineHeight: '1.6' } : {}

  const tabs = [
    { id: 'basic', label: gm ? 'মূল তথ্য' : 'Basic Info' },
    { id: 'photos', label: gm ? 'ছবি' : 'Photos' },
    { id: 'personal', label: gm ? 'ব্যক্তিগত' : 'Personal' },
    { id: 'lifestyle', label: gm ? 'জীবনধারা' : 'Lifestyle' },
    { id: 'partner', label: gm ? 'পাত্র/পাত্রী' : 'Partner Preferences' },
    { id: 'verification', label: gm ? 'যাচাই' : 'Verification' },
    { id: 'privacy', label: gm ? 'গোপনীয়তা' : 'Privacy' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '80px', paddingBottom: '60px' }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0 16px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: '0 0 4px', fontSize: gm ? '28px' : '24px', fontWeight: 800, color: '#111827' }}>
                {gm ? 'প্রোফাইল সম্পাদনা' : 'Edit Profile'}
              </h1>
              {guardianMode && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', boxShadow: '0 2px 8px rgba(124,58,237,0.35)' }}>
                  পরিবার পরিচালিত
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: gm ? '14px' : '13px', color: '#9ca3af' }}>
              {gm ? 'আপনার প্রোফাইল আপডেট রাখুন' : 'Keep your profile updated for better matches'}
            </p>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: saved ? '#10b981' : 'linear-gradient(135deg,#e11d48,#db2777)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
            {saving ? (gm ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : saved ? (gm ? 'সংরক্ষিত!' : 'Saved!') : (gm ? 'সংরক্ষণ করুন' : 'Save')}
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
              <div style={{ gridColumn: '1/-1' }}>
                <label className={labelClass} style={gmFontStyle}>{gm ? (user?.gender === 'Male' ? 'তার সম্পর্কে' : 'তার সম্পর্কে') : (user?.gender === 'Male' ? 'About Him' : 'About Her')}</label>
                <textarea value={aboutMe} onChange={e => setAboutMe(e.target.value)} className={inputClass} rows={4} placeholder={gm ? 'তার চরিত্র ও পারিবারিক পটভূমি বর্ণনা করুন...' : (user?.gender === 'Male' ? 'Describe his character, background and family...' : 'Describe her character, background and family...')} style={{ resize: 'vertical', ...gmFontStyle }} />
              </div>
            </div>
          </div>
        )}

        {/* PHOTOS TAB */}
        {activeTab === 'photos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: '#111827' }}>Main Profile Photo</h3>
              <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#9ca3af' }}>AI automatically crops to your face.</p>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Current</p>
                  {currentMainPhoto ? <img src={currentMainPhoto} alt="Current" style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #e5e7eb' }} />
                    : <div style={{ width: '100px', height: '100px', borderRadius: '12px', background: '#f3f4f6', border: '2px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>?</div>}
                </div>
                {mainPhotoPreview && <>
                  <div style={{ display: 'flex', alignItems: 'center', paddingTop: '36px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, color: '#10b981', textTransform: 'uppercase' }}>New Preview</p>
                    <img src={mainPhotoPreview} alt="Preview" style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #10b981' }} />
                  </div>
                </>}
                {mainPhotoProcessing && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '36px' }}>
                  <div style={{ width: '16px', height: '16px', border: '2px solid #e11d48', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>AI detecting face...</span>
                </div>}
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <label style={{ cursor: 'pointer' }}>
                  <div style={{ padding: '10px 20px', background: '#f8fafc', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: '#374151', display: 'inline-block' }}>Choose Photo</div>
                  <input type="file" accept="image/*" onChange={handleMainPhotoSelect} style={{ display: 'none' }} />
                </label>
                {mainPhotoFile && <button onClick={handleMainPhotoSave} disabled={mainPhotoSaving} style={{ padding: '10px 20px', background: mainPhotoSaved ? '#10b981' : 'linear-gradient(135deg,#e11d48,#db2777)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                  {mainPhotoSaving ? 'Saving...' : mainPhotoSaved ? 'Saved!' : 'Save as Main Photo'}
                </button>}
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#111827' }}>Gallery Photos</h3>
                <span style={{ fontSize: '12px', fontWeight: 700, color: galleryPhotos.length >= 8 ? '#e11d48' : '#9ca3af' }}>{galleryPhotos.length}/8</span>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#9ca3af' }}>Full body, candid or family photos. Max 8.</p>
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
                      : <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg><span style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px', fontWeight: 600 }}>Add</span></>}
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
                <label className={labelClass} style={gmFontStyle}>{gm ? 'ধার্মিক অনুশীলন' : 'Religious Practice'}</label>
                <select value={religionLevel} onChange={e => setReligionLevel(e.target.value)} className={inputClass} style={gmFontStyle}>
                  <option value="">{gm ? 'বেছে নিন' : 'Select'}</option>
                  <option value="Very Religious">Practising</option>
                  <option value="Religious">Moderately practising</option>
                  <option value="Moderate">Cultural / occasional</option>
                  <option value="Liberal">Prefer not to say</option>
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
              {maritalStatus !== 'Never married' && (
                <div>
                  <label className={labelClass} style={gmFontStyle}>{gm ? 'সন্তান আছে?' : 'Have Children'}</label>
                  <select value={hasChildren} onChange={e => setHasChildren(e.target.value)} className={inputClass} style={gmFontStyle}>
                    <option value="false">{gm ? 'না' : 'No'}</option>
                    <option value="living_with">{gm ? 'হ্যাঁ, আমার সাথে থাকে' : 'Yes, living with me'}</option>
                    <option value="not_living_with">{gm ? 'হ্যাঁ, আলাদা থাকে' : 'Yes, not living with me'}</option>
                    <option value="sometimes">{gm ? 'হ্যাঁ, মাঝে মাঝে' : 'Yes, sometimes with me'}</option>
                  </select>
                </div>
              )}
              <div style={{ gridColumn: '1/-1' }}>
                <label className={labelClass} style={gmFontStyle}>{gm ? 'শখ ও আগ্রহ' : 'Hobbies & Interests'}</label>
                <input value={hobbies} onChange={e => setHobbies(e.target.value)} className={inputClass} style={gmFontStyle} placeholder={gm ? 'যেমন: পড়া, রান্না, ভ্রমণ, ক্রিকেট' : 'e.g. Reading, Cooking, Travel, Cricket'} />
              </div>
            </div>
          </div>
        )}

        {/* LIFESTYLE TAB */}
        {activeTab === 'lifestyle' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>All fields are optional. The more you fill, the better your matches.</p>

            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                <div>
                  <label className={labelClass} style={gmFontStyle}>{gm ? 'বিয়ের সময়সীমা' : 'Marriage Timeline'}</label>
                  <select value={marriageTimeline} onChange={e => setMarriageTimeline(e.target.value)} className={inputClass} style={gmFontStyle}>
                    <option value="">{gm ? 'বেছে নিন' : 'Select'}</option>
                    <option value="Within 3 months">Within 3 months</option>
                    <option value="Within 6 months">3–6 months</option>
                    <option value="Within 1 year">6–12 months</option>
                    <option value="Within 2 years">Within 2 years</option>
                    <option value="Not decided yet">Not decided yet</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass} style={gmFontStyle}>Preferred Family Setup</label>
                  <select value={familyValues} onChange={e => setFamilyValues(e.target.value)} className={inputClass} style={gmFontStyle}>
                    <option value="">Select</option>
                    <option value="Conservative">Nuclear family</option>
                    <option value="Moderate">Joint family</option>
                    <option value="Liberal">Separate home near parents</option>
                    <option value="Very Liberal">Flexible / depends on partner</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass} style={gmFontStyle}>Career / Study Plan After Marriage</label>
                  <select value={workAfterMarriage} onChange={e => setWorkAfterMarriage(e.target.value)} className={inputClass} style={gmFontStyle}>
                    <option value="">Select</option>
                    <option value="Will continue working">Continue working</option>
                    <option value="Will stop working">Prefer homemaking</option>
                    <option value="Depends on situation">Continue working or studying</option>
                    <option value="Not decided">Open to discussion</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass} style={gmFontStyle}>Future Children Plan</label>
                  <select value={livingArrangement} onChange={e => setLivingArrangement(e.target.value)} className={inputClass} style={gmFontStyle}>
                    <option value="">Select</option>
                    <option value="Nuclear family">Yes, want children</option>
                    <option value="With in-laws">No, do not want children</option>
                    <option value="Flexible">Open to discussion</option>
                    <option value="Depends on partner">Not decided yet</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass} style={gmFontStyle}>Tobacco Use</label>
                  <select value={smoking} onChange={e => setSmoking(e.target.value)} className={inputClass} style={gmFontStyle}>
                    <option value="false">Never</option>
                    <option value="occasionally">Occasionally</option>
                    <option value="true">Regularly</option>
                    <option value="quit">Recently quit</option>
                    <option value="prefer_not">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass} style={gmFontStyle}>Vaping</label>
                  <select value={drinking} onChange={e => setDrinking(e.target.value)} className={inputClass} style={gmFontStyle}>
                    <option value="false">Never</option>
                    <option value="occasionally">Occasionally</option>
                    <option value="true">Regularly</option>
                    <option value="prefer_not">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass} style={gmFontStyle}>Dietary Preference</label>
                  <select value={diet} onChange={e => setDiet(e.target.value)} className={inputClass} style={gmFontStyle}>
                    <option value="">Select</option>
                    <option value="Halal only">Halal only</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="No restriction">No restriction</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass} style={gmFontStyle}>Settlement Plan After Marriage</label>
                  <select value={""} onChange={() => {}} className={inputClass} style={gmFontStyle}>
                    <option value="">Select</option>
                    <option value="same_city">Stay in current city</option>
                    <option value="within_bd">Open to moving within Bangladesh</option>
                    <option value="abroad">Open to moving abroad</option>
                    <option value="settling_abroad">Planning to settle abroad</option>
                    <option value="depends">Depends on partner</option>
                  </select>
                </div>

              </div>

              {/* Relocation toggle */}
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>Open to Relocation</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Willing to move within Bangladesh or abroad after marriage</p>
                </div>
                <Toggle value={willingToRelocate} onChange={setWillingToRelocate} />
              </div>
            </div>

            {/* More Lifestyle Details accordion */}
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <button type="button" onClick={() => setShowMoreLifestyle(!showMoreLifestyle)} style={{ width: '100%', padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '4px', height: '20px', background: '#d1d5db', borderRadius: '2px' }} />
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>More Lifestyle Details</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>optional</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" style={{ transform: showMoreLifestyle ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {showMoreLifestyle && (
                <div style={{ padding: '0 24px 24px' }}>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#9ca3af' }}>These details help us find more compatible matches.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className={labelClass}>Family Involvement Preference</label>
                      <select className={inputClass}>
                        <option value="">Select</option>
                        <option value="from_beginning">Family involved from the beginning</option>
                        <option value="talk_first">Talk first, involve family shortly after</option>
                        <option value="after_mutual">Family involvement after mutual interest</option>
                        <option value="guardian_to_guardian">Prefer guardian-to-guardian communication</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Social Lifestyle</label>
                      <select className={inputClass}>
                        <option value="">Select</option>
                        <option value="quiet">Quiet and home-oriented</option>
                        <option value="balanced">Balanced</option>
                        <option value="social">Social and outgoing</option>
                        <option value="depends">Depends on occasion</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Dowry Stance</label>
                      <select className={inputClass}>
                        <option value="">Select</option>
                        <option value="against">Strictly against dowry</option>
                        <option value="gifts_only">No dowry; voluntary gifts only</option>
                        <option value="discussion">Open to discussion</option>
                        <option value="prefer_not">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Preferred Wedding Style</label>
                      <select className={inputClass}>
                        <option value="">Select</option>
                        <option value="simple">Simple and intimate</option>
                        <option value="traditional">Traditional family wedding</option>
                        <option value="large">Large celebration</option>
                        <option value="discussion">Open to discussion</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PARTNER PREFS TAB */}
        {activeTab === 'partner' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800, color: '#111827' }}>Partner Preferences</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Tell us what matters to you. Choose your priorities so we can show more compatible matches.</p>
              </div>
              <button type="button" onClick={() => {
                setPartnerAgeMin(''); setPartnerAgeMax(''); setPartnerDistrict('');
                setPartnerEducation(''); setExpectedReligion(''); setExpectedMaritalStatus('');
                setExpectedMarriageTimeline(''); setExpectedLivingArrangement('');
                setExpectedWorkAfterMarriage(''); setExpectedContactPreference('');
                setExpectedSmoking(''); setExpectedDiet(''); setExpectedFamilyValues('');
                setAcceptsChildren(true); setExpectedReligiousLevel('');
                setPriorityReligion('flexible'); setPriorityLocation('flexible');
                setPriorityChildren('flexible'); setPriorityLiving('flexible');
                setPrioritySmoking('flexible'); setPriorityCareer('flexible');
              }} style={{ fontSize: '12px', color: '#e11d48', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
                Clear all preferences
              </button>
            </div>

            {mustMatchCount >= 4 && (
              <div style={{ padding: '12px 16px', background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '12px', fontSize: '13px', color: '#92400e', lineHeight: '1.5' }}>
                Your preferences may significantly reduce compatible profiles. Consider changing one or two <strong>Must Match</strong> items to <strong>Prefer</strong>.
              </div>
            )}

            {/* Essential */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ width: '4px', height: '20px', background: 'linear-gradient(135deg,#e11d48,#db2777)', borderRadius: '2px' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#111827' }}>Essential Preferences</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className={labelClass}>Preferred Age Range</label>
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>Min age</span>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#e11d48' }}>{partnerAgeMin || '18'} – {partnerAgeMax || '65'}</span>
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>Max age</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <input type="range" min="18" max="65" value={partnerAgeMin || 18} onChange={e => setPartnerAgeMin(e.target.value)} style={{ width: '100%', accentColor: '#e11d48' }} />
                        <div style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>Min: {partnerAgeMin || 18}</div>
                      </div>
                      <div>
                        <input type="range" min="18" max="65" value={partnerAgeMax || 65} onChange={e => setPartnerAgeMax(e.target.value)} style={{ width: '100%', accentColor: '#e11d48' }} />
                        <div style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>Max: {partnerAgeMax || 65}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className={labelClass} style={{ margin: 0 }}>Preferred Location</label>
                    <PrioritySelector value={priorityLocation} onChange={setPriorityLocation} mustMatchCount={mustMatchCount} />
                  </div>
                  <select value={partnerDistrict} onChange={e => setPartnerDistrict(e.target.value)} className={inputClass}>
                    <option value="">Any location</option>
                    <option value="same_district">Same district preferred</option>
                    <option value="anywhere_bangladesh">Anywhere in Bangladesh</option>
                    <option value="abroad">Abroad preferred</option>
                    <option value="bangladesh_or_abroad">Bangladesh or abroad</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className={labelClass} style={{ margin: 0 }}>Religion</label>
                    <PrioritySelector value={priorityReligion} onChange={setPriorityReligion} mustMatchCount={mustMatchCount} />
                  </div>
                  <select value={expectedReligion} onChange={e => setExpectedReligion(e.target.value)} className={inputClass}>
                    <option value="">Any</option>
                    {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Religious Practice Preference</label>
                  <select value={expectedReligiousLevel} onChange={e => setExpectedReligiousLevel(e.target.value)} className={inputClass}>
                    <option value="">Any</option>
                    <option value="Very Religious">Practising</option>
                    <option value="Religious">Moderately practising</option>
                    <option value="Moderate">Cultural</option>
                    <option value="Liberal">Open to discussion</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Accepted Marital Status <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 400 }}>(select all that apply)</span></label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {MARITAL_STATUSES.map(m => {
                      const selected = expectedMaritalStatus.includes(m)
                      return (
                        <button key={m} type="button"
                          onClick={() => {
                            const current = expectedMaritalStatus ? expectedMaritalStatus.split(',').filter(Boolean) : []
                            if (selected) setExpectedMaritalStatus(current.filter(x => x !== m).join(','))
                            else setExpectedMaritalStatus([...current, m].join(','))
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', border: 'none', background: selected ? '#e11d48' : '#f3f4f6', color: selected ? 'white' : '#374151', fontSize: '13px', fontWeight: selected ? 700 : 500, transition: 'all 0.15s' }}
                        >
                          <span style={{ fontSize: '12px' }}>{selected ? '✓' : '○'}</span>
                          {m}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Expected Marriage Timeline</label>
                  <select value={expectedMarriageTimeline} onChange={e => setExpectedMarriageTimeline(e.target.value)} className={inputClass}>
                    <option value="">Any</option>
                    <option value="Within 3 months">Within 3 months</option>
                    <option value="Within 6 months">3–6 months</option>
                    <option value="Within 1 year">6–12 months</option>
                    <option value="Within 2 years">Within 2 years</option>
                    <option value="Not decided yet">Flexible</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Marriage & Family */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ width: '4px', height: '20px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius: '2px' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#111827' }}>Marriage & Family Plans</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className={labelClass} style={{ margin: 0 }}>Open to a Partner Who Has Children</label>
                    <PrioritySelector value={priorityChildren} onChange={setPriorityChildren} mustMatchCount={mustMatchCount} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { value: true, label: 'Yes', activeColor: '#16a34a', activeBg: '#f0fdf4' },
                      { value: 'discussion', label: 'Open to discussion', activeColor: '#0ea5e9', activeBg: '#e0f2fe' },
                      { value: false, label: 'No', activeColor: '#e11d48', activeBg: '#fef2f2' },
                    ].map(opt => {
                      const selected = acceptsChildren === opt.value
                      return (
                        <button key={String(opt.value)} type="button" onClick={() => setAcceptsChildren(opt.value as any)}
                          style={{ flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer', background: selected ? opt.activeBg : '#f3f4f6', color: selected ? opt.activeColor : '#374151', fontSize: '12px', fontWeight: selected ? 700 : 500, border: selected ? `2px solid ${opt.activeColor}` : '2px solid transparent', transition: 'all 0.15s' }}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className={labelClass} style={{ margin: 0 }}>Preferred Family Setup</label>
                    <PrioritySelector value={priorityLiving} onChange={setPriorityLiving} mustMatchCount={mustMatchCount} />
                  </div>
                  <select value={expectedLivingArrangement} onChange={e => setExpectedLivingArrangement(e.target.value)} className={inputClass}>
                    <option value="">Any</option>
                    <option value="Nuclear family">Nuclear family</option>
                    <option value="With in-laws">Joint family</option>
                    <option value="Flexible">Separate home near parents</option>
                    <option value="Depends on partner">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Relocation Preference</label>
                  <select value={expectedFamilyValues} onChange={e => setExpectedFamilyValues(e.target.value)} className={inputClass}>
                    <option value="">Any</option>
                    <option value="Conservative">Same city preferred</option>
                    <option value="Moderate">Anywhere in Bangladesh</option>
                    <option value="Liberal">Open to moving abroad</option>
                    <option value="Very Liberal">Depends on partner</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Career & Lifestyle */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ width: '4px', height: '20px', background: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', borderRadius: '2px' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#111827' }}>Career & Lifestyle</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className={labelClass} style={{ margin: 0 }}>Partner Career or Study Plan After Marriage</label>
                    <PrioritySelector value={priorityCareer} onChange={setPriorityCareer} mustMatchCount={mustMatchCount} />
                  </div>
                  <select value={expectedWorkAfterMarriage} onChange={e => setExpectedWorkAfterMarriage(e.target.value)} className={inputClass}>
                    <option value="">Any</option>
                    <option value="Will continue working">Continue working</option>
                    <option value="Will stop working">Prefer homemaking</option>
                    <option value="Depends on situation">Either is acceptable</option>
                    <option value="Not decided">Open to discussion</option>
                  </select>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className={labelClass} style={{ margin: 0 }}>Tobacco Use Preference</label>
                    <PrioritySelector value={prioritySmoking} onChange={setPrioritySmoking} mustMatchCount={mustMatchCount} />
                  </div>
                  <select value={expectedSmoking} onChange={e => setExpectedSmoking(e.target.value)} className={inputClass}>
                    <option value="">No preference</option>
                    <option value="no">Non-smoker only</option>
                    <option value="occasionally">Occasionally OK</option>
                    <option value="any">Any</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Food Preference</label>
                  <select value={expectedDiet} onChange={e => setExpectedDiet(e.target.value)} className={inputClass}>
                    <option value="">No preference</option>
                    <option value="Halal only">Halal only</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="No restriction">No restriction</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Contact Preference</label>
                  <select value={expectedContactPreference} onChange={e => setExpectedContactPreference(e.target.value)} className={inputClass}>
                    <option value="">Any</option>
                    {CONTACT_PREFERENCES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Optional */}
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <button type="button" onClick={() => setShowOptional(!showOptional)} style={{ width: '100%', padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '4px', height: '20px', background: '#d1d5db', borderRadius: '2px' }} />
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>More Optional Preferences</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" style={{ transform: showOptional ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {showOptional && (
                <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#9ca3af' }}>These will not significantly reduce your matches.</p>
                  <div>
                    <label className={labelClass}>Minimum Education</label>
                    <select value={partnerEducation} onChange={e => setPartnerEducation(e.target.value)} className={inputClass}>
                      <option value="">Any</option>
                      {EDUCATIONS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
              )}
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
            <div style={{ padding: '20px', background: guardianMode ? 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(168,85,247,0.08))' : '#f8fafc', borderRadius: '14px', border: `2px solid ${guardianMode ? '#a855f7' : '#e5e7eb'}`, transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '18px' }}>👨‍👩‍👧</span>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#111827' }}>Guardian Mode</p>
                    {guardianMode && <span style={{ fontSize: '10px', fontWeight: 700, color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: '20px' }}>Active</span>}
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                    This profile is managed by a family member. A "Family Managed" badge will appear on your profile card.
                  </p>
                  {guardianMode && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', padding: '8px 12px', background: 'white', borderRadius: '8px', border: '1px solid #e9d5ff', width: 'fit-content' }}>
                      <span style={{ fontSize: '13px' }}>👨‍👩‍👧</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#7c3aed' }}>পরিবার পরিচালিত</span>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>— badge preview</span>
                    </div>
                  )}
                </div>
                <button onClick={() => setGuardianMode(!guardianMode)} style={{ width: '52px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: guardianMode ? '#7c3aed' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <span style={{ position: 'absolute', top: '4px', left: guardianMode ? '27px' : '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
            </div>

            {/* Contact Preference moved here */}
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>Contact Preference</p>
              <select value={contactPreference} onChange={e => setContactPreference(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', background: 'white', color: '#111827' }}>
                <option value="">Select</option>
                {CONTACT_PREFERENCES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>Photo Privacy</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Only show my photo to people whose interest I accept</p>
              </div>
              <Toggle value={photoPrivacy} onChange={setPhotoPrivacy} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>Income Privacy</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Show "Not disclosed" instead of your income on your profile</p>
              </div>
              <Toggle value={incomeHidden} onChange={setIncomeHidden} />
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>Date of Birth Visibility</p>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#6b7280' }}>Control who can see your date of birth. Age is always visible.</p>
              <select value={dobPrivacy} onChange={e => setDobPrivacy(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', background: 'white', color: '#111827' }}>
                <option value="age_only">Show age only (recommended)</option>
                <option value="full">Show full date of birth</option>
                <option value="hidden">Hide completely (requestable after mutual interest)</option>
              </select>
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>Contact Filter</p>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#6b7280' }}>Interests from people outside these criteria go to your Filtered folder.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', minWidth: '80px' }}>Age Range</label>
                  <select value={contactMinAge} onChange={e => setContactMinAge(parseInt(e.target.value))} style={{ padding: '8px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', background: 'white' }}>
                    {Array.from({length: 43}, (_, i) => i + 18).map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>to</span>
                  <select value={contactMaxAge} onChange={e => setContactMaxAge(parseInt(e.target.value))} style={{ padding: '8px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', background: 'white' }}>
                    {Array.from({length: 43}, (_, i) => i + 18).map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', minWidth: '80px' }}>Religion</label>
                  <select value={contactReligion} onChange={e => setContactReligion(e.target.value)} style={{ padding: '8px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', background: 'white' }}>
                    <option value="any">Any religion</option>
                    <option value="Islam">Islam only</option>
                    <option value="Hinduism">Hinduism only</option>
                    <option value="Christianity">Christianity only</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>SMS Notification</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Receive an SMS when you and someone else mutually accept each other's interest</p>
              </div>
              <Toggle value={smsOnMutual} onChange={setSmsOnMutual} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: deactivated ? '#fff1f2' : '#f8fafc', borderRadius: '12px', border: `1px solid ${deactivated ? '#fecdd3' : '#e5e7eb'}` }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>Deactivate Profile</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Hide your profile from browse. You can reactivate anytime.</p>
              </div>
              <Toggle value={deactivated} onChange={setDeactivated} />
            </div>
            <div style={{ padding: '16px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
              <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#92400e' }}>Want to delete your account?</p>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#92400e' }}>Email us at support@biyekori.com and we will delete all your data within 48 hours.</p>
              <a href="mailto:support@biyekori.com?subject=Account Deletion Request" style={{ fontSize: '13px', color: '#e11d48', fontWeight: 700 }}>Request Account Deletion</a>
            </div>
          </div>
        )}

        {/* Save button */}
        {activeTab !== 'photos' && (
          <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '14px', background: saved ? '#10b981' : 'linear-gradient(135deg,#e11d48,#db2777)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
            </button>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '14px 24px', background: 'white', color: '#6b7280', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        )}

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
