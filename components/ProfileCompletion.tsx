"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ProfileCompletionProps {
  user: any;
}

export default function ProfileCompletion({ user }: ProfileCompletionProps) {
  const [completion, setCompletion] = useState(0);
  const [missing, setMissing] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const items = [
      { field: 'photo_url', label: 'Profile Photo', weight: 20 },
      { field: 'is_verified', label: 'NID Verification', weight: 30 },
      { field: 'bio', label: 'Bio/About Me', weight: 15 },
      { field: 'education', label: 'Education', weight: 10 },
      { field: 'profession', label: 'Profession', weight: 10 },
      { field: 'monthly_income', label: 'Monthly Income', weight: 5 },
      { field: 'phone', label: 'Phone Number', weight: 5 },
      { field: 'email', label: 'Email Address', weight: 5 },
    ];

    let totalWeight = 0;
    const missingItems: string[] = [];

    items.forEach(item => {
      if (user[item.field]) {
        totalWeight += item.weight;
      } else {
        missingItems.push(item.label);
      }
    });

    setCompletion(totalWeight);
    setMissing(missingItems);
  }, [user]);

  if (!user) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
      <h3 className="text-lg font-black text-gray-900 mb-4">
        Profile Completion
      </h3>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-gray-700">{completion}% Complete</span>
          {completion === 100 ? (
            <span className="text-green-600 text-sm font-bold">✓ Complete</span>
          ) : (
            <span className="text-orange-600 text-sm font-bold">Incomplete</span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-rose-500 to-pink-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          ></div>
        </div>
      </div>

      {/* Benefits */}
      {completion < 100 && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-4">
          <p className="text-xs font-bold text-yellow-900 mb-2">
            🎯 Complete your profile to get:
          </p>
          <ul className="text-xs text-yellow-800 space-y-1">
            <li>✓ 5x more profile views</li>
            <li>✓ Top search ranking</li>
            <li>✓ 80% more responses</li>
          </ul>
        </div>
      )}

      {/* Missing Items */}
      {missing.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-700 mb-2">Missing:</p>
          {missing.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-gray-600">• {item}</span>
              {item === 'NID Verification' && (
                <Link 
                  href="/verify"
                  className="text-rose-600 font-bold hover:underline"
                >
                  Add →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Primary CTA - NID Verification */}
      {!user.is_verified && (
        <Link
          href="/verify"
          className="block mt-4 w-full px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold text-center hover:shadow-lg transition"
        >
          🔒 Verify NID (+30%)
        </Link>
      )}

      {/* Success State */}
      {completion === 100 && (
        <div className="mt-4 p-4 bg-green-50 border-2 border-green-400 rounded-xl text-center">
          <div className="text-3xl mb-2">🎉</div>
          <p className="text-sm font-bold text-green-900">
            Your profile is complete!
          </p>
        </div>
      )}
    </div>
  );
}