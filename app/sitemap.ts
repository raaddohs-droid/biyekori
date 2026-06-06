import { MetadataRoute } from 'next'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
    // Fetch all profiles — no deactivation filter since most profiles have null not false
    // We fetch in batches of 1000 to handle large datasets
    let allProfiles: { id: number; updated_at: string }[] = []
    let offset = 0
    const batchSize = 1000

    while (true) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?select=id,updated_at&order=id.asc&limit=${batchSize}&offset=${offset}`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
          next: { revalidate: 86400 },
        }
      )

      if (!res.ok) break

      const batch = await res.json()
      if (!Array.isArray(batch) || batch.length === 0) break

      allProfiles = [...allProfiles, ...batch]
      if (batch.length < batchSize) break
      offset += batchSize
    }

    const profilePages: MetadataRoute.Sitemap = allProfiles.map(profile => ({
      url: `${BASE_URL}/profile/${profile.id}`,
      lastModified: profile.updated_at ? new Date(profile.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    console.log(`Sitemap: generated ${profilePages.length} profile URLs`)
    return [...staticPages, ...profilePages]
  } catch (err) {
    console.error('Sitemap generation error:', err)
    return staticPages
  }
}
