import type { Metadata } from "next";
import Link from "next/link";

import CtaBand from "@/components/CtaBand";
import { IconBook, IconCheck, IconCopy, IconSparkles } from "@/components/Icons";
import PageHero from "@/components/PageHero";
import PromptsExplorer from "@/components/PromptsExplorer";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { prompts, toPersianDigits } from "@/lib/data";

export const metadata: Metadata = {
  title: "پرامپت‌نویسی معماری و کتابخانه پرامپت",
  description:
    "ساختار هفت‌لایه پرامپت معماری و کتابخانه پرامپت آماده Midjourney و Stable Diffusion با منفی‌پرامپت تخصصی برای رندر، فرم، متریال و نورپردازی.",
  alternates: { canonical: "/ai-prompts" },
};

const layers = [
  {
    title: "فرم و حجم",
    text: "توصیف دقیق هندسه، تناسبات، کنسول و لایه‌بندی حجم‌ها با زبان معماری.",
  },
  {
    title: "متریال و بافت",
    text: "بتن اکسپوز، تراورتن، چوب گردو و فلز با کیفیت سطح و جزئیات واقعی.",
  },
  {
    title: "نور و سایه",
    text: "ساعت طلایی، نور جانبی، نورپردازی شب و کنترل کنتراست سایه‌ها.",
  },
  {
    title: "لنز و پرسپکتیو",
    text: "انتخاب 24mm تا 100mm، نمای چشم‌سطح، تیلت‌شیفت و کنترل خطوط عمودی.",
  },
  {
    title: "اتمسفر",
    text: "مه صبحگاهی، غبار شهری، بازتاب باران روی سنگ و حس حضور انسان.",
  },
  {
    title: "استایل بصری",
    text: "رئالیسم معماری، مینیمال اسکاندیناوی یا رندر سینمایی با گرید رنگی واحد.",
  },
  {
    title: "منفی‌پرامپت",
    text: "حذف متن، اعوجاج تناسبات، طبقات اضافه، ماشین و آرتیفکت‌های تصویر.",
  },
];

export default function AiPromptsPage() {
  return (
    <>
      <PageHero
        eyebrow="تخصص دوم • PROMPT ENGINEERING"
        title="پرامپت‌نویسی معماری؛ زبان مشترک با هوش مصنوعی"
        description="ساختار هفت‌لایه پرامپت برای رندر معماری: فرم، متریال، نور، لنز، اتمسفر، استایل و پرهیزها؛ همراه با کتابخانه پرامپت آماده و منفی‌پرامپت تخصصی."
        image="/covers/course-02.svg"
        badges={[
          `${toPersianDigits(prompts.length)} پرامپت آماده`,
          "چارچوب هفت‌لایه",
          "منفی‌پرامپت اختصاصی",
        ]}
        breadcrumb={{ href: "/ai-prompts", label: "پرامپت‌نویسی معماری" }}
        actions={
          <>
            <Link href="#library" className="btn-primary">
              <IconSparkles className="h-4 w-4" />
              ورود به کتابخانه پرامپت
            </Link>
            <Link href="/courses" className="btn-ghost">
              دوره پرامپت‌نویسی
            </Link>
          </>
        }
      />

      <section className="container-x py-20">
        <Reveal>
          <SectionHeading
            eyebrow="چارچوب LUMENS"
            title="هفت لایه یک پرامپت حرفه‌ای"
            description="پرامپت خوب، فهرست کلمات زیبا نیست؛ یک دستور فنی لایه‌بندی‌شده است که هر بار خروجی قابل پیش‌بینی می‌دهد."
          />
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {layers.map((layer, index) => (
            <Reveal key={layer.title} delay={index * 70}>
              <div className="glow-card h-full p-5">
                <span className="font-display text-2xl font-black text-gradient-gold">
                  {toPersianDigits(index + 1)}
                </span>
                <h3 className="mt-3 text-sm font-bold text-white">{layer.title}</h3>
                <p className="mt-2 text-[11px] leading-6 text-zinc-400">{layer.text}</p>
              </div>
            </Reveal>
          ))}

          <Reveal delay={7 * 70}>
            <div className="glass-card flex h-full flex-col justify-between p-5">
              <div>
                <IconCheck className="h-6 w-6 text-gold" />
                <h3 className="mt-3 text-sm font-bold text-white">قانون طلایی</h3>
                <p className="mt-2 text-[11px] leading-6 text-zinc-400">
                  هر لایه را جداگانه تست کنید؛ یک تغییر در هر مرحله، کنترل خروجی را حفظ می‌کند.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold text-gold-light">
                <IconCopy className="h-3.5 w-3.5" />
                قابل کپی و استفاده
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        id="library"
        className="relative scroll-mt-[88px] border-y border-white/10 bg-white/[0.015] py-20"
      >
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="کتابخانه پرامپت"
              title="پرامپت‌های آماده معماری، با یک کلیک کپی"
              description="مجموعه‌ای از پرامپت‌های تست‌شده برای فرم، نما، نورپردازی، متریال، پلان و فضای داخلی؛ همراه منفی‌پرامپت پیشنهادی LUMENS."
              action={
                <span className="chip border-gold/25 text-gold-light">
                  <IconBook className="h-3.5 w-3.5" />
                  {toPersianDigits(prompts.length)} پرامپت
                </span>
              }
            />
          </Reveal>

          <Reveal className="mt-10" delay={80}>
            <PromptsExplorer />
          </Reveal>
        </div>
      </section>

      <section className="container-x py-20">
        <Reveal>
          <div className="glass-card grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <span className="eyebrow">
                <IconSparkles className="h-3.5 w-3.5" />
                کارگاه عملی
              </span>
              <h2 className="section-title mt-5">پرامپت‌نویسی را در پروژه واقعی تمرین کنید</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                در دوره «پرامپت‌نویسی حرفه‌ای معماری» ساختار هفت‌لایه را روی سه پروژه مسکونی، فرهنگی و
                اداری پیاده می‌کنید و برای هر پروژه یک کتابخانه پرامپت اختصاصی می‌سازید.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/courses" className="btn-primary">
                  <IconSparkles className="h-4 w-4" />
                  مشاهده دوره
                </Link>
                <Link href="/ai-architecture" className="btn-ghost">
                  هوش مصنوعی در معماری
                </Link>
              </div>
            </div>

            <ul className="space-y-3">
              {[
                "الگوی آماده LUMENS Prompt Framework",
                "کنترل پرسپکتیو، لنز و قاب‌بندی سینمایی",
                "ساخت منفی‌پرامپت اختصاصی پروژه",
                "تمرین روی سه پروژه واقعی",
              ].map((item) => (
                <li
                  key={item}
                  className="glass flex items-center gap-3 rounded-2xl px-4 py-3 text-xs text-zinc-300"
                >
                  <IconCheck className="h-4 w-4 shrink-0 text-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <section className="container-x pb-24">
        <Reveal>
          <CtaBand
            eyebrow="زبان مشترک"
            title="پرامپت بعدی‌تان را با اطمینان بنویسید"
            description="با چارچوب هفت‌لایه و کتابخانه آماده LUMENS، خروجی‌های قابل پیش‌بینی و قابل ارائه بسازید."
            primary={{ href: "/courses", label: "شروع دوره پرامپت‌نویسی" }}
            secondary={{ href: "/realtime-rendering", label: "رندرینگ لحظه‌ای" }}
          />
        </Reveal>
      </section>
    </>
  );
}

