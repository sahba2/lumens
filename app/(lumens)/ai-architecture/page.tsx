import type { Metadata } from "next";
import Link from "next/link";

import CourseCard from "@/components/CourseCard";
import CtaBand from "@/components/CtaBand";
import { IconArrowLeft, IconBolt, IconBrain, IconLayers, IconSparkles, IconUsers } from "@/components/Icons";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import WorkflowTimeline from "@/components/WorkflowTimeline";
import { allCourses } from "@/lib/data";

export const metadata: Metadata = {
  title: "هوش مصنوعی در معماری؛ از ایده تا فرم",
  description:
    "تولید کانسپت، دیاگرام و فرم معماری با هوش مصنوعی؛ تحلیل سایت و اقلیم، کتابخانه سبک شخصی و تصمیم طراحی داده‌محور در گردش کار LUMENS.",
  alternates: { canonical: "/ai-architecture" },
};

const capabilities = [
  {
    icon: IconBrain,
    title: "کانسپت و فرم‌یابی",
    text: "تبدیل بریف و تحلیل سایت به ده‌ها واریاسیون فرمی در یک روز کاری، با کنترل منطق طراحی و مقیاس واقعی.",
    bullets: ["۴۰ دیاگرام مفهومی در روز", "توسعه فرم با Pan و Zoom", "کنترل پرسپکتیو و لنز"],
  },
  {
    icon: IconLayers,
    title: "دیاگرام و تحلیل",
    text: "تولید دیاگرام‌های تحلیلی سایت، مسیر، نور و اقلیم با استایل یکپارچه و قابل ارائه در برد پروژه.",
    bullets: ["دیاگرام اقلیم و مسیر", "لایه‌بندی اطلاعات", "پالت رنگی اختصاصی"],
  },
  {
    icon: IconSparkles,
    title: "کتابخانه سبک شخصی",
    text: "ساخت Style Reference اختصاصی استودیو تا خروجی همه پروژه‌ها زبان بصری واحد و قابل تشخیص داشته باشد.",
    bullets: ["Style Library اختصاصی", "کنترل اتمسفر", "تکرارپذیری خروجی"],
  },
  {
    icon: IconBolt,
    title: "تصمیم داده‌محور",
    text: "ارزیابی واریاسیون‌ها بر اساس معیارهای کارفرما، اقلیم و برنامه فیزیکی؛ نه فقط زیبایی ظاهری.",
    bullets: ["معیارهای ارزیابی", "مقایسه برد ۴×۴", "گزارش تصمیم طراحی"],
  },
];

const tools = ["Midjourney", "Stable Diffusion", "Vizcom", "ChatGPT", "ComfyUI"];

const aiCourses = allCourses.filter((course) => course.category === "ai-design");
const relatedCourses = [
  ...aiCourses,
  ...allCourses.filter((course) => course.category !== "ai-design"),
].slice(0, 3);

export default function AiArchitecturePage() {
  return (
    <>
      <PageHero
        eyebrow="تخصص اول • AI × ARCHITECTURE"
        title="هوش مصنوعی در معماری؛ از ایده تا فرم"
        description="از تحلیل سایت و برنامه فیزیکی تا تولید دیاگرام، حجم و فرم نهایی؛ یاد بگیرید چگونه مدل‌های مولد را به دستیار طراحی استودیوی خود تبدیل کنید."
        image="/renders/object-09.svg"
        badges={["۴۰ دیاگرام در یک روز", "Style Library اختصاصی", "پروژه‌های واقعی"]}
        breadcrumb={{ href: "/ai-architecture", label: "هوش مصنوعی در معماری" }}
        actions={
          <>
            <Link href="/courses" className="btn-primary">
              <IconSparkles className="h-4 w-4" />
              دوره‌های این حوزه
            </Link>
            <Link href="/ai-workflow" className="btn-ghost">
              دیدن گردش کار کامل
              <IconArrowLeft className="h-4 w-4" />
            </Link>
          </>
        }
      />

      <section className="container-x py-20">
        <Reveal>
          <SectionHeading
            eyebrow="چهار لایه کاربرد"
            title="هوش مصنوعی کجای فرآیند طراحی می‌نشیند؟"
            description="AI جای معمار را نمی‌گیرد؛ جایگاه هر تصمیم را دقیق‌تر می‌کند. این چهار لایه، نقشه راه استفاده حرفه‌ای از مدل‌های مولد است."
            action={
              <div className="flex flex-wrap gap-1.5">
                {tools.map((tool) => (
                  <span key={tool} className="chip">
                    {tool}
                  </span>
                ))}
              </div>
            }
          />
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {capabilities.map(({ icon: Icon, title, text, bullets }, index) => (
            <Reveal key={title} delay={index * 90}>
              <article className="glow-card h-full p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">{title}</h3>
                    <p className="mt-3 text-xs leading-6 text-zinc-400">{text}</p>
                  </div>
                </div>
                <ul className="mt-5 space-y-2 border-t border-white/10 pt-4">
                  {bullets.map((bullet) => (
                    <li key={`${title}-${bullet}`} className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span className="h-1 w-1 rounded-full bg-gold" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-white/[0.015] py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="اجرای گام‌به‌گام"
              title="از بریف تا فرم قابل ارائه"
              description="سه مرحله نخست گردش کار شش‌مرحله‌ای LUMENS؛ دقیقاً همان مسیری که در دوره‌ها تمرین می‌کنید."
              action={
                <Link href="/ai-workflow" className="btn-ghost">
                  نقشه راه کامل
                  <IconArrowLeft className="h-4 w-4" />
                </Link>
              }
            />
          </Reveal>

          <Reveal className="mt-12" delay={80}>
            <WorkflowTimeline limit={3} />
          </Reveal>
        </div>
      </section>

      <section className="container-x py-20">
        <Reveal>
          <SectionHeading
            eyebrow="مسیر یادگیری"
            title="دوره‌های مرتبط با طراحی AI-First"
            description="از مبانی تا اجرای حرفه‌ای؛ دوره‌ای انتخاب کنید که به مرحله فعلی پروژه‌های شما نزدیک‌تر است."
            action={
              <Link href="/courses" className="btn-ghost">
                همه دوره‌ها
                <IconArrowLeft className="h-4 w-4" />
              </Link>
            }
          />
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {relatedCourses.map((course, index) => (
            <Reveal key={course.id} delay={index * 90}>
              <CourseCard course={course} priority={index === 0} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10">
          <div className="glass-card flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <IconUsers className="h-5 w-5 text-gold" />
              <p className="text-xs leading-6 text-zinc-400">
                بیش از ۳۸ هزار معمار و دانشجو در مسیر طراحی AI-First همراه LUMENS هستند.
              </p>
            </div>
            <Link href="/articles" className="btn-quiet shrink-0">
              مطالعه مقالات این حوزه
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="container-x pb-24">
        <Reveal>
          <CtaBand
            eyebrow="آماده شروع؟"
            title="اولین فرم هوش مصنوعی خود را امروز بسازید"
            description="با دوره «هوش مصنوعی در معماری؛ از ایده تا فرم» شروع کنید و در سه پروژه واقعی، گردش کار کامل را تمرین کنید."
            primary={{ href: "/courses", label: "شروع یادگیری" }}
            secondary={{ href: "/ai-prompts", label: "پرامپت‌نویسی معماری" }}
          />
        </Reveal>
      </section>
    </>
  );
}

