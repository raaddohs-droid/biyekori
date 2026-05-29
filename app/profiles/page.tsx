import { getProfiles } from '@/lib/supabase-server'
import ProfileCard from '@/components/profiles/ProfileCard'
import ProfileFilters from '@/components/profiles/ProfileFilters'

export const revalidate = 0
export const dynamic = 'force-dynamic'

const PROFILES_PER_PAGE = 12

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProfilesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const allProfiles = await getProfiles()
  
  // Get logged-in user from localStorage (client-side will be handled)
  // For now, we'll use URL parameter or default behavior
  const userGender = typeof params.userGender === 'string' ? params.userGender : ''
  
  // SMART GENDER LOGIC: Auto-filter opposite gender
  let defaultGenderFilter = typeof params.gender === 'string' ? params.gender : ''
  
  // If user is male, show females by default. If female, show males.
  if (!defaultGenderFilter && userGender) {
    defaultGenderFilter = userGender === 'male' ? 'female' : 'male'
  }
  
  const genderFilter = defaultGenderFilter
  const ageMin = typeof params.ageMin === 'string' ? parseInt(params.ageMin) : 18
  const ageMax = typeof params.ageMax === 'string' ? parseInt(params.ageMax) : 80
  const cityFilter = typeof params.city === 'string' ? params.city : ''
  const educationFilter = typeof params.education === 'string' ? params.education : ''
  const professionFilter = typeof params.profession === 'string' ? params.profession : ''
  const religionFilter = typeof params.religion === 'string' ? params.religion : ''
  const maritalStatusFilter = typeof params.maritalStatus === 'string' ? params.maritalStatus : ''
  const heightMinFilter = typeof params.heightMin === 'string' ? params.heightMin : ''
  const heightMaxFilter = typeof params.heightMax === 'string' ? params.heightMax : ''
  const incomeMinFilter = typeof params.incomeMin === 'string' ? parseInt(params.incomeMin) : 0
  const currentPage = typeof params.page === 'string' ? parseInt(params.page) : 1
  
  // Apply ALL filters
  let filteredProfiles = allProfiles.filter(profile => {
    if (genderFilter && profile.gender !== genderFilter) return false
    if (profile.age < ageMin || profile.age > ageMax) return false
    if (cityFilter && profile.city !== cityFilter) return false
    if (educationFilter && profile.education !== educationFilter) return false
    if (professionFilter && profile.profession !== professionFilter) return false
    if (religionFilter && profile.religion !== religionFilter) return false
    if (maritalStatusFilter && profile.marital_status !== maritalStatusFilter) return false
    if (incomeMinFilter > 0 && (!profile.monthly_income || profile.monthly_income < incomeMinFilter)) return false
    
    return true
  })
  
  // BUSINESS STRATEGY: Limit free users to first 20 profiles
  const isFreeTier = true // TODO: Check user's package from localStorage
  const displayProfiles = isFreeTier ? filteredProfiles.slice(0, 20) : filteredProfiles
  
  const genderCounts = allProfiles.reduce((acc, p) => {
    const g = p.gender || 'NULL'
    acc[g] = (acc[g] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const cities = Array.from(new Set(allProfiles.map(p => p.city).filter(Boolean))).sort()
  const educations = Array.from(new Set(allProfiles.map(p => p.education).filter(Boolean))).sort()
  const professions = Array.from(new Set(allProfiles.map(p => p.profession).filter(Boolean))).sort()
  
  const totalFilteredProfiles = displayProfiles.length
  const totalPages = Math.ceil(totalFilteredProfiles / PROFILES_PER_PAGE)
  const startIndex = (currentPage - 1) * PROFILES_PER_PAGE
  const paginatedProfiles = displayProfiles.slice(startIndex, startIndex + PROFILES_PER_PAGE)
  
  const prevPage = currentPage - 1
  const nextPage = currentPage + 1
  
  const hiddenProfilesCount = filteredProfiles.length - displayProfiles.length
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Browse Profiles 💕</h1>
              <p className="text-sm text-gray-600 mt-1">
                {allProfiles.length} verified profiles waiting for you
              </p>
            </div>
            
            {/* Gender Pills */}
            <div className="flex gap-2">
              <a 
                href="/profiles" 
                className={`px-6 py-2.5 rounded-xl font-bold transition ${
                  !genderFilter 
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-rose-300'
                }`}
              >
                All ({allProfiles.length})
              </a>
              <a 
                href="/profiles?gender=female"
                className={`px-6 py-2.5 rounded-xl font-bold transition ${
                  genderFilter === 'female' 
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-rose-300'
                }`}
              >
                👰 Brides ({genderCounts['female'] || 0})
              </a>
              <a 
                href="/profiles?gender=male"
                className={`px-6 py-2.5 rounded-xl font-bold transition ${
                  genderFilter === 'male' 
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-rose-300'
                }`}
              >
                🤵 Grooms ({genderCounts['male'] || 0})
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProfileFilters 
              cities={cities}
              educations={educations}
              professions={professions}
              currentFilters={{
                gender: genderFilter,
                search: '',
                ageMin,
                ageMax,
                city: cityFilter,
                education: educationFilter,
                profession: professionFilter,
                sort: 'newest'
              }}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            
            {/* Results Header */}
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
              <p className="text-xl font-black text-gray-900">
                Profiles For You
                {isFreeTier && hiddenProfilesCount > 0 && (
                  <span className="text-sm font-normal text-orange-600 ml-2">
                    
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                
              </p>
            </div>

            {/* PREMIUM UPGRADE BANNER - Shows after 10 profiles for free users */}
            {isFreeTier && paginatedProfiles.length >= 10 && (
              <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 border-4 border-yellow-400 rounded-2xl p-6 mb-6 shadow-xl animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black text-gray-900 mb-2">
                      🎉 Unlock More Profiles Waiting for You!
                    </p>
                    <p className="text-sm text-gray-700 mb-3">
                      You are seeing a small selection. Upgrade to discover thousands of verified matches across Bangladesh.
                    </p>
                    <ul className="text-sm text-gray-800 space-y-1 mb-4">
                      <li>✅ Access thousands of verified profiles</li>
                      <li>✅ Send unlimited messages</li>
                      <li>✅ View contact details</li>
                      <li>✅ Get priority in search results</li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Starting at</p>
                    <p className="text-4xl font-black text-rose-600 mb-3">৳100</p>
                    <button className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition">
                      Upgrade Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Grid */}
            {paginatedProfiles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {paginatedProfiles.map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3">
                    {currentPage > 1 && (
                      <a 
                        href={"/profiles?page=" + prevPage}
                        className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl font-bold text-gray-900 hover:bg-gray-50 hover:border-rose-500 transition"
                      >
                        Previous
                      </a>
                    )}
                    
                    <span className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold shadow-lg">
                      Page {currentPage}
                    </span>
                    
                    {currentPage < totalPages && (
                      <a 
                        href={"/profiles?page=" + nextPage}
                        className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl font-bold text-gray-900 hover:bg-gray-50 hover:border-rose-500 transition"
                      >
                        Next
                      </a>
                    )}
                  </div>
                )}

                {/* Smart Nudges */}
                {totalFilteredProfiles > 0 && totalFilteredProfiles < 5 && !isFreeTier && (
                  <div className="mt-8 p-5 bg-blue-50 border-l-4 border-blue-500 rounded-xl">
                    <p className="text-sm text-blue-900 font-bold">
                      💡 Only {totalFilteredProfiles} matches? Try relaxing your age or location filters to see more profiles!
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">😔</div>
                <p className="text-2xl font-bold text-gray-400 mb-4">No profiles match your criteria</p>
                <p className="text-gray-600 mb-6">Try adjusting your filters or browse all profiles</p>
                <a 
                  href="/profiles"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition"
                >
                  Clear All Filters
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}