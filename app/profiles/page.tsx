import { getProfiles } from '@/lib/supabase-server'
import ProfileCard from '@/components/profiles/ProfileCard'
import ProfileFilters from '@/components/profiles/ProfileFilters'
import Link from 'next/link'

export const revalidate = 0
export const dynamic = 'force-dynamic'

const PROFILES_PER_PAGE = 12
const FREE_MAX_PAGES = 5

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProfilesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const allProfiles = await getProfiles()

  const userGender = typeof params.userGender === 'string' ? params.userGender : (typeof params.gender === 'string' ? params.gender : '')
  const excludeId = typeof params.excludeId === 'string' ? params.excludeId : ''
  const currentPage = typeof params.page === 'string' ? parseInt(params.page) || 1 : 1
  const isFreeTier = true

  // Filter opposite gender only
  let filteredProfiles = allProfiles
  if (userGender) {
    const showGender = userGender === 'male' ? 'female' : 'male'
    filteredProfiles = allProfiles.filter((p: any) => p.gender === showGender)
  }

  // Remove own profile
  if (excludeId) {
    filteredProfiles = filteredProfiles.filter((p: any) => String(p.id) !== String(excludeId))
  }

  // Apply other filters
  const heightFilter = typeof params.height === 'string' ? params.height : ''
  const districtFilter = typeof params.district === 'string' ? params.district : ''
  const religionFilter = typeof params.religion === 'string' ? params.religion : ''
  const maritalFilter = typeof params.marital === 'string' ? params.marital : ''
  const educationFilter = typeof params.education === 'string' ? params.education : ''
  const professionFilter = typeof params.profession === 'string' ? params.profession : ''
  const minAge = typeof params.minAge === 'string' ? parseInt(params.minAge) : 18
  const maxAge = typeof params.maxAge === 'string' ? parseInt(params.maxAge) : 80

  if (heightFilter) filteredProfiles = filteredProfiles.filter((p: any) => p.height === heightFilter)
  if (districtFilter) filteredProfiles = filteredProfiles.filter((p: any) => p.district === districtFilter || p.city === districtFilter)
  if (religionFilter) filteredProfiles = filteredProfiles.filter((p: any) => p.religion === religionFilter)
  if (maritalFilter) filteredProfiles = filteredProfiles.filter((p: any) => p.marital_status === maritalFilter)
  if (educationFilter) filteredProfiles = filteredProfiles.filter((p: any) => p.education === educationFilter)
  if (professionFilter) filteredProfiles = filteredProfiles.filter((p: any) => p.profession === professionFilter)
  filteredProfiles = filteredProfiles.filter((p: any) => {
    const age = p.age || 0
    return age >= minAge && age <= maxAge
  })

  const totalProfiles = filteredProfiles.length
  const totalPages = Math.ceil(totalProfiles / PROFILES_PER_PAGE)
  const startIndex = (currentPage - 1) * PROFILES_PER_PAGE
  const paginatedProfiles = filteredProfiles.slice(startIndex, startIndex + PROFILES_PER_PAGE)
  const prevPage = currentPage - 1
  const nextPage = currentPage + 1

  const baseUrl = `/profiles?userGender=${userGender}&excludeId=${excludeId}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50" style={{paddingTop:"120px"}}>
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="bg-white shadow-lg border-b sticky top-0 z-20" style={{top:"60px"}}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-gray-900">Browse Profiles</h1>
                <p className="text-sm text-gray-500 mt-0.5">Thousands of verified profiles waiting for you</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6 py-6">
          {/* Filters sidebar */}
          <div className="w-64 flex-shrink-0">
            <ProfileFilters
              cities={[]}
              educations={[]}
              professions={[]}
              currentFilters={{ gender: userGender, search: '', ageMin: minAge, ageMax: maxAge, city: districtFilter, education: educationFilter, profession: professionFilter, sort: '' }}
            />
          </div>

          {/* Main content */}
          <div className="flex-1">

            {/* Upgrade banner for free users */}
            {isFreeTier && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-gray-900 mb-2">Your Perfect Match is Out There!</h3>
                    <p className="text-sm text-gray-600 mb-3">You are viewing a limited selection. Upgrade to unlock thousands of verified profiles and find your ideal partner.</p>
                    <ul className="space-y-1">
                      <li className="text-sm text-gray-700">Unlock thousands of verified profiles across Bangladesh</li>
                      <li className="text-sm text-gray-700">Send unlimited interests to potential matches</li>
                      <li className="text-sm text-gray-700">View phone numbers and contact details directly</li>
                      <li className="text-sm text-gray-700">Appear at the top of search results</li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Starting at</p>
                    <p className="text-4xl font-black text-rose-600 mb-3">৳100</p>
                    <Link href="/pricing" className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition inline-block">
                      Upgrade Now
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Grid */}
            {paginatedProfiles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {paginatedProfiles.map((profile: any) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 flex-wrap mt-4 mb-8">
                    {currentPage > 1 && (
                      <Link href={`${baseUrl}&page=${prevPage}`}
                        className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-bold text-gray-900 hover:border-rose-500 transition">
                        Prev
                      </Link>
                    )}
                    {Array.from({length: Math.min(totalPages, 15)}, (_, i) => i + 1).map((pageNum) => (
                      isFreeTier && pageNum > FREE_MAX_PAGES ? (
                        <Link key={pageNum} href="/pricing"
                          className="px-4 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg font-bold text-gray-400 hover:border-rose-500 transition"
                          title="Upgrade to access">
                          {pageNum}
                        </Link>
                      ) : (
                        <Link key={pageNum} href={`${baseUrl}&page=${pageNum}`}
                          className={`px-4 py-2 border-2 rounded-lg font-bold transition ${currentPage === pageNum ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white border-rose-500' : 'bg-white border-gray-300 text-gray-900 hover:border-rose-500'}`}>
                          {pageNum}
                        </Link>
                      )
                    ))}
                    {currentPage < totalPages && !(isFreeTier && currentPage >= FREE_MAX_PAGES) && (
                      <Link href={`${baseUrl}&page=${nextPage}`}
                        className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-bold text-gray-900 hover:border-rose-500 transition">
                        Next
                      </Link>
                    )}
                    {isFreeTier && currentPage >= FREE_MAX_PAGES && (
                      <Link href="/pricing"
                        className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white border-2 border-rose-500 rounded-lg font-bold transition">
                        Upgrade for More
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <p className="text-2xl font-bold text-gray-400 mb-4">No profiles match your criteria</p>
                <p className="text-gray-600 mb-6">Try adjusting your filters</p>
                <Link href={`/profiles?userGender=${userGender}&excludeId=${excludeId}`}
                  className="inline-block px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition">
                  Clear Filters
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

