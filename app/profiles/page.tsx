import { getProfiles } from '@/lib/supabase'
import ProfileCard from '@/components/profiles/ProfileCard'

// Disable caching - always fetch fresh data
export const revalidate = 0

export default async function ProfilesPage() {
  // Fetch profiles from Supabase
  const profiles = await getProfiles()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 text-white border-b-4 border-red-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
            Browse Profiles
          </h1>
          <p className="text-lg text-rose-50 font-medium">
            Find your perfect match from verified profiles
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Results Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-1">
                {profiles.length} Profiles Found
              </h2>
              <p className="text-sm text-gray-600">
                Showing all verified profiles from our database
              </p>
            </div>
          </div>
        </div>

        {/* Profile Cards Grid */}
        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center border-2 border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">🔍</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              No profiles found
            </h3>
            <p className="text-gray-600 mb-6">
              No profiles in database yet. Import your CSV data!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}