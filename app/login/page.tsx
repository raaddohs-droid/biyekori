// app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    identifier: "", // Phone or Email
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.identifier || !formData.password) {
      setError("Please enter your phone/email and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      // Store user data in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('biyekori_user', JSON.stringify(result.user));
      }

      alert("✅ Login successful! Welcome back!");
      router.push('/dashboard');

    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Welcome Back! 💕
          </h1>
          <p className="text-gray-600">Login to your Biyekori account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-sm text-red-800">⚠️ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Phone or Email */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Phone or Email *
              </label>
              <input
                type="text"
                value={formData.identifier}
                onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none text-gray-900"
                placeholder="01XXXXXXXXX or email@example.com"
                autoComplete="username"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use your registered phone (01XXXXXXXXX) or email
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none text-gray-900"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                href="/forgot-password" 
                className="text-sm text-rose-600 hover:text-rose-700 font-semibold"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-rose-600 hover:to-pink-700 disabled:opacity-50 transition-all"
            >
              {isLoading ? "Logging in..." : "🔐 Login"}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link 
                href="/register" 
                className="text-rose-600 hover:text-rose-700 font-bold"
              >
                Register Free
              </Link>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <p className="text-sm text-green-800 font-bold text-center">
            ✨ Registration is 100% FREE! No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}