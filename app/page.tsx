import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-black text-gray-900 mb-4">
          Biyekori 💕
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Find your perfect match in Bangladesh
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link 
            href="/register"
            className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-rose-600 hover:to-pink-700"
          >
            🎉 Register Free
          </Link>
          <Link 
            href="/login"
            className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 border-2 border-gray-300"
          >
            🔐 Login
          </Link>
        </div>

        <p className="text-sm text-green-600 font-bold mt-6">
          ✨ 100% FREE to join! No credit card required.
        </p>
      </div>
    </div>
  );
}