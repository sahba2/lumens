import Link from "next/link";

import { footerLinks, navigation } from "@/lib/data";
import { IconBolt, IconBrain, IconCube, IconSparkles } from "./Icons";
import NewsletterForm from "./NewsletterForm";

const socials = [
  { label: "Instagram", href: "https://instagram.com", icon: IconSparkles },
  { label: "Telegram", href: "https://telegram.org", icon: IconBolt },
  { label: "YouTube", href: "https://youtube.com", icon: IconBrain },
  { label: "LinkedIn", href: "https://linkedin.com", icon: IconCube },
];

const year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date());

/** Site-wide footer: brand column, link columns, newsletter and legal row. */
export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-ink-soft/60">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold/50 to-transparent" />
      <div className="orb -right-24 top-10 h-72 w-72 bg-gold/10" />
      <div className="orb -left-24 bottom-0 h-72 w-72 bg-indigo-500/10" />

      <div className="container-x relative grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-16 w-16 max-h-16 max-w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gold/35 bg-white/[0.04] backdrop-blur-xl">
              <span className="font-display text-2xl font-black leading-none text-gradient-gold">L</span>
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-black tracking-widest2 text-white">LUMENS</span>
              <span className="mt-1.5 text-[10px] text-zinc-500">AI × ARCHITECTURE PLATFORM</span>
            </span>
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-7 text-zinc-400">
            LUMENS بستر تخصصی هوش مصنوعی در معماری است؛ جایی که کانسپت، رندر، آموزش و
            کتابخانه آبجکت‌های سه‌بعدی در یک گردش کار یکپارچه به هم می‌رسند.
          </p>

          <div className="mt-6 flex items-center gap-2">
            {socials.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="glass flex h-10 w-10 items-center justify-center rounded-2xl text-zinc-400 transition-all duration-300 hover:border-gold/45 hover:text-gold"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {footerLinks.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-bold text-white">{column.title}</h3>
            <span className="gold-hairline mt-4 block w-12" />
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={`${column.title}-${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors duration-300 hover:text-gold-light"
                  >
                    <span className="h-1 w-1 rounded-full bg-gold/50 transition-all duration-300 group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <NewsletterForm />
        </div>
      </div>

      <div className="container-x relative">
        <div className="hairline" />
        <div className="flex flex-col items-center justify-between gap-4 py-7 text-xs text-zinc-500 sm:flex-row">
          <p>
            © {year} تمام حقوق برای پلتفرم <span className="font-semibold text-zinc-300">LUMENS</span> محفوظ است.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {navigation.map((item) => (
              <Link key={`foot-${item.href}`} href={item.href} className="transition-colors hover:text-gold-light">
                {item.label}
              </Link>
            ))}
            <span className="text-zinc-600">|</span>
            <span>ساخته‌شده برای معماران فارسی‌زبان</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
