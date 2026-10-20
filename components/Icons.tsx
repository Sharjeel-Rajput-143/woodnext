import Image from "next/image";
import type { IconName } from "@/lib/products";

type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export function ChevronIcon({ className, direction }: IconProps & { direction: "left" | "right" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden="true" focusable="false">
      <path d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden="true" focusable="false">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden="true" focusable="false">
      <path d="M3 11l9-7.5 9 7.5" />
      <path d="M5.5 9.5V19a1 1 0 0 0 1 1H10v-5.5h4V20h3.5a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

export function GridIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden="true" focusable="false">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.8" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.8" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden="true" focusable="false">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function HeartIcon({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      {...stroke}
      fill={filled ? "currentColor" : "none"}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 20.5s-7.5-4.6-9.2-9.4A5.2 5.2 0 0 1 12 6.6a5.2 5.2 0 0 1 9.2 4.5c-1.7 4.8-9.2 9.4-9.2 9.4z" />
    </svg>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
    </svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden="true" focusable="false">
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" />
    </svg>
  );
}

export function ArrowIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden="true" focusable="false">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function CategoryIcon({ icon, className }: IconProps & { icon: IconName }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden="true" focusable="false">
      {icon === "bed" && (
        <>
          <path d="M3 18V6M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" />
          <circle cx="7" cy="11" r="1.6" />
        </>
      )}
      {icon === "kitchen" && (
        <>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M4 9h16M8 6h.01M12 6h.01M16 6h.01M9 14h6" />
        </>
      )}
      {icon === "door" && (
        <>
          <rect x="6" y="3" width="12" height="18" rx="1" />
          <circle cx="15" cy="12.5" r=".8" fill="currentColor" />
        </>
      )}
      {icon === "chair" && (
        <>
          <path d="M7 3h10v8H7zM6 11h12v4H6zM8 15v6M16 15v6" />
        </>
      )}
      {icon === "sofa" && (
        <>
          <path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3zM6 18v2M18 18v2" />
        </>
      )}
      {icon === "table" && (
        <>
          <path d="M3 8h18M5 8v12M19 8v12M5 12h14" />
        </>
      )}
      {icon === "wardrobe" && (
        <>
          <rect x="4" y="3" width="16" height="18" rx="1.5" />
          <path d="M12 3v18M9.5 12h.01M14.5 12h.01" />
        </>
      )}
      {icon === "tag" && (
        <>
          <path d="M3 12V4h8l10 10-8 8z" />
          <circle cx="7.5" cy="8.5" r="1.2" />
        </>
      )}
    </svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z" />
    </svg>
  );
}

export type FeatureIconName = "leaf" | "ruler" | "chat" | "truck";

export function FeatureIcon({ name, className }: IconProps & { name: FeatureIconName }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden="true" focusable="false">
      {name === "leaf" && (
        <>
          <path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14z" />
          <path d="M5 19c3-5 6-8 10-10" />
        </>
      )}
      {name === "ruler" && (
        <>
          <rect x="3" y="8" width="18" height="8" rx="1.5" />
          <path d="M7 8v3M11 8v4M15 8v3M19 8v4" />
        </>
      )}
      {name === "chat" && <path d="M4 5h16v11H9l-5 4z" />}
      {name === "truck" && (
        <>
          <path d="M2 6h11v10H2zM13 9h5l3 3v4h-8z" />
          <circle cx="7" cy="18" r="1.8" />
          <circle cx="17" cy="18" r="1.8" />
        </>
      )}
    </svg>
  );
}

export function LogoMark({ className }: IconProps) {
  return (
    <Image
      src="/logo-mark.png"
      alt=""
      width={96}
      height={96}
      className={className}
      priority
    />
  );
}
