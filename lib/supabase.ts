import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: number
  full_name: string
  email: string
  gender: string
  age: number
  height: string
  religion: string
  marital_status: string
  education: string
  profession: string
  city: string
  blood_group: string
  nrb: boolean
  about_me: string
  partner_preference: string
  photo_url: string
  is_verified: boolean
  is_premium: boolean
  family_managed: boolean
  guardian_name: string
  guardian_phone: string
  photo_visible_to: string
  created_at: string
}