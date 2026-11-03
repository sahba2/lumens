/**
 * LUMENS - admin Supabase client (service role)
 * ---------------------------------------------
 * Bypasses Row Level Security, therefore it must never be imported by a
 * Client Component and must only run on the server (Route Handlers, Server
 * Actions, scripts). The service-role key has no `NEXT_PUBLIC_` prefix on
 * purpose.
 */

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import type { LumenSupabaseClient } from "./supabase";

export function createSupabaseAdminClient(): LumenSupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("createSupabaseAdminClient() must only run on the server.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase admin client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
