"use client";
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();

  const packages = [
    {
      name: 'Prottasha',
      banglaName: 'প্রত্যাশা',
      price: 0,
      period: 'Free Forever',
      color: 'gray',
      features: [
        { text: 'Create profile with photos', included: true },
        { text: 'Browse unlimited profiles', included: true },
        { text: 'See all photos', included: true },
        { text: 'Send 3 interests per month', included: true, badge: '3/month' },
        { text: 'View contact details', included: false },
        { text: 'Send messages', included: false },
        { text: 'See who viewed you (last 5)', included: true, badge: 'Last 5' },
        { text: 'AI compatibility scores', included: false },
        { text: 'Priority in search', included: false }
      ],
      cta: 'Current Plan',
      popular: false
    },
    {
      name: 'Bondhon',
      banglaName: 'বন্ধন',
      price: 999,
      period: 'per month',
      yearlyPrice: 8999,
      color: 'rose',
      features: [
        { text: 'Everything in Prottasha', included: true },
        { text: 'View 25 phone numbers/month', included: true, badge: '25/month' },
        { text: 'Unlimited interests', included: true },
        { text: 'Send direct messages (10/month)', included: true, badge: '10/month' },
        { text: 'See all profile viewers', included: true },
        { text: 'AI compatibility scores', included: true, badge: 'NEW' },
        { text: 'Highlighted profile (2x views)', included: true },
        { text: 'Verified badge display', included: true },
        { text: 'Priority in search', included: false }
      ],
      cta: 'Upgrade Now',
      popular: true,
      savings: 'Save ৳3,000/year'
    },
    {
      name: 'Milon',
      banglaName: 'মিলন',
      price: 2999,
      period: 'per month',
      yearlyPrice: 29999,
      color: 'purple',
      features: [
        { text: 'Everything in Bondhon', included: true },
        { text: 'Unlimited contact viewing', included: true },
        { text: 'Unlimited messages', included: true },
        { text: 'Top 10 search placement', included: true, badge: 'Always' },
        { text: 'Featured gold badge', included: true, badge: '👑' },
        { text: 'Profile boost 3x/month', included: true, badge: '3x' },
        { text: 'AI matchmaker (weekly)', included: true },
        { text: 'Relationship manager support', included: true },
        { text: 'Background verification help', included: true }
      ],
      cta: 'Go Elite',
      popular: false,
      savings: 'Save ৳6,000/year'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find your life partner with the plan that fits your needs. 
            Upgrade anytime, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative bg-white rounded-2xl shadow-xl p-8 ${
                pkg.popular ? 'ring-4 ring-rose-500 scale-105' : ''
              }`}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    ⭐ Most Popular
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-gray-900">
                  {pkg.name}
                </h3>
                <p className="text-gray-600">{pkg.banglaName}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                {pkg.price === 0 ? (
                  <div className="text-4xl font-black text-gray-900">Free</div>
                ) : (
                  <>
                    <div className="text-5xl font-black text-gray-900">
                      ৳{pkg.price.toLocaleString()}
                    </div>
                    <div className="text-gray-600 mt-1">{pkg.period}</div>
                    {pkg.yearlyPrice && (
                      <div className="mt-2 text-sm text-green-600 font-bold">
                        {pkg.savings}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                      feature.included ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {feature.included ? '✓' : '✕'}
                    </span>
                    <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                      {feature.text}
                      {feature.badge && (
                        <span className="ml-2 text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                          {feature.badge}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => pkg.price > 0 ? router.push('/dashboard') : null}
                disabled={pkg.price === 0}
                className={`w-full py-4 rounded-xl font-bold transition ${
                  pkg.price === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : pkg.popular
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-xl'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {pkg.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Add-ons Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Add-ons (À La Carte)</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* NID Verification */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-rose-500 transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">NID Verification</h3>
                  <p className="text-sm text-gray-600">Get verified badge, 5x more views</p>
                </div>
                <div className="text-2xl font-black text-rose-500">৳200</div>
              </div>
              <ul className="space-y-2 mb-4 text-sm text-gray-600">
                <li>✓ Green verified badge</li>
                <li>✓ 5x more profile views</li>
                <li>✓ 80% more responses</li>
                <li>✓ One-time payment</li>
              </ul>
              <button className="w-full py-3 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600">
                Verify Now
              </button>
            </div>

            {/* Profile Boost */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-rose-500 transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Profile Boost</h3>
                  <p className="text-sm text-gray-600">Top 10 for 48 hours</p>
                </div>
                <div className="text-2xl font-black text-rose-500">৳299</div>
              </div>
              <ul className="space-y-2 mb-4 text-sm text-gray-600">
                <li>✓ Appear in top 10 search</li>
                <li>✓ 500% more views</li>
                <li>✓ Lasts 48 hours</li>
                <li>✓ Buy anytime</li>
              </ul>
              <button className="w-full py-3 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600">
                Boost Profile
              </button>
            </div>

            {/* AI Matchmaker Report */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-rose-500 transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">AI Matchmaker Report</h3>
                  <p className="text-sm text-gray-600">Detailed compatibility analysis</p>
                </div>
                <div className="text-2xl font-black text-rose-500">৳499</div>
              </div>
              <ul className="space-y-2 mb-4 text-sm text-gray-600">
                <li>✓ 20-page PDF report</li>
                <li>✓ Compatibility scores</li>
                <li>✓ Conversation starters</li>
                <li>✓ Red flags analysis</li>
              </ul>
              <button className="w-full py-3 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600">
                Get Report
              </button>
            </div>

            {/* Contact Unlock */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-rose-500 transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Single Contact Unlock</h3>
                  <p className="text-sm text-gray-600">View one profile's contact</p>
                </div>
                <div className="text-2xl font-black text-rose-500">৳99</div>
              </div>
              <ul className="space-y-2 mb-4 text-sm text-gray-600">
                <li>✓ See phone number</li>
                <li>✓ See email</li>
                <li>✓ Instant access</li>
                <li>✓ Perfect for testing</li>
              </ul>
              <button className="w-full py-3 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600">
                Unlock Contact
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Have questions? Contact us at{' '}
            <a href="tel:01733577215" className="text-rose-500 font-bold">
              01733577215
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}