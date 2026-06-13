import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const globalForSupabase = globalThis as unknown as { supabaseAdmin: SupabaseClient | null }

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null

  if (!globalForSupabase.supabaseAdmin) {
    globalForSupabase.supabaseAdmin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return globalForSupabase.supabaseAdmin
}

export function getStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || 'uploads'
}
