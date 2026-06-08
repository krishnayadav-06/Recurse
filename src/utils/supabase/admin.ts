import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client using the Service Role Key.
 * This bypasses RLS entirely — use ONLY in server-side API routes.
 * Never expose this client or key to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY!

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SECRET_KEY is not set. This is required for server-side operations.'
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
