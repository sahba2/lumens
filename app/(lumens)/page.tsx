import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import AiKeywordsSection from "@/components/AiKeywordsSection";
import ArticleCard from "@/components/ArticleCard";
import CinematicBackdrop from "@/components/CinematicBackdrop";
import CourseCard from "@/components/CourseCard";
import CtaBand from "@/components/CtaBand";
import EngineShowcase from "@/components/landing/EngineShowcase";
import FaqAccordion from "@/components/FaqAccordion";
import FeaturedObjects from "@/components/FeaturedObjects";
import { IconArrowLeft, IconBolt, IconBrain, IconCheck, IconSparkles } from "@/components/Icons";
import HeroShowcase from "@/components/landing/HeroShowcase";
import SearchDock from "@/components/landing/SearchDock";
import KeywordCards from "@/components/KeywordCards";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import SeoTopics from "@/components/SeoTopics";
import Testimonials from "@/components/Testimonials";
import WorkflowTimeline from "@/components/WorkflowTimeline";
import { allCourses, articles, heroStats, platformStats } from "@/lib/data";

export const metadata: Metadata = {
  title: "LUMENS | معماری، فراتر از تخیل با هوش مصنوعی",
  description:
    "پلتفرم تخصصی هوش مصنوعی در معماری: رندرینگ لحظه‌ای، پرامپت‌نویسی معماری، گردش کار AI و کتابخانه آبجکت‌های سه‌بعدی آماده رندر برای معماران و طراحان داخلی.",
  alternates: { canonical: "/" },
};

const popularCourses = allCourses.filter((course) => course.popular).slice(0, 3);
const latestArticles = articles.slice(0, 3);

const promises = [
  "رندر واریاسیون در ۸ ثانیه با پایپ‌لاین SDXL Turbo",
  "کتابخانه پرامپت اختصاصی معماری با منفی‌پرامپت",
  "آبجکت‌های سه‌بعدی سبک با متریال PBR آماده رندر",
  "گردش کار شش‌مرحله‌ای از کروکی تا برد ارائه نهایی",
];

