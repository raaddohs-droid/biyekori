'use client'
import { useState } from 'react'

interface Props {
  profile: any
  viewerProfile: any
  isLoggedIn: boolean
}

function getItems(profile: any, viewer: any): Array<{
  icon: string
  title: string
  detail: string
  type: 'warning' | 'info' | 'tip'
}> {
  const items: Array<{ icon: string; title: string; detail: string; type: 'warning' | 'info' | 'tip' }> = []

  // Age difference
  if (viewer?.expected_age_min || viewer?.expected_age_max) {
    const pAge = profile.age || 0
    const min = viewer.expected_age_min || 0
    const max = viewer.expected_age_max || 99
    if (pAge < min || pAge > max) {
      const diff = pAge < min ? min - pAge : pAge - max
      items.push({
        icon: '📅',
        title: 'Age difference',
        detail: `Their age (${pAge}) is ${diff} year${diff > 1 ? 's' : ''} outside your preferred range (${min}–${max}). Many couples make this work — consider if it matters to you.`,
        type: 'warning'
      })
    }
  }

  // Profile not selfie verified
  if (profile.selfie_status !== 'approved') {
    items.push({
      icon: '🛡️',
      title: 'Not selfie verified',
      detail: 'This profile has not completed live selfie verification. You can still connect — just be mindful when sharing personal contact details.',
      type: 'warning'
    })
  }

  // Living arrangement mismatch
  if (viewer?.expected_living_arrangement && profile.living_arrangement &&
    viewer.expected_living_arrangement !== profile.living_arrangement &&
    viewer.expected_living_arrangement !== 'Flexible' &&
    profile.living_arrangement !== 'Flexible') {
    items.push({
      icon: '🏠',
      title: 'Living arrangement differs',
      detail: `You prefer ${viewer.expected_living_arrangement}, they prefer ${profile.living_arrangement}. This is an important decision — worth aligning on early in conversations.`,
      type: 'info'
    })
  }

  // Marriage timeline mismatch
  if (viewer?.expected_marriage_timeline && profile.marriage_timeline &&
    viewer.expected_marriage_timeline !== profile.marriage_timeline) {
    items.push({
      icon: '💍',
      title: 'Different marriage timelines',
      detail: `You expect marriage ${viewer.expected_marriage_timeline.toLowerCase()}, they are thinking ${profile.marriage_timeline.toLowerCase()}. Worth discussing early.`,
      type: 'info'
    })
  }

  // Work after marriage mismatch
  if (viewer?.expected_work_after_marriage && profile.work_after_marriage &&
    viewer.expected_work_after_marriage !== profile.work_after_marriage &&
    viewer.expected_work_after_marriage !== 'Depends on situation' &&
    profile.work_after_marriage !== 'Depends on situation') {
    items.push({
      icon: '💼',
      title: 'Work plans after marriage',
      detail: `You expect your partner to: "${viewer.expected_work_after_marriage}". They say: "${profile.work_after_marriage}". This topic matters — bring it up early.`,
      type: 'info'
    })
  }

  // Religion mismatch
  if (viewer?.expected_religion && profile.religion &&
    viewer.expected_religion !== profile.religion) {
    items.push({
      icon: '🕌',
      title: 'Different religions',
      detail: `You prefer a ${viewer.expected_religion} partner. This profile is ${profile.religion}. This is a significant consideration for most families.`,
      type: 'warning'
    })
  }

  // Profile completion low
  const completion = profile.profile_completion || 0
  if (completion < 50) {
    items.push({
      icon: '📝',
      title: 'Profile is incomplete',
      detail: `This profile is only ${completion}% complete. Key information like income, family type, and lifestyle preferences may be missing. Consider asking them to complete their profile.`,
      type: 'tip'
    })
  }

  // No profile photo
  if (!profile.photo_url) {
    items.push({
      icon: '📷',
      title: 'No profile photo',
      detail: 'This profile has no photo. You may want to request one before proceeding.',
      type: 'tip'
    })
  }

  // Smoking mismatch (only if viewer specifically wants non-smoker)
  if (viewer?.expected_smoking === 'no') {
    const smokes = profile.smoking && profile.smoking !== 'false' && profile.smoking !== 'no'
    if (smokes) {
      items.push({
        icon: '🚭',
        title: 'Smoking preference differs',
        detail: `You prefer a non-smoker. This profile smokes${profile.smoking === 'occasionally' ? ' occasionally' : ''}. Worth discussing if this is a dealbreaker for you.`,
        type: 'warning'
      })
    }
  }

  // Children mismatch
  if (viewer?.accepts_partner_with_children === false) {
    const hasKids = profile.has_children && profile.has_children !== 'false'
    if (hasKids) {
      items.push({
        icon: '👶',
        title: 'Has children',
        detail: `This person has children. Your preference is for a partner without children. Consider if this changes your decision.`,
        type: 'warning'
      })
    }
  }

  return items
}

