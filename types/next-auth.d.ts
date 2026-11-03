/**
 * LUMENS - NextAuth type augmentation
 * -----------------------------------
 * Adds the fields our credentials provider returns (`id`, `role`) to the
 * built-in `User`, `Session` and `JWT` types so TypeScript stays accurate in
 * server components, route handlers and client hooks.
 */

import type { DefaultSession } from "next-auth";

import type { UserRole } from "@/lib/user-store";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      /** Canonical Iranian mobile number (`09xxxxxxxxx`) when known. */
      phone?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    phone?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  }
}
