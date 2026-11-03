/**
 * LUMENS - Supabase client configuration
 * --------------------------------------
 * Shared, browser-safe configuration + the singleton browser client.
 * Server-side helpers live in `lib/supabase-server.ts` (cookie sessions) and
 * `lib/supabase-admin.ts` (service-role operations) so that `next/headers`
 * and the secret key never leak into Client Components.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

/** Fully typed Supabase client used across the platform. */
export type LumenSupabaseClient = SupabaseClient<Database>;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfig = {
  url,
  anonKey,
  /** Origin used to build confirmation / magic-link / recovery redirects. */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export const SUPABASE_SETUP_HINT =
  "اتصال به Supabase تنظیم نشده است. مقادیر NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY را در فایل .env.local قرار دهید (نمونه: .env.example).";

/** True when both public env variables are present. */
export function isSupabaseConfigured(): boolean {
  return supabaseConfig.url.length > 0 && supabaseConfig.anonKey.length > 0;
}

/** Returns the public credentials or throws a localized setup error. */
export function requireSupabaseConfig(): { url: string; anonKey: string } {
  if (!isSupabaseConfigured()) {
    throw new Error(SUPABASE_SETUP_HINT);
  }

  return { url: supabaseConfig.url, anonKey: supabaseConfig.anonKey };
}

let browserClient: LumenSupabaseClient | null = null;

/**
 * Returns the singleton browser client.
 * Uses `createBrowserClient` from `@supabase/ssr` so the session is stored in
 * cookies and stays in sync with Server Components / Route Handlers.
 */
export function getSupabaseBrowserClient(): LumenSupabaseClient {
  if (browserClient) {
    return browserClient;
  }

  const config = requireSupabaseConfig();
  browserClient = createBrowserClient<Database>(config.url, config.anonKey);

  return browserClient;
}

/**
 * Safe variant for UI code that must render even before Supabase is wired up.
 * Returns `null` instead of throwing when the env variables are missing.
 */
export function getSupabaseBrowserClientSafe(): LumenSupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return getSupabaseBrowserClient();
}
