import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find Your Perfect Match
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join Bangladesh's most trusted matrimonial platform. 
            Connect with verified profiles and find your life partner.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Link 
              href="/register"
              className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Register Now
            </Link>
            <Link 
              href="/profiles"
              className="bg-white hover:bg-gray-50 text-rose-500 border-2 border-rose-500 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Browse Profiles
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Phone Verified</h3>
            <p className="text-gray-600">All profiles verified with SMS OTP</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI NID Verification</h3>
            <p className="text-gray-600">Automatic NID verification with AI</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Safe & Secure</h3>
            <p className="text-gray-600">Your data is protected and private</p>
          </div>
        </div>
      </div>
    </div>
  )
}