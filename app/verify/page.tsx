"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyNIDPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [frontImage, setFrontImage] = useState<string>('');
  const [backImage, setBackImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // TODO: Get this from localStorage or API
  const [userData] = useState({
    name: 'Test User',
    dob: '01-01-1995',
    district: 'Dhaka',
    blood_group: '' // Empty = not provided yet
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (side === 'front') {
        setFrontImage(base64);
      } else {
        setBackImage(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVerify = async () => {
    if (!frontImage || !backImage) {
      alert('Please upload both front and back images of your NID');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/verify-nid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontImage,
          backImage,
          userData
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        // TODO: Update user profile:
        // - is_verified = true
        // - blood_group = extractedData.blood_group (if user didn't have it)
        // - nid_number = extractedData.nid_number
        
        setTimeout(() => {
          alert('✅ Verification Successful!\n\nYour profile is now verified!');
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('❌ Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Identity Verification</h1>
              <p className="text-gray-600 mt-2">NID বা জন্ম নিবন্ধন — যেকোনো একটি দিয়ে যাচাই করুন</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-rose-600">৳200</div>
              <p className="text-xs text-gray-500">One-time fee</p>
              <p className="text-xs text-green-600 font-bold">FREE with ৳500+ plans</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-green-50 p-4 rounded-xl text-center">
              <div className="text-2xl mb-2">✓</div>
              <p className="text-sm font-bold text-gray-900">Verified Badge</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <div className="text-2xl mb-2">⭐</div>
              <p className="text-sm font-bold text-gray-900">5x More Views</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl text-center">
              <div className="text-2xl mb-2">🔝</div>
              <p className="text-sm font-bold text-gray-900">Top Search Results</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-rose-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-rose-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 font-bold">Upload Front</span>
            </div>
            
            <div className={`w-16 h-1 mx-4 ${step >= 2 ? 'bg-rose-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center ${step >= 2 ? 'text-rose-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-rose-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 font-bold">Upload Back</span>
            </div>
            
            <div className={`w-16 h-1 mx-4 ${step >= 3 ? 'bg-rose-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center ${step >= 3 ? 'text-rose-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-rose-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2 font-bold">Verify</span>
            </div>
          </div>

          {/* Document type notice */}
          <div style={{ marginBottom: '20px', padding: '14px 18px', background: '#fffbeb', borderRadius: '14px', border: '1.5px solid #fde68a', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>💡</span>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#92400e' }}>NID নেই? জন্ম নিবন্ধন সনদ ব্যবহার করুন</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#78350f', lineHeight: 1.6 }}>
                If you do not have a National ID Card (NID), you can upload your <strong>জন্ম নিবন্ধন সনদ (Birth Registration Certificate)</strong> instead. Upload the front and back of whichever document you have.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-900 mb-3">
              📄 NID / জন্ম নিবন্ধন — Front Side
            </label>
            <div className="border-4 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-rose-500 transition">
              {frontImage ? (
                <div className="relative">
                  <img src={frontImage} alt="NID Front" className="max-h-64 mx-auto rounded-lg shadow-lg" />
                  <button
                    onClick={() => setFrontImage('')}
                    className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="text-6xl mb-4">📸</div>
                  <p className="text-xl font-bold text-gray-900 mb-2">Click to upload NID front</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'front')}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-900 mb-3">
              📄 NID / জন্ম নিবন্ধন — Back Side
            </label>
            <div className="border-4 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-rose-500 transition">
              {backImage ? (
                <div className="relative">
                  <img src={backImage} alt="NID Back" className="max-h-64 mx-auto rounded-lg shadow-lg" />
                  <button
                    onClick={() => setBackImage('')}
                    className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="text-6xl mb-4">📸</div>
                  <p className="text-xl font-bold text-gray-900 mb-2">Click to upload NID back</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'back')}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={!frontImage || !backImage || loading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition ${
              frontImage && backImage && !loading
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-2xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? '🔄 Verifying...' : '✓ Verify My NID'}
          </button>

          {result && (
            <div className={`mt-6 p-6 rounded-xl ${result.success ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
              <h3 className={`text-xl font-black mb-3 ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                {result.success ? '✅ Verification Successful!' : '❌ Verification Failed'}
              </h3>
              <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.message}
              </p>
              
              {result.extractedData && (
                <div className="mt-4 p-4 bg-white rounded-lg">
                  <p className="text-xs font-bold text-gray-600 mb-2">Extracted Data:</p>
                  <div className="text-sm text-gray-800 space-y-1">
                    <p><strong>Name:</strong> {result.extractedData.name}</p>
                    <p><strong>DOB:</strong> {result.extractedData.dob}</p>
                    <p><strong>Blood Group:</strong> {result.extractedData.blood_group}</p>
                    <p><strong>District:</strong> {result.extractedData.district}</p>
                    <p><strong>NID Number:</strong> {result.extractedData.nid_number}</p>
                  </div>
                </div>
              )}
              
              {result.mismatches && result.mismatches.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-bold text-red-900 mb-2">Issues Found:</p>
                  <ul className="list-disc list-inside text-sm text-red-800">
                    {result.mismatches.map((mismatch: string, i: number) => (
                      <li key={i}>{mismatch}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}