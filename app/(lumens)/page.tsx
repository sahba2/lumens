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
import { IconArrowLeft, IconBrain, IconCheck, IconSparkles } from "@/components/Icons";
import CompareSlider from "@/components/landing/CompareSlider";
import HeroShowcase from "@/components/landing/HeroShowcase";
import SearchDock from "@/components/landing/SearchDock";
import SketchDropzone from "@/components/landing/SketchDropzone";
import KeywordCards from "@/components/KeywordCards";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import SeoTopics from "@/components/SeoTopics";
import Testimonials from "@/components/Testimonials";
import WorkflowTimeline from "@/components/WorkflowTimeline";
import { allCourses, articles, platformStats } from "@/lib/data";

export const metadata: Metadata = {
  title: "LUMENS | معماری، فراتر از تخیل با هوش مصنوعی",
  description:
    "پلتفرم تخصصی هوش مصنوعی در معماری: رندرینگ لحظه‌ای، پرامپت‌نویسی معماری، گردش کار AI و کتابخانه آبجکت‌های سه‌بعدی آماده رندر برای معماران و طراحان داخلی.",
  alternates: { canonical: "/" },
};

const popularCourses = allCourses.filter((course) => course.popular).slice(0, 3);
const latestArticles = articles.slice(0, 3);

/**
 * Hero trust row: three short, verifiable facts. The hero intentionally keeps a
 * single primary action (the free render drop zone) so a first-time visitor is
 * never asked to choose between competing calls to action.
 */
const heroTrust = [
  "بدون نصب نرم‌افزار",
  "۳ رندر رایگان برای هر حساب",
  "شیت متنی رایگان و نامحدود",
];

/**
 * Highlights of the Live 3D loop banner. It is no longer part of the hero: it
 * now introduces the engine feature further down the page, after the render
 * showcase, so the first screen has exactly one visual and one action.
 */
const live3dHighlights = [
  "سه پریست نور: طلایی، شب و استودیو",
  "پرامپت زنده و نوار پیشرفت رندر",
  "اجرا در مرورگر، بدون نصب نرم‌افزار",
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
        <div className="hero-aurora" aria-hidden="true" />

        <div className="container-x relative z-10 grid items-center gap-10 py-12 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,1fr)] lg:gap-12 lg:py-16">
          <div className="flex flex-col justify-center">
            <span className="eyebrow">
              <IconSparkles className="h-3.5 w-3.5" />
              AI × ARCHITECTURE PLATFORM
            </span>

            <h1 className="mt-6 font-display text-[1.9rem] font-black leading-[1.45] text-lumens-bone sm:text-[2.6rem] sm:leading-[1.35]">
              <span className="text-gradient-gold">LUMENS</span>
              <span className="mx-3 text-zinc-700">|</span>
              از کروکی دستی تا رندر سینمایی، در یک گفت‌وگو
              <span className="mt-3 block text-[0.52em] font-extrabold leading-[1.7] text-lumens-bone/85">
                هوش مصنوعی در معماری؛ تصویر خام را رها کنید و رندر نهایی را تحویل بگیرید
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-8 text-zinc-400">
              تصویر پلان، کروکی یا ویوپورت مدل را در باکس رندر زیر رها کنید؛ LUMENS در چند ثانیه
              شیت پنج‌فازی، پرامپت کالیبره و رندر سینمایی را می‌سازد.
            </p>

            <div id="upload" className="glass-card mt-6 scroll-mt-[110px] p-2.5 sm:p-3">
              <SketchDropzone />
            </div>

            <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              {heroTrust.map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <IconCheck className="h-3.5 w-3.5 shrink-0 text-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <CompareSlider
              priority
              caption="BEFORE / AFTER · ویلای کردان"
              sizes="(max-width: 1024px) 100vw, 46vw"
            />
            <p className="mt-3 text-center text-[10px] leading-5 text-zinc-500">
              نمونه واقعی ویلای کردان: کروکی دستی در برابر رندر سینمایی LUMENS؛ دستگیره را بکشید.
            </p>
          </div>
        </div>
      </section>

      <SearchDock />

      <Marquee />

      {/* --------------------------------------------- Engine showcase */}
      <Reveal>
        <EngineShowcase />
      </Reveal>

      {/* ---------------------------------------- Live 3D feature banner */}
      <section id="live-3d" aria-labelledby="live-3d-title" className="container-x py-16">
        <Reveal>
          <div className="glass-card relative grid items-center gap-8 overflow-hidden p-4 sm:p-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-10">
            <div className="orb -right-16 -top-16 h-52 w-52 bg-gold/10" />

            <div className="relative">
              <span className="eyebrow">
                <IconSparkles className="h-3.5 w-3.5" />
                LIVE 3D LOOP
              </span>
              <h2
                id="live-3d-title"
                className="mt-4 font-display text-xl font-black leading-9 text-white sm:text-2xl sm:leading-[2.4rem]"
              >
                حجم و ماسینگ پروژه، پیش از رندر نهایی زنده بررسی می‌شود
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                موتور سه‌بعدی LUMENS با سه پریست نور، پرامپت زنده و نوار پیشرفت رندر، همان
                تجربه‌ای است که هنگام ساخت پروژه می‌بینید؛ بدون نصب هیچ نرم‌افزاری.
              </p>

              <ul className="mt-4 space-y-2">
                {live3dHighlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-[11px] leading-6 text-zinc-300"
                  >
                    <IconCheck className="mt-1 h-3.5 w-3.5 shrink-0 text-gold" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/realtime-rendering" className="btn-primary mt-5 px-4 py-2.5 text-xs">
                <IconSparkles className="h-4 w-4" />
                تجربه رندر لحظه‌ای
                <IconArrowLeft className="h-4 w-4" />
              </Link>
            </div>

            <HeroShowcase />
          </div>
        </Reveal>
      </section>

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
