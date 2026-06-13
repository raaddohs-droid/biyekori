"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState<'en'|'bn'>('en');
  const t = (en: string, bn: string) => lang === 'bn' ? bn : en;

  // Step 1 — Phone
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Step 2 — Basic info
  const [iAm, setIAm] = useState(''); // 'bride' or 'groom'
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [guardianMode, setGuardianMode] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  const handleSendOtp = async () => {
    if (!phone || phone.length !== 11) { setErrorMsg(t('Enter a valid 11-digit number', 'সঠিক ১১ সংখ্যার নম্বর দিন')); return; }
    setLoading(true); setErrorMsg('');
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setSentOtp(generatedOtp);
    try {
      const res = await fetch('/api/send-sms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.startsWith('0') ? `+880${phone.substring(1)}` : `+880${phone}`, message: `Your Biyekori OTP is: ${generatedOtp}` })
      });
      const data = await res.json();
      if (data.success) setOtpSent(true);
      else setErrorMsg(t('Failed to send OTP. Try again.', 'OTP পাঠানো যায়নি। আবার চেষ্টা করুন।'));
    } catch { setErrorMsg(t('Network error. Try again.', 'নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।')); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = () => {
    if (otp === sentOtp) { setOtpVerified(true); setErrorMsg(''); }
    else setErrorMsg(t('Wrong OTP. Try again.', 'ভুল OTP। আবার চেষ্টা করুন।'));
  };

  const handleSubmit = async () => {
    if (!iAm) { setErrorMsg(t('Please select bride or groom', 'পাত্র বা পাত্রী নির্বাচন করুন')); return; }
    if (!fullName.trim()) { setErrorMsg(t('Enter your full name', 'পুরো নাম লিখুন')); return; }
    if (!age || parseInt(age) < 18 || parseInt(age) > 70) { setErrorMsg(t('Enter a valid age (18-70)', 'সঠিক বয়স দিন (১৮-৭০)')); return; }
    if (!password || password.length < 6) { setErrorMsg(t('Password must be at least 6 characters', 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে')); return; }
    setLoading(true); setErrorMsg('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          age: parseInt(age),
          phone,
          password,
          gender: iAm === 'bride' ? 'female' : 'male',
          looking_for: iAm === 'bride' ? 'groom' : 'bride',
          managed_by: guardianMode ? 'Guardian' : 'Self',
          guardian_mode: guardianMode,
          package: 'prottasha',
          phone_verified: true,
          city: '',
          district: '',
          education: '',
          profession: '',
        })
      });
      const data = await res.json();
      if (data.success) { setStep(3); }
      else {
        if (data.error?.includes('duplicate') || data.error?.includes('unique')) {
          setErrorMsg(t('This phone is already registered. Please login.', 'এই নম্বরে ইতিমধ্যে অ্যাকাউন্ট আছে। লগইন করুন।'));
        } else {
          setErrorMsg(data.error || t('Registration failed. Try again.', 'নিবন্ধন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'));
        }
      }
    } catch { setErrorMsg(t('Error. Try again.', 'সমস্যা হয়েছে। আবার চেষ্টা করুন।')); }
    finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', padding: '13px 16px', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', outline: 'none', color: '#111827', background: '#fff', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' as const };
  const btnPrimary = { width: '100%', padding: '15px', background: 'linear-gradient(135deg,#7B1D2E,#4A1A6B)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', fontFamily: 'system-ui, sans-serif' };
  const btnSecondary = { padding: '13px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui, sans-serif' };

  return (
    <div style={{ minHeight: '100vh', background: '#FDF6EE', paddingTop: '90px', paddingBottom: '60px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#7B1D2E', fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>BIYEKORI</span>
        </a>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
          {[1,2].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step >= s ? '#7B1D2E' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: step >= s ? 'white' : '#9ca3af' }}>{s}</div>
              {s < 2 && <div style={{ width: '40px', height: '2px', background: step > s ? '#7B1D2E' : '#e5e7eb', borderRadius: '2px' }} />}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <div style={{ background: 'white', borderRadius: '30px', padding: '4px', display: 'flex', gap: '2px', border: '1px solid #e5e7eb' }}>
            <button onClick={() => setLang('en')} style={{ padding: '5px 16px', borderRadius: '24px', border: 'none', background: lang === 'en' ? '#7B1D2E' : 'transparent', color: lang === 'en' ? 'white' : '#6b7280', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>EN</button>
            <button onClick={() => setLang('bn')} style={{ padding: '5px 16px', borderRadius: '24px', border: 'none', background: lang === 'bn' ? '#7B1D2E' : 'transparent', color: lang === 'bn' ? 'white' : '#6b7280', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>বাংলা</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '440px', margin: '0 auto', padding: '0 20px' }}>

        {/* ── STEP 1: Phone ── */}
        {step === 1 && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 20px rgba(0,0,0,0.07)' }}>
            <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 900, color: '#111827' }}>{t('Your phone number', 'আপনার ফোন নম্বর')}</h2>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6b7280' }}>{t('We\'ll send a one-time code to verify', 'যাচাইয়ের জন্য একটি কোড পাঠাব')}</p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>{t('Phone number', 'ফোন নম্বর')}</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={{ ...inputStyle, flex: 1 }} placeholder="01XXXXXXXXX" maxLength={11} />
                <button onClick={handleSendOtp} disabled={loading || otpVerified} style={{ padding: '13px 16px', background: otpVerified ? '#1D9E75' : '#7B1D2E', color: 'white', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: loading || otpVerified ? 'default' : 'pointer', whiteSpace: 'nowrap' }}>
                  {loading ? '...' : otpVerified ? '✓' : t('Send OTP', 'OTP পাঠান')}
                </button>
              </div>
            </div>

            {otpSent && !otpVerified && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>{t('Enter OTP', 'OTP লিখুন')}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value)} style={{ ...inputStyle, flex: 1, letterSpacing: '4px', textAlign: 'center', fontSize: '20px' }} placeholder="------" maxLength={6} />
                  <button onClick={handleVerifyOtp} style={{ padding: '13px 16px', background: '#1D9E75', color: 'white', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>{t('Verify', 'যাচাই')}</button>
                </div>
              </div>
            )}

            {otpVerified && (
              <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', fontWeight: 700, color: '#15803d' }}>
                ✓ {t('Phone verified!', 'ফোন যাচাই হয়েছে!')}
              </div>
            )}

            {errorMsg && <p style={{ color: '#e11d48', fontSize: '13px', margin: '0 0 12px' }}>{errorMsg}</p>}

            <button onClick={() => { if (!otpVerified) { setErrorMsg(t('Verify your phone first', 'আগে ফোন যাচাই করুন')); return; } setErrorMsg(''); setStep(2); }} style={btnPrimary}>
              {t('Continue →', 'পরবর্তী →')}
            </button>

            <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '16px' }}>
              {t('Already registered?', 'ইতিমধ্যে অ্যাকাউন্ট আছে?')} <a href="/login" style={{ color: '#7B1D2E', fontWeight: 700, textDecoration: 'none' }}>{t('Login', 'লগইন করুন')}</a>
            </p>
          </div>
        )}

        {/* ── STEP 2: Basic Info ── */}
        {step === 2 && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 20px rgba(0,0,0,0.07)' }}>
            <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 900, color: '#111827' }}>{t('A few basics', 'কিছু মৌলিক তথ্য')}</h2>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6b7280' }}>{t('You can add more from your dashboard later', 'বাকি তথ্য পরে ড্যাশবোর্ড থেকে যোগ করা যাবে')}</p>

            {/* I am */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>{t('I am a...', 'আমি একজন...')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[{ val: 'bride', bn: 'পাত্রী', en: 'Bride (woman)', icon: '👰' }, { val: 'groom', bn: 'পাত্র', en: 'Groom (man)', icon: '🤵' }].map(opt => (
                  <button key={opt.val} onClick={() => setIAm(opt.val)} style={{ padding: '14px', border: `2px solid ${iAm === opt.val ? '#7B1D2E' : '#e5e7eb'}`, borderRadius: '12px', background: iAm === opt.val ? '#FDF6EE' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>{opt.icon}</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: iAm === opt.val ? '#7B1D2E' : '#374151' }}>{lang === 'bn' ? opt.bn : opt.en}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Guardian mode toggle */}
            <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e5e7eb', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#374151' }}>{t('Family-managed profile', 'পরিবার পরিচালিত প্রোফাইল')}</p>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#9ca3af' }}>{t('Registering on behalf of a family member', 'পরিবারের কারো জন্য নিবন্ধন করছেন')}</p>
              </div>
              <button onClick={() => setGuardianMode(!guardianMode)} style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', background: guardianMode ? '#7B1D2E' : '#d1d5db', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                <span style={{ position: 'absolute', top: '2px', left: guardianMode ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
              </button>
            </div>

            {/* Full name */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>{t('Full name', 'পুরো নাম')}</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} placeholder={t('Your full name', 'আপনার পুরো নাম')} />
            </div>

            {/* Age */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>{t('Age', 'বয়স')}</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} style={inputStyle} placeholder={t('Your age', 'আপনার বয়স')} min={18} max={70} />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>{t('Create password', 'পাসওয়ার্ড তৈরি করুন')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} placeholder={t('At least 6 characters', 'কমপক্ষে ৬ অক্ষর')} />
            </div>

            {errorMsg && <p style={{ color: '#e11d48', fontSize: '13px', margin: '0 0 12px' }}>{errorMsg}</p>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setStep(1); setErrorMsg(''); }} style={{ ...btnSecondary, flex: '0 0 auto' }}>←</button>
              <button onClick={handleSubmit} disabled={loading} style={{ ...btnPrimary, flex: 1, opacity: loading ? 0.7 : 1 }}>
                {loading ? t('Creating account...', 'অ্যাকাউন্ট তৈরি হচ্ছে...') : t('Create Account →', 'অ্যাকাউন্ট তৈরি করুন →')}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Welcome ── */}
        {step === 3 && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px 28px', boxShadow: '0 2px 20px rgba(0,0,0,0.07)', textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 900, color: '#111827' }}>{t('Welcome to Biyekori!', 'বিয়েকরিতে স্বাগতম!')}</h2>
            <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{t('Your account is ready. Add a photo and more details from your dashboard to get better matches.', 'আপনার অ্যাকাউন্ট তৈরি হয়েছে। ভালো ম্যাচের জন্য ড্যাশবোর্ড থেকে ছবি ও বিস্তারিত তথ্য যোগ করুন।')}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', textAlign: 'left' }}>
              {[
                { icon: '🤳', text: t('Verify your identity — builds 4× more trust', 'পরিচয় যাচাই করুন — ৪ গুণ বেশি বিশ্বাস তৈরি হয়'), href: '/verify-selfie' },
                { icon: '📸', text: t('Add a profile photo', 'প্রোফাইল ছবি যোগ করুন'), href: '/edit-profile' },
                { icon: '📝', text: t('Complete your profile', 'প্রোফাইল সম্পূর্ণ করুন'), href: '/edit-profile' },
              ].map((item, i) => (
                <a key={i} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e5e7eb', textDecoration: 'none' }}>
                  <span style={{ fontSize: '22px' }}>{item.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{item.text}</span>
                  <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                </a>
              ))}
            </div>

            <button onClick={() => router.push('/login')} style={btnPrimary}>{t('Go to Dashboard →', 'ড্যাশবোর্ডে যান →')}</button>
          </div>
        )}

      </div>
    </div>
  );
}
