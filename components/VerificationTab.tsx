'use client'
import { useState } from 'react'
import Link from 'next/link'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface Props {
  user: any
  profile: any
  onUpdate: () => void
}

type DocType = 'education' | 'job'
type UploadState = 'idle' | 'uploading' | 'processing' | 'done' | 'pending'

export default function VerificationTab({ user, profile, onUpdate }: Props) {
  const [eduState, setEduState] = useState<UploadState>('idle')
  const [jobState, setJobState] = useState<UploadState>('idle')
  const [eduResult, setEduResult] = useState<any>(null)
  const [jobResult, setJobResult] = useState<any>(null)
  const [eduError, setEduError] = useState('')
  const [jobError, setJobError] = useState('')

  const handleUpload = async (file: File, docType: DocType) => {
    const setState = docType === 'education' ? setEduState : setJobState
    const setResult = docType === 'education' ? setEduResult : setJobResult
    const setError = docType === 'education' ? setEduError : setJobError

    setState('uploading')
    setError('')

    try {
      // Upload to Supabase storage
      const fileName = `documents/${user.id}/${docType}-${Date.now()}.${file.name.split('.').pop()}`
      const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/profile-photos/${fileName}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': file.type,
          'x-upsert': 'true'
        },
        body: file
      })

      if (!uploadRes.ok) throw new Error('Upload failed')
      const docUrl = `${SUPABASE_URL}/storage/v1/object/public/profile-photos/${fileName}`

      setState('processing')

      // Call verification API
      const verifyRes = await fetch('/api/verify-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          docUrl,
          docType,
          profileName: profile.full_name || user.full_name
        })
      })

      const result = await verifyRes.json()
      setResult(result)

      if (result.autoApproved) {
        setState('done')
        onUpdate()
      } else {
        setState('pending')
      }
    } catch (e: any) {
      setError(e.message || 'Upload failed. Please try again.')
      setState('idle')
    }
  }

  const VerificationCard = ({
    docType, title, description, examples, icon,
    state, result, error, isVerified, verifiedAt
  }: {
    docType: DocType, title: string, description: string,
    examples: string[], icon: string, state: UploadState,
    result: any, error: string, isVerified: boolean, verifiedAt: string
  }) => {
    const setState = docType === 'education' ? setEduState : setJobState

    return (
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: isVerified ? '1px solid #bbf7d0' : '1px solid #e5e7eb' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '28px' }}>{icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#111827' }}>{title}</h3>
              {isVerified && (
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '20px' }}>Verified</span>
              )}
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>{description}</p>
          </div>
        </div>

        {isVerified ? (
          <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '14px', border: '1px solid #bbf7d0' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}><path d="M20 6L9 17l-5-5"/></svg>
              <div>
                {result?.aiResult?.qualification && <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#15803d' }}>{result.aiResult.qualification}</p>}
                {result?.aiResult?.institution && <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#16a34a' }}>{result.aiResult.institution}</p>}
                {result?.aiResult?.business_or_employer && <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#16a34a' }}>{result.aiResult.business_or_employer}</p>}
                <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>Certificate checked · Name matched · {verifiedAt ? new Date(verifiedAt).toLocaleDateString() : 'Recently'}</p>
              </div>
            </div>
          </div>
        ) : state === 'idle' ? (
          <>
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#374151' }}>Accepted documents:</p>
              <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
                {examples.map((ex, i) => <li key={i} style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>{ex}</li>)}
              </ul>
            </div>
            <div style={{ background: '#fffbeb', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px', border: '1px solid #fde68a', fontSize: '12px', color: '#92400e' }}>
              Your document is stored privately and never shown publicly. AI reads your name and qualifications only.
            </div>
            <label style={{ cursor: 'pointer', display: 'block' }}>
              <div style={{ padding: '12px', background: 'linear-gradient(135deg,#e11d48,#db2777)', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>
                Upload Document
              </div>
              <input type="file" accept="image/*,.pdf" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, docType) }} style={{ display: 'none' }} />
            </label>
            {error && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#e11d48' }}>{error}</p>}
          </>
        ) : state === 'uploading' ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #fce7f3', borderTopColor: '#e11d48', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Uploading document...</p>
          </div>
        ) : state === 'processing' ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #fce7f3', borderTopColor: '#e11d48', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
            <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>AI is reading your document...</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Checking name and qualifications</p>
          </div>
        ) : state === 'pending' ? (
          <div style={{ background: '#fffbeb', borderRadius: '12px', padding: '14px', border: '1px solid #fde68a' }}>
            <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#92400e' }}>Sent for manual review</p>
            <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#b45309', lineHeight: 1.5 }}>
              {result?.reason || 'Our team will review your document within 24 hours and notify you.'}
            </p>
            {result?.aiResult && (
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {result.aiResult.name_on_document && <p style={{ margin: '0 0 2px' }}>Name found: {result.aiResult.name_on_document}</p>}
                {result.aiResult.document_type && <p style={{ margin: 0 }}>Document type: {result.aiResult.document_type}</p>}
              </div>
            )}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ background: '#f0f9ff', borderRadius: '14px', padding: '16px', border: '1px solid #bae6fd' }}>
        <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#0369a1' }}>About document verification</p>
        <p style={{ margin: 0, fontSize: '12px', color: '#0284c7', lineHeight: 1.6 }}>
          Our AI reads your uploaded documents to verify your name matches your profile. Documents are stored privately and never shown to other users. Verification badges add significant trust to your profile.
        </p>
      </div>

      {/* Selfie status */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: profile.selfie_status === 'approved' ? '1px solid #bbf7d0' : '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🤳</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#111827' }}>Live Selfie</h3>
                {profile.selfie_status === 'approved' && <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '20px' }}>Verified</span>}
                {profile.selfie_status === 'pending' && <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400e', background: '#fef3c7', padding: '2px 8px', borderRadius: '20px' }}>Pending</span>}
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>Live face check — confirms your photo is real</p>
            </div>
          </div>
          {profile.selfie_status !== 'approved' && profile.selfie_status !== 'pending' && (
            <Link href="/verify-selfie" style={{ padding: '8px 16px', background: '#0369a1', color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
              Verify Now
            </Link>
          )}
        </div>
      </div>

      <VerificationCard
        docType="education"
        title="Education Certificate"
        description="Verify your highest qualification"
        icon="🎓"
        examples={[
          'Degree certificate (HSC, Bachelor\'s, Master\'s, PhD)',
          'University marksheet with name',
          'Diploma certificate',
          'MBBS / Engineering degree'
        ]}
        state={eduState}
        result={eduResult}
        error={eduError}
        isVerified={profile.education_verified || eduState === 'done'}
        verifiedAt={profile.education_verified_at}
      />

      <VerificationCard
        docType="job"
        title="Job / Business"
        description="Verify your employment or business"
        icon="💼"
        examples={[
          'Trade license',
          'Employment letter on company letterhead',
          'Business registration certificate',
          'Office ID card with name and designation'
        ]}
        state={jobState}
        result={jobResult}
        error={jobError}
        isVerified={profile.job_verified || jobState === 'done'}
        verifiedAt={profile.job_verified_at}
      />

      <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid #e5e7eb' }}>
        <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 700, color: '#374151' }}>Why verify?</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            '✓ Verified profiles receive 4x more serious responses',
            '✓ Families trust verified candidates significantly more',
            '✓ Your documents are never shown publicly',
            '✓ Badges appear on your profile and browse cards',
          ].map((t, i) => <p key={i} style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{t}</p>)}
        </div>
      </div>

    </div>
  )
}
