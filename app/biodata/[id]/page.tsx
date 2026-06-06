'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default function BiodataPage() {
  const params = useParams()
  const id = params?.id as string
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}&select=*`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    })
      .then(r => r.json())
      .then(data => { setProfile(data[0] || null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const element = document.getElementById('biodata-content')
      if (!element) return

      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `biodata-${profile?.full_name?.replace(/\s+/g, '-') || id}.pdf`,
        image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as 'portrait' }
      }
      await html2pdf().set(opt).from(element).save()
    } catch (err) {
      alert('Download failed. Please use Print → Save as PDF instead.')
    }
    setDownloading(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontSize: '20px', fontFamily: 'Arial' }}>
      Loading biodata...
    </div>
  )
  if (!profile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontSize: '20px', fontFamily: 'Arial' }}>
      Profile not found
    </div>
  )

  const has = (v: any) => v !== null && v !== undefined && String(v).trim() !== '' && String(v).toLowerCase() !== 'not specified'
  const showDegree = has(profile.degree) && profile.degree !== profile.education && !['SSC','HSC'].includes(profile.education)

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: Arial, sans-serif; background: #f5f3ff; color: #1a1a1a; }
        .print-bar { background: #f3f0ff; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #7c3aed; position: sticky; top: 0; z-index: 100; }
        .bar-left { display: flex; align-items: center; gap: 8px; }
        .back-link { color: #7c3aed; font-weight: 700; text-decoration: none; font-size: 14px; }
        .bar-right { display: flex; gap: 10px; }
        .download-btn { background: linear-gradient(135deg,#7c3aed,#ec4899); color: white; border: none; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .download-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .print-btn { background: white; color: #7c3aed; border: 2px solid #7c3aed; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .wrapper { max-width: 860px; margin: 24px auto; background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(124,58,237,0.1); overflow: hidden; }
        .page { padding: 40px; }
        .logo { text-align: center; margin-bottom: 20px; }
        .logo-brand { font-size: 16px; color: #7c3aed; font-weight: 900; letter-spacing: 3px; }
        .logo-sub { font-size: 11px; color: #9ca3af; margin-top: 2px; }
        .header { background: linear-gradient(135deg,#7c3aed,#ec4899); color: white; padding: 24px; border-radius: 14px; margin-bottom: 18px; display: flex; align-items: center; gap: 18px; }
        .photo { width: 100px; height: 100px; border-radius: 10px; border: 3px solid white; object-fit: cover; flex-shrink: 0; }
        .photo-ph { width: 100px; height: 100px; border-radius: 10px; border: 3px solid white; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 40px; flex-shrink: 0; }
        .header h1 { font-size: 24px; font-weight: 900; margin-bottom: 8px; }
        .badges { display: flex; flex-wrap: wrap; gap: 6px; }
        .badge { background: rgba(255,255,255,0.2); padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .section { background: #f9f7ff; border-radius: 10px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #7c3aed; }
        .section h2 { font-size: 12px; font-weight: 800; color: #7c3aed; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
        .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #ede9fe; }
        .row:last-child { border-bottom: none; }
        .lbl { color: #6b7280; font-size: 12px; }
        .val { font-weight: 600; font-size: 12px; color: #1f2937; text-align: right; }
        .text-block { font-size: 13px; line-height: 1.6; color: #374151; }
        .footer { text-align: center; margin-top: 20px; padding: 14px; border-top: 2px solid #e5e7eb; }
        .footer-brand { font-size: 13px; font-weight: 900; color: #7c3aed; }
        .footer p { font-size: 11px; color: #9ca3af; margin-top: 2px; }
        @media print {
          .print-bar { display: none !important; }
          body { background: white; }
          .wrapper { box-shadow: none; border-radius: 0; margin: 0; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
        @media (max-width: 600px) {
          .page { padding: 20px; }
          .grid2 { grid-template-columns: 1fr; }
          .bar-right { gap: 6px; }
          .download-btn, .print-btn { padding: 8px 12px; font-size: 12px; }
        }
      `}</style>

      {/* Top Bar */}
      <div className="print-bar">
        <div className="bar-left">
          <Link href={`/profile/${id}`} className="back-link">← Back to Profile</Link>
        </div>
        <div className="bar-right">
          <button className="download-btn" onClick={handleDownloadPDF} disabled={downloading}>
            {downloading ? '⏳ Downloading...' : '⬇️ Download PDF'}
          </button>
          <button className="print-btn" onClick={() => window.print()}>
            🖨️ Print
          </button>
        </div>
      </div>

      <div className="wrapper">
        <div className="page" id="biodata-content">

          <div className="logo">
            <div className="logo-brand">✦ BIYEKORI.COM ✦</div>
            <div className="logo-sub">Bangladesh's AI Matrimony Platform</div>
          </div>

          <div className="header">
            {profile.photo_url
              ? <img src={profile.photo_url} alt={profile.full_name} className="photo" crossOrigin="anonymous" />
              : <div className="photo-ph">{profile.gender === 'male' ? '👨' : '👩'}</div>
            }
            <div>
              <h1>{profile.full_name || 'Anonymous'}</h1>
              <div className="badges">
                {has(profile.age) && <span className="badge">🎂 {profile.age} yrs</span>}
                {has(profile.religion) && <span className="badge">🕌 {profile.religion}</span>}
                {has(profile.city) && <span className="badge">📍 {profile.city}</span>}
                {has(profile.profession) && <span className="badge">💼 {profile.profession}</span>}
                {profile.nid_verified && <span className="badge">✓ Verified</span>}
              </div>
            </div>
          </div>

          {has(profile.about_me) && (
            <div className="section">
              <h2>📝 About Me</h2>
              <p className="text-block">{profile.about_me}</p>
            </div>
          )}

          <div className="section">
            <h2>👤 Personal Information</h2>
            <div className="grid2">
              <div>
                {has(profile.age) && <div className="row"><span className="lbl">Age</span><span className="val">{profile.age} years</span></div>}
                {has(profile.height) && <div className="row"><span className="lbl">Height</span><span className="val">{profile.height}</span></div>}
                {has(profile.weight) && <div className="row"><span className="lbl">Weight</span><span className="val">{profile.weight} kg</span></div>}
                {has(profile.blood_group) && <div className="row"><span className="lbl">Blood Group</span><span className="val">{profile.blood_group}</span></div>}
                {has(profile.complexion) && <div className="row"><span className="lbl">Complexion</span><span className="val">{profile.complexion}</span></div>}
              </div>
              <div>
                {has(profile.marital_status) && <div className="row"><span className="lbl">Marital Status</span><span className="val">{profile.marital_status}</span></div>}
                {has(profile.religion) && <div className="row"><span className="lbl">Religion</span><span className="val">{profile.religion}</span></div>}
                {has(profile.sect) && <div className="row"><span className="lbl">Sect</span><span className="val">{profile.sect}</span></div>}
                {has(profile.body_type) && <div className="row"><span className="lbl">Body Type</span><span className="val">{profile.body_type}</span></div>}
              </div>
            </div>
          </div>

          <div className="section">
            <h2>📍 Location</h2>
            <div className="grid2">
              <div>
                {has(profile.city) && <div className="row"><span className="lbl">City / District</span><span className="val">{profile.city}</span></div>}
                {has(profile.residency_status) && <div className="row"><span className="lbl">Residency Status</span><span className="val">{profile.residency_status}</span></div>}
                {has(profile.grew_up_in) && <div className="row"><span className="lbl">Grew Up In</span><span className="val">{profile.grew_up_in}</span></div>}
              </div>
              <div>
                {has(profile.country) && <div className="row"><span className="lbl">Country</span><span className="val">{profile.country}</span></div>}
                <div className="row"><span className="lbl">Willing to Relocate</span><span className="val">{profile.willing_to_relocate ? 'Yes' : 'No'}</span></div>
              </div>
            </div>
          </div>

          <div className="section">
            <h2>🎓 Education & Career</h2>
            <div className="grid2">
              <div>
                {has(profile.education) && <div className="row"><span className="lbl">Education</span><span className="val">{profile.education}</span></div>}
                {showDegree && <div className="row"><span className="lbl">Degree</span><span className="val">{profile.degree}</span></div>}
                {has(profile.college_attended) && <div className="row"><span className="lbl">College / University</span><span className="val">{profile.college_attended}</span></div>}
                {has(profile.institution) && <div className="row"><span className="lbl">Institution</span><span className="val">{profile.institution}</span></div>}
              </div>
              <div>
                {has(profile.profession) && <div className="row"><span className="lbl">Profession</span><span className="val">{profile.profession}</span></div>}
                {has(profile.working_with) && <div className="row"><span className="lbl">Working With</span><span className="val">{profile.working_with}</span></div>}
                {has(profile.working_as) && <div className="row"><span className="lbl">Working As</span><span className="val">{profile.working_as}</span></div>}
                {has(profile.employer_name) && <div className="row"><span className="lbl">Employer</span><span className="val">{profile.employer_name}</span></div>}
                {has(profile.monthly_income) && profile.monthly_income > 0 && <div className="row"><span className="lbl">Monthly Income</span><span className="val">৳{Number(profile.monthly_income).toLocaleString()}</span></div>}
              </div>
            </div>
          </div>

          <div className="section">
            <h2>🕌 Religious Background</h2>
            <div className="grid2">
              <div>
                {has(profile.religious_level) && <div className="row"><span className="lbl">Religious Practice</span><span className="val">{profile.religious_level}</span></div>}
                {has(profile.community) && <div className="row"><span className="lbl">Community / Sect</span><span className="val">{profile.community}</span></div>}
                {has(profile.prayer_habit) && <div className="row"><span className="lbl">Prayer Habit</span><span className="val">{profile.prayer_habit}</span></div>}
              </div>
              <div>
                {has(profile.diet) && <div className="row"><span className="lbl">Diet</span><span className="val">{profile.diet}</span></div>}
                {profile.gender === 'female' && <div className="row"><span className="lbl">Wears Hijab</span><span className="val">{profile.wears_hijab ? 'Yes' : 'No'}</span></div>}
              </div>
            </div>
          </div>

          <div className="section">
            <h2>👨‍👩‍👧‍👦 Family Background</h2>
            <div className="grid2">
              <div>
                {has(profile.father_profession) && <div className="row"><span className="lbl">Father's Profession</span><span className="val">{profile.father_profession}</span></div>}
                {has(profile.mother_profession) && <div className="row"><span className="lbl">Mother's Profession</span><span className="val">{profile.mother_profession}</span></div>}
                {profile.num_sisters !== null && profile.num_sisters !== undefined && <div className="row"><span className="lbl">No. of Sisters</span><span className="val">{profile.num_sisters === 0 ? 'None' : profile.num_sisters}</span></div>}
                {profile.num_brothers !== null && profile.num_brothers !== undefined && <div className="row"><span className="lbl">No. of Brothers</span><span className="val">{profile.num_brothers === 0 ? 'None' : profile.num_brothers}</span></div>}
                {has(profile.total_siblings) && <div className="row"><span className="lbl">Total Siblings</span><span className="val">{profile.total_siblings}</span></div>}
              </div>
              <div>
                {has(profile.family_financial_status) && <div className="row"><span className="lbl">Family Financial Status</span><span className="val">{profile.family_financial_status}</span></div>}
                {has(profile.family_location) && <div className="row"><span className="lbl">Family Location</span><span className="val">{profile.family_location}</span></div>}
                {has(profile.family_type) && <div className="row"><span className="lbl">Family Type</span><span className="val">{profile.family_type}</span></div>}
                {has(profile.family_values) && <div className="row"><span className="lbl">Family Values</span><span className="val">{profile.family_values}</span></div>}
                {has(profile.family_status) && <div className="row"><span className="lbl">Family Status</span><span className="val">{profile.family_status}</span></div>}
              </div>
            </div>
          </div>

          {(has(profile.hobbies) || has(profile.personality_type)) && (
            <div className="section">
              <h2>🎨 Lifestyle & Personality</h2>
              <div className="grid2">
                <div>
                  {has(profile.personality_type) && <div className="row"><span className="lbl">Personality</span><span className="val">{profile.personality_type}</span></div>}
                  <div className="row"><span className="lbl">Smoking</span><span className="val">{profile.smoking ? 'Yes' : 'No'}</span></div>
                </div>
                <div>
                  <div className="row"><span className="lbl">Drinking</span><span className="val">{profile.drinking ? 'Yes' : 'No'}</span></div>
                </div>
              </div>
              {has(profile.social_lifestyle) && <div className="row"><span className="lbl">Social Lifestyle</span><span className="val">{profile.social_lifestyle === 'quiet' ? 'Quiet and home-oriented' : profile.social_lifestyle === 'balanced' ? 'Balanced' : profile.social_lifestyle === 'social' ? 'Social and outgoing' : profile.social_lifestyle === 'depends' ? 'Depends on occasion' : profile.social_lifestyle}</span></div>}
              {has(profile.family_involvement) && <div className="row"><span className="lbl">Family Involvement</span><span className="val">{profile.family_involvement === 'from_beginning' ? 'Family involved from the beginning' : profile.family_involvement === 'talk_first' ? 'Talk first, involve family shortly after' : profile.family_involvement === 'after_mutual' ? 'After mutual interest' : profile.family_involvement === 'guardian_to_guardian' ? 'Guardian-to-guardian preferred' : profile.family_involvement}</span></div>}
              {has(profile.dowry_stance) && <div className="row"><span className="lbl">Dowry Stance</span><span className="val">{profile.dowry_stance === 'against' ? 'Strictly against dowry' : profile.dowry_stance === 'gifts_only' ? 'No dowry; voluntary gifts only' : profile.dowry_stance === 'discussion' ? 'Open to discussion' : profile.dowry_stance === 'prefer_not' ? 'Prefer not to say' : profile.dowry_stance}</span></div>}
              {has(profile.wedding_style) && <div className="row"><span className="lbl">Wedding Style</span><span className="val">{profile.wedding_style === 'simple' ? 'Simple and intimate' : profile.wedding_style === 'traditional' ? 'Traditional family wedding' : profile.wedding_style === 'large' ? 'Large celebration' : profile.wedding_style === 'discussion' ? 'Open to discussion' : profile.wedding_style}</span></div>}
              {has(profile.hobbies) && <div style={{marginTop:'8px'}}><span className="lbl">Hobbies: </span><span style={{fontSize:'12px',fontWeight:600}}>{profile.hobbies}</span></div>}
            </div>
          )}

          {has(profile.expected_age_min) && (
            <div className="section">
              <h2>💕 Partner Expectations</h2>
              <div className="grid2">
                <div>
                  <div className="row"><span className="lbl">Expected Age</span><span className="val">{profile.expected_age_min} - {profile.expected_age_max} yrs</span></div>
                  {has(profile.expected_education) && <div className="row"><span className="lbl">Education</span><span className="val">{profile.expected_education}</span></div>}
                </div>
                <div>
                  {has(profile.expected_religious_level) && <div className="row"><span className="lbl">Religious Level</span><span className="val">{profile.expected_religious_level}</span></div>}
                  {has(profile.expected_family_type) && <div className="row"><span className="lbl">Family Type</span><span className="val">{profile.expected_family_type}</span></div>}
                </div>
              </div>
              {has(profile.partner_preference) && (
                <div style={{marginTop:'8px'}}>
                  <div className="lbl" style={{marginBottom:'4px'}}>Partner Preference</div>
                  <p className="text-block">{profile.partner_preference}</p>
                </div>
              )}
            </div>
          )}

          <div className="footer">
            <div className="footer-brand">BIYEKORI.COM</div>
            <p>Bangladesh's AI-Powered Matrimony Platform • www.biyekori.com</p>
            <p>Generated on {new Date().toLocaleDateString('en-BD')} • Profile ID: {profile.id}</p>
            <p style={{marginTop:'4px',fontSize:'10px'}}>This document is confidential and intended for matrimonial purposes only.</p>
          </div>

        </div>
      </div>
    </>
  )
}
