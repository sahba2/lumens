import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  align?: "start" | "center";
}

/** Shared section header: golden eyebrow chip + title + description. */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "start",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={`flex flex-col gap-6 ${
        centered ? "items-center text-center" : "items-start lg:flex-row lg:items-end lg:justify-between"
      }`}
    >
      <div className={`max-w-3xl ${centered ? "mx-auto" : ""}`}>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h2 className="section-title mt-5">{title}</h2>
        {description ? (
          <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
