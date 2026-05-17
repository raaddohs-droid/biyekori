import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-red-50 font-sans">
      {/* Header */}
      <header className="bg-red-700 text-white py-4 px-8 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">💍 BandhanBD</Link>
        <nav className="flex gap-6">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/profiles" className="hover:underline">Profiles</Link>
          <Link href="/login" className="hover:underline">Login</Link>
          <Link href="/register" className="hover:underline">Register</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="text-center py-20 px-8 bg-red-700 text-white">
        <h2 className="text-4xl font-bold mb-4">Find Your Life Partner</h2>
        <p className="text-lg mb-8">Bangladesh's trusted matrimony platform</p>
        <Link href="/register" className="bg-white text-red-700 font-bold px-8 py-3 rounded-full hover:bg-red-100">
          Get Started
        </Link>
      </section>

      {/* Features */}
      <section className="py-16 px-8 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <Link href="/register" className="bg-white rounded-xl shadow p-6 text-center hover:shadow-lg">
          <div className="text-4xl mb-4">👤</div>
          <h3 className="text-xl font-bold mb-2">Create Profile</h3>
          <p className="text-gray-600">Set up your profile and find matches</p>
        </Link>
        <Link href="/profiles" className="bg-white rounded-xl shadow p-6 text-center hover:shadow-lg">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">Search Profiles</h3>
          <p className="text-gray-600">Filter by age, location and more</p>
        </Link>
        <Link href="/login" className="bg-white rounded-xl shadow p-6 text-center hover:shadow-lg">
          <div className="text-4xl mb-4">💌</div>
          <h3 className="text-xl font-bold mb-2">Send Interest</h3>
          <p className="text-gray-600">Connect with your perfect match</p>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-red-700 text-white text-center py-6 mt-8">
        <p>© 2026 BandhanBD — Bangladesh's Trusted Matrimony Site</p>
      </footer>
    </div>
  );
}