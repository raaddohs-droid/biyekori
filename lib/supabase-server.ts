'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function getProfiles(sortMode: string = 'newest') {
  let query = supabase.from('profiles').select('*')

  if (sortMode === 'oldest') {
    query = query.order('created_at', { ascending: true })
  } else if (sortMode === 'active') {
    query = query.order('updated_at', { ascending: false })
  } else if (sortMode === 'completion') {
    query = query.order('profile_completion', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching profiles:', error)
    return []
  }

  return data || []
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
