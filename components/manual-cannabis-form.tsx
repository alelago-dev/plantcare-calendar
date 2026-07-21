"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import type { SeedType } from "@/lib/cultivation-reference";
import { GENETICS_CATALOG } from "@/lib/genetics-catalog";

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
  "No programado",
  "Hoy",
  "En 3 dias",
  "En 7 dias",
  "En 14 dias",
  "Definir luego"
];

export function ManualCannabisForm() {
  const [seedType, setSeedType] = useState<SeedType>("feminized");

  return (
    <div className="grid gap-4">
      <FormGroup title="Identificacion">
        <FormSelect label="Banco o catalogo" options={bankOptions} />
        <FormSelect
          label="Nombre de la genetica"
          options={["No seleccionada", ...GENETICS_CATALOG.map((genetic) => genetic.name), "Otra / no listada"]}
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
        <FormSelect label="Proxima revision de humedad" options={reminderOptions} />
        <FormSelect label="Cambio de etapa / flora" options={reminderOptions} />
        <FormSelect label="Secado de ramas" options={reminderOptions} />
        <FormSelect label="Mantenimiento" options={reminderOptions} />
      </FormGroup>

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

function FormSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="grid gap-1 text-sm font-black text-moss-950">
      {label}
      <select className="form-control" defaultValue={options[0]}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
