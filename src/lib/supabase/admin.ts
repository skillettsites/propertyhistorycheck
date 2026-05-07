import { createClient } from "@supabase/supabase-js";

// Service-role client for API routes. Bypasses RLS. Never expose client-side.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
