import type { Locale } from "@/lib/i18n/dict";

/** Small, dependency-free SVG flags (16×12) for the language picker (EN, KO, DE, FR, IT, ES). Simplified designs, decorative only. */
export function Flag({ locale, className }: { locale: Locale; className?: string }) {
  const common = { width: 16, height: 12, viewBox: "0 0 16 12", className, "aria-hidden": true as const, style: { borderRadius: 2, boxShadow: "0 0 0 1px rgba(0,0,0,0.12)" } };
  switch (locale) {
    case "en": // simplified Union Jack
      return (
        <svg {...common}>
          <rect width="16" height="12" fill="#012169" />
          <path d="M0 0L16 12M16 0L0 12" stroke="#fff" strokeWidth="2.4" />
          <path d="M0 0L16 12M16 0L0 12" stroke="#C8102E" strokeWidth="0.9" />
          <path d="M8 0V12M0 6H16" stroke="#fff" strokeWidth="3.2" />
          <path d="M8 0V12M0 6H16" stroke="#C8102E" strokeWidth="1.8" />
        </svg>
      );
    case "ko": // simplified Taegukgi
      return (
        <svg {...common}>
          <rect width="16" height="12" fill="#fff" />
          <circle cx="8" cy="6" r="3" fill="#0047A0" />
          <path d="M5 6a3 3 0 0 1 6 0a1.5 1.5 0 0 1-3 0a1.5 1.5 0 0 0-3 0z" fill="#CD2E3A" />
          <g stroke="#000" strokeWidth="0.6">
            <path d="M1.6 2.2l1.6-1M1.9 2.7l1.6-1M2.2 3.2l1.6-1" />
            <path d="M12.8 1.2l1.6 1M12.5 1.7l1.6 1M12.2 2.2l1.6 1" />
            <path d="M1.6 9.8l1.6 1M1.9 9.3l1.6 1M2.2 8.8l1.6 1" />
            <path d="M12.8 10.8l1.6-1M12.5 10.3l1.6-1M12.2 9.8l1.6-1" />
          </g>
        </svg>
      );
    case "de":
      return (
        <svg {...common}>
          <rect width="16" height="4" y="0" fill="#000" />
          <rect width="16" height="4" y="4" fill="#DD0000" />
          <rect width="16" height="4" y="8" fill="#FFCE00" />
        </svg>
      );
    case "fr":
      return (
        <svg {...common}>
          <rect width="5.33" height="12" x="0" fill="#0055A4" />
          <rect width="5.34" height="12" x="5.33" fill="#fff" />
          <rect width="5.33" height="12" x="10.67" fill="#EF4135" />
        </svg>
      );
    case "it":
      return (
        <svg {...common}>
          <rect width="5.33" height="12" x="0" fill="#009246" />
          <rect width="5.34" height="12" x="5.33" fill="#fff" />
          <rect width="5.33" height="12" x="10.67" fill="#CE2B37" />
        </svg>
      );
    case "es":
      return (
        <svg {...common}>
          <rect width="16" height="3" y="0" fill="#AA151B" />
          <rect width="16" height="6" y="3" fill="#F1BF00" />
          <rect width="16" height="3" y="9" fill="#AA151B" />
          <rect width="2.2" height="2.6" x="4" y="4.7" rx="0.4" fill="#AA151B" fillOpacity="0.85" />
        </svg>
      );
    default:
      return null;
  }
}
