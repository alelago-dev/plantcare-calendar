export const locales = ["es", "en"] as const;

export type Locale = (typeof locales)[number];

export type Dictionary = {
  hero: {
    kicker: string;
    title: string;
    body: string;
  };
};

export type GrowMode = "Exterior" | "Interior" | "Invernadero";

export type GrowSpace = {
  id: string;
  name: string;
  mode: GrowMode;
  region: string;
  privacyLevel: "Region aproximada" | "Interior privado";
};

export type Plant = {
  id: string;
  spaceId: string;
  name: string;
  variety: string;
  startedAt: string;
  stage: string;
  mode: GrowMode;
  pot: string;
  substrate: string;
  lighting: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: "open" | "done";
  frequency: "Manual" | "Diaria" | "Semanal" | "Recurrente";
  category: "Riego" | "Mantenimiento" | "Observacion" | "Registro";
};

export type CareEntry = {
  id: string;
  title: string;
  createdAt: string;
  note: string;
  tags: string[];
};

export type CalendarDay = {
  isoDate: string;
  label: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  items: string[];
};
