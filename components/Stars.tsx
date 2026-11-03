import { IconStar } from "./Icons";
import { formatRating } from "@/lib/data";

interface StarsProps {
  rating: number;
  className?: string;
  showValue?: boolean;
}

/** Golden five-star rating indicator. */
export default function Stars({ rating, className = "", showValue = true }: StarsProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`.trim()}>
      <span className="flex items-center gap-0.5 text-gold">
        {[1, 2, 3, 4, 5].map((step) => (
          <IconStar
            key={step}
            className={`h-3.5 w-3.5 ${step <= Math.round(rating) ? "text-gold" : "text-zinc-700"}`}
            fill={step <= Math.round(rating) ? "currentColor" : "none"}
            strokeWidth={1.2}
          />
        ))}
      </span>
      {showValue ? (
        <span className="text-[11px] font-semibold text-zinc-400 tabular-nums">
          {formatRating(rating)}
        </span>
      ) : null}
    </span>
  );
}
