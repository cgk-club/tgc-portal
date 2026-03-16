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
    if (serviceKey) {
      _supabaseAdmin = createClient(getUrl(), serviceKey)
    } else {
      _supabaseAdmin = getSupabase()
    }
  }
  return _supabaseAdmin
}

export function getStorageUrl(path: string): string {
  return `${getUrl()}/storage/v1/object/public/fiche-images/${path}`
}
