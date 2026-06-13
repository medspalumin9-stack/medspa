import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const globalForSupabase = globalThis as unknown as { supabaseAdmin: SupabaseClient | null }

function readSupabaseUrl() {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim()
}

function readSupabaseServiceRoleKey() {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
}

export function getSupabaseConfigStatus() {
  const url = readSupabaseUrl()
  const key = readSupabaseServiceRoleKey()
  return {
    hasUrl: Boolean(url),
    hasKey: Boolean(key),
    isConfigured: Boolean(url && key),
  }
}

export function getSupabaseAdmin() {
  const url = readSupabaseUrl()
  const key = readSupabaseServiceRoleKey()
  if (!url || !key) return null

  if (!globalForSupabase.supabaseAdmin) {
    globalForSupabase.supabaseAdmin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return globalForSupabase.supabaseAdmin
}

export function getStorageBucket() {
  return (process.env.SUPABASE_STORAGE_BUCKET || 'uploads').trim()
}

export function missingSupabaseEnvVars() {
  const { hasUrl, hasKey } = getSupabaseConfigStatus()
  const missing: string[] = []
  if (!hasUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!hasKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  return missing
}
