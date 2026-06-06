import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import GuestGate from '@/components/GuestGate'
import CityProfileCard from '@/components/profiles/CityProfileCard'



// All supported city slugs
const CITY_DATA: Record<string, {
  name: string
  nameBn: string
  division: string
  divisionBn: string
  areas?: string[]
  description: string
}> = {
  dhaka: {
    name: 'Dhaka', nameBn: 'ঢাকা',
    division: 'Dhaka', divisionBn: 'ঢাকা বিভাগ',
    areas: ['Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Mohammadpur',
      'Bashundhara', 'Motijheel', 'Wari', 'Lalbagh', 'Tejgaon', 'Rampura',
      'Khilgaon', 'Mugda', 'Badda', 'Demra', 'Jatrabari', 'Keraniganj',
      'Savar', 'Gazipur', 'Narayanganj'],
    description: 'Find verified matrimony profiles from Dhaka — Bangladesh\'s capital city. Browse brides and grooms from Dhanmondi, Gulshan, Uttara, Mirpur and all major areas of Dhaka.'
  },
  chittagong: {
    name: 'Chittagong', nameBn: 'চট্টগ্রাম',
    division: 'Chittagong', divisionBn: 'চট্টগ্রাম বিভাগ',
    areas: ['Agrabad', 'Nasirabad', 'Halishahar', 'Panchlaish', 'Khulshi',
      'Bayazid', 'Chandgaon', 'Double Mooring', 'Kotwali', 'Pahartali',
      "Cox's Bazar", 'Comilla', 'Feni', 'Noakhali', 'Brahmanbaria'],
    description: 'Find verified matrimony profiles from Chittagong — Bangladesh\'s port city. Browse brides and grooms from Agrabad, Nasirabad, Khulshi and all areas of Chittagong.'
  },
  sylhet: {
    name: 'Sylhet', nameBn: 'সিলেট',
    division: 'Sylhet', divisionBn: 'সিলেট বিভাগ',
    areas: ['Sylhet Sadar', 'Sunamganj', 'Moulvibazar', 'Habiganj',
      'Zindabazar', 'Amberkhana', 'Shibganj', 'Shahjalal Upashahar',
      'Beanibazar', 'Golapganj', 'Jaintiapur', 'Companiganj'],
    description: 'Find verified matrimony profiles from Sylhet — home of NRBs and the tea garden region. Browse brides and grooms from Sylhet Sadar, Sunamganj, Moulvibazar and Habiganj.'
  },
  rajshahi: {
    name: 'Rajshahi', nameBn: 'রাজশাহী',
    division: 'Rajshahi', divisionBn: 'রাজশাহী বিভাগ',
    areas: ['Rajshahi Sadar', 'Bogura', 'Pabna', 'Naogaon', 'Natore',
      'Sirajganj', 'Chapainawabganj', 'Joypurhat'],
    description: 'Find verified matrimony profiles from Rajshahi division. Browse brides and grooms from Rajshahi, Bogura, Pabna and all districts of Rajshahi division.'
  },
  khulna: {
    name: 'Khulna', nameBn: 'খুলনা',
    division: 'Khulna', divisionBn: 'খুলনা বিভাগ',
    areas: ['Khulna Sadar', 'Jessore', 'Satkhira', 'Bagerhat', 'Narail',
      'Chuadanga', 'Kushtia', 'Magura', 'Jhenaidah', 'Meherpur'],
    description: 'Find verified matrimony profiles from Khulna division. Browse brides and grooms from Khulna, Jessore, Satkhira and all districts of Khulna division.'
  },
  barisal: {
    name: 'Barisal', nameBn: 'বরিশাল',
    division: 'Barisal', divisionBn: 'বরিশাল বিভাগ',
    areas: ['Barisal Sadar', 'Bhola', 'Patuakhali', 'Barguna',
      'Jhalokathi', 'Pirojpur'],
    description: 'Find verified matrimony profiles from Barisal division. Browse brides and grooms from Barisal, Bhola, Patuakhali and all districts of Barisal division.'
  },
  rangpur: {
    name: 'Rangpur', nameBn: 'রংপুর',
    division: 'Rangpur', divisionBn: 'রংপুর বিভাগ',
    areas: ['Rangpur Sadar', 'Dinajpur', 'Kurigram', 'Gaibandha',
      'Nilphamari', 'Lalmonirhat', 'Panchagarh', 'Thakurgaon'],
    description: 'Find verified matrimony profiles from Rangpur division. Browse brides and grooms from Rangpur, Dinajpur, Bogura and all districts of Rangpur division.'
  },
  mymensingh: {
    name: 'Mymensingh', nameBn: 'ময়মনসিংহ',
    division: 'Mymensingh', divisionBn: 'ময়মনসিংহ বিভাগ',
    areas: ['Mymensingh Sadar', 'Netrokona', 'Kishorganj', 'Jamalpur', 'Sherpur'],
    description: 'Find verified matrimony profiles from Mymensingh division. Browse brides and grooms from Mymensingh, Netrokona, Jamalpur and all districts of Mymensingh division.'
  },
  comilla: {
    name: 'Comilla', nameBn: 'কুমিল্লা',
    division: 'Chittagong', divisionBn: 'চট্টগ্রাম বিভাগ',
    description: 'Find verified matrimony profiles from Comilla. Browse brides and grooms from Comilla district.'
  },
  gazipur: {
    name: 'Gazipur', nameBn: 'গাজীপুর',
    division: 'Dhaka', divisionBn: 'ঢাকা বিভাগ',
    description: 'Find verified matrimony profiles from Gazipur. Browse brides and grooms from Gazipur district near Dhaka.'
  },
  narayanganj: {
    name: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ',
    division: 'Dhaka', divisionBn: 'ঢাকা বিভাগ',
    description: 'Find verified matrimony profiles from Narayanganj. Browse brides and grooms from Narayanganj district.'
  },
}

const CITY_SEARCH_TERMS: Record<string, string[]> = {
  dhaka: ['Dhaka','Mirpur','Dhanmondi','Gulshan','Banani','Uttara','Mohammadpur',
    'Bashundhara','Motijheel','Wari','Lalbagh','Tejgaon','Rampura','Khilgaon',
    'Mugda','Badda','Demra','Jatrabari','Keraniganj','Savar','Pallabi','Hazaribagh','Cantonment'],
  chittagong: ['Chittagong','Agrabad','Nasirabad','Halishahar','Panchlaish','Khulshi',
    'Bayazid','Chandgaon','Pahartali','Kotwali','Double Mooring','Bakalia',
    'Bandar','Karnaphuli','Sitakunda','Fatikchhari','Rangunia','Patiya','Boalkhali'],
  sylhet: ['Sylhet','Zindabazar','Amberkhana','Shibganj','Beanibazar','Golapganj',
    'Jaintiapur','Companiganj','Zakiganj','Kanaighat','Bishwanath','Fenchuganj',
    'Balagonj','Osmaninagar','Sunamganj','Habiganj','Moulvibazar'],
  rajshahi: ['Rajshahi','Bogura','Bogra','Pabna','Naogaon','Natore','Sirajganj',
    'Chapainawabganj','Joypurhat','Boalia','Matihar','Rajpara'],
  khulna: ['Khulna','Jessore','Satkhira','Bagerhat','Narail','Chuadanga',
    'Kushtia','Magura','Jhenaidah','Meherpur','Sonadanga','Khalishpur','Rupsha','Dumuria'],
  barisal: ['Barisal','Bhola','Patuakhali','Barguna','Jhalokathi','Pirojpur',
    'Bakerganj','Gournadi','Agailjhara','Mehendiganj','Muladi','Babuganj','Hizla'],
  rangpur: ['Rangpur','Dinajpur','Kurigram','Gaibandha','Nilphamari',
    'Lalmonirhat','Panchagarh','Thakurgaon','Badarganj','Mithapukur','Kaunia'],
  mymensingh: ['Mymensingh','Netrokona','Kishoreganj','Jamalpur','Sherpur',
    'Muktagacha','Trishal','Bhaluka','Phulpur','Gaffargaon'],
  comilla: ['Comilla','Chandpur','Brahmanbaria','Lakshmipur','Feni','Noakhali',
    'Burichang','Homna','Daudkandi','Chauddagram','Laksam','Barura','Debidwar'],
  gazipur: ['Gazipur','Tongi','Kaliakair','Kapasia','Sreepur','Kaliganj'],
  narayanganj: ['Narayanganj','Fatullah','Siddhirganj','Rupganj','Araihazar','Sonargaon'],
}

export async function generateStaticParams() {
  return Object.keys(CITY_DATA).map(city => ({ city }))
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params
  const cityInfo = CITY_DATA[city]
  if (!cityInfo) return { title: 'Not Found' }

  return {
    title: `${cityInfo.name} Matrimony — পাত্র পাত্রী | Biyekori`,
    description: cityInfo.description,
    keywords: [
      `${cityInfo.name} matrimony`, `${cityInfo.name} marriage media`,
      `${cityInfo.nameBn} পাত্র পাত্রী`, `${cityInfo.name} bride groom`,
      `${cityInfo.name} biye`, 'bangladesh matrimony', 'biyekori',
      `${cityInfo.division} matrimony`
    ].join(', '),
    openGraph: {
      title: `${cityInfo.name} Matrimony — Find Your Match | Biyekori`,
      description: cityInfo.description,
      url: `https://biyekori.com/matrimony/${city}`,
    },
    alternates: { canonical: `https://biyekori.com/matrimony/${city}` }
  }
}

async function getCityProfiles(cityName: string, area?: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  let query = supabase
    .from('profiles')
    .select('id, full_name, age, gender, city, district, profession, education, photo_url, is_verified, package, profile_completion, selfie_status')
    .neq('is_banned', true)

  if (area) {
    query = query.or(`city.ilike.%${area}%,district.ilike.%${area}%,location_detail.ilike.%${area}%`)
  } else {
    const terms = CITY_SEARCH_TERMS[cityName] || [cityName]
    const orClause = terms.map((t: string) => `city.ilike.%${t}%`).join(',')
    query = query.or(orClause)
  }

  const { data } = await query.order('profile_completion', { ascending: false }).limit(60)
  return data || []
}

export default async function CityMatrimonyPage({ params, searchParams }: {
  params: Promise<{ city: string }>
  searchParams: Promise<{ area?: string; gender?: string }>
}) {
  const { city } = await params
  const { area, gender } = await searchParams

  const cityInfo = CITY_DATA[city]
  if (!cityInfo) notFound()

  const profiles = await getCityProfiles(city, area)
  const filtered = gender
    ? profiles.filter((p: any) => p.gender?.toLowerCase() === gender.toLowerCase())
    : profiles

  const males = profiles.filter((p: any) => p.gender?.toLowerCase() === 'male').length
  const females = profiles.filter((p: any) => p.gender?.toLowerCase() === 'female').length

  const ALL_CITIES = Object.entries(CITY_DATA).map(([slug, d]) => ({ slug, name: d.name, nameBn: d.nameBn }))

  return (
    <div style={{ minHeight: '100vh', background: '#fdf2f4', paddingTop: '80px' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #e11d48 100%)', padding: '48px 24px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Biyekori · বিয়েকরি
          </p>
          <h1 style={{ margin: '0 0 8px', fontSize: '36px', fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
            {cityInfo.name} Matrimony
          </h1>
          <p style={{ margin: '0 0 4px', fontSize: '20px', color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>
            {cityInfo.nameBn} পাত্র পাত্রী
          </p>
          <p style={{ margin: '16px 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            {cityInfo.description}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', color: 'white', fontWeight: 600 }}>
              {males} Grooms · পাত্র
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', color: 'white', fontWeight: 600 }}>
              {females} Brides · পাত্রী
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', color: 'white', fontWeight: 600 }}>
              AI Matched · যাচাইকৃত
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px' }}>

        {/* Filter bar */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Gender filter */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <Link href={`/matrimony/${city}${area ? `?area=${area}` : ''}`}
              style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', background: !gender ? 'linear-gradient(135deg,#e11d48,#db2777)' : '#f3f4f6', color: !gender ? 'white' : '#6b7280' }}>
              All
            </Link>
            <Link href={`/matrimony/${city}?gender=Female${area ? `&area=${area}` : ''}`}
              style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', background: gender === 'Female' ? 'linear-gradient(135deg,#e11d48,#db2777)' : '#f3f4f6', color: gender === 'Female' ? 'white' : '#6b7280' }}>
              Brides · পাত্রী
            </Link>
            <Link href={`/matrimony/${city}?gender=Male${area ? `&area=${area}` : ''}`}
              style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', background: gender === 'Male' ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : '#f3f4f6', color: gender === 'Male' ? 'white' : '#6b7280' }}>
              Grooms · পাত্র
            </Link>
          </div>

          {/* Area dropdown — only for Dhaka and cities with areas */}
          {cityInfo.areas && cityInfo.areas.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}>Area / এলাকা:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '400px' }}>
                <Link href={`/matrimony/${city}${gender ? `?gender=${gender}` : ''}`}
                  style={{ padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600, textDecoration: 'none', background: !area ? '#e11d48' : '#f3f4f6', color: !area ? 'white' : '#6b7280' }}>
                  All
                </Link>
                {cityInfo.areas.slice(0, 6).map((a: string) => (
                  <Link key={a} href={`/matrimony/${city}?area=${encodeURIComponent(a)}${gender ? `&gender=${gender}` : ''}`}
                    style={{ padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600, textDecoration: 'none', background: area === a ? '#e11d48' : '#f3f4f6', color: area === a ? 'white' : '#6b7280' }}>
                    {a}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Area quick links for Dhaka */}
        {cityInfo.areas && cityInfo.areas.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Browse by Area — এলাকা অনুযায়ী
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {cityInfo.areas.map(a => (
                <Link key={a} href={`/matrimony/${city}?area=${encodeURIComponent(a)}${gender ? `&gender=${gender}` : ''}`}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                    textDecoration: 'none', border: '1.5px solid #fecdd3',
                    background: area === a ? '#e11d48' : 'white',
                    color: area === a ? 'white' : '#e11d48'
                  }}>
                  {a}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Profile grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px' }}>
            <p style={{ fontSize: '16px', color: '#9ca3af', margin: '0 0 16px' }}>No profiles found for this area yet.</p>
            <Link href="/profiles" style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#e11d48,#db2777)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
              Browse All Profiles
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {filtered.map((p: any) => (
              <CityProfileCard key={p.id} profile={p} cityName={cityInfo.name} />
            ))}
          </div>
          <GuestGate page={1} />
        )}

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#e11d48)', borderRadius: '20px', padding: '40px 24px', textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900, color: 'white' }}>
            Find Your {cityInfo.name} Match — আজই শুরু করুন
          </h2>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
            Join thousands of {cityInfo.name} families finding their perfect match on Biyekori
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ padding: '14px 28px', background: 'white', color: '#e11d48', borderRadius: '12px', fontWeight: 800, textDecoration: 'none', fontSize: '15px' }}>
              Register Free — ফ্রি নিবন্ধন
            </Link>
            <Link href="/profiles" style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', fontSize: '15px', border: '1.5px solid rgba(255,255,255,0.3)' }}>
              Browse All Profiles
            </Link>
          </div>
        </div>

        {/* Other cities */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 800, color: '#111827' }}>
            Browse Other Cities — অন্যান্য শহর
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {ALL_CITIES.filter(c => c.slug !== city).map(c => (
              <Link key={c.slug} href={`/matrimony/${c.slug}`}
                style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
                {c.name} · {c.nameBn}
              </Link>
            ))}
          </div>
        </div>

        {/* SEO text block */}
        <div style={{ marginTop: '32px', padding: '24px', background: 'white', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 800, color: '#111827' }}>
            {cityInfo.name} Marriage Media — {cityInfo.nameBn} বিয়ের মিডিয়া
          </h2>
          <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#6b7280', lineHeight: 1.8 }}>
            Biyekori is Bangladesh&apos;s first AI-powered matrimony platform. We serve brides and grooms across {cityInfo.name} with verified profiles, AI match scores, and real-time messaging. Unlike traditional marriage media, Biyekori uses advanced AI to calculate compatibility based on education, profession, family background, lifestyle and values.
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: 1.8 }}>
            {cityInfo.nameBn}-তে পাত্র পাত্রী খুঁজছেন? বিয়েকরিতে রেজিস্ট্রেশন করুন এবং আমাদের AI ম্যাচিং সিস্টেমের মাধ্যমে আপনার জন্য সেরা ম্যাচ খুঁজুন। সম্পূর্ণ বিনামূল্যে রেজিস্ট্রেশন করা যায়।
          </p>
        </div>
      </div>
    </div>
  )
}
