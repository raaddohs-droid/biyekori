// Types based on your Supabase profiles table
export interface Profile {
  id: number
  created_at: string
  full_name: string
  email: string
  gender: string
  age: number | null
  photo_url?: string | null
  education?: string | null
  occupation?: string | null
  city?: string | null
  location_detail?: string | null
  height?: string | null
  marital_status?: string | null
  family_type?: string | null
  religious_level?: string | null
  religion?: string | null
  managed_by?: string | null
  bio?: string | null
}

export interface ProfileFilters {
  gender?: string
  minAge?: number
  maxAge?: number
}