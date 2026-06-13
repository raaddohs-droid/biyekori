'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function getProfiles() {
  // Supabase default limit is 1000 — fetch all in batches
  const allProfiles: any[] = []
  const BATCH = 1000
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, from + BATCH - 1)

    if (error) {
      console.error('Error fetching profiles:', error)
      break
    }

    if (!data || data.length === 0) break
    allProfiles.push(...data)
    if (data.length < BATCH) break
    from += BATCH
  }

  return allProfiles
}

export async function getProfileById(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
