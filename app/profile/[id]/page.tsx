import { getProfiles } from '@/lib/supabase'
import ProfileCard from '@/components/ProfileCard'

export const revalidate = 0 // Always fetch fresh data

export default async function ProfilesPage() {
  const profiles = await getProfiles()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Find Your Perfect Match
          </h1>
          <p className="text-lg text-rose-50">
            Browse through verified profiles
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {profiles.length} Profiles Found
            </h2>
            <p className="text-sm text-gray-500">Showing all verified profiles</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Profiles Grid */}
        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg mb-4">No profiles found</p>
            <button className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors">
              Clear Filters
            </button>
          </div>
        )}

        {/* End Message */}
        {profiles.length > 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                You've viewed all profiles!
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting filters for more matches
              </p>
              <button className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors">
                🔄 Adjust Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
