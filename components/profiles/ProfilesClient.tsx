'use client'
import { useState } from 'react'
import ProfilesGrid from '@/components/profiles/ProfilesGrid'

const MAROON = '#7B1D2E'
const DISTRICTS = ["Bagerhat","Bandarban","Barguna","Barishal","Bhola","Bogura","Brahmanbaria","Chandpur","Chapai Nawabganj","Chattogram","Chuadanga","Cox's Bazar","Cumilla","Dhaka","Dinajpur","Faridpur","Feni","Gaibandha","Gazipur","Gopalganj","Habiganj","Jamalpur","Jashore","Jhalokathi","Jhenaidah","Joypurhat","Khagrachhari","Khulna","Kishoreganj","Kurigram","Kushtia","Lakshmipur","Lalmonirhat","Madaripur","Magura","Manikganj","Meherpur","Moulvibazar","Munshiganj","Mymensingh","Naogaon","Narail","Narayanganj","Narsingdi","Natore","Netrokona","Nilphamari","Noakhali","Pabna","Panchagarh","Patuakhali","Pirojpur","Rajbari","Rajshahi","Rangamati","Rangpur","Satkhira","Shariatpur","Sherpur","Sirajganj","Sunamganj","Sylhet","Tangail","Thakurgaon"]

interface Props {
  profiles: any[]
  viewerProfile: any
  initialFilters: {
    district: string
    minAge: number
    maxAge: number
    religion: string
    marital: string
    edu: string
    prof: string
  }
  baseUrl: string
}

export default function ProfilesClient({ profiles, viewerProfile, initialFilters, baseUrl }: Props) {
  const [showFilter, setShowFilter] = useState(false)
  const [district, setDistrict] = useState(initialFilters.district)
  const [minAge, setMinAge] = useState(initialFilters.minAge)
  const [maxAge, setMaxAge] = useState(initialFilters.maxAge)
  const [religion, setReligion] = useState(initialFilters.religion)
  const [marital, setMarital] = useState(initialFilters.marital)
  const [edu, setEdu] = useState(initialFilters.edu)
  const [prof, setProf] = useState(initialFilters.prof)
  const [view, setView] = useState<'grid'|'list'>('grid')

  const hasFilters = !!(district || religion || marital || edu || prof || minAge !== 18 || maxAge !== 70)

  const applyFilters = () => {
    let url = baseUrl
    if (district) url += `&district=${encodeURIComponent(district)}`
    if (religion) url += `&religion=${encodeURIComponent(religion)}`
    if (edu) url += `&edu=${encodeURIComponent(edu)}`
    if (prof) url += `&prof=${encodeURIComponent(prof)}`
    if (marital) url += `&marital=${encodeURIComponent(marital)}`
    if (minAge !== 18) url += `&minAge=${minAge}`
    if (maxAge !== 70) url += `&maxAge=${maxAge}`
    window.location.href = url
  }

  const clearFilters = () => {
    window.location.href = baseUrl
  }

  const selectStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '10px',
    border: '1.5px solid #e5e7eb', fontSize: '14px', background: 'white',
    color: '#111827', outline: 'none', appearance: 'none' as const,
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>

      {/* Top bar — filter button + view toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowFilter(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px', borderRadius: '10px',
              background: hasFilters ? MAROON : 'white',
              color: hasFilters ? 'white' : '#374151',
              border: hasFilters ? 'none' : '1.5px solid #e5e7eb',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            ফিল্টার {hasFilters && '●'}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} style={{ padding: '8px 12px', background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', color: '#6b7280', cursor: 'pointer' }}>
              Clear
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '3px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <button onClick={() => setView('grid')} style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: view === 'grid' ? MAROON : 'transparent', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={view === 'grid' ? 'white' : '#9ca3af'} strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
          <button onClick={() => setView('list')} style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: view === 'list' ? MAROON : 'transparent', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={view === 'list' ? 'white' : '#9ca3af'} strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* Profiles grid */}
      <ProfilesGrid profiles={profiles} view={view} />

      {/* Filter bottom sheet */}
      {showFilter && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowFilter(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }}
          />
          {/* Sheet */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
            background: 'white', borderRadius: '20px 20px 0 0',
            padding: '20px 20px 40px', maxHeight: '85vh', overflowY: 'auto',
          }}>
            {/* Handle */}
            <div style={{ width: '40px', height: '4px', background: '#e5e7eb', borderRadius: '2px', margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>ফিল্টার করুন</h3>
              <button onClick={() => setShowFilter(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6b7280' }}>×</button>
            </div>

            {/* Age range */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>বয়স: {minAge} – {maxAge} বছর</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input type="range" min={18} max={70} value={minAge} onChange={e => setMinAge(Number(e.target.value))}
                  style={{ flex: 1, accentColor: MAROON }} />
                <input type="range" min={18} max={70} value={maxAge} onChange={e => setMaxAge(Number(e.target.value))}
                  style={{ flex: 1, accentColor: MAROON }} />
              </div>
            </div>

            {/* District */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>জেলা</label>
              <select value={district} onChange={e => setDistrict(e.target.value)} style={selectStyle}>
                <option value="">সব জেলা</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Religion */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>ধর্ম</label>
              <select value={religion} onChange={e => setReligion(e.target.value)} style={selectStyle}>
                <option value="">সব ধর্ম</option>
                {['Islam','Hinduism','Christianity','Buddhism','Other'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Marital status */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>বৈবাহিক অবস্থা</label>
              <select value={marital} onChange={e => setMarital(e.target.value)} style={selectStyle}>
                <option value="">যেকোনো</option>
                {['Never married','Divorced','Widowed'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Education */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>শিক্ষাগত যোগ্যতা</label>
              <select value={edu} onChange={e => setEdu(e.target.value)} style={selectStyle}>
                <option value="">সব</option>
                {["SSC","HSC","Diploma","Bachelor's","Master's","PhD","Medical","Engineering","Law","Other"].map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            {/* Apply button */}
            <button
              onClick={() => { setShowFilter(false); applyFilters() }}
              style={{ width: '100%', padding: '15px', background: MAROON, color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', marginTop: '8px' }}
            >
              ফিল্টার প্রয়োগ করুন
            </button>
          </div>
        </>
      )}
    </div>
  )
}
