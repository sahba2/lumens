import type { Metadata } from "next";
import Link from "next/link";

import CourseCard from "@/components/CourseCard";
import CtaBand from "@/components/CtaBand";
import { IconArrowLeft, IconBolt, IconCheck, IconClock, IconLayers, IconRoute } from "@/components/Icons";
import Marquee from "@/components/Marquee";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import WorkflowTimeline from "@/components/WorkflowTimeline";
import { allCourses } from "@/lib/data";

export const metadata: Metadata = {
  title: "گردش کار AI در استودیوی معماری",
  description:
    "نقشه راه شش‌مرحله‌ای پروژه‌های AI-First؛ از تحلیل سایت و مهندسی پرامپت تا ControlNet، رندر لحظه‌ای، پست‌پروداکشن و تحویل استاندارد به کارفرما.",
  alternates: { canonical: "/ai-workflow" },
};

const deliverables = [
  {
    icon: IconRoute,
    title: "نقشه راه شش‌مرحله‌ای",
    text: "هر مرحله با ورودی، خروجی، ابزار و چک‌لیست کیفیت مشخص؛ قابل اجرا در استودیوی کوچک و بزرگ.",
  },
  {
    icon: IconClock,
    title: "زمان‌بندی واقعی",
    text: "مجموع زمان هر مرحله حدود ۱۵ ساعت است؛ یعنی یک برد ارائه کامل در دو روز کاری.",
  },
  {
    icon: IconLayers,
    title: "اتصال به ابزارهای طراحی",
    text: "گردش کار با Rhino، SketchUp، Revit، Blender و Photoshop یکپارچه می‌شود.",
  },
  {
    icon: IconCheck,
    title: "چک‌لیست تحویل",
    text: "استاندارد نام‌گذاری فایل، رزولوشن خروجی و بسته‌بندی نهایی برای کارفرما.",
  },
];

const workflowCourses = allCourses.filter((course) => course.category === "workflow");
const relatedCourses = [
  ...workflowCourses,
  ...allCourses.filter((course) => course.category !== "workflow"),
].slice(0, 3);

export default function AiWorkflowPage() {
  return (
    <>
      <PageHero
        eyebrow="تخصص چهارم • AI WORKFLOW"
        title="گردش کار AI؛ استودیوی هوشمند شما"
        description="نقشه راه شش‌مرحله‌ای پروژه‌های AI-First، از تحلیل ورودی و مهندسی پرامپت تا کنترل هندسه، رندر و تحویل استاندارد به کارفرما."
        image="/covers/course-04.svg"
        badges={["۶ مرحله اجرایی", "حدود ۱۵ ساعت", "چک‌لیست کیفیت"]}
        breadcrumb={{ href: "/ai-workflow", label: "گردش کار AI" }}
        actions={
          <>
            <Link href="#roadmap" className="btn-primary">
              <IconRoute className="h-4 w-4" />
              مشاهده نقشه راه
            </Link>
            <Link href="/courses" className="btn-ghost">
              دوره گردش کار AI
            </Link>
          </>
        }
      />

      <section id="roadmap" className="container-x scroll-mt-[88px] py-20">
        <Reveal>
          <SectionHeading
            eyebrow="نقشه راه کامل"
            title="شش مرحله از بریف تا تحویل"
            description="هوش مصنوعی جای معمار را نمی‌گیرد؛ جایگاه آن را دقیق‌تر می‌کند. این نقشه راه، AI را به دستیار تکرارپذیر استودیوی شما تبدیل می‌کند."
          />
        </Reveal>

        <Reveal className="mt-12" delay={80}>
          <WorkflowTimeline />
        </Reveal>
      </section>

      <Marquee />

      <section className="container-x py-20">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="خروجی گردش کار"
            title="یک فرآیند، چهار تضمین"
            description="اجرای این نقشه راه، خروجی استودیو را از کیفیت وابسته به فرد، به یک استاندارد تکرارپذیر تبدیل می‌کند."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {deliverables.map(({ icon: Icon, title, text }, index) => (
            <Reveal key={title} delay={index * 90}>
              <div className="glow-card h-full p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-sm font-bold text-white">{title}</h3>
                <p className="mt-3 text-[11px] leading-6 text-zinc-400">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-white/[0.015] py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="آموزش اجرا"
              title="دوره‌های گردش کار و مدل‌سازی"
              description="از طراحی فرآیند تا اتصال به Rhino و Revit؛ مهارت‌هایی که استودیو را مقیاس‌پذیر می‌کنند."
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
        </div>
      </section>

      <section className="container-x pb-24 pt-20">
        <Reveal>
          <div className="glass-card mb-10 flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <IconBolt className="h-5 w-5 text-gold" />
              <p className="text-xs leading-6 text-zinc-400">
                آماده‌اید گردش کار استودیوی خود را بسازید؟ از دوره رایگان شروع کنید.
              </p>
            </div>
            <Link href="/courses#catalog" className="btn-quiet shrink-0">
              انتخاب دوره
            </Link>
          </div>

          <CtaBand
            eyebrow="استودیوی هوشمند"
            title="فرآیند طراحی خود را یک‌بار برای همیشه استاندارد کنید"
            description="با نقشه راه شش‌مرحله‌ای LUMENS، تیم شما به جای تکرار کارهای دستی، روی تصمیم‌های طراحی تمرکز می‌کند."
            primary={{ href: "/courses", label: "شروع دوره گردش کار" }}
            secondary={{ href: "/realtime-rendering", label: "رندرینگ لحظه‌ای" }}
          />
        </Reveal>
      </section>
    </>
  );
}

