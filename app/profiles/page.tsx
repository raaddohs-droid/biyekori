import UpgradeNudge from '@/components/UpgradeNudge'
import GuestGate from '@/components/GuestGate'
import { getProfiles } from '@/lib/supabase-server'
import ProfilesGrid from '@/components/profiles/ProfilesGrid'
import Link from 'next/link'
import { Suspense } from 'react'

export const revalidate = 0
export const dynamic = 'force-dynamic'

const PROFILES_PER_PAGE = 12
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
      <div style={{ minHeight: '100vh', background: C.ivory, paddingTop: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
    <div style={{ minHeight: '100vh', background: C.ivory, paddingTop: '120px', fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>
      <GuestGate page={currentPage} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 64px' }}>

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
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'white', padding: '4px', borderRadius: '12px', border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', width: 'fit-content' }}>
          {TABS.map(tab => (
            <Link key={tab.key} href={tabUrl(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 600,
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
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

          {/* LEFT SIDEBAR */}
          <div style={{ flexShrink: 0, width: '240px', position: 'sticky', top: '100px' }}>
            <form method="GET" action="/profiles">
              <input type="hidden" name="userGender" value={userGender} />
              <input type="hidden" name="excludeId" value={excludeId} />
              <input type="hidden" name="view" value={viewMode} />
              <input type="hidden" name="tab" value={activeTab} />
              <input type="hidden" name="sort" value={sortBy} />

              <div style={{ background: 'white', borderRadius: '16px', border: `1px solid ${C.border}`, boxShadow: C.cardShadow, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>Filters</span>
                  {hasActiveFilters && (
                    <Link href={`${baseUrl}&view=${viewMode}&tab=${activeTab}&sort=${sortBy}`} style={{ fontSize: '12px', color: C.maroon, fontWeight: 600, textDecoration: 'none' }}>Clear All</Link>
                  )}
                </div>

                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Age Range */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Age Range</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select name="minAge" defaultValue={String(minAge)} style={{ flex: 1, padding: '7px 8px', borderRadius: '8px', border: `1px solid ${C.border}`, fontSize: '13px', color: C.text, background: 'white', outline: 'none' }}>
                        {Array.from({ length: 53 }, (_, i) => i + 18).map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                      <span style={{ fontSize: '12px', color: C.textLight }}>–</span>
                      <select name="maxAge" defaultValue={String(maxAge)} style={{ flex: 1, padding: '7px 8px', borderRadius: '8px', border: `1px solid ${C.border}`, fontSize: '13px', color: C.text, background: 'white', outline: 'none' }}>
                        {Array.from({ length: 53 }, (_, i) => i + 18).map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* District */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>District</label>
                    <select name="district" defaultValue={districtFilter} style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: `1px solid ${C.border}`, fontSize: '13px', color: C.text, background: 'white', outline: 'none' }}>
                      <option value="">All Districts</option>
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Education */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Education</label>
                    <select name="edu" defaultValue={eduFilter} style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: `1px solid ${C.border}`, fontSize: '13px', color: C.text, background: 'white', outline: 'none' }}>
                      <option value="">Any Education</option>
                      {EDUCATIONS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>

                  {/* Profession */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Profession</label>
                    <select name="prof" defaultValue={profFilter} style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: `1px solid ${C.border}`, fontSize: '13px', color: C.text, background: 'white', outline: 'none' }}>
                      <option value="">Any Profession</option>
                      {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  {/* Religion */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Religion</label>
                    <select name="religion" defaultValue={religionFilter} style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: `1px solid ${C.border}`, fontSize: '13px', color: C.text, background: 'white', outline: 'none' }}>
                      <option value="">Any Religion</option>
                      {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Marital Status</label>
                    <select name="marital" defaultValue={maritalFilter} style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: `1px solid ${C.border}`, fontSize: '13px', color: C.text, background: 'white', outline: 'none' }}>
                      <option value="">Any Status</option>
                      {MARITAL_STATUSES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <button type="submit" style={{ width: '100%', padding: '10px', background: C.maroon, color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', letterSpacing: '0.01em' }}>
                    Apply Filters
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* RIGHT CONTENT */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Sort bar + count */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', color: C.textMuted, fontWeight: 500 }}>
                Showing <strong style={{ color: C.text }}>{paginatedProfiles.length}</strong> of <strong style={{ color: C.text }}>{totalProfiles.toLocaleString()}</strong> profiles
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <form method="GET" action="/profiles" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="hidden" name="userGender" value={userGender} />
                  <input type="hidden" name="excludeId" value={excludeId} />
                  <input type="hidden" name="view" value={viewMode} />
                  <input type="hidden" name="tab" value={activeTab} />
                  {districtFilter && <input type="hidden" name="district" value={districtFilter} />}
                  {religionFilter && <input type="hidden" name="religion" value={religionFilter} />}
                  {eduFilter && <input type="hidden" name="edu" value={eduFilter} />}
                  {profFilter && <input type="hidden" name="prof" value={profFilter} />}
                  {minAge !== 18 && <input type="hidden" name="minAge" value={minAge} />}
                  {maxAge !== 70 && <input type="hidden" name="maxAge" value={maxAge} />}
                  {maritalFilter && <input type="hidden" name="marital" value={maritalFilter} />}
                  <label style={{ fontSize: '13px', color: C.textMuted, fontWeight: 500, whiteSpace: 'nowrap' }}>Sort by</label>
                  <select name="sort" defaultValue={sortBy} style={{ padding: '7px 10px', borderRadius: '8px', border: `1px solid ${C.border}`, fontSize: '13px', color: C.text, background: 'white', outline: 'none', cursor: 'pointer' }}>
                    {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <button type="submit" style={{ padding: '7px 14px', background: C.maroon, color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Go</button>
                </form>

                {/* View toggle */}
                <div style={{ display: 'flex', gap: '2px', background: 'white', padding: '3px', borderRadius: '9px', border: `1px solid ${C.border}` }}>
                  <Link href={`${baseUrl}&view=list&tab=${activeTab}&sort=${sortBy}${districtFilter?'&district='+encodeURIComponent(districtFilter):''}${religionFilter?'&religion='+encodeURIComponent(religionFilter):''}${eduFilter?'&edu='+encodeURIComponent(eduFilter):''}${profFilter?'&prof='+encodeURIComponent(profFilter):''}`}
                    style={{ padding: '5px 8px', borderRadius: '7px', background: viewMode === 'list' ? C.maroon : 'transparent', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={viewMode === 'list' ? 'white' : C.textLight} strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                  </Link>
                  <Link href={`${baseUrl}&view=grid&tab=${activeTab}&sort=${sortBy}${districtFilter?'&district='+encodeURIComponent(districtFilter):''}${religionFilter?'&religion='+encodeURIComponent(religionFilter):''}${eduFilter?'&edu='+encodeURIComponent(eduFilter):''}${profFilter?'&prof='+encodeURIComponent(profFilter):''}`}
                    style={{ padding: '5px 8px', borderRadius: '7px', background: viewMode === 'grid' ? C.maroon : 'transparent', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={viewMode === 'grid' ? 'white' : C.textLight} strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                  </Link>
                </div>
              </div>
            </div>

            {paginatedProfiles.length > 0 ? (
              <>
                <div className={excludeId ? 'profiles-blurable' : 'profiles-guest-blur'} style={{ position: 'relative' }}>
                  <ProfilesGrid profiles={paginatedProfiles} view={viewMode} />
                  {!excludeId && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'rgba(250,250,247,0.7)', backdropFilter: 'blur(2px)' }}>
                      <div style={{ background: 'white', borderRadius: '20px', padding: '36px 32px', textAlign: 'center', maxWidth: '360px', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', border: `1.5px solid ${C.border}` }}>
                        <div style={{ fontSize: '40px', marginBottom: '14px' }}>🔒</div>
                        <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: C.text }}>প্রোফাইল দেখতে লগইন করুন</h3>
                        <p style={{ margin: '0 0 22px', fontSize: '14px', color: C.textMuted, lineHeight: 1.6 }}>বিয়েকরিতে বিনামূল্যে নিবন্ধন করুন এবং হাজারো প্রোফাইল দেখুন।</p>
                        <a href="/register" style={{ display: 'block', padding: '13px', background: C.maroon, color: 'white', borderRadius: '12px', fontWeight: 700, fontSize: '15px', textDecoration: 'none', marginBottom: '10px' }}>বিনামূল্যে নিবন্ধন করুন →</a>
                        <a href="/login" style={{ display: 'block', fontSize: '13px', color: C.maroon, fontWeight: 600, textDecoration: 'none' }}>ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন</a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingTop: '32px' }}>
                    {currentPage > 1 && (
                      <Link href={buildUrl(currentPage - 1)} style={{ padding: '8px 16px', background: 'white', border: `1px solid ${C.border}`, borderRadius: '8px', fontWeight: 600, color: C.text, textDecoration: 'none', fontSize: '13px' }}>← Prev</Link>
                    )}
                    {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(pageNum =>
                      (!isPaid && pageNum > FREE_MAX_PAGES) ? (
                        <Link key={pageNum} href="/pricing" style={{ padding: '8px 14px', background: '#f9fafb', border: `1px solid ${C.border}`, borderRadius: '8px', fontWeight: 600, color: C.textLight, textDecoration: 'none', fontSize: '13px' }} title="Upgrade to access">{pageNum}</Link>
                      ) : (
                        <Link key={pageNum} href={buildUrl(pageNum)} style={{ padding: '8px 14px', background: currentPage === pageNum ? C.maroon : 'white', border: `1px solid ${currentPage === pageNum ? C.maroon : C.border}`, borderRadius: '8px', fontWeight: 600, color: currentPage === pageNum ? 'white' : C.text, textDecoration: 'none', fontSize: '13px' }}>{pageNum}</Link>
                      )
                    )}
                    {currentPage < Math.min(totalPages, isPaid ? totalPages : FREE_MAX_PAGES) && (
                      <Link href={buildUrl(currentPage + 1)} style={{ padding: '8px 16px', background: 'white', border: `1px solid ${C.border}`, borderRadius: '8px', fontWeight: 600, color: C.text, textDecoration: 'none', fontSize: '13px' }}>Next →</Link>
                    )}
                    {!isPaid && currentPage >= FREE_MAX_PAGES && (
                      <Link href="/pricing" style={{ padding: '8px 20px', background: C.maroon, border: `1px solid ${C.maroon}`, borderRadius: '8px', fontWeight: 600, color: 'white', textDecoration: 'none', fontSize: '13px' }}>Upgrade for More</Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: 'white', borderRadius: '16px', padding: '64px 24px', textAlign: 'center', border: `1px solid ${C.border}` }}>
                <p style={{ fontSize: '18px', fontWeight: 600, color: C.textMuted, margin: '0 0 8px' }}>কোনো প্রোফাইল মেলেনি your criteria</p>
                <p style={{ fontSize: '14px', color: C.textLight, margin: '0 0 24px' }}>Try adjusting your filters</p>
                <Link href={`${baseUrl}&view=${viewMode}&tab=${activeTab}`} style={{ display: 'inline-block', padding: '11px 28px', background: C.maroon, color: 'white', borderRadius: '10px', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>Clear Filters</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isPaid && currentPage >= 3 && currentPage <= 5 && (
        <UpgradeNudge type="soft" data={{
          message: currentPage === 5
            ? 'You are on the last free page. Upgrade to browse all profiles.'
            : `Enjoying Biyekori? Upgrade to browse unlimited profiles.`,
          ctaText: 'Upgrade Now',
          ctaHref: '/pricing'
        }} />
      )}
    </div>
  )
}
