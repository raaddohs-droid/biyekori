import UpgradeNudge from '@/components/UpgradeNudge'
import GuestGate from '@/components/GuestGate'
import { getProfiles } from '@/lib/supabase-server'
import ProfilesClient from '@/components/profiles/ProfilesClient'
import ProfilesGrid from '@/components/profiles/ProfilesGrid'
import Link from 'next/link'
import { Suspense } from 'react'

export const revalidate = 0
export const dynamic = 'force-dynamic'

const PROFILES_PER_PAGE = 24
const FREE_MAX_PAGES = 5

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const DISTRICTS = [
  'Dhaka','Chittagong','Rajshahi','Khulna','Barisal','Sylhet','Rangpur','Mymensingh',
  'Comilla','Gazipur','Narayanganj','Narsingdi','Tangail','Jamalpur','Sherpur',
  'Netrokona','Brahmanbaria','Chandpur','Lakshmipur','Noakhali','Feni',
  "Cox's Bazar",'Bandarban','Rangamati','Khagrachhari','Bogra','Chapainawabganj',
  'Joypurhat','Naogaon','Natore','Pabna','Sirajganj','Jessore','Jhenaidah',
  'Kushtia','Magura','Meherpur','Narail','Chuadanga','Satkhira','Bagerhat',
  'Barguna','Bhola','Jhalokathi','Patuakhali','Pirojpur','Dinajpur','Gaibandha',
  'Kurigram','Lalmonirhat','Nilphamari','Panchagarh','Thakurgaon','Habiganj',
  'Moulvibazar','Sunamganj','Faridpur','Gopalganj','Madaripur','Rajbari',
  'Shariatpur','Kishoreganj','Manikganj','Munshiganj'
]

const EDUCATIONS = ["Bachelor's","Master's","Engineering","Medical","PhD","HSC","SSC","Diploma","Law","Other"]
const PROFESSIONS = ["Doctor","Engineer","IT Professional","Teacher","Business","Banker","Government Job","Lawyer","Accountant","Nurse","Other"]
const RELIGIONS = ["Islam","Hinduism","Christianity","Buddhism","Other"]
const MARITAL_STATUSES = ["Never married","Divorced","Widowed"]

const C = {
  maroon: '#7B1D2E',
  maroonLight: '#9B2D3E',
  maroonBg: '#FDF2F4',
  gold: '#B8892A',
  goldLight: '#F5E6C8',
  ivory: '#FAFAF7',
  border: '#E8E0D8',
  text: '#1C1917',
  textMuted: '#78716C',
  textLight: '#A8A29E',
  white: '#FFFFFF',
  cardShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
  cardShadowHover: '0 4px 20px rgba(0,0,0,0.12)',
}

