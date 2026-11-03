import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import AiKeywordsSection from "@/components/AiKeywordsSection";
import ArticlesExplorer from "@/components/ArticlesExplorer";
import CtaBand from "@/components/CtaBand";
import { IconBook, IconBrain, IconCheck, IconClock, IconSearch, IconSparkles } from "@/components/Icons";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { articles, toPersianDigits } from "@/lib/data";

export const metadata: Metadata = {
  title: "مقالات تخصصی هوش مصنوعی و معماری",
  description:
    "آرشیو مقالات LUMENS: راهنماهای عملی پرامپت‌نویسی، مقایسه ابزارهای رندر هوش مصنوعی، گردش کار استودیو و تحلیل آینده حرفه معماری.",
  alternates: { canonical: "/articles" },
};

const highlights = [
  {
    icon: IconBrain,
    title: "تحلیل ابزارها",
    text: "مقایسه فنی Midjourney، Stable Diffusion، ComfyUI و Vizcom با معیارهای واقعی پروژه معماری.",
  },
  {
    icon: IconCheck,
    title: "راهنمای گام‌به‌گام",
    text: "هر مقاله با چک‌لیست اجرایی و فایل نمونه همراه است تا بلافاصله در پروژه استفاده شود.",
  },
  {
    icon: IconClock,
    title: "به‌روز و کوتاه",
    text: "مقالات کوتاه و دقیق؛ زمان مطالعه مشخص است تا سریع‌ترین مسیر یادگیری را انتخاب کنید.",
  },
];

interface ArticlesPageProps {
  searchParams?: { tag?: string | string[] };
}

export default function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const tag = typeof searchParams?.tag === "string" ? searchParams.tag : null;

  return (
    <>
      <PageHero
        eyebrow="آرشیو تخصصی LUMENS"
        title="مقالات هوش مصنوعی در معماری"
        description="راهنماهای عملی، مقایسه ابزارها و تحلیل‌های فنی برای معمارانی که می‌خواهند جلوتر از بازار حرکت کنند."
        image="/articles/article-01.svg"
        badges={[
          `${toPersianDigits(articles.length)} مقاله منتشرشده`,
          "به‌روزرسانی هفتگی",
          "تحریریه تخصصی",
        ]}
        breadcrumb={{ href: "/articles", label: "مقالات" }}
        actions={
          <>
            <Link href="#archive" className="btn-primary">
              <IconBook className="h-4 w-4" />
              ورود به آرشیو
            </Link>
            <Link href="/ai-prompts" className="btn-ghost">
              کتابخانه پرامپت
              <IconSparkles className="h-4 w-4 text-gold" />
            </Link>
          </>
        }
      />

      <section id="archive" className="container-x scroll-mt-[88px] py-16">
        <Reveal>
          <SectionHeading
            eyebrow="آرشیو مقالات"
            title="دانش فنی، بدون حاشیه"
            description="با جستجوی آنی و فیلتر دسته‌بندی، دقیقاً همان مقاله‌ای را پیدا کنید که پروژه امروز شما به آن نیاز دارد."
            action={
              <span className="chip border-gold/25 text-gold-light">
                <IconSearch className="h-3.5 w-3.5" />
                جستجوی آنی
              </span>
            }
          />
        </Reveal>

        <Reveal className="mt-10" delay={80}>
          <Suspense fallback={null}>
            <AiKeywordsSection />
          </Suspense>
        </Reveal>

        <Reveal className="mt-10" delay={120}>
          <ArticlesExplorer tag={tag} />
        </Reveal>
      </section>

      <section className="relative border-y border-white/10 bg-white/[0.015] py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="رویکرد تحریریه"
              title="چرا مقالات LUMENS متفاوت است؟"
              description="ما به جای ترجمه اخبار، تجربه اجرای واقعی ابزارها در پروژه‌های معماری را مستند می‌کنیم."
            />
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, title, text }, index) => (
              <Reveal key={title} delay={index * 90}>
                <div className="glow-card h-full p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-base font-bold text-white">{title}</h3>
                  <p className="mt-3 text-xs leading-6 text-zinc-400">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x pb-24 pt-20">
        <Reveal>
          <CtaBand
            eyebrow="یادگیری عمیق‌تر"
            title="از مقاله تا اجرا در پروژه بعدی"
            description="با دوره‌های پروژه‌محور LUMENS، مفاهیم مقالات را به گردش کار قابل تکرار در استودیو تبدیل کنید."
            primary={{ href: "/courses", label: "مشاهده دوره‌ها" }}
            secondary={{ href: "/ai-architecture", label: "هوش مصنوعی در معماری" }}
          />
        </Reveal>
      </section>
    </>
  );
}
