import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

const defaults = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-5 w-5",
};

export function IconBrain({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <path d="M9.5 4.5A2.5 2.5 0 0 0 7 7v.5A2.5 2.5 0 0 0 5 10c0 1 .5 1.8 1.3 2.2A2.5 2.5 0 0 0 6 14c0 1.4 1.1 2.5 2.5 2.5H9v3" />
      <path d="M14.5 4.5A2.5 2.5 0 0 1 17 7v.5a2.5 2.5 0 0 1 2 2.5c0 1-.5 1.8-1.3 2.2A2.5 2.5 0 0 1 18 14c0 1.4-1.1 2.5-2.5 2.5H15v3" />
      <path d="M12 4v16M9.5 9h5M9.5 13h5" />
    </svg>
  );
}

export function IconSparkles({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" />
      <path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2zM5 14l.6 1.6L7.2 16l-1.6.6L5 18.2l-.6-1.6L2.8 16l1.6-.6L5 14z" />
    </svg>
  );
}

export function IconBolt({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <path d="M13.5 2.5 5 13.5h5.2l-.7 8 8.5-11h-5.2l.7-8z" />
    </svg>
  );
}

export function IconRoute({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.5 6H14a4 4 0 0 1 0 8h-4a4 4 0 0 0 0 8h5.5" />
    </svg>
  );
}

export function IconSearch({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

export function IconDownload({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <path d="M12 3.5v11m0 0 4-4m-4 4-4-4" />
      <path d="M4.5 17.5v1.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-1.5" />
    </svg>
  );
}

export function IconEye({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconEyeOff({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 6.1A9.9 9.9 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-2.6 3.3M6.4 7.5A17.6 17.6 0 0 0 2.5 12S6 18 12 18a9.7 9.7 0 0 0 4.1-.9" />
      <path d="M9.9 10.1a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

export function IconMail({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
    </svg>
  );
}

export function IconUser({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c0-3.6 3.4-6.2 7.5-6.2s7.5 2.6 7.5 6.2" />
    </svg>
  );
}

export function IconLock({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10M12 14.5v2.5" />
    </svg>
  );
}

export function IconStar({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.8l5.9-.9L12 3.6z" />
    </svg>
  );
}

export function IconPlay({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10.5 8.8v6.4l5.2-3.2-5.2-3.2z" />
    </svg>
  );
}

export function IconArrowLeft({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
    </svg>
  );
}

export function IconClose({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconMenu({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconCheck({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function IconLayers({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3z" />
      <path d="m4 12 8 4.3 8-4.3M4 16.5 12 21l8-4.5" />
    </svg>
  );
}

export function IconCube({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <path d="M12 2.8 20 7v10l-8 4.2L4 17V7l8-4.2z" />
      <path d="M4 7l8 4.2L20 7M12 21.2V11.2" />
    </svg>
  );
}

export function IconCopy({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M15 6.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15" />
    </svg>
  );
}

export function IconClock({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconUsers({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19.5c0-3 2.5-5.2 5.5-5.2s5.5 2.2 5.5 5.2" />
      <path d="M16 5.5a3 3 0 0 1 0 6M17.5 14.6c2 .6 3.4 2.4 3.4 4.9" />
    </svg>
  );
}

export function IconBook({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a1.8 1.8 0 0 0-1.8-1.8H4V5.5z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a1.8 1.8 0 0 1 1.8-1.8H20V5.5z" />
    </svg>
  );
}

export function IconChevronDown({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <path d="m6 9.5 6 6 6-6" />
    </svg>
  );
}

export function IconSliders({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <path d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h9M17 17h3" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="15" cy="17" r="2" />
    </svg>
  );
}

export function IconChat({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <path d="M20.5 11.8a8 8 0 0 1-8 8H8.4L4 22l1.2-4.2a8 8 0 1 1 15.3-6z" />
      <path d="M9 10.5h6M9 14h4" />
    </svg>
  );
}

export function IconSend({ className = defaults.className, ...props }: IconProps) {
  return (
    <svg {...defaults} className={className} {...props}>
      <path d="M21 3 10.5 13.5" />
      <path d="m21 3-6.5 18-4-7.5-7.5-4L21 3z" />
    </svg>
  );
}
