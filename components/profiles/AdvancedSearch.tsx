'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const EDUCATION_LEVELS = ['SSC', 'HSC', "Bachelor's", "Master's", 'Medical', 'Engineering', 'Law', 'PhD']
const RELIGION_LEVELS = ['Religious', 'Moderate', 'Liberal', 'Very Religious']
const PROFESSIONS = ['Student', 'Doctor', 'Engineer', 'Teacher', 'Banker', 'Lawyer', 'Business', 'Government Officer', 'NGO Worker', 'Homemaker', 'IT Professional', 'Accountant', 'Military', 'Police', 'Other']
const HEIGHTS = ['4\'6"', '4\'8"', '4\'10"', '4\'11"', '5\'0"', '5\'1"', '5\'2"', '5\'3"', '5\'4"', '5\'5"', '5\'6"', '5\'7"', '5\'8"', '5\'9"', '5\'10"', '5\'11"', '6\'0"', '6\'1"', '6\'2"']

export default function AdvancedSearch({ userGender, excludeId }: { userGender: string, excludeId: string }) {
  const [open, setOpen] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [education, setEducation] = useState('')
  const [religionLevel, setReligionLevel] = useState('')
  const [profession, setProfession] = useState('')
  const [minHeight, setMinHeight] = useState('')
  const [maxHeight, setMaxHeight] = useState('')
  const [nidOnly, setNidOnly] = useState(false)
  const [neverMarried, setNeverMarried] = useState(false)
  const [guardianOnly, setGuardianOnly] = useState(false)
  const [selfOnly, setSelfOnly] = useState(false)
  const [hideViewed, setHideViewed] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    try {
      const stored = localStorage.getItem('biyekori_user')
      if (stored) {
        const user = JSON.parse(stored)
        setIsPaid(user.package && user.package !== 'prottasha')
      }
      // Read existing advanced params from URL
      setEducation(searchParams.get('edu') || '')
      setReligionLevel(searchParams.get('relLevel') || '')
      setProfession(searchParams.get('prof') || '')
      setMinHeight(searchParams.get('minH') || '')
      setMaxHeight(searchParams.get('maxH') || '')
      setNidOnly(searchParams.get('nidOnly') === '1')
      setNeverMarried(searchParams.get('neverMarried') === '1')
      setGuardianOnly(searchParams.get('guardianOnly') === '1')
      setSelfOnly(searchParams.get('selfOnly') === '1')
      setHideViewed(searchParams.get('hideViewed') === '1')
    } catch(e) {}
  }, [])

  const hasAdvancedFilters = education || religionLevel || profession || minHeight || maxHeight || nidOnly || neverMarried || guardianOnly || selfOnly || hideViewed

  const handleApply = () => {
    const base = new URLSearchParams(searchParams.toString())
    base.set('page', '1')
    if (education) base.set('edu', education); else base.delete('edu')
    if (religionLevel) base.set('relLevel', religionLevel); else base.delete('relLevel')
    if (profession) base.set('prof', profession); else base.delete('prof')
    if (minHeight) base.set('minH', minHeight); else base.delete('minH')
    if (maxHeight) base.set('maxH', maxHeight); else base.delete('maxH')
    if (nidOnly) base.set('nidOnly', '1'); else base.delete('nidOnly')
    if (neverMarried) base.set('neverMarried', '1'); else base.delete('neverMarried')
    if (guardianOnly) base.set('guardianOnly', '1'); else base.delete('guardianOnly')
    if (selfOnly) base.set('selfOnly', '1'); else base.delete('selfOnly')
    if (hideViewed) base.set('hideViewed', '1'); else base.delete('hideViewed')
    router.push('/profiles?' + base.toString())
    setOpen(false)
  }

  const handleClear = () => {
    setEducation(''); setReligionLevel(''); setProfession('')
    setMinHeight(''); setMaxHeight(''); setNidOnly(false); setNeverMarried(false)
    const base = new URLSearchParams(searchParams.toString())
    base.delete('edu'); base.delete('relLevel'); base.delete('prof')
    base.delete('minH'); base.delete('maxH'); base.delete('nidOnly'); base.delete('neverMarried'); base.delete('guardianOnly'); base.delete('selfOnly'); base.delete('hideViewed')
    base.set('page', '1')
    router.push('/profiles?' + base.toString())
    setOpen(false)
  }

  const selectStyle = {
    padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e9d5ff',
    fontSize: '13px', color: '#1f2937', background: 'white', width: '100%'
  }

  const labelStyle = {
    fontSize: '11px', fontWeight: 600 as const, color: '#7c3aed',
    textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '4px', display: 'block' as const
  }

  return (
    <div style={{ marginBottom: '12px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
          background: open ? 'linear-gradient(135deg,#7c3aed,#db2777)' : 'white',
          border: '2px solid',
          borderColor: hasAdvancedFilters ? '#7c3aed' : '#e9d5ff',
          color: open ? 'white' : '#7c3aed',
          fontSize: '13px', fontWeight: 700,
          boxShadow: '0 2px 8px rgba(124,58,237,0.1)',
          transition: 'all 0.2s'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
        </svg>
        Advanced Search
        {hasAdvancedFilters && !open && (
          <span style={{ background: '#7c3aed', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[education, religionLevel, profession, minHeight, maxHeight, nidOnly, neverMarried, guardianOnly, selfOnly, hideViewed].filter(Boolean).length}
          </span>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div style={{
          marginTop: '8px', borderRadius: '16px', overflow: 'hidden',
          border: '2px solid #e9d5ff',
          boxShadow: '0 8px 32px rgba(124,58,237,0.1)'
        }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>&#10024;</span>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>Premium Advanced Filters</span>
            </div>
            {!isPaid && (
              <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.5px' }}>
                PREMIUM ONLY
              </span>
            )}
          </div>

          {!isPaid ? (
            /* Upgrade prompt for free users */
            <div style={{ background: 'white', padding: '28px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>&#128269;</div>
              <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700, color: '#1f2937' }}>
                Find Your Perfect Match Faster
              </h3>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
                Premium members can filter by education, religion level, profession, height, NID verification and more.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                {['Education Level', 'Religion Level', 'Profession', 'Height Range', 'NID Verified Only', 'Never Married Only'].map(f => (
                  <span key={f} style={{ padding: '4px 12px', background: '#f3f0ff', color: '#7c3aed', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                    {f}
                  </span>
                ))}
              </div>
              <a href="/pricing" style={{
                display: 'inline-block', padding: '12px 32px',
                background: 'linear-gradient(135deg,#7c3aed,#db2777)',
                color: 'white', borderRadius: '10px', fontWeight: 700,
                textDecoration: 'none', fontSize: '14px',
                boxShadow: '0 4px 12px rgba(124,58,237,0.3)'
              }}>
                Upgrade to Unlock
              </a>
            </div>
          ) : (
            /* Full filters for paid users */
            <div style={{ background: 'white', padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>

                <div>
                  <label style={labelStyle}>Education</label>
                  <select value={education} onChange={e => setEducation(e.target.value)} style={selectStyle}>
                    <option value="">Any</option>
                    {EDUCATION_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Religion Level</label>
                  <select value={religionLevel} onChange={e => setReligionLevel(e.target.value)} style={selectStyle}>
                    <option value="">Any</option>
                    {RELIGION_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Profession</label>
                  <select value={profession} onChange={e => setProfession(e.target.value)} style={selectStyle}>
                    <option value="">Any</option>
                    {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Min Height</label>
                  <select value={minHeight} onChange={e => setMinHeight(e.target.value)} style={selectStyle}>
                    <option value="">Any</option>
                    {HEIGHTS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Max Height</label>
                  <select value={maxHeight} onChange={e => setMaxHeight(e.target.value)} style={selectStyle}>
                    <option value="">Any</option>
                    {HEIGHTS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={nidOnly} onChange={e => setNidOnly(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#7c3aed' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>NID Verified Only</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={neverMarried} onChange={e => setNeverMarried(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#7c3aed' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Never Married Only</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={guardianOnly} onChange={e => { setGuardianOnly(e.target.checked); if (e.target.checked) setSelfOnly(false) }}
                    style={{ width: '16px', height: '16px', accentColor: '#7c3aed' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Family Managed Only</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selfOnly} onChange={e => { setSelfOnly(e.target.checked); if (e.target.checked) setGuardianOnly(false) }}
                    style={{ width: '16px', height: '16px', accentColor: '#7c3aed' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Self Managed Only</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={hideViewed} onChange={e => setHideViewed(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#7c3aed' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Hide Already Viewed</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleApply} style={{
                  padding: '10px 28px', background: 'linear-gradient(135deg,#7c3aed,#db2777)',
                  color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '13px',
                  border: 'none', cursor: 'pointer'
                }}>
                  Apply Filters
                </button>
                {hasAdvancedFilters && (
                  <button onClick={handleClear} style={{
                    padding: '10px 20px', background: '#f3f4f6', color: '#6b7280',
                    borderRadius: '8px', fontWeight: 600, fontSize: '13px',
                    border: 'none', cursor: 'pointer'
                  }}>
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
