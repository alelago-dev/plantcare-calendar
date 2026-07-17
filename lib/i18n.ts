import { locales, type Dictionary, type Locale } from "@/lib/types";
export { locales } from "@/lib/types";
export type { Locale };

const dictionaries: Record<Locale, Dictionary> = {
  es: {
    hero: {
      kicker: "MVP horticola legal",
      title: "Calendario claro para cuidar cultivos permitidos.",
      body:
        "Organiza espacios, plantas, tareas, observaciones, fotos y clima aproximado sin guardar direcciones exactas ni incluir recomendaciones sensibles."
    }
  },
  en: {
    hero: {
      kicker: "Legal horticulture MVP",
      title: "A clear calendar for permitted plant care.",
      body:
        "Track spaces, plants, tasks, notes, photos, and approximate weather without saving exact addresses or sensitive growing guidance."
    }
  }
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.es;
}

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
