import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProfilePageClient from './ProfilePageClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
    }
  }

  const name = profile.full_name ? profile.full_name.split(' ')[0] + ', ' + (profile.age || '') : 'Profile'
  const location = profile.city || profile.district || 'Bangladesh'
  const title = name + ' — ' + location + ' | Biyekori'
  const description = 'View ' + (profile.full_name || 'this profile') + ' on Biyekori — Bangladesh AI Matrimony. Find your perfect match.'
  const image = profile.photo_url || 'https://biyekori.com/og-default.jpg'
  const url = 'https://biyekori.com/profile/' + resolvedParams.id

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Biyekori',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !profile) notFound()

  return <ProfilePageClient profile={profile} />
}
