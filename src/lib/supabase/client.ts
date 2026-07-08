import { createBrowserClient } from '@supabase/ssr'

/**
 * Client Supabase à utiliser dans les Client Components ("use client").
 * Nécessite NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
 * définies dans .env.local (voir .env.example).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
