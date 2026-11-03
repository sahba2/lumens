import Link from "next/link";

import { workflowSteps } from "@/lib/data";
import { IconArrowLeft, IconBolt } from "./Icons";

interface WorkflowTimelineProps {
  /** Show only the first N steps (used by the landing page teaser). */
  limit?: number;
  showCta?: boolean;
}

/** Numbered 6-step AI workflow timeline shared by the home and workflow pages. */
export default function WorkflowTimeline({ limit, showCta = false }: WorkflowTimelineProps) {
  const steps = typeof limit === "number" ? workflowSteps.slice(0, limit) : workflowSteps;

  return (
    <div>
      <ol className="relative grid gap-6 lg:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step.id} className="glow-card group flex h-full gap-5 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 font-display text-base font-black text-gold-light">
              {(index + 1).toLocaleString("fa-IR")}
            </span>

            <div className="flex-1">
              <p className="text-[10px] font-semibold tracking-widest2 text-gold/80">{step.subtitle}</p>
              <h3 className="mt-2 text-base font-bold text-white transition-colors duration-300 group-hover:text-gold-light">
                {step.title}
              </h3>
              <p className="mt-3 text-xs leading-6 text-zinc-400">{step.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="chip border-gold/25 text-gold-light">
                  <IconBolt className="h-3 w-3" />
                  {step.duration}
                </span>
                {step.tools.map((tool) => (
                  <span key={`${step.id}-${tool}`} className="chip">
                    {tool}
                  </span>
                ))}
              </div>

              <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                {step.tips.map((tip) => (
                  <li key={`${step.id}-${tip}`} className="flex items-start gap-2 text-[11px] leading-6 text-zinc-500">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold/70" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      {showCta ? (
        <div className="mt-8 flex justify-center">
          <Link href="/ai-workflow" className="btn-ghost">
            مشاهده نقشه راه کامل گردش کار
            <IconArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
