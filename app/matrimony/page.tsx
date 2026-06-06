import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Bangladesh Matrimony by City — পাত্র পাত্রী | Biyekori',
  description: 'Find brides and grooms from Dhaka, Chittagong, Sylhet, Rajshahi, Khulna and all cities of Bangladesh. AI-powered matrimony platform.',
  alternates: { canonical: 'https://biyekori.com/matrimony' }
}

const CITIES = [
  { slug: 'dhaka', name: 'Dhaka', nameBn: 'ঢাকা', icon: '🏙️', desc: 'Capital city — largest profile base' },
  { slug: 'chittagong', name: 'Chittagong', nameBn: 'চট্টগ্রাম', icon: '⚓', desc: 'Port city — business families' },
  { slug: 'sylhet', name: 'Sylhet', nameBn: 'সিলেট', icon: '🍵', desc: 'NRB hub — UK & Middle East diaspora' },
  { slug: 'rajshahi', name: 'Rajshahi', nameBn: 'রাজশাহী', icon: '🎓', desc: 'Education city — professionals' },
  { slug: 'khulna', name: 'Khulna', nameBn: 'খুলনা', icon: '🌿', desc: 'Southern division' },
  { slug: 'barisal', name: 'Barisal', nameBn: 'বরিশাল', icon: '🌊', desc: 'River delta region' },
  { slug: 'rangpur', name: 'Rangpur', nameBn: 'রংপুর', icon: '🌾', desc: 'Northern division' },
  { slug: 'mymensingh', name: 'Mymensingh', nameBn: 'ময়মনসিংহ', icon: '🏞️', desc: 'Central-north region' },
  { slug: 'comilla', name: 'Comilla', nameBn: 'কুমিল্লা', icon: '🕌', desc: 'Eastern district' },
  { slug: 'gazipur', name: 'Gazipur', nameBn: 'গাজীপুর', icon: '🏭', desc: 'Greater Dhaka area' },
  { slug: 'narayanganj', name: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ', icon: '🚢', desc: 'Industrial hub near Dhaka' },
]

export default function MatrimonyIndexPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fdf2f4', paddingTop: '80px' }}>
      <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#e11d48)', padding: '48px 24px', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '32px', fontWeight: 900, color: 'white' }}>Bangladesh Matrimony</h1>
        <p style={{ margin: '0 0 4px', fontSize: '18px', color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>বাংলাদেশ পাত্র পাত্রী</p>
        <p style={{ margin: '16px 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Browse verified profiles by city — AI-powered matching</p>
      </div>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {CITIES.map(c => (
            <Link key={c.slug} href={`/matrimony/${c.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1.5px solid #fde8ed', transition: 'all 0.15s', cursor: 'pointer' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{c.icon}</div>
                <h2 style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: 800, color: '#111827' }}>{c.name}</h2>
                <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#e11d48' }}>{c.nameBn}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{c.desc}</p>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <Link href="/profiles" style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#e11d48,#db2777)', color: 'white', borderRadius: '12px', fontWeight: 800, textDecoration: 'none', fontSize: '15px' }}>
            Browse All Profiles
          </Link>
        </div>
      </div>
    </div>
  )
}
