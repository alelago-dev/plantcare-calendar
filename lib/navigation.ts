import type { Locale } from "@/lib/types";

export type AppSection = "today" | "seeds" | "spaces" | "calendar" | "journal" | "privacy";

export type NavigationItem = {
  icon: string;
  key: AppSection;
  label: string;
  short: string;
  slug: string;
};

export const navigationByLocale: Record<Locale, NavigationItem[]> = {
  es: [
    { icon: "H", key: "today", label: "Hoy", short: "Hoy", slug: "hoy" },
    { icon: "S", key: "seeds", label: "Semillas", short: "Semillas", slug: "semillas" },
    { icon: "E", key: "spaces", label: "Espacios", short: "Cultivos", slug: "espacios" },
    { icon: "C", key: "calendar", label: "Calendario", short: "Agenda", slug: "calendario" },
    { icon: "D", key: "journal", label: "Diario", short: "Diario", slug: "diario" },
    { icon: "L", key: "privacy", label: "Privacidad", short: "Legal", slug: "privacidad" }
  ],
  en: [
    { icon: "T", key: "today", label: "Today", short: "Today", slug: "today" },
    { icon: "S", key: "seeds", label: "Seeds", short: "Seeds", slug: "seeds" },
    { icon: "G", key: "spaces", label: "Spaces", short: "Grow", slug: "spaces" },
    { icon: "C", key: "calendar", label: "Calendar", short: "Plan", slug: "calendar" },
    { icon: "J", key: "journal", label: "Journal", short: "Log", slug: "journal" },
    { icon: "L", key: "privacy", label: "Privacy", short: "Legal", slug: "privacy" }
  ]
};

export const allSectionStaticParams = Object.entries(navigationByLocale).flatMap(([locale, items]) =>
  items.map((item) => ({ locale, section: item.slug }))
);

export function getSectionFromSlug(locale: Locale, slug: string): AppSection | null {
  return navigationByLocale[locale].find((item) => item.slug === slug)?.key ?? null;
}

export function getSectionHref(locale: Locale, section: AppSection) {
  const item = navigationByLocale[locale].find((navItem) => navItem.key === section);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return `${basePath}/${locale}/${item?.slug ?? navigationByLocale[locale][0].slug}/`;
}
