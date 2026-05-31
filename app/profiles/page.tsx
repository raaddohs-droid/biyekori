import UpgradeNudge from '@/components/UpgradeNudge'
import { getProfiles } from '@/lib/supabase-server'
import ProfilesGrid from '@/components/profiles/ProfilesGrid'
import Link from 'next/link'
import { Suspense } from 'react'
import AdvancedSearch from '@/components/profiles/AdvancedSearch'

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
  const relLevelFilter = typeof params.relLevel === 'string' ? params.relLevel : ''
  const profFilter = typeof params.prof === 'string' ? params.prof : ''
  const nidOnly = params.nidOnly === '1'
  const neverMarriedOnly = params.neverMarried === '1'

  if (currentPage > FREE_MAX_PAGES) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff5f7', paddingTop: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px', padding: '40px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#128149;</div>
          <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 700, color: '#1f2937' }}>
            Upgrade to See More Profiles
          </h2>
          <p style={{ margin: '0 0 24px', fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>
            You have browsed the free limit. Premium members get unlimited access to verified profiles.
          </p>
          <Link href="/pricing" style={{
            display: 'inline-block', padding: '14px 32px',
            background: 'linear-gradient(135deg,#e11d48,#db2777)',
            color: 'white', borderRadius: '12px', fontSize: '15px',
            fontWeight: 700, textDecoration: 'none'
          }}>
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
  if (excludeId) {
    filtered = filtered.filter((p: any) => String(p.id) !== String(excludeId))
  }
  if (districtFilter) {
    filtered = filtered.filter((p: any) =>
      p.district === districtFilter || p.city === districtFilter || p.location === districtFilter
    )
  }
  filtered = filtered.filter((p: any) => {
    const age = p.age || 0
    return age >= minAge && age <= maxAge
  })
  if (maritalFilter) {
    filtered = filtered.filter((p: any) => p.marital_status === maritalFilter)
  }
  if (eduFilter) {
    filtered = filtered.filter((p: any) => p.education === eduFilter)
  }
  if (relLevelFilter) {
    filtered = filtered.filter((p: any) => p.religious_level === relLevelFilter)
  }
  if (profFilter) {
    filtered = filtered.filter((p: any) => p.profession === profFilter)
  }
  if (nidOnly) {
    filtered = filtered.filter((p: any) => p.nid_verified === true)
  }
  if (neverMarriedOnly) {
    filtered = filtered.filter((p: any) => p.marital_status === 'Never married')
  }

  // Sort featured profiles to top
  filtered = [...filtered.sort((a: any, b: any) => {
    const aFeatured = a.is_featured && a.featured_until && new Date(a.featured_until) > new Date()
    const bFeatured = b.is_featured && b.featured_until && new Date(b.featured_until) > new Date()
    if (aFeatured && !bFeatured) return -1
    if (!aFeatured && bFeatured) return 1
    return 0
  })]

  const totalProfiles = filtered.length
  const totalPages = Math.ceil(totalProfiles / PROFILES_PER_PAGE)
  const startIndex = (currentPage - 1) * PROFILES_PER_PAGE
  const paginatedProfiles = filtered.slice(startIndex, startIndex + PROFILES_PER_PAGE)

  const baseUrl = `/profiles?userGender=${userGender}&excludeId=${excludeId}`

  const buildUrl = (page: number) => {
    let url = `${baseUrl}&page=${page}`
    if (districtFilter) url += `&district=${encodeURIComponent(districtFilter)}`
    if (minAge !== 18) url += `&minAge=${minAge}`
    if (maxAge !== 70) url += `&maxAge=${maxAge}`
    if (maritalFilter) url += `&marital=${encodeURIComponent(maritalFilter)}`
    return url
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff5f7 0%, #fdf2f8 50%, #f5f3ff 100%)', paddingTop: '120px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 800, color: '#1f2937' }}>
            Browse Profiles
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            Thousands of verified profiles waiting for you
          </p>
        </div>

        <Suspense fallback={null}>
          <AdvancedSearch userGender={userGender} excludeId={excludeId} />
        </Suspense>

        <form method="GET" action="/profiles" style={{
          background: 'white', borderRadius: '16px', padding: '20px 24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '28px',
          display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end'
        }}>
          <input type="hidden" name="userGender" value={userGender} />
          <input type="hidden" name="excludeId" value={excludeId} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>District</label>
            <select name="district" defaultValue={districtFilter} style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '13px', color: '#1f2937', background: 'white', minWidth: '140px' }}>
              <option value="">All Districts</option>
              {DISTRICTS.map(d => (<option key={d} value={d}>{d}</option>))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Min Age</label>
            <select name="minAge" defaultValue={String(minAge)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '13px', color: '#1f2937', background: 'white' }}>
              {Array.from({ length: 53 }, (_, i) => i + 18).map(a => (<option key={a} value={a}>{a}</option>))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Max Age</label>
            <select name="maxAge" defaultValue={String(maxAge)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '13px', color: '#1f2937', background: 'white' }}>
              {Array.from({ length: 53 }, (_, i) => i + 18).map(a => (<option key={a} value={a}>{a}</option>))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Marital Status</label>
            <select name="marital" defaultValue={maritalFilter} style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '13px', color: '#1f2937', background: 'white' }}>
              <option value="">Any</option>
              <option value="Never married">Never married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>

          <button type="submit" style={{ padding: '8px 20px', background: 'linear-gradient(135deg,#e11d48,#db2777)', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Search
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px', alignItems: 'center' }}>
            <a href={'?userGender=' + userGender + '&excludeId=' + excludeId + '&view=list'} style={{ padding: '6px 8px', borderRadius: '7px', border: '2px solid', borderColor: viewMode === 'list' ? '#e11d48' : '#e5e7eb', background: viewMode === 'list' ? '#fff1f2' : 'white', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={viewMode === 'list' ? '#e11d48' : '#9ca3af'} strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </a>
            <a href={'?userGender=' + userGender + '&excludeId=' + excludeId + '&view=grid'} style={{ padding: '6px 8px', borderRadius: '7px', border: '2px solid', borderColor: viewMode === 'grid' ? '#e11d48' : '#e5e7eb', background: viewMode === 'grid' ? '#fff1f2' : 'white', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={viewMode === 'grid' ? '#e11d48' : '#9ca3af'} strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </a>
          </div>

          {(districtFilter || minAge !== 18 || maxAge !== 70 || maritalFilter) && (
            <Link href={`/profiles?userGender=${userGender}&excludeId=${excludeId}`} style={{ padding: '8px 16px', background: '#f3f4f6', color: '#6b7280', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
              Clear
            </Link>
          )}
        </form>

        {paginatedProfiles.length > 0 ? (
          <>
            <ProfilesGrid profiles={paginatedProfiles} view={viewMode} />

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingBottom: '48px' }}>
                {currentPage > 1 && (
                  <Link href={buildUrl(currentPage - 1)} style={{ padding: '8px 16px', background: 'white', border: '2px solid #e5e7eb', borderRadius: '8px', fontWeight: 700, color: '#1f2937', textDecoration: 'none', fontSize: '13px' }}>Prev</Link>
                )}
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(pageNum =>
                  pageNum > FREE_MAX_PAGES ? (
                    <Link key={pageNum} href="/pricing" style={{ padding: '8px 14px', background: '#f9fafb', border: '2px solid #e5e7eb', borderRadius: '8px', fontWeight: 700, color: '#d1d5db', textDecoration: 'none', fontSize: '13px' }} title="Upgrade to access">{pageNum}</Link>
                  ) : (
                    <Link key={pageNum} href={buildUrl(pageNum)} style={{ padding: '8px 14px', background: currentPage === pageNum ? 'linear-gradient(135deg,#e11d48,#db2777)' : 'white', border: currentPage === pageNum ? '2px solid #e11d48' : '2px solid #e5e7eb', borderRadius: '8px', fontWeight: 700, color: currentPage === pageNum ? 'white' : '#1f2937', textDecoration: 'none', fontSize: '13px' }}>{pageNum}</Link>
                  )
                )}
                {currentPage < Math.min(totalPages, FREE_MAX_PAGES) && (
                  <Link href={buildUrl(currentPage + 1)} style={{ padding: '8px 16px', background: 'white', border: '2px solid #e5e7eb', borderRadius: '8px', fontWeight: 700, color: '#1f2937', textDecoration: 'none', fontSize: '13px' }}>Next</Link>
                )}
                {currentPage >= FREE_MAX_PAGES && (
                  <Link href="/pricing" style={{ padding: '8px 20px', background: 'linear-gradient(135deg,#e11d48,#db2777)', border: '2px solid #e11d48', borderRadius: '8px', fontWeight: 700, color: 'white', textDecoration: 'none', fontSize: '13px' }}>Upgrade for More</Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ background: 'white', borderRadius: '20px', padding: '64px 24px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#9ca3af', margin: '0 0 8px' }}>No profiles match your criteria</p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px' }}>Try adjusting your filters</p>
            <Link href={`/profiles?userGender=${userGender}&excludeId=${excludeId}`} style={{ display: 'inline-block', padding: '12px 28px', background: 'linear-gradient(135deg,#e11d48,#db2777)', color: 'white', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>Clear Filters</Link>
          </div>
        )}
      </div>

      <UpgradeNudge currentPage={currentPage} />
    </div>
  )
}
