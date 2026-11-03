"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

interface SignOutButtonProps {
  className?: string;
}

/** Ends the NextAuth JWT session and returns the visitor to the home page. */
export default function SignOutButton({ className }: SignOutButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleSignOut = async () => {
    setBusy(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <button type="button" onClick={handleSignOut} disabled={busy} className={className}>
      {busy ? "در حال خروج…" : "خروج از حساب"}
    </button>
  );
}
