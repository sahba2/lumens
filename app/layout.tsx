import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import BackToTop from "@/components/BackToTop";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { ogImage } from "@/lib/images";

const siteUrl = "https://lumens.archi";

const siteDescription =
  "LUMENS؛ پلتفرم تخصصی هوش مصنوعی در معماری. آموزش پرامپت‌نویسی معماری، رندرینگ لحظه‌ای، گردش کار AI و کتابخانه آبجکت‌های سه‌بعدی آماده رندر برای معماران و طراحان داخلی.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LUMENS | معماری، فراتر از تخیل با هوش مصنوعی",
    template: "%s | LUMENS",
  },
  description: siteDescription,
  applicationName: "LUMENS",
  keywords: [
    "هوش مصنوعی در معماری",
    "پرامپت‌نویسی معماری",
    "رندرینگ لحظه‌ای",
    "گردش کار AI",
    "آبجکت سه‌بعدی معماری",
    "دوره هوش مصنوعی معماری",
    "Midjourney",
    "Stable Diffusion",
    "ComfyUI",
    "ControlNet",
  ],
  authors: [{ name: "LUMENS Studio", url: siteUrl }],
  creator: "LUMENS Studio",
  publisher: "LUMENS Studio",
  category: "معماری و هوش مصنوعی",
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: siteUrl,
    siteName: "LUMENS",
    title: "LUMENS | معماری، فراتر از تخیل با هوش مصنوعی",
    description: siteDescription,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "LUMENS - پلتفرم هوش مصنوعی در معماری",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LUMENS | معماری، فراتر از تخیل با هوش مصنوعی",
    description: siteDescription,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="dark relative min-h-screen overflow-x-hidden bg-neutral-950 text-neutral-100 antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-gold focus:px-5 focus:py-2 focus:text-sm focus:font-bold focus:text-ink"
        >
          رفتن به محتوای اصلی
        </a>

        <Providers>
          <Navbar />
          <main id="main" className="pt-[81px]">
            {children}
          </main>
          <Footer />
          <BackToTop />
        </Providers>

        {/* ویجت چت Moshaver.ai - تگ اسکریپت استاندارد HTML برای اطمینان از اجرای آن */}
        <script
          src="https://moshaver.ai/ai-chat/widget.php?key=802d9f4b73387d2df56fe889abdee3964ef303463b0bd30d"
          async
        ></script>
      </body>
    </html>
  );
}
