'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function VerifyPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Phone verification states
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [generatedOTP, setGeneratedOTP] = useState('')
  const [phoneStep, setPhoneStep] = useState<'input' | 'verify'>('input')
  const [phoneError, setPhoneError] = useState('')
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  
  // NID verification states
  const [nidNumber, setNidNumber] = useState('')
  const [nidFrontFile, setNidFrontFile] = useState<File | null>(null)
  const [nidBackFile, setNidBackFile] = useState<File | null>(null)
  const [nidError, setNidError] = useState('')
  const [nidLoading, setNidLoading] = useState(false)
  const [aiMismatches, setAiMismatches] = useState<string[]>([])
  const [aiVerifying, setAiVerifying] = useState(false)
  const [nidVerified, setNidVerified] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/login')
        return
      }
      
      setUser(user)
      setLoading(false)
    } catch (err: any) {
      setError('Error: ' + err.message)
      setLoading(false)
    }
  }

  const handleSendOTP = async () => {
    setPhoneError('')
    setPhoneLoading(true)

    if (!phone.startsWith('+880')) {
      setPhoneError('Phone must start with +880')
      setPhoneLoading(false)
      return
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOTP(code)

    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          message: `Your Biyekori verification code is: ${code}`
        })
      })

      const data = await response.json()

      if (data.success) {
        setPhoneStep('verify')
        alert('✅ OTP sent! Check your phone.')
      } else {
        setPhoneError(data.error || 'Failed to send OTP')
      }
    } catch (err) {
      setPhoneError('Failed to send OTP')
    }
    setPhoneLoading(false)
  }

  const handleVerifyOTP = async () => {
    setPhoneError('')
    setPhoneLoading(true)

    if (otp === generatedOTP) {
      setPhoneVerified(true)
      alert('✅ Phone verified successfully!')
      setPhoneError('')
    } else {
      setPhoneError('❌ Invalid OTP code')
    }
    setPhoneLoading(false)
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleNIDUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setNidError('')
    setAiMismatches([])
    setNidLoading(true)
    setAiVerifying(true)

    if (!/^\d{10}$|^\d{13}$|^\d{17}$/.test(nidNumber)) {
      setNidError('NID must be 10, 13, or 17 digits')
      setNidLoading(false)
      setAiVerifying(false)
      return
    }

    if (!nidFrontFile || !nidBackFile) {
      setNidError('Please upload both front and back of NID')
      setNidLoading(false)
      setAiVerifying(false)
      return
    }

    try {
      // Convert images to base64
      const frontBase64 = await convertToBase64(nidFrontFile)
      const backBase64 = await convertToBase64(nidBackFile)

      // AI Verification
      const verifyResponse = await fetch('/api/verify-nid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontImage: frontBase64,
          backImage: backBase64,
          userData: {
            name: 'Test User',
            dob: '01-01-1995',
            gender: 'Male',
            district: 'Dhaka'
          }
        })
      })

      const verifyData = await verifyResponse.json()
      setAiVerifying(false)

      if (!verifyData.success && verifyData.mismatches) {
        setAiMismatches(verifyData.mismatches)
        setNidError('⚠️ AI detected mismatches! Please correct your profile data.')
        setNidLoading(false)
        return
      }

      setNidVerified(true)
      alert('✅ NID verified by AI successfully!')
      setNidError('')
      setNidLoading(false)

    } catch (err: any) {
      setNidError(err.message || 'Failed to verify NID')
      setNidLoading(false)
      setAiVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔐 Verify Your Account
          </h1>
          <p className="text-gray-600">
            Complete phone and NID verification with AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Phone Verification Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">📱 Phone Verification</h2>
              {phoneVerified && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  ✓ Verified
                </span>
              )}
            </div>
            
            {!phoneVerified ? (
              phoneStep === 'input' ? (
                <div className="space-y-4">
                  {phoneError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                      {phoneError}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+880 1712345678"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-gray-900"
                    />
                  </div>

                  <button
                    onClick={handleSendOTP}
                    disabled={phoneLoading}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 px-4 rounded-lg disabled:bg-gray-400"
                  >
                    {phoneLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {phoneError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                      {phoneError}
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600">OTP sent to: {phone}</p>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-gray-900 text-center text-xl tracking-widest"
                    />
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    disabled={phoneLoading || otp.length !== 6}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 px-4 rounded-lg disabled:bg-gray-400"
                  >
                    {phoneLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <button
                    onClick={() => setPhoneStep('input')}
                    className="w-full text-rose-500 hover:text-rose-600 text-sm"
                  >
                    Change Number
                  </button>
                </div>
              )
            ) : (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                <div className="text-6xl mb-3">✓</div>
                <p className="text-green-800 font-bold text-lg mb-2">Phone Verified!</p>
                <p className="text-green-700 text-sm">{phone}</p>
              </div>
            )}
          </div>

          {/* NID Verification Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">🤖 AI NID Verification</h2>
              {nidVerified && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  ✓ Verified
                </span>
              )}
            </div>
            
            {!nidVerified ? (
              <form onSubmit={handleNIDUpload} className="space-y-4">
                {nidError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                    {nidError}
                  </div>
                )}
                
                {aiMismatches.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="font-medium text-yellow-800 mb-2">⚠️ AI Detected Mismatches:</p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {aiMismatches.map((mismatch, index) => (
                        <li key={index}>• {mismatch}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiVerifying && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 font-medium">🤖 AI is analyzing your NID...</p>
                    <p className="text-blue-600 text-sm">This may take 10-15 seconds</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NID Number
                  </label>
                  <input
                    type="text"
                    value={nidNumber}
                    onChange={(e) => setNidNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="10, 13, or 17 digits"
                    maxLength={17}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NID Front Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNidFrontFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NID Back Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNidBackFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={nidLoading}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 px-4 rounded-lg disabled:bg-gray-400"
                >
                  {nidLoading ? (aiVerifying ? '🤖 AI Analyzing...' : 'Uploading...') : '🤖 Verify with AI'}
                </button>
              </form>
            ) : (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                <div className="text-6xl mb-3">✓</div>
                <p className="text-green-800 font-bold text-lg mb-2">NID Verified by AI!</p>
                <p className="text-green-700 text-sm">NID: {nidNumber}</p>
              </div>
            )}
          </div>
        </div>

        {phoneVerified && nidVerified && (
          <div className="mt-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg shadow-lg p-6 text-center text-white">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Account Fully Verified!</h2>
            <p className="mb-4">Your phone and NID have been verified successfully.</p>
            <button
              onClick={() => router.push('/profiles')}
              className="bg-white text-green-600 hover:bg-gray-100 font-bold py-2 px-6 rounded-lg"
            >
              Browse Profiles →
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/profiles')}
            className="text-rose-500 hover:text-rose-600 font-medium"
          >
            ← Back to Profiles
          </button>
        </div>
      </div>
    </div>
  )
}