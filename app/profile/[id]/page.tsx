import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import ProfilePageClient from './ProfilePageClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Fields safe to show publicly (teaser only)
const PUBLIC_FIELDS = 'id,full_name,age,gender,religion,religious_level,district,city,profession,education,height,marital_status,photo_url,additional_photos,photo_privacy,package,is_verified,guardian_mode,profile_completion,created_at,last_active_at,marriage_timeline,family_type,family_values,about_me,partner_preference'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, age, city, district, religion, photo_url')
    .eq('id', resolvedParams.id)
    .single()

  if (!profile) {
    return {
      title: 'Profile | Biyekori',
      description: 'Find your life partner on Biyekori — Bangladesh AI Matrimony.',
      robots: { index: false, follow: false },
    }
  }

  const firstName = profile.full_name ? profile.full_name.split(' ')[0] : 'Profile'
  const location = profile.city || profile.district || 'Bangladesh'
  const title = `${firstName}, ${profile.age || ''} — ${location} | Biyekori`
  const description = `View this profile on Biyekori — Bangladesh's privacy-first matrimony platform.`
  const image = 'https://biyekori.com/og-default.jpg' // never expose real photo in OG

  return {
    title,
    description,
    robots: { index: false, follow: false }, // never index personal profiles
    openGraph: {
      title,
      description,
      siteName: 'Biyekori',
      images: [{ url: image, width: 1200, height: 630, alt: 'Biyekori' }],
      type: 'profile',
    },
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params

  // Only fetch safe public fields server-side — sensitive data fetched client-side after auth check
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(PUBLIC_FIELDS)
    .eq('id', resolvedParams.id)
    .single()

  if (error || !profile) notFound()

  return <ProfilePageClient profile={profile} />
}

