/**
 * LUMENS - server-side Supabase client
 * ------------------------------------
 * Reads the auth session from Next.js cookies. Only import this module from
 * Server Components, Server Actions, Route Handlers or middleware-aware code.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "./database.types";
import { requireSupabaseConfig, type LumenSupabaseClient } from "./supabase";

/**
 * Creates a request-scoped Supabase client that reads/writes the auth cookies.
 * Cookie writes are ignored inside Server Components (Next.js forbids them);
 * `middleware.ts` is responsible for refreshing the session in that case.
 */
export async function createSupabaseServerClient(): Promise<LumenSupabaseClient> {
  const cookieStore = cookies();
  const { url, anonKey } = requireSupabaseConfig();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component: the middleware refreshes the
          // session cookie on the next request instead.
        }
      },
    },
  });
}