export default async function ProfilesPage({ searchParams }: PageProps) {
  const params = await searchParams

  const userGender = typeof params.userGender === 'string'
    ? params.userGender
    : (typeof params.gender === 'string' ? params.gender : '')
  const excludeId = typeof params.excludeId === 'string' ? params.excludeId : ''
  const currentPage = typeof params.page === 'string' ? parseInt(params.page) || 1 : 1
  const districtFilter = typeof params.district === 'string' ? params.district : ''
  const minAge = typeof params.minAge === 'string' ? parseInt(params.minAge) || 18 : 18
  const maxAge = typeof params.maxAge === 'string' ? parseInt(params.maxAge) || 70 : 70
  const maritalFilter = typeof params.marital === 'string' ? params.marital : ''
  const viewMode = typeof params.view === 'string' && params.view === 'grid' ? 'grid' : 'list'
  const eduFilter = typeof params.edu === 'string' ? params.edu : ''
  const profFilter = typeof params.prof === 'string' ? params.prof : ''
  const neverMarriedOnly = params.neverMarried === '1'
  const discoverMode = params.discover === '1'
  const religionFilter = typeof params.religion === 'string' ? params.religion : ''
  const guardianOnly = params.guardianOnly === '1'
  const selfOnly = params.selfOnly === '1'
  const hideViewed = params.hideViewed === '1'
  const activeTab = typeof params.tab === 'string' ? params.tab : 'recommended'
  const sortBy = typeof params.sort === 'string' ? params.sort : 'recommended'

  // Fetch user package
  let userPackage = 'prottasha'
  if (excludeId) {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: prof } = await sb.from('profiles').select('package').eq('id', excludeId).single()
    if (prof?.package) userPackage = prof.package
  }
  const isPaid = ['silver', 'gold', 'milon'].includes(userPackage)

  if (!isPaid && currentPage > FREE_MAX_PAGES) {
    return (
  <div style={{ minHeight: '100vh', background: C.ivory, paddingTop: 'clamp(90px, 15vw, 130px)', overflowX: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px', padding: '40px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💍</div>
          <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 700, color: C.text }}>আরো প্রোফাইল দেখতে আপগ্রেড করুন</h2>
          <p style={{ margin: '0 0 24px', fontSize: '15px', color: C.textMuted, lineHeight: 1.6 }}>
            আপনি বিনামূল্যে ব্রাউজের সীমা পেরিয়ে গেছেন। প্রিমিয়াম সদস্যরা যাচাইকৃত প্রোফাইলে সীমাহীন অ্যাক্সেস পান।
          </p>
          <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', background: C.maroon, color: 'white', borderRadius: '10px', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }}>
            View Plans
          </Link>
        </div>
      </div>
    )
  }

  const allProfiles = await getProfiles()
  let filtered = allProfiles

  if (userGender) {
    const showGender = userGender === 'male' ? 'female' : 'male'
    filtered = filtered.filter((p: any) => p.gender === showGender)
  }
  if (excludeId) filtered = filtered.filter((p: any) => String(p.id) !== String(excludeId))
  if (districtFilter) filtered = filtered.filter((p: any) => (p.district || p.city) === districtFilter)
  if (minAge !== 18) filtered = filtered.filter((p: any) => p.age >= minAge)
  if (maxAge !== 70) filtered = filtered.filter((p: any) => p.age <= maxAge)
  if (maritalFilter) filtered = filtered.filter((p: any) => p.marital_status === maritalFilter)
  if (eduFilter) filtered = filtered.filter((p: any) => p.education === eduFilter)
  if (profFilter) filtered = filtered.filter((p: any) => p.profession === profFilter)
  if (religionFilter) filtered = filtered.filter((p: any) => p.religion === religionFilter)
  if (guardianOnly) filtered = filtered.filter((p: any) => p.guardian_mode)
  if (selfOnly) filtered = filtered.filter((p: any) => !p.guardian_mode)
  if (neverMarriedOnly) filtered = filtered.filter((p: any) => p.marital_status === 'Never married')

  // Tab filters
  if (activeTab === 'new' || discoverMode) {
    const oneWeekAgo = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    filtered = filtered.filter((p: any) => p.created_at && new Date(p.created_at) >= oneWeekAgo)
  } else if (activeTab === 'verified') {
    filtered = filtered.filter((p: any) => p.is_verified || p.nid_verified)
  } else if (activeTab === 'nrb') {
    filtered = filtered.filter((p: any) => p.package === 'milon' || (p.city || '').toLowerCase().includes('abroad') || (p.district || '').toLowerCase().includes('uk') || (p.district || '').toLowerCase().includes('us'))
  }

  // Sort
  filtered = [...filtered].sort((a: any, b: any) => {
    const aFeat = a.is_featured && a.featured_until && new Date(a.featured_until) > new Date()
    const bFeat = b.is_featured && b.featured_until && new Date(b.featured_until) > new Date()
    if (aFeat && !bFeat) return -1
    if (!aFeat && bFeat) return 1
    if (sortBy === 'newest') return new Date(b.created_at||0).getTime() - new Date(a.created_at||0).getTime()
    if (sortBy === 'age_asc') return (a.age||99) - (b.age||99)
    if (sortBy === 'age_desc') return (b.age||0) - (a.age||0)
    if (sortBy === 'verified') {
      const av = (a.is_verified?2:0)+(a.nid_verified?1:0), bv = (b.is_verified?2:0)+(b.nid_verified?1:0)
      return bv - av
    }
    return 0
  })

  const oneWeekAgoDate = new Date(); oneWeekAgoDate.setDate(oneWeekAgoDate.getDate() - 7)
  const newThisWeek = allProfiles.filter((p: any) => {
    const genderMatch = !userGender || p.gender === (userGender === 'male' ? 'female' : 'male')
    return p.created_at && new Date(p.created_at) >= oneWeekAgoDate && genderMatch
  }).length

  const totalProfiles = filtered.length
  const totalPages = Math.ceil(totalProfiles / PROFILES_PER_PAGE)
  const startIndex = (currentPage - 1) * PROFILES_PER_PAGE
  const paginatedProfiles = filtered.slice(startIndex, startIndex + PROFILES_PER_PAGE)

  const baseUrl = `/profiles${userGender ? '?userGender=' + userGender : '?'}${excludeId ? '&excludeId=' + excludeId : ''}`

  const buildUrl = (page: number) => {
    let url = `/profiles?page=${page}`
    if (userGender) url += `&userGender=${userGender}`
    if (excludeId) url += `&excludeId=${excludeId}`
    if (viewMode !== 'list') url += `&view=${viewMode}`
    if (activeTab !== 'recommended') url += `&tab=${activeTab}`
    if (sortBy !== 'recommended') url += `&sort=${sortBy}`
    if (districtFilter) url += `&district=${encodeURIComponent(districtFilter)}`
    if (religionFilter) url += `&religion=${encodeURIComponent(religionFilter)}`
    if (eduFilter) url += `&edu=${encodeURIComponent(eduFilter)}`
    if (profFilter) url += `&prof=${encodeURIComponent(profFilter)}`
    if (guardianOnly) url += `&guardianOnly=1`
    if (selfOnly) url += `&selfOnly=1`
    if (hideViewed) url += `&hideViewed=1`
    if (minAge !== 18) url += `&minAge=${minAge}`
    if (maxAge !== 70) url += `&maxAge=${maxAge}`
    if (maritalFilter) url += `&marital=${encodeURIComponent(maritalFilter)}`
    return url
  }

  const tabUrl = (tab: string) => {
    let url = `/profiles?tab=${tab}`
    if (userGender) url += `&userGender=${userGender}`
    if (excludeId) url += `&excludeId=${excludeId}`
    if (viewMode !== 'list') url += `&view=${viewMode}`
    if (sortBy !== 'recommended') url += `&sort=${sortBy}`
    if (districtFilter) url += `&district=${encodeURIComponent(districtFilter)}`
    if (religionFilter) url += `&religion=${encodeURIComponent(religionFilter)}`
    if (eduFilter) url += `&edu=${encodeURIComponent(eduFilter)}`
    if (profFilter) url += `&prof=${encodeURIComponent(profFilter)}`
    if (minAge !== 18) url += `&minAge=${minAge}`
    if (maxAge !== 70) url += `&maxAge=${maxAge}`
    if (maritalFilter) url += `&marital=${encodeURIComponent(maritalFilter)}`
    return url
  }

  const hasActiveFilters = !!(districtFilter || eduFilter || profFilter || religionFilter || maritalFilter || minAge !== 18 || maxAge !== 70)

  const TABS = [
    { key: 'recommended', label: 'Recommended' },
    { key: 'new', label: 'New', badge: newThisWeek > 0 ? newThisWeek : null },
    { key: 'active', label: 'Recently Active' },
    { key: 'verified', label: 'Verified' },
    { key: 'nrb', label: 'NRB' },
  ]

  const SORTS = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'newest', label: 'Newest' },
    { value: 'active', label: 'Recently Active' },
    { value: 'verified', label: 'Most Verified' },
    { value: 'age_asc', label: 'Age: Low to High' },
    { value: 'age_desc', label: 'Age: High to Low' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: C.ivory, paddingTop: 'clamp(90px, 15vw, 130px)', overflowX: 'hidden', fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>
      <GuestGate page={currentPage} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(12px, 4vw, 24px) 64px' }}>
        {/* Page header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 700, color: C.text, letterSpacing: '-0.02em' }}>
            Browse Profiles
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: C.textMuted }}>
            {totalProfiles.toLocaleString()} profiles match your search
          </p>
        </div>

        {/* Top tabs */}
        <div className="profiles-tabs" style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'white', padding: '4px', borderRadius: '12px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {TABS.map(tab => (
            <Link key={tab.key} href={tabUrl(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: 'clamp(6px, 2vw, 8px) clamp(10px, 3vw, 18px)', borderRadius: '9px', fontSize: 'clamp(12px, 3vw, 13px)', fontWeight: 600,
              textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all 0.15s',
              background: activeTab === tab.key ? C.maroon : 'transparent',
              color: activeTab === tab.key ? 'white' : C.textMuted,
            }}>
              {tab.label}
              {tab.badge && (
                <span style={{ background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : C.maroon, color: 'white', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '20px', minWidth: '18px', textAlign: 'center' }}>
                  {tab.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Main layout: sidebar + content */}
        <div style={{ display: 'block' }}>


          <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                {totalProfiles.toLocaleString()} প্রোফাইল পাওয়া গেছে — পেজ {currentPage} / {totalPages}
              </p>
            </div>
            <ProfilesClient
              profiles={paginatedProfiles}
              viewerProfile={null}
              initialFilters={{ district: districtFilter, minAge, maxAge, religion: religionFilter, marital: maritalFilter, edu: eduFilter, prof: profFilter }}
              baseUrl={`/profiles?userGender=${userGender}&excludeId=${excludeId}&tab=${activeTab}&sort=${sortBy}&view=${viewMode}`}
            />
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', paddingTop: '32px', paddingBottom: '48px', flexWrap: 'wrap' }}>
                {currentPage > 1 && (
                  <a href={buildUrl(currentPage - 1)} style={{ padding: '8px 16px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontWeight: 700, color: '#1f2937', textDecoration: 'none', fontSize: '13px' }}>← Prev</a>
                )}
                {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 3) + i
                  if (pageNum > totalPages) return null
                  return (
                    <a key={pageNum} href={buildUrl(pageNum)} style={{ padding: '8px 14px', background: currentPage === pageNum ? '#7B1D2E' : 'white', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontWeight: 700, color: currentPage === pageNum ? 'white' : '#1f2937', textDecoration: 'none', fontSize: '13px' }}>{pageNum}</a>
                  )
                })}
                {currentPage < totalPages && (
                  <a href={buildUrl(currentPage + 1)} style={{ padding: '8px 16px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontWeight: 700, color: '#1f2937', textDecoration: 'none', fontSize: '13px' }}>Next →</a>
                )}
              </div>
            )}
          </div>
  )
}