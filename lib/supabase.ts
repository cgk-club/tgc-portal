import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient
let _supabaseAdmin: SupabaseClient

function getUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
}

function getAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
}

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(getUrl(), getAnonKey())
  }
  return _supabase
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      // Never silently fall back to the anon key: service-role writes would then
      // fail quietly under RLS. Fail loudly so the misconfiguration is visible.
      throw new Error('[supabase] SUPABASE_SERVICE_ROLE_KEY is not set; refusing to fall back to the anon key for admin client')
    }
    _supabaseAdmin = createClient(getUrl(), serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }
  return _supabaseAdmin
}

export function getStorageUrl(path: string): string {
  return `${getUrl()}/storage/v1/object/public/fiche-images/${path}`
}