export default function HomePage() {
  return (
    <>
      {/* ---------------------------------------------------------- Hero */}
      <section
        id="hero"
        className="hero-stage relative isolate scroll-mt-[88px] overflow-hidden"
      >
        <CinematicBackdrop />

        <div className="container-x relative z-10 grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-20">
          <div className="flex flex-col justify-center">
            <span className="eyebrow">
              <IconSparkles className="h-3.5 w-3.5" />
              AI × ARCHITECTURE PLATFORM
            </span>

            <h1 className="mt-7 font-display text-[2rem] font-black leading-[1.45] text-white sm:text-5xl sm:leading-[1.35]">
              <span className="text-gradient-gold">LUMENS</span>
              <span className="mx-3 text-zinc-700">|</span>
              هوش مصنوعی در معماری
              <span className="mt-3 block text-[0.62em] font-extrabold leading-[1.6] text-zinc-200">
                از کانسپت تا رندر سینمایی، در یک گردش کار هوشمند
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-8 text-zinc-400 sm:text-base">
              رندرینگ لحظه‌ای در چند ثانیه و پرامپت‌نویسی تخصصی معماری؛ از کانسپت، حجم و دیاگرام
              تا نورپردازی سینمایی و برد ارائه نهایی — همه در یک گردش کار هوشمند و تکرارپذیر.
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {promises.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-xs leading-6 text-zinc-300">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/courses" className="btn-primary group overflow-hidden">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-l from-transparent via-white/45 to-transparent transition-transform duration-700 ease-cinema group-hover:translate-x-full"
                />
                <IconBolt className="h-4 w-4" />
                شروع رایگان با LUMENS
              </Link>
              <Link href="/objects" className="btn-glass-glow group">
                <IconSparkles className="h-4 w-4 text-gold" />
                کاوش آبجکت‌های سه‌بعدی
                <IconArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              </Link>
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {heroStats.map((stat) => (
                <div key={stat.label} className="glass rounded-2xl p-4 text-center">
                  <dt className="font-display text-lg font-black text-gradient-gold sm:text-xl">
                    {stat.value}
                  </dt>
                  <dd className="mt-2 text-[10px] leading-5 text-zinc-500">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroShowcase />
        </div>
      </section>

      <SearchDock />

      <Marquee />

      {/* --------------------------------------------- Engine showcase */}
      <Reveal>
        <EngineShowcase />
      </Reveal>

      {/* ------------------------------------------- Golden keyword cards */}
      <section className="container-x py-20">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="چهار ستون LUMENS"
            title="چهار کلیدواژه طلایی پلتفرم"
            description="هر ستون یک مسیر کامل یادگیری و اجرا است: از فهم هوش مصنوعی در معماری تا پرامپت‌نویسی، رندر لحظه‌ای و گردش کار حرفه‌ای استودیو."
          />
        </Reveal>

        <Reveal className="mt-12" delay={120}>
          <KeywordCards />
        </Reveal>

        <Reveal className="mt-8" delay={180}>
          <Suspense fallback={null}>
            <AiKeywordsSection />
          </Suspense>
        </Reveal>
      </section>

      {/* -------------------------------------------- Popular courses */}
      <section
        id="courses"
        className="relative scroll-mt-[88px] border-y border-white/10 bg-white/[0.015] py-20"
      >
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="آموزش تخصصی"
              title="پرطرفدارترین دوره‌های LUMENS"
              description="دوره‌های پروژه‌محور با تمرین روی پروژه‌های واقعی، فایل‌های تمرینی و پشتیبانی انجمن تخصصی معماران."
              action={
                <Link href="/courses" className="btn-ghost">
                  مشاهده همه دوره‌ها
                  <IconArrowLeft className="h-4 w-4" />
                </Link>
              }
            />
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {popularCourses.map((course, index) => (
              <Reveal key={course.id} delay={index * 100}>
                <CourseCard course={course} priority={index === 0} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------- Featured objects */}
      <section id="objects" className="container-x scroll-mt-[88px] py-20">
        <Reveal>
          <SectionHeading
            eyebrow="کتابخانه سه‌بعدی"
            title="پرطرفدارترین آبجکت‌های آماده رندر"
            description="آبجکت‌های سبک و بهینه با UV باز شده و متریال PBR؛ کافی است دانلود کنید و مستقیم در صحنه پروژه بگذارید."
            action={
              <Link href="/objects" className="btn-ghost">
                ورود به کتابخانه آبجکت‌ها
                <IconArrowLeft className="h-4 w-4" />
              </Link>
            }
          />
        </Reveal>

        <Reveal className="mt-12" delay={120}>
          <FeaturedObjects count={3} />
        </Reveal>
      </section>

      {/* ------------------------------------------------ AI workflow */}
      <section
        id="workflow"
        className="relative scroll-mt-[88px] border-y border-white/10 bg-white/[0.015] py-20"
      >
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="نقشه راه حرفه‌ای"
              title="گردش کار شش‌مرحله‌ای پروژه‌های AI-First"
              description="هوش مصنوعی جای معمار را نمی‌گیرد؛ جایگاه آن را دقیق‌تر می‌کند. این نقشه راه، AI را به دستیار تکرارپذیر استودیوی شما تبدیل می‌کند."
            />
          </Reveal>

          <Reveal className="mt-12" delay={120}>
            <WorkflowTimeline limit={4} showCta />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------- Platform stats */}
      <section className="container-x py-20">
        <Reveal>
          <div className="grid gap-6 sm:grid-cols-3">
            {platformStats.map((stat) => (
              <div key={stat.label} className="glow-card p-6 text-center">
                <p className="font-display text-3xl font-black text-gradient-gold">{stat.value}</p>
                <p className="mt-3 text-xs text-zinc-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-16">
          <SectionHeading
            align="center"
            eyebrow="تجربه اعضا"
            title="معمارانی که با LUMENS سریع‌تر طراحی می‌کنند"
            description="از استودیوهای حرفه‌ای تا دانشجویان معماری؛ LUMENS فاصله میان ایده و ارائه را کوتاه می‌کند."
          />
        </Reveal>

        <Reveal className="mt-12" delay={120}>
          <Testimonials />
        </Reveal>
      </section>

      {/* ---------------------------------------------------- Articles */}
      <section
        id="articles"
        className="relative scroll-mt-[88px] border-y border-white/10 bg-white/[0.015] py-20"
      >
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="آرشیو تخصصی"
              title="تازه‌ترین مقالات هوش مصنوعی در معماری"
              description="راهنماهای عملی، مقایسه ابزارها و تحلیل‌های فنی برای معمارانی که می‌خواهند جلوتر از بازار باشند."
              action={
                <Link href="/articles" className="btn-ghost">
                  همه مقالات
                  <IconArrowLeft className="h-4 w-4" />
                </Link>
              }
            />
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((article, index) => (
              <Reveal key={article.id} delay={index * 100}>
                <ArticleCard article={article} priority={index === 0} />
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10" delay={120}>
            <SeoTopics />
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------- FAQ */}
      <section id="faq" className="container-x scroll-mt-[88px] py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <Reveal>
            <div>
              <span className="eyebrow">
                <IconBrain className="h-3.5 w-3.5" />
                پرسش‌های متداول
              </span>
              <h2 className="section-title mt-5">هر آنچه پیش از شروع باید بدانید</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                اگر پاسخ سؤال‌تان را پیدا نکردید، تیم پشتیبانی LUMENS در تمام روزهای هفته آماده
                راهنمایی شماست.
              </p>
              <Link href="/courses" className="btn-primary mt-7">
                <IconSparkles className="h-4 w-4" />
                شروع با دوره رایگان
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <FaqAccordion />
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------- CTA */}
      <section className="container-x pb-24">
        <Reveal>
          <CtaBand
            eyebrow="آماده‌اید؟"
            title="اولین رندر هوش مصنوعی‌تان را امروز بسازید"
            description="با دوره رایگان «پلان، دیاگرام و اینفوگرافیک هوشمند» شروع کنید و در کمتر از یک ساعت اولین خروجی قابل ارائه‌تان را تحویل بگیرید."
            primary={{ href: "/courses", label: "شروع دوره رایگان" }}
            secondary={{ href: "/objects", label: "مشاهده کتابخانه آبجکت‌ها" }}
          />
        </Reveal>
      </section>
    </>
  );
}
