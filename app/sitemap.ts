import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://biyekori.com'

export const dynamic = 'force-dynamic'

const CITY_SLUGS = [
  'dhaka','chittagong','sylhet','rajshahi','khulna',
  'barisal','rangpur','mymensingh','comilla','gazipur','narayanganj'
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/profiles`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/matrimony`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/safety`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Add all city matrimony pages
  const cityPages: MetadataRoute.Sitemap = CITY_SLUGS.map(city => ({
    url: `${BASE_URL}/matrimony/${city}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }))

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id')
      .order('id', { ascending: true })

    if (error || !profiles) {
      console.log('Sitemap Supabase error:', error?.message)
      return [...staticPages, ...cityPages]
    }

    const profilePages: MetadataRoute.Sitemap = profiles.map(profile => ({
      url: `${BASE_URL}/profile/${profile.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    console.log(`Sitemap: ${profilePages.length} profiles + ${cityPages.length} city pages`)
    return [...staticPages, ...cityPages, ...profilePages]
  } catch (err) {
    console.error('Sitemap error:', err)
    return [...staticPages, ...cityPages]
  }
}
