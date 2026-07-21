"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { addDays, createEventId, getTodayIso } from "@/lib/calendar-events";
import type { SeedType } from "@/lib/cultivation-reference";
import { GENETICS_CATALOG } from "@/lib/genetics-catalog";
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

export function ManualCannabisForm({ onCreateEvents }: { onCreateEvents: (events: CalendarEvent[]) => void }) {
  const [seedType, setSeedType] = useState<SeedType>("feminized");
  const [geneticName, setGeneticName] = useState("No seleccionada");
  const [moistureReminder, setMoistureReminder] = useState("0");
  const [stageReminder, setStageReminder] = useState("none");
  const [dryingReminder, setDryingReminder] = useState("none");
  const [maintenanceReminder, setMaintenanceReminder] = useState("7");
  const [recurrenceDays, setRecurrenceDays] = useState("0");
  const [recurrenceEnd, setRecurrenceEnd] = useState("none");
  const [statusMessage, setStatusMessage] = useState("");

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
      return;
    }

    onCreateEvents(nextEvents);
    setStatusMessage(`${nextEvents.length} evento(s) manual(es) agregados al calendario.`);
  }

  return (
    <div className="grid gap-4">
      <FormGroup title="Identificacion">
        <FormSelect label="Banco o catalogo" options={bankOptions} />
        <FormSelect
          label="Nombre de la genetica"
          options={["No seleccionada", ...GENETICS_CATALOG.map((genetic) => genetic.name), "Otra / no listada"]}
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
        <FormSelect label="Dias a flora" options={floweringDayOptions} />
        <FormSelect label="Semanas de floracion" options={floweringWeekOptions} />
        <FormSelect label="Tipo de espacio" options={["Interior", "Exterior", "Invernadero"]} />
        <FormSelect label="Tamano indoor" options={indoorSizeOptions} />
        <FormSelect label="Tipo de luz" options={["LED", "Sodio", "Mixta", "Luz natural", "No declarado"]} />
        <FormSelect label="Maceta en litros" options={potOptions} />
      </FormGroup>

      <FormGroup title="Fechas y recordatorios">
        <FormSelect label="Proxima revision de humedad" options={reminderOptions} value={moistureReminder} onChange={setMoistureReminder} />
        <FormSelect label="Cambio de etapa / flora" options={reminderOptions} value={stageReminder} onChange={setStageReminder} />
        <FormSelect label="Secado de ramas" options={reminderOptions} value={dryingReminder} onChange={setDryingReminder} />
        <FormSelect label="Mantenimiento" options={reminderOptions} value={maintenanceReminder} onChange={setMaintenanceReminder} />
        <FormSelect label="Recurrencia" options={recurrenceOptions} value={recurrenceDays} onChange={setRecurrenceDays} />
        <FormSelect label="Fin recurrencia" options={recurrenceEndOptions} value={recurrenceEnd} onChange={setRecurrenceEnd} />
      </FormGroup>

      <div className="flex flex-wrap items-center gap-3">
        <button className="primary-button" type="button" onClick={handleCreateEvents}>
          Crear eventos manuales
        </button>
        {statusMessage ? <span className="text-sm font-bold text-stone-600">{statusMessage}</span> : null}
      </div>

      <p className="text-xs font-bold leading-5 text-stone-600">
        Estos campos sirven para agenda y recordatorios definidos por el usuario. Evita guardar numeros de registro,
        domicilios exactos o datos medicos en esta demo publica.
      </p>
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
  value
}: {
  label: string;
  onChange?: (value: string) => void;
  options: string[] | Array<{ label: string; value: string }>;
  value?: string;
}) {
  const normalizedOptions = options.map((option) => (typeof option === "string" ? { label: option, value: option } : option));

  return (
    <label className="grid gap-1 text-sm font-black text-moss-950">
      {label}
      <select
        className="form-control"
        defaultValue={value ? undefined : normalizedOptions[0]?.value}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      >
        {normalizedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatSeedType(type: SeedType) {
  if (type === "autoflowering") return "Automatica";
  if (type === "regular") return "Regular";
  return "Feminizada";
}
