"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { addDays, createEventId, getTodayIso } from "@/lib/calendar-events";
import { CopyValueButton } from "@/components/copy-button";
import { getReferenceRow, type SeedType } from "@/lib/cultivation-reference";
import { getGeneticsCatalogAlphabetically, type GeneticReferenceEntry, type GeneticType } from "@/lib/genetics-catalog";
import type { CalendarEvent, CalendarEventKind } from "@/lib/types";

const seedTypeOptions: Array<{ label: string; value: SeedType }> = [
  { label: "Feminizada", value: "feminized" },
  { label: "Regular", value: "regular" },
  { label: "Automatica", value: "autoflowering" }
];

const bankOptions = [
  "Catalogo propio",
  "BSF",
  "Zig Zag",
  "Banco legal local",
  "Otro banco autorizado",
  "No declarado"
];

const floweringDayOptions = [
  "No declarado",
  "15-30 dias",
  "21-45 dias",
  "30-60 dias",
  "Definir en agenda"
];

const floweringWeekOptions = [
  "No declarado",
  "5-8 semanas",
  "7-9 semanas",
  "8-10 semanas",
  "10-12 semanas",
  "Definir en agenda"
];

const indoorSizeOptions = [
  "No aplica",
  "40 x 40 cm",
  "60 x 60 cm",
  "80 x 80 cm",
  "100 x 100 cm",
  "120 x 120 cm",
  "Otro tamano declarado"
];

const potOptions = ["No declarado", "3 L", "5 L", "7 L", "10 L", "15 L", "20 L", "25 L", "Otro volumen"];

const reminderOptions = [
  { label: "No programado", value: "none" },
  { label: "Hoy", value: "0" },
  { label: "En 3 dias", value: "3" },
  { label: "En 7 dias", value: "7" },
  { label: "En 14 dias", value: "14" }
];

const recurrenceOptions = [
  { label: "No repetir", value: "0" },
  { label: "Cada 3 dias", value: "3" },
  { label: "Cada 7 dias", value: "7" },
  { label: "Cada 14 dias", value: "14" }
];

const recurrenceEndOptions = [
  { label: "Sin fecha de fin", value: "none" },
  { label: "Durante 30 dias", value: "30" },
  { label: "Durante 60 dias", value: "60" },
  { label: "Durante 90 dias", value: "90" }
];
const geneticsCatalogAlphabetically = getGeneticsCatalogAlphabetically();
const geneticSelectOptions = [
  { label: "No seleccionada", value: "No seleccionada" },
  ...geneticsCatalogAlphabetically.map((genetic) => ({
    label: `${genetic.name} - ${formatGeneticType(genetic.type)} - ${formatWeekRange(genetic.flowering_weeks_range)}`,
    value: genetic.name
  })),
  { label: "Otra / no listada", value: "Otra / no listada" }
];

