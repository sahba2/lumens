import type { Metadata } from "next";

import NotFoundPanel from "@/components/NotFoundPanel";

/**
 * Root 404 boundary.
 * Next.js compiles this into the `/_not-found` page that the dev server needs
 * when a request cannot be matched to any route.
 */
export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
  robots: { index: false, follow: true },
};

export default function RootNotFound() {
  return <NotFoundPanel />;
}
