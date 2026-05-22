'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPhonePage() {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [generatedOTP, setGeneratedOTP] = useState('')

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate Bangladesh phone format
    if (!phone.startsWith('+880')) {
      setError('Phone number must start with +880')
      setLoading(false)
      return
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOTP(code)

    // Send OTP via Bulk SMS BD
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          message: `Your Biyekori verification code is: ${code}. Valid for 3 minutes.`
        })
      })

      const data = await response.json()

      if (data.success) {
        setStep('otp')
        setLoading(false)
        alert('OTP sent to your phone! Check your SMS.')
      } else {
        setError(data.error || 'Failed to send OTP')
        setLoading(false)
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.')
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Verify OTP
    if (otp === generatedOTP) {
      // Success!
      alert('Phone verified successfully!')
      router.push('/profiles')
      router.refresh()
    } else {
      setError('Invalid OTP code. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📱 Register with Phone
          </h1>
          <p className="text-gray-600">
            {step === 'phone' 
              ? 'Enter your Bangladesh phone number' 
              : 'Enter the OTP code sent to your phone'
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {step === 'phone' ? (
            // Phone Number Form
            <form onSubmit={handleSendOTP} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-gray-900"
                  placeholder="+880 1712-345678"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: +880 1712345678
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            // OTP Verification Form
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="text-center mb-4">
                <p className="text-gray-600">OTP sent to:</p>
                <p className="font-medium text-gray-900">{phone}</p>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-sm text-rose-500 hover:text-rose-600 mt-2"
                >
                  Change number
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-gray-900 text-center text-2xl tracking-widest"
                  placeholder="123456"
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Enter the 6-digit code sent to your phone
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Verifying...' : 'Verify & Register'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtp('')
                  handleSendOTP(new Event('submit') as any)
                }}
                className="w-full text-rose-500 hover:text-rose-600 text-sm font-medium"
              >
                Resend OTP
              </button>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-rose-500 hover:text-rose-600 font-medium">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}