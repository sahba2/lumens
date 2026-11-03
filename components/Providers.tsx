"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/**
 * Client-side providers shared by the whole app.
 * `SessionProvider` exposes the NextAuth session to `useSession()` and
 * `signOut()` inside the Navbar and other Client Components.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
