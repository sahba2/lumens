/**
 * LUMENS - server-side authentication helpers
 * -------------------------------------------
 * Import only from Server Components, Server Actions or Route Handlers.
 * Uses the cookie-based Supabase client so RLS runs with the visitor identity.
 */

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import type { UserRole } from "./database.types";
import { isSupabaseConfigured } from "./supabase";
import { createSupabaseServerClient } from "./supabase-server";

export interface ServerAuthContext {
  user: User;
  role: UserRole;
  fullName: string;
  avatarUrl: string | null;
}

/** Returns the authenticated user or `null` (never throws for guests). */
export async function getServerUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}

/** Returns the user together with the profile role used by RLS policies. */
export async function getServerAuthContext(): Promise<ServerAuthContext | null> {
  const user = await getServerUser();
  if (!user) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    role: data?.role ?? "student",
    fullName: data?.full_name ?? "",
    avatarUrl: data?.avatar_url ?? null,
  };
}

/** Redirects guests to the login page and returns the auth context otherwise. */
export async function requireUser(loginPath = "/login"): Promise<ServerAuthContext> {
  const context = await getServerAuthContext();
  if (!context) {
    redirect(loginPath);
  }

  return context;
}

/**
 * Ensures the visitor has one of the required roles.
 * Guests go to the login page, authenticated users without permission go home.
 */
export async function requireRole(
  roles: UserRole[],
  loginPath = "/login",
  forbiddenPath = "/",
): Promise<ServerAuthContext> {
  const context = await requireUser(loginPath);
  if (!roles.includes(context.role)) {
    redirect(forbiddenPath);
  }

  return context;
}

/** True when the current server session belongs to an editor or admin. */
export async function isCurrentUserStaff(): Promise<boolean> {
  const context = await getServerAuthContext();
  return context?.role === "editor" || context?.role === "admin";
}
