import { createClient } from "@supabase/supabase-js";

/** Service-role client for webhooks, server jobs and scripts. Never import from client components. */
export function adminClient(opts: { fetch?: typeof fetch } = {}) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
    ...(opts.fetch ? { global: { fetch: opts.fetch } } : {}),
  });
}
