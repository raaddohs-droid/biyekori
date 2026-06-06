import { MetadataRoute } from 'next'

const BASE_URL = 'https://biyekori.com'

export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/profiles`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/safety`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  try {
    // Use our own API endpoint which already has Supabase access
    const res = await fetch(`${BASE_URL}/api/profiles`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      console.log(`Sitemap: API fetch failed with status ${res.status}`)
      return staticPages
    }

    const data = await res.json()
    const profiles: { id: number }[] = data.profiles || []

    const profilePages: MetadataRoute.Sitemap = profiles.map(profile => ({
      url: `${BASE_URL}/profile/${profile.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    console.log(`Sitemap: generated ${profilePages.length} profile URLs`)
    return [...staticPages, ...profilePages]
  } catch (err) {
    console.error('Sitemap error:', err)
    return staticPages
  }
}
