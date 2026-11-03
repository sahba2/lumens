/**
 * LUMENS - NextAuth configuration
 * -------------------------------
 * Credentials-only authentication backed by the local JSON user store.
 * The role (student / instructor) picked at sign-up is carried inside the JWT
 * and exposed again on `session.user.role`, so server components can authorise
 * requests and client components can adapt the UI.
 *
 * Import this module only from Route Handlers / Server Components (it reads
 * Node's `fs` through the user store).
 */

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { verifyOtp } from "./otp-store";
import { verifyPassword } from "./password";
import { normalizeIranianPhone } from "./phone";
import { findUserByEmail, findUserByPhone, normalizeEmail, type StoredUser } from "./user-store";

/** Maps a stored account to the NextAuth `User` shape (also feeds the JWT). */
function toAuthUser(user: StoredUser) {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    role: user.role,
    phone: user.phone ?? null,
  };
}

/**
 * Development fallback so `next dev` works without an `.env.local`.
 * Production builds refuse to start without `NEXTAUTH_SECRET`.
 */
const DEVELOPMENT_SECRET = "lumens-local-development-secret-change-me";

export const authOptions: NextAuthOptions = {
  secret:
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : DEVELOPMENT_SECRET),
  session: {
    // JWT sessions keep the credentials flow cookie-based without a DB adapter.
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "LUMENS",
      credentials: {
        identifier: { label: "ایمیل یا شماره موبایل", type: "text" },
        // Kept so older clients posting `email` keep working.
        email: { label: "ایمیل", type: "email" },
        password: { label: "رمز عبور", type: "password" },
      },
      async authorize(credentials) {
        const identifier =
          typeof credentials?.identifier === "string"
            ? credentials.identifier.trim()
            : typeof credentials?.email === "string"
              ? credentials.email.trim()
              : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";

        if (!identifier || !password) {
          return null;
        }

        // Only an e-mail address can contain "@"; anything else is treated as
        // a mobile number so one field accepts both identifiers.
        const user = identifier.includes("@")
          ? await findUserByEmail(normalizeEmail(identifier))
          : await findUserByPhone(identifier);

        if (!user) {
          return null;
        }

        const passwordMatches = await verifyPassword(password, user.passwordHash);
        return passwordMatches ? toAuthUser(user) : null;
      },
    }),
    CredentialsProvider({
      id: "phone-otp",
      name: "LUMENS SMS",
      credentials: {
        phone: { label: "شماره موبایل", type: "tel" },
        code: { label: "کد تأیید", type: "text" },
      },
      async authorize(credentials) {
        const phone = normalizeIranianPhone(
          typeof credentials?.phone === "string" ? credentials.phone : "",
        );
        const code = typeof credentials?.code === "string" ? credentials.code.trim() : "";

        if (!phone || !code) {
          return null;
        }

        const user = await findUserByPhone(phone);
        if (!user) {
          return null;
        }

        // One-time code login doubles as account recovery when the password
        // (or the e-mail address used at sign-up) is forgotten.
        const verified = await verifyOtp(phone, code);
        return verified.ok ? toAuthUser(user) : null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name ?? null;
        token.email = user.email ?? null;
        token.phone = user.phone ?? null;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id ?? token.sub ?? "",
        role: token.role ?? "student",
        phone: token.phone ?? null,
      };

      return session;
    },
  },
};