export function ManualCannabisForm({
  calendarHref,
  onCreateEvents
}: {
  calendarHref: string;
  onCreateEvents: (events: CalendarEvent[]) => void;
}) {
  const [seedType, setSeedType] = useState<SeedType>("feminized");
  const [geneticName, setGeneticName] = useState("No seleccionada");
  const [moistureReminder, setMoistureReminder] = useState("0");
  const [stageReminder, setStageReminder] = useState("none");
  const [dryingReminder, setDryingReminder] = useState("none");
  const [maintenanceReminder, setMaintenanceReminder] = useState("7");
  const [photoReminder, setPhotoReminder] = useState("none");
  const [structureReminder, setStructureReminder] = useState("none");
  const [nutritionReminder, setNutritionReminder] = useState("none");
  const [pestReminder, setPestReminder] = useState("none");
  const [closingReminder, setClosingReminder] = useState("none");
  const [recurrenceDays, setRecurrenceDays] = useState("0");
  const [recurrenceEnd, setRecurrenceEnd] = useState("none");
  const [statusMessage, setStatusMessage] = useState("");
  const [showCalendarLink, setShowCalendarLink] = useState(false);
  const selectedGenetic = geneticsCatalogAlphabetically.find((genetic) => genetic.name === geneticName);
  const visualReferenceType = selectedGenetic ? mapGeneticTypeToSeedType(selectedGenetic.type) : seedType;
  const visualReference = getReferenceRow(visualReferenceType);

  function handleCreateEvents() {
    const definitions: Array<{
      description: string;
      kind: CalendarEventKind;
      title: string;
      value: string;
    }> = [
      {
        description: "Fecha declarada manualmente por el usuario para revisar humedad antes de decidir riego.",
        kind: "watering",
        title: "Revision de humedad",
        value: moistureReminder
      },
      {
        description: "Fecha declarada manualmente por el usuario para registrar cambio de etapa.",
        kind: "review",
        title: "Cambio de etapa / flora",
        value: stageReminder
      },
      {
        description: "Fecha declarada manualmente por el usuario para registrar secado de ramas.",
        kind: "review",
        title: "Secado de ramas",
        value: dryingReminder
      },
      {
        description: "Fecha declarada manualmente por el usuario para mantenimiento del espacio.",
        kind: "cleaning",
        title: "Mantenimiento",
        value: maintenanceReminder
      },
      {
        description: "Fecha declarada manualmente por el usuario para registrar foto de seguimiento.",
        kind: "photo",
        title: "Registro fotografico",
        value: photoReminder
      },
      {
        description: "Fecha declarada manualmente por el usuario para trabajo de estructura o poda.",
        kind: "review",
        title: "Trabajo de estructura / poda",
        value: structureReminder
      },
      {
        description: "Fecha declarada manualmente por el usuario para registrar nutricion o fertilizacion.",
        kind: "review",
        title: "Nutricion / fertilizacion",
        value: nutritionReminder
      },
      {
        description: "Fecha declarada manualmente por el usuario para prevencion o revision de plagas.",
        kind: "review",
        title: "Prevencion de plagas",
        value: pestReminder
      },
      {
        description: "Fecha declarada manualmente por el usuario para cierre de riego o fertilizacion.",
        kind: "review",
        title: "Cierre de riego / fertilizacion",
        value: closingReminder
      }
    ];
    const todayIso = getTodayIso();
    const everyDays = Number(recurrenceDays);
    const nextEvents = definitions
      .filter((definition) => definition.value !== "none")
      .map((definition) => {
        const startDate = addDays(todayIso, Number(definition.value));
        const recurrenceEndDate =
          everyDays > 0 && recurrenceEnd !== "none" ? addDays(startDate, Number(recurrenceEnd)) : undefined;

        return {
          completedDates: [],
          description: `${definition.description} Genetica: ${geneticName}. Tipo: ${formatSeedType(seedType)}.`,
          id: createEventId("event-manual"),
          kind: definition.kind,
          plantId: "plant-manual-regulated",
          recurrence:
            everyDays > 0
              ? {
                  active: true,
                  endDate: recurrenceEndDate,
                  everyDays
                }
              : undefined,
          source: "manual",
          startDate,
          title: definition.title
        } satisfies CalendarEvent;
      });

    if (nextEvents.length === 0) {
      setStatusMessage("No hay fechas manuales seleccionadas para crear eventos.");
      setShowCalendarLink(false);
      return;
    }

    onCreateEvents(nextEvents);
    setStatusMessage(`${nextEvents.length} evento(s) manual(es) agregados. Abriendo calendario...`);
    setShowCalendarLink(true);
    window.setTimeout(() => {
      window.location.href = calendarHref;
    }, 180);
  }

  return (
    <div className="grid gap-4">
      <FormGroup title="Identificacion">
        <FormSelect label="Banco o catalogo" options={bankOptions} recentKey="bank" />
        <FormSelect
          label="Nombre de la genetica"
          options={geneticSelectOptions}
          value={geneticName}
          onChange={setGeneticName}
        />
        <FormSelect label="Registro legal" options={["Confirmado", "Pendiente de verificar", "No aplica"]} />
        <label className="grid gap-1 text-sm font-black text-moss-950">
          Tipo declarado
          <select
            className="form-control"
            value={seedType}
            onChange={(event) => setSeedType(event.target.value as SeedType)}
          >
            {seedTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </FormGroup>

      <FormGroup title="Datos de cultivo">
        <GeneticDataReference genetic={selectedGenetic} visualReference={visualReference} />
        <FormSelect label="Dias a flora" options={floweringDayOptions} />
        <FormSelect label="Semanas de floracion" options={floweringWeekOptions} />
        <FormSelect label="Tipo de espacio" options={["Interior", "Exterior", "Invernadero"]} />
        <FormSelect label="Tamano indoor" options={indoorSizeOptions} recentKey="indoor-size" />
        <FormSelect label="Tipo de luz" options={["LED", "Sodio", "Mixta", "Luz natural", "No declarado"]} recentKey="light-type" />
        <FormSelect label="Maceta en litros" options={potOptions} recentKey="pot-liters" />
      </FormGroup>

      <FormGroup title="Fechas y recordatorios">
        <FormSelect label="Proxima revision de humedad" options={reminderOptions} value={moistureReminder} onChange={setMoistureReminder} />
        <FormSelect label="Cambio de etapa / flora" options={reminderOptions} value={stageReminder} onChange={setStageReminder} />
        <FormSelect label="Secado de ramas" options={reminderOptions} value={dryingReminder} onChange={setDryingReminder} />
        <FormSelect label="Mantenimiento" options={reminderOptions} value={maintenanceReminder} onChange={setMaintenanceReminder} />
        <FormSelect label="Registro fotografico" options={reminderOptions} value={photoReminder} onChange={setPhotoReminder} />
        <FormSelect label="Trabajo de estructura / poda" options={reminderOptions} value={structureReminder} onChange={setStructureReminder} />
        <FormSelect label="Nutricion / fertilizacion" options={reminderOptions} value={nutritionReminder} onChange={setNutritionReminder} />
        <FormSelect label="Prevencion de plagas" options={reminderOptions} value={pestReminder} onChange={setPestReminder} />
        <FormSelect label="Cierre de riego / fertilizacion" options={reminderOptions} value={closingReminder} onChange={setClosingReminder} />
        <FormSelect label="Recurrencia" options={recurrenceOptions} value={recurrenceDays} onChange={setRecurrenceDays} />
        <FormSelect label="Fin recurrencia" options={recurrenceEndOptions} value={recurrenceEnd} onChange={setRecurrenceEnd} />
      </FormGroup>

      <div className="flex flex-wrap items-center gap-3">
        <button className="primary-button" type="button" onClick={handleCreateEvents}>
          Crear eventos manuales
        </button>
        {statusMessage ? <span className="text-sm font-bold text-stone-600">{statusMessage}</span> : null}
        {showCalendarLink ? (
          <a className="secondary-button" href={calendarHref}>
            Ver calendario
          </a>
        ) : null}
      </div>

      <p className="text-xs font-bold leading-5 text-stone-600">
        Estos campos sirven para agenda y recordatorios definidos por el usuario. Evita guardar numeros de registro,
        domicilios exactos o datos medicos en esta demo publica.
      </p>
    </div>
  );
}

function GeneticDataReference({
  genetic,
  visualReference
}: {
  genetic?: GeneticReferenceEntry;
  visualReference?: ReturnType<typeof getReferenceRow>;
}) {
  const floweringWeeks = genetic ? formatWeekRange(genetic.flowering_weeks_range) : visualReference?.flowering_weeks_range ?? "No declarado";
  const daysToFlower = visualReference?.days_to_flower_range ?? "No declarado";
  const geneticType = genetic ? formatGeneticType(genetic.type) : "Segun tipo declarado";

  return (
    <article className="manual-reference-card sm:col-span-2" aria-label="Referencia visual de la genetica seleccionada">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase text-stone-500">Referencia visible, no autocompleta</p>
          <h4 className="mt-1 font-black text-moss-950">{genetic?.name ?? "Elegí una genética para ver datos publicados"}</h4>
          <p className="mt-1 text-sm font-bold text-stone-600">
            {genetic ? `${genetic.cross} - ${genetic.source}` : "Los valores quedan como ayuda para copiar o elegir manualmente."}
          </p>
        </div>
        <span className="mode-badge manual">Manual</span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        <ReferenceValue label="Tipo publicado" value={geneticType} />
        <ReferenceValue label="Dias a flora ref." value={daysToFlower} />
        <ReferenceValue label="Floracion/ciclo" value={floweringWeeks} />
        <ReferenceValue label="THC publicado" value={genetic ? `${genetic.thc_percent_range[0]}-${genetic.thc_percent_range[1]}%` : "No declarado"} />
      </div>
    </article>
  );
}

function ReferenceValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="reference-value">
      <span>{label}</span>
      <strong>{value}</strong>
      <CopyValueButton label={label} value={value} />
    </div>
  );
}

function FormGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-lg border border-moss-950/10 bg-white/70 p-3">
      <h3 className="text-xs font-black uppercase text-stone-500">{title}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function FormSelect({
  label,
  onChange,
  options,
  recentKey,
  value
}: {
  label: string;
  onChange?: (value: string) => void;
  options: string[] | Array<{ label: string; value: string }>;
  recentKey?: string;
  value?: string;
}) {
  const normalizedOptions = options.map((option) => (typeof option === "string" ? { label: option, value: option } : option));
  const { recentOptions, rememberOption } = useRecentOptions(recentKey, normalizedOptions);
  const regularOptions = normalizedOptions.filter((option) => !recentOptions.some((recentOption) => recentOption.value === option.value));

  return (
    <label className="grid gap-1 text-sm font-black text-moss-950">
      {label}
      <select
        aria-label={label}
        className="form-control"
        defaultValue={value ? undefined : normalizedOptions[0]?.value}
        value={value}
        onChange={(event) => {
          rememberOption(event.target.value);
          onChange?.(event.target.value);
        }}
      >
        {recentOptions.length > 0 ? <option disabled>Usados recientemente</option> : null}
        {recentOptions.map((option) => (
          <option key={`recent-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
        {recentOptions.length > 0 ? <option disabled>Opciones</option> : null}
        {regularOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function useRecentOptions(key: string | undefined, options: Array<{ label: string; value: string }>) {
  const storageKey = key ? `plantcare-recent-${key}` : "";
  const [recentValues, setRecentValues] = useState<string[]>(() => {
    if (!storageKey || typeof window === "undefined") return [];
    const storedValue = window.localStorage.getItem(storageKey);
    return storedValue ? JSON.parse(storedValue) as string[] : [];
  });

  function rememberOption(value: string) {
    if (!storageKey) return;

    const nextValues = [value, ...recentValues.filter((recentValue) => recentValue !== value)].slice(0, 3);
    setRecentValues(nextValues);
    window.localStorage.setItem(storageKey, JSON.stringify(nextValues));
  }

  return {
    recentOptions: recentValues
      .map((recentValue) => options.find((option) => option.value === recentValue))
      .filter((option): option is { label: string; value: string } => Boolean(option)),
    rememberOption
  };
}

function formatSeedType(type: SeedType) {
  if (type === "autoflowering") return "Automatica";
  if (type === "regular") return "Regular";
  return "Feminizada";
}

function formatGeneticType(type: GeneticType) {
  if (type === "autoflowering") return "Automatica";
  if (type === "faster_flowering") return "Rapida";
  return "Feminizada";
}

function formatWeekRange(range: [number, number]) {
  return range[0] === range[1] ? `${range[0]} semanas` : `${range[0]}-${range[1]} semanas`;
}

function mapGeneticTypeToSeedType(type: GeneticType): SeedType {
  if (type === "autoflowering") return "autoflowering";
  return "feminized";
}
