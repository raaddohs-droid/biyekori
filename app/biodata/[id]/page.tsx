import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function BiodataPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !profile) notFound()

  const hasValue = (value: any) => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim() !== '' && value.trim().toLowerCase() !== 'not specified'
    return true
  }

  const showDegree = hasValue(profile.degree) &&
    profile.degree !== profile.education &&
    !['SSC', 'HSC'].includes(profile.education)

  const css = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #fff; color: #1a1a1a; }
    .page { max-width: 800px; margin: 0 auto; padding: 40px; position: relative; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-45deg); font-size: 80px; color: rgba(124,58,237,0.04); font-weight: 900; pointer-events: none; z-index: 0; white-space: nowrap; }
    .print-bar { position: fixed; bottom: 20px; right: 20px; z-index: 100; display: flex; gap: 10px; }
    .print-btn { background: linear-gradient(135deg,#7c3aed,#ec4899); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 15px rgba(124,58,237,0.4); }
    .back-btn { background: white; color: #7c3aed; border: 2px solid #7c3aed; padding: 12px 24px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; }
    .logo { text-align: center; margin-bottom: 16px; }
    .logo-brand { font-size: 16px; color: #7c3aed; font-weight: 900; letter-spacing: 3px; }
    .logo-sub { font-size: 11px; color: #9ca3af; margin-top: 2px; }
    .header { background: linear-gradient(135deg,#7c3aed,#ec4899); color: white; padding: 28px; border-radius: 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 20px; }
    .photo { width: 110px; height: 110px; border-radius: 12px; border: 3px solid white; object-fit: cover; flex-shrink: 0; }
    .photo-placeholder { width: 110px; height: 110px; border-radius: 12px; border: 3px solid white; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 44px; flex-shrink: 0; }
    .header h1 { font-size: 26px; font-weight: 900; margin-bottom: 10px; }
    .badges { display: flex; flex-wrap: wrap; gap: 6px; }
    .badge { background: rgba(255,255,255,0.2); padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .section { background: #f9f7ff; border-radius: 12px; padding: 18px; margin-bottom: 14px; border-left: 4px solid #7c3aed; }
    .section h2 { font-size: 13px; font-weight: 800; color: #7c3aed; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e9e4f7; }
    .row:last-child { border-bottom: none; }
    .lbl { color: #6b7280; font-size: 12px; }
    .val { font-weight: 600; font-size: 13px; color: #1f2937; text-align: right; max-width: 55%; }
    .text-block { font-size: 13px; line-height: 1.7; color: #374151; margin-top: 4px; }
    .footer { text-align: center; margin-top: 20px; padding: 14px; border-top: 2px solid #e5e7eb; }
    .footer-brand { font-size: 14px; font-weight: 900; color: #7c3aed; }
    .footer p { font-size: 11px; color: #9ca3af; margin-top: 3px; }
    @media print {
      .print-bar { display: none !important; }
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="watermark">BIYEKORI.COM</div>

      <div className="print-bar">
        <button className="back-btn" onClick={() => window.history.back()}>← Back</button>
        <button className="print-btn" onClick={() => window.print()}>📥 Save as PDF</button>
      </div>

      <div className="page">

        <div className="logo">
          <div className="logo-brand">✦ BIYEKORI.COM ✦</div>
          <div className="logo-sub">Bangladesh's AI Matrimony Platform</div>
        </div>

        <div className="header">
          {profile.photo_url
            ? <img src={profile.photo_url} alt={profile.full_name} className="photo" />
            : <div className="photo-placeholder">{profile.gender === 'male' ? '👨' : '👩'}</div>
          }
          <div>
            <h1>{profile.full_name || 'Anonymous'}</h1>
            <div className="badges">
              {hasValue(profile.age) && <span className="badge">🎂 {profile.age} years</span>}
              {hasValue(profile.religion) && <span className="badge">🕌 {profile.religion}</span>}
              {hasValue(profile.city) && <span className="badge">📍 {profile.city}</span>}
              {hasValue(profile.profession) && <span className="badge">💼 {profile.profession}</span>}
              {profile.nid_verified && <span className="badge">✓ Verified</span>}
            </div>
          </div>
        </div>

        {hasValue(profile.about_me) && (
          <div className="section">
            <h2>📝 About Me</h2>
            <p className="text-block">{profile.about_me}</p>
          </div>
        )}

        <div className="section">
          <h2>👤 Personal Information</h2>
          <div className="grid2">
            <div>
              {hasValue(profile.age) && <div className="row"><span className="lbl">Age</span><span className="val">{profile.age} years</span></div>}
              {hasValue(profile.height) && <div className="row"><span className="lbl">Height</span><span className="val">{profile.height}</span></div>}
              {hasValue(profile.weight) && <div className="row"><span className="lbl">Weight</span><span className="val">{profile.weight} kg</span></div>}
              {hasValue(profile.blood_group) && <div className="row"><span className="lbl">Blood Group</span><span className="val">{profile.blood_group}</span></div>}
              {hasValue(profile.complexion) && <div className="row"><span className="lbl">Complexion</span><span className="val">{profile.complexion}</span></div>}
            </div>
            <div>
              {hasValue(profile.marital_status) && <div className="row"><span className="lbl">Marital Status</span><span className="val">{profile.marital_status}</span></div>}
              {hasValue(profile.religion) && <div className="row"><span className="lbl">Religion</span><span className="val">{profile.religion}</span></div>}
              {hasValue(profile.sect) && <div className="row"><span className="lbl">Sect</span><span className="val">{profile.sect}</span></div>}
              {hasValue(profile.body_type) && <div className="row"><span className="lbl">Body Type</span><span className="val">{profile.body_type}</span></div>}
            </div>
          </div>
        </div>

        <div className="section">
          <h2>📍 Location</h2>
          <div className="grid2">
            <div>
              {hasValue(profile.city) && <div className="row"><span className="lbl">City</span><span className="val">{profile.city}</span></div>}
              {hasValue(profile.district) && <div className="row"><span className="lbl">District</span><span className="val">{profile.district}</span></div>}
            </div>
            <div>
              {hasValue(profile.country) && <div className="row"><span className="lbl">Country</span><span className="val">{profile.country}</span></div>}
              <div className="row"><span className="lbl">Willing to Relocate</span><span className="val">{profile.willing_to_relocate ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
        </div>

        <div className="section">
          <h2>🎓 Education & Career</h2>
          <div className="grid2">
            <div>
              {hasValue(profile.education) && <div className="row"><span className="lbl">Education</span><span className="val">{profile.education}</span></div>}
              {showDegree && <div className="row"><span className="lbl">Degree</span><span className="val">{profile.degree}</span></div>}
              {hasValue(profile.institution) && <div className="row"><span className="lbl">Institution</span><span className="val">{profile.institution}</span></div>}
            </div>
            <div>
              {hasValue(profile.profession) && <div className="row"><span className="lbl">Profession</span><span className="val">{profile.profession}</span></div>}
              {hasValue(profile.monthly_income) && profile.monthly_income > 0 && <div className="row"><span className="lbl">Monthly Income</span><span className="val">৳{Number(profile.monthly_income).toLocaleString()}</span></div>}
            </div>
          </div>
        </div>

        <div className="section">
          <h2>🕌 Religious Background</h2>
          <div className="grid2">
            <div>
              {hasValue(profile.religious_level) && <div className="row"><span className="lbl">Religious Level</span><span className="val">{profile.religious_level}</span></div>}
              {hasValue(profile.prayer_habit) && <div className="row"><span className="lbl">Prayer Habit</span><span className="val">{profile.prayer_habit}</span></div>}
            </div>
            <div>
              {hasValue(profile.diet) && <div className="row"><span className="lbl">Diet</span><span className="val">{profile.diet}</span></div>}
              {profile.gender === 'female' && <div className="row"><span className="lbl">Wears Hijab</span><span className="val">{profile.wears_hijab ? 'Yes' : 'No'}</span></div>}
            </div>
          </div>
        </div>

        <div className="section">
          <h2>👨‍👩‍👧‍👦 Family Background</h2>
          <div className="grid2">
            <div>
              {hasValue(profile.father_profession) && <div className="row"><span className="lbl">Father's Profession</span><span className="val">{profile.father_profession}</span></div>}
              {hasValue(profile.mother_profession) && <div className="row"><span className="lbl">Mother's Profession</span><span className="val">{profile.mother_profession}</span></div>}
              {hasValue(profile.total_siblings) && <div className="row"><span className="lbl">Total Siblings</span><span className="val">{profile.total_siblings}</span></div>}
            </div>
            <div>
              {hasValue(profile.family_type) && <div className="row"><span className="lbl">Family Type</span><span className="val">{profile.family_type}</span></div>}
              {hasValue(profile.family_values) && <div className="row"><span className="lbl">Family Values</span><span className="val">{profile.family_values}</span></div>}
              {hasValue(profile.family_status) && <div className="row"><span className="lbl">Family Status</span><span className="val">{profile.family_status}</span></div>}
            </div>
          </div>
        </div>

        {(hasValue(profile.hobbies) || hasValue(profile.personality_type)) && (
          <div className="section">
            <h2>🎨 Lifestyle & Personality</h2>
            <div className="grid2">
              <div>
                {hasValue(profile.personality_type) && <div className="row"><span className="lbl">Personality</span><span className="val">{profile.personality_type}</span></div>}
                <div className="row"><span className="lbl">Smoking</span><span className="val">{profile.smoking ? 'Yes' : 'No'}</span></div>
              </div>
              <div>
                <div className="row"><span className="lbl">Drinking</span><span className="val">{profile.drinking ? 'Yes' : 'No'}</span></div>
              </div>
            </div>
            {hasValue(profile.hobbies) && <div style={{ marginTop: '8px' }}><span className="lbl">Hobbies: </span><span style={{ fontSize: '13px', fontWeight: 600 }}>{profile.hobbies}</span></div>}
          </div>
        )}

        {hasValue(profile.expected_age_min) && (
          <div className="section">
            <h2>💕 Partner Expectations</h2>
            <div className="grid2">
              <div>
                <div className="row"><span className="lbl">Expected Age</span><span className="val">{profile.expected_age_min} - {profile.expected_age_max} yrs</span></div>
                {hasValue(profile.expected_education) && <div className="row"><span className="lbl">Education</span><span className="val">{profile.expected_education}</span></div>}
              </div>
              <div>
                {hasValue(profile.expected_religious_level) && <div className="row"><span className="lbl">Religious Level</span><span className="val">{profile.expected_religious_level}</span></div>}
                {hasValue(profile.expected_family_type) && <div className="row"><span className="lbl">Family Type</span><span className="val">{profile.expected_family_type}</span></div>}
              </div>
            </div>
            {hasValue(profile.partner_preference) && (
              <div style={{ marginTop: '8px' }}>
                <div className="lbl" style={{ marginBottom: '4px' }}>Partner Preference Details</div>
                <p className="text-block">{profile.partner_preference}</p>
              </div>
            )}
          </div>
        )}

        <div className="footer">
          <div className="footer-brand">BIYEKORI.COM</div>
          <p>Bangladesh's AI-Powered Matrimony Platform • www.biyekori.com</p>
          <p>Generated on {new Date().toLocaleDateString('en-BD')} • Profile ID: {profile.id}</p>
          <p style={{ marginTop: '6px', fontSize: '10px' }}>This document is confidential and intended for matrimonial purposes only.</p>
        </div>

      </div>
    </>
  )
}
