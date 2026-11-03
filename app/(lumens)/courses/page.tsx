import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import AiKeywordsSection from "@/components/AiKeywordsSection";
import CtaBand from "@/components/CtaBand";
import CoursesExplorer from "@/components/CoursesExplorer";
import { IconBolt, IconBook, IconCheck, IconClock, IconLayers, IconUsers } from "@/components/Icons";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { allCourses, toPersianDigits } from "@/lib/data";

export const metadata: Metadata = {
  title: "دوره‌های نرم‌افزارهای معماری: 3ds Max، Revit، Rhino، Grasshopper، Lumion، Blender و SketchUp",
  description:
    "کاتالوگ دوره‌های پروژه‌محور LUMENS: 3ds Max، Revit و BIM، Rhino، Grasshopper، Lumion، Blender، SketchUp و هوش مصنوعی در معماری؛ با فیلتر نرم‌افزار، سرفصل جلسه‌به‌جلسه و پشتیبانی انجمن تخصصی معماران.",
  alternates: { canonical: "/courses" },
};

const perks = [
  {
    icon: IconLayers,
    title: "پروژه‌محور و تکرارپذیر",
    text: "هر دوره روی سه پروژه واقعی مسکونی، فرهنگی و اداری تمرین می‌شود تا خروجی قابل ارائه در استودیو بسازید.",
  },
  {
    icon: IconClock,
    title: "دسترسی دائمی",
    text: "ویدیوها و فایل‌های تمرینی بدون محدودیت زمانی در دسترس‌اند و به‌روزرسانی‌ها رایگان اضافه می‌شوند.",
  },
  {
    icon: IconUsers,
    title: "پشتیبانی انجمن تخصصی",
    text: "پرسش‌های فنی خود را در انجمن معماران LUMENS مطرح کنید و بازخورد مدرس و هم‌دوره‌ای‌ها را بگیرید.",
  },
  {
    icon: IconCheck,
    title: "گواهی پایان دوره",
    text: "پس از تحویل پروژه نهایی، گواهی مهارت LUMENS برای ارائه به کارفرما و استودیو صادر می‌شود.",
  },
];

const paidCount = allCourses.filter((course) => !course.isFree).length;
const freeCount = allCourses.filter((course) => course.isFree).length;

interface CoursesPageProps {
  searchParams?: { tag?: string | string[] };
}

export default function CoursesPage({ searchParams }: CoursesPageProps) {
  const tag = typeof searchParams?.tag === "string" ? searchParams.tag : null;

  return (
    <>
      <PageHero
        eyebrow="آموزش تخصصی LUMENS"
        title="دوره‌های پروژه‌محور هوش مصنوعی در معماری"
        description="از پرامپت‌نویسی و تولید کانسپت تا رندرینگ لحظه‌ای و گردش کار کامل استودیو؛ مسیر یادگیری خود را انتخاب کنید و با تمرین روی پروژه‌های واقعی، مهارت قابل ارائه بسازید."
        image="/covers/course-01.svg"
        badges={[
          `${toPersianDigits(allCourses.length)} دوره فعال`,
          `${toPersianDigits(freeCount)} دوره رایگان`,
          "دسترسی دائمی",
        ]}
        breadcrumb={{ href: "/courses", label: "دوره‌های آموزشی" }}
        actions={
          <>
            <Link href="#catalog" className="btn-primary">
              <IconBolt className="h-4 w-4" />
              مشاهده کاتالوگ دوره‌ها
            </Link>
            <Link href="/objects" className="btn-ghost">
              کتابخانه آبجکت‌ها
            </Link>
          </>
        }
      />

      <section id="catalog" className="container-x scroll-mt-[88px] py-16">
        <Reveal>
          <SectionHeading
            eyebrow="کاتالوگ دوره‌ها"
            title="دوره مناسب سطح خود را پیدا کنید"
            description="اول نرم‌افزار تخصصی خود را انتخاب کنید (3ds Max، Revit، Rhino، Grasshopper، Lumion، Blender، SketchUp یا AI)، سپس با جستجوی آنی، فیلتر سطح و مرتب‌سازی، دوره مناسب را پیدا کنید و در همان صفحه ثبت‌نام را تکمیل کنید."
            action={
              <span className="chip border-gold/25 text-gold-light">
                <IconBook className="h-3.5 w-3.5" />
                {toPersianDigits(paidCount)} دوره تخصصی
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
          <CoursesExplorer tag={tag} />
        </Reveal>
      </section>

      <section className="relative border-y border-white/10 bg-white/[0.015] py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="چرا LUMENS"
              title="آموزشی که به برد ارائه تبدیل می‌شود"
              description="تمرکز ما روی مهارت عملی است؛ چیزی که فردای کلاس بتوانید در پروژه واقعی اجرا کنید."
            />
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map(({ icon: Icon, title, text }, index) => (
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
            eyebrow="شروع مسیر"
            title="با دوره رایگان، اولین خروجی هوش مصنوعی‌تان را بسازید"
            description="دوره «پلان، دیاگرام و اینفوگرافیک هوشمند» بدون هزینه است و در کمتر از یک ساعت اولین برد ارائه شما آماده می‌شود."
            primary={{ href: "/courses#catalog", label: "انتخاب دوره" }}
            secondary={{ href: "/ai-workflow", label: "مشاهده گردش کار AI" }}
          />
        </Reveal>
      </section>
    </>
  );
}
