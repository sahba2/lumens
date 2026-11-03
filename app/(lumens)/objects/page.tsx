import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import AiKeywordsSection from "@/components/AiKeywordsSection";
import CtaBand from "@/components/CtaBand";
import { IconBolt, IconCheck, IconCube, IconDownload, IconLayers, IconSliders } from "@/components/Icons";
import ObjectsExplorer from "@/components/ObjectsExplorer";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { models3d, toPersianDigits } from "@/lib/data";

export const metadata: Metadata = {
  title: "کتابخانه آبجکت‌های سه‌بعدی معماری",
  description:
    "دانلود آبجکت‌های سه‌بعدی سبک و بهینه معماری با متریال PBR و UV باز شده؛ مبلمان، فضای داخلی و خارجی در فرمت‌های FBX، OBJ، BLEND، MAX و GLTF.",
  alternates: { canonical: "/objects" },
};

const features = [
  {
    icon: IconLayers,
    title: "بهینه و سبک",
    text: "همه مدل‌ها با پالیگان کنترل‌شده و توپولوژی تمیز ساخته شده‌اند تا صحنه شما روان بماند.",
  },
  {
    icon: IconSliders,
    title: "متریال PBR آماده",
    text: "تکسچرهای استاندارد و متریال آماده رندر، بدون نیاز به تنظیم دستی در V-Ray یا Corona.",
  },
  {
    icon: IconDownload,
    title: "فرمت‌های گسترده",
    text: "FBX، OBJ، BLEND، MAX و GLTF؛ سازگار با Blender، 3ds Max، SketchUp و Rhino.",
  },
  {
    icon: IconCheck,
    title: "به‌روزرسانی مستمر",
    text: "هر هفته آبجکت‌های جدید به کتابخانه اضافه می‌شود و خریدهای قبلی رایگان به‌روز می‌شوند.",
  },
];

const freeCount = models3d.filter((model) => model.isFree).length;

interface ObjectsPageProps {
  searchParams?: { tag?: string | string[] };
}

export default function ObjectsPage({ searchParams }: ObjectsPageProps) {
  const tag = typeof searchParams?.tag === "string" ? searchParams.tag : null;

  return (
    <>
      <PageHero
        eyebrow="کتابخانه سه‌بعدی LUMENS"
        title="آبجکت‌های سه‌بعدی آماده رندر برای معماران"
        description="مجموعه‌ای از مبلمان، عناصر داخلی و خارجی با UV باز شده و متریال PBR؛ کافی است دانلود کنید و مستقیم در صحنه پروژه قرار دهید."
        image="/renders/object-01.svg"
        badges={[
          `${toPersianDigits(models3d.length)} آبجکت آماده`,
          `${toPersianDigits(freeCount)} فایل رایگان`,
          "PBR + UV Ready",
        ]}
        breadcrumb={{ href: "/objects", label: "آبجکت‌های سه‌بعدی" }}
        actions={
          <>
            <Link href="#library" className="btn-primary">
              <IconCube className="h-4 w-4" />
              ورود به کتابخانه
            </Link>
            <Link href="/courses" className="btn-ghost">
              آموزش استفاده در پروژه
            </Link>
          </>
        }
      />

      <section id="library" className="container-x scroll-mt-[88px] py-16">
        <Reveal>
          <SectionHeading
            eyebrow="جستجو در کتابخانه"
            title="آبجکت مناسب صحنه خود را پیدا کنید"
            description="بر اساس دسته‌بندی (داخلی، خارجی، مبلمان) فیلتر کنید، جستجوی آنی بزنید و پیش از دانلود، مشخصات فنی هر مدل را ببینید."
            action={
              <span className="chip border-gold/25 text-gold-light">
                <IconBolt className="h-3.5 w-3.5" />
                دانلود آنی
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
          <ObjectsExplorer tag={tag} />
        </Reveal>
      </section>

      <section className="relative border-y border-white/10 bg-white/[0.015] py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="استاندارد LUMENS"
              title="کیفیت فنی، بدون مصالحه"
              description="هر آبجکت پیش از انتشار از نظر توپولوژی، مقیاس، UV و متریال بازبینی می‌شود."
            />
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }, index) => (
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
            eyebrow="کتابخانه حرفه‌ای"
            title="آبجکت‌های بیشتر، رندر سریع‌تر"
            description="با عضویت در LUMENS به کتابخانه کامل آبجکت‌ها، پرامپت‌های آماده و دوره‌های تخصصی دسترسی داشته باشید."
            primary={{ href: "/courses", label: "مشاهده دوره‌ها" }}
            secondary={{ href: "/ai-workflow", label: "گردش کار AI" }}
          />
        </Reveal>
      </section>
    </>
  );
}
