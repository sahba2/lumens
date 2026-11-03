/**
 * LUMENS - NextAuth catch-all route
 * ---------------------------------
 * Serves `/api/auth/session`, `/api/auth/csrf`, `/api/auth/callback/credentials`
 * and the rest of the NextAuth endpoints.
 *
 * The static `/api/auth/signup` route takes precedence over this dynamic
 * segment, so account creation stays a dedicated JSON endpoint.
 */

import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth-options";

// bcrypt + `node:fs` require the Node.js runtime, not the Edge runtime.
export const runtime = "nodejs";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
