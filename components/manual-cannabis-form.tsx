"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { addDays, createEventId, getTodayIso } from "@/lib/calendar-events";
import { CopyValueButton } from "@/components/copy-button";
import { getReferenceRow, type SeedType } from "@/lib/cultivation-reference";
import {
  getGeneticsCatalogAlphabetically,
  searchGeneticsByName,
  type GeneticReferenceEntry,
  type GeneticType
} from "@/lib/genetics-catalog";
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
        <GeneticPredictiveSelect value={geneticName} onChange={setGeneticName} />
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
        <ReferenceValue label="Tipo publicado" targetField="Tipo declarado" value={geneticType} />
        <ReferenceValue label="Dias a flora ref." targetField="Dias a flora" value={daysToFlower} />
        <ReferenceValue label="Floracion/ciclo" targetField="Semanas de floracion" value={floweringWeeks} />
        <ReferenceValue
          label="THC publicado"
          targetField="Nota manual de genetica"
          value={genetic ? formatThcRange(genetic.thc_percent_range) : "No declarado"}
        />
      </div>
      {genetic?.raw_fields ? <RawFieldsPanel fields={genetic.raw_fields} /> : null}
    </article>
  );
}

function ReferenceValue({ label, targetField, value }: { label: string; targetField?: string; value: string }) {
  const destination = targetField ?? getManualReferenceTarget(label);

  return (
    <div className="reference-value">
      <span>{label}</span>
      <strong>{value}</strong>
      <div className="reference-copy-row">
        <span className="reference-target-field">Campo: {destination}</span>
        <CopyValueButton label={destination} value={value} />
      </div>
    </div>
  );
}

function RawFieldsPanel({ fields }: { fields: NonNullable<GeneticReferenceEntry["raw_fields"]> }) {
  return (
    <details className="mt-3 rounded-md border border-moss-950/10 bg-white/70 p-2">
      <summary className="cursor-pointer text-xs font-black uppercase text-stone-500">Campos originales del Excel</summary>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {Object.entries(fields).map(([label, rawValue]) => {
          const value = rawValue === null ? "No declarado" : String(rawValue);
          return <ReferenceValue key={label} label={label} value={value} />;
        })}
      </div>
    </details>
  );
}

function getManualReferenceTarget(label: string) {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes("floracion") || normalizedLabel.includes("ciclo")) return "Semanas de floracion";
  if (normalizedLabel.includes("flora")) return "Dias a flora";
  if (normalizedLabel.includes("tipo")) return "Tipo declarado";
  if (normalizedLabel.includes("maceta")) return "Maceta en litros";
  if (normalizedLabel.includes("luz")) return "Tipo de luz";
  return "Campo manual correspondiente";
}

function FormGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-lg border border-moss-950/10 bg-white/70 p-3">
      <h3 className="text-xs font-black uppercase text-stone-500">{title}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function GeneticPredictiveSelect({ onChange, value }: { onChange: (value: string) => void; value: string }) {
  const [query, setQuery] = useState(value === "No seleccionada" ? "" : value);
  const results = useMemo(() => searchGeneticsByName(query), [query]);
  const selectValue = geneticSelectOptions.some((option) => option.value === value) ? value : "Otra / no listada";
  const showResults = query.trim().length >= 2 && results.length > 0 && query !== value;

  function chooseGenetic(genetic: GeneticReferenceEntry) {
    setQuery(genetic.name);
    onChange(genetic.name);
  }

  return (
    <div className="grid gap-2 sm:col-span-2">
      <label className="grid gap-1 text-sm font-black text-moss-950">
        Buscar genetica
        <input
          aria-label="Buscar genetica por nombre, banco o linaje"
          className="form-control"
          placeholder="Escribi para buscar: Gorilla, Baseball, Kush..."
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            onChange(nextQuery.trim() ? nextQuery : "No seleccionada");
          }}
        />
      </label>

      {showResults ? (
        <div className="grid max-h-56 gap-1 overflow-auto rounded-lg border border-emerald-900/15 bg-white p-2 shadow-sm">
          {results.map((genetic) => (
            <button
              className="rounded-md px-2.5 py-2 text-left text-sm font-black text-moss-950 transition hover:bg-mint-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
              key={genetic.id}
              onClick={() => chooseGenetic(genetic)}
              type="button"
            >
              {genetic.name}
              <span className="ml-2 text-xs font-bold text-stone-500">
                {formatGeneticType(genetic.type)} - {genetic.source}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <FormSelect
        label={`O elegir desde la lista completa (${geneticsCatalogAlphabetically.length} geneticas)`}
        options={geneticSelectOptions}
        value={selectValue}
        onChange={(nextValue) => {
          setQuery(nextValue === "No seleccionada" ? "" : nextValue);
          onChange(nextValue);
        }}
      />
      <p className="text-xs font-bold leading-5 text-stone-600">
        Busca por nombre o banco. Ejemplos cargados: Gorilla Glue #4, AK 47, Red Skunk Auto, OBG Kush. Elegir una
        genetica solo muestra referencia para copiar; no completa dias, luz, riego ni fechas.
      </p>
    </div>
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
  if (type === "regular") return "Regular";
  return "Feminizada";
}

function formatWeekRange(range: [number, number]) {
  return range[0] === range[1] ? `${range[0]} semanas` : `${range[0]}-${range[1]} semanas`;
}

function formatThcRange(range: [number, number]) {
  if (range[0] === 0 && range[1] === 0) return "No declarado";
  return range[0] === range[1] ? `${range[0]}%` : `${range[0]}-${range[1]}%`;
}

function mapGeneticTypeToSeedType(type: GeneticType): SeedType {
  if (type === "autoflowering") return "autoflowering";
  if (type === "regular") return "regular";
  return "feminized";
}