const TYPE_COLORS = {
  warning: { bg: '#fff1f2', border: '#fecdd3', icon: '#e11d48', text: '#be123c' },
  info: { bg: '#eff6ff', border: '#bfdbfe', icon: '#2563eb', text: '#1d4ed8' },
  tip: { bg: '#f0fdf4', border: '#bbf7d0', icon: '#16a34a', text: '#15803d' },
}

export default function BeforeYouConnect({ profile, viewerProfile, isLoggedIn }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [openItem, setOpenItem] = useState<number | null>(null)

  if (!isLoggedIn || !viewerProfile) return null

  const items = getItems(profile, viewerProfile)
  if (items.length === 0) return (
    <div style={{ background: '#f0fdf4', borderRadius: '16px', padding: '16px 20px', marginBottom: '20px', border: '1px solid #bbf7d0', display: 'flex', gap: '12px', alignItems: 'center' }}>
      <span style={{ fontSize: '20px' }}>✅</span>
      <div>
        <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 700, color: '#15803d' }}>No major concerns</p>
        <p style={{ margin: 0, fontSize: '12px', color: '#16a34a' }}>Based on your preferences, this profile looks compatible. Go ahead and connect!</p>
      </div>
    </div>
  )

  const warnings = items.filter(i => i.type === 'warning')
  const others = items.filter(i => i.type !== 'warning')
  const visibleItems = expanded ? items : items.slice(0, 3)

  return (
    <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '20px', border: '1px solid #f1f5f9' }}>

      {/* Header */}
      <button onClick={() => setExpanded(!expanded)} style={{
        width: '100%', padding: '16px 20px', background: 'none', border: 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>💬</span>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#111827' }}>Before You Connect</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{items.length} thing{items.length !== 1 ? 's' : ''} to be aware of</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {warnings.length > 0 && (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#e11d48', background: '#fff1f2', padding: '2px 8px', borderRadius: '20px' }}>
              {warnings.length} important
            </span>
          )}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </button>

      {/* Items */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {visibleItems.map((item, i) => {
          const colors = TYPE_COLORS[item.type]
          const isOpen = openItem === i
          return (
            <div key={i} style={{ background: colors.bg, borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
              <button onClick={() => setOpenItem(isOpen ? null : i)} style={{
                width: '100%', padding: '12px 14px', background: 'none', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left'
              }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827', flex: 1 }}>{item.title}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {isOpen && (
                <div style={{ padding: '0 14px 12px 40px' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#374151', lineHeight: 1.6 }}>{item.detail}</p>
                </div>
              )}
            </div>
          )
        })}

        {items.length > 3 && (
          <button onClick={() => setExpanded(!expanded)} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: '#6b7280', textAlign: 'center' }}>
            {expanded ? 'Show less' : `Show ${items.length - 3} more`}
          </button>
        )}
      </div>

      {/* Footer tip */}
      <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
          These are conversation starters, not dealbreakers. Every family is unique.
        </p>
      </div>
    </div>
  )
}
