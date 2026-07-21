"use client";

import { useMemo, useState } from "react";
import { getReferenceRow, type SeedType } from "@/lib/cultivation-reference";
import { searchGeneticsByName, type GeneticReferenceEntry } from "@/lib/genetics-catalog";
import type { Locale } from "@/lib/types";

type ManualCannabisFormProps = {
  locale: Locale;
};

const seedTypeOptions: Array<{ label: string; value: SeedType }> = [
  { label: "Feminizada", value: "feminized" },
  { label: "Regular", value: "regular" },
  { label: "Automatica", value: "autoflowering" }
];

export function ManualCannabisForm({ locale }: ManualCannabisFormProps) {
  const [seedType, setSeedType] = useState<SeedType>("feminized");
  const [geneticsQuery, setGeneticsQuery] = useState("");
  const [selectedGenetic, setSelectedGenetic] = useState<GeneticReferenceEntry | null>(null);
  const reference = useMemo(() => getReferenceRow(seedType), [seedType]);
  const geneticsResults = useMemo(() => searchGeneticsByName(geneticsQuery), [geneticsQuery]);
  const isSpanish = locale === "es";

  return (
    <div className="seed-result border-emerald-800/20 bg-emerald-50/80">
      <p className="text-sm font-black text-moss-950">Plan manual legal</p>
      <div className="mt-3 grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <div className="grid gap-3">
          <FormField label="Banco o catalogo" placeholder="Ej. banco legal o catalogo propio" />
          <label className="grid gap-1 text-sm font-black text-moss-950">
            Nombre de la genetica
            <input
              className="form-control"
              placeholder="Ej. nombre comercial declarado"
              value={geneticsQuery}
              onChange={(event) => {
                setGeneticsQuery(event.target.value);
                setSelectedGenetic(null);
              }}
            />
          </label>
          {geneticsResults.length > 0 ? (
            <div className="grid gap-2 rounded-lg border border-moss-950/10 bg-white/70 p-2">
              {geneticsResults.map((genetic) => (
                <button
                  className="rounded-md px-2.5 py-2 text-left text-sm font-black text-moss-950 transition hover:bg-mint-100"
                  key={genetic.id}
                  type="button"
                  onClick={() => {
                    setSelectedGenetic(genetic);
                    setGeneticsQuery(genetic.name);
                  }}
                >
                  {genetic.name}
                  <span className="ml-2 text-xs font-bold text-stone-500">{genetic.type}</span>
                </button>
              ))}
            </div>
          ) : null}
          <label className="grid gap-1 text-sm font-black text-moss-950">
            Registro legal
            <select className="form-control" defaultValue="Confirmado">
              <option>Confirmado</option>
              <option>Pendiente de verificar</option>
              <option>No aplica</option>
            </select>
          </label>
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
          <FormField label="Dias a flora" placeholder="Carga manual, ej. 30 dias" />
          <FormField label="Semanas de floracion" placeholder="Carga manual, ej. 9 semanas" />
        </div>

        {reference ? (
          <div className="grid gap-3">
            <aside className="rounded-lg border border-moss-950/10 bg-white/76 p-3 text-sm" aria-label="Referencia informativa">
              <p className="eyebrow text-emerald-800">Referencia estatica</p>
              <h3 className="mt-1 font-black text-moss-950">{isSpanish ? reference.label_es : reference.label_en}</h3>
              <dl className="mt-3 grid gap-2">
                <ReferenceFact label="Dias a flora" value={reference.days_to_flower_range} />
                <ReferenceFact label="Floracion" value={reference.flowering_weeks_range} />
                <ReferenceFact label="Maceta" value={reference.pot_liters_range} />
              </dl>
              <p className="mt-3 text-xs font-bold leading-5 text-stone-700">
                {isSpanish ? reference.light_notes_es : reference.light_notes_en}
              </p>
              <p className="mt-2 text-xs font-bold leading-5 text-stone-700">
                {isSpanish ? reference.watering_notes_es : reference.watering_notes_en}
              </p>
              <p className="mt-3 rounded-md bg-amber-50 px-2.5 py-2 text-xs font-black leading-5 text-amber-900">
                Solo ayuda visual: no completa ni calcula campos.
              </p>
            </aside>
            <GeneticsReferencePanel genetic={selectedGenetic} isSpanish={isSpanish} />
          </div>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-black text-moss-950">
          Tipo de espacio
          <select className="form-control" defaultValue="Interior">
            <option>Interior</option>
            <option>Exterior</option>
            <option>Invernadero</option>
          </select>
        </label>
        <FormField label="Tamano indoor" placeholder="Ej. 80 x 80 cm" />
        <label className="grid gap-1 text-sm font-black text-moss-950">
          Tipo de luz
          <select className="form-control" defaultValue="LED">
            <option>LED</option>
            <option>Sodio</option>
            <option>Mixta</option>
            <option>Luz natural</option>
          </select>
        </label>
        <FormField label="Maceta en litros" placeholder="Ej. 10 L" />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <FormField label="Proxima revision de humedad" placeholder="Fecha definida por el usuario" />
        <FormField label="Cambio de etapa / flora" placeholder="Fecha definida por el usuario" />
        <FormField label="Secado de ramas" placeholder="Fecha definida por el usuario" />
        <FormField label="Mantenimiento" placeholder="Fecha definida por el usuario" />
      </div>
      <p className="mt-3 text-xs font-bold leading-5 text-stone-600">
        Estos campos sirven para agenda y recordatorios definidos por el usuario. Evita guardar numeros de registro,
        domicilios exactos o datos medicos en esta demo publica.
      </p>
    </div>
  );
}

function GeneticsReferencePanel({
  genetic,
  isSpanish
}: {
  genetic: GeneticReferenceEntry | null;
  isSpanish: boolean;
}) {
  if (!genetic) {
    return (
      <aside className="rounded-lg border border-moss-950/10 bg-white/64 p-3 text-sm" aria-label="Referencia de genetica">
        <p className="eyebrow text-emerald-800">Catalogo informativo</p>
        <p className="mt-2 text-xs font-bold leading-5 text-stone-700">
          Busca una genetica por nombre para ver cruza, floracion publicada, THC y notas. No se copian datos al plan
          manual.
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-lg border border-moss-950/10 bg-white/76 p-3 text-sm" aria-label="Referencia de genetica">
      <p className="eyebrow text-emerald-800">Catalogo informativo</p>
      <h3 className="mt-1 font-black text-moss-950">{genetic.name}</h3>
      <p className="mt-1 text-xs font-bold text-stone-600">{genetic.source}</p>
      <dl className="mt-3 grid gap-2">
        <ReferenceFact label="Cruza" value={genetic.cross} />
        <ReferenceFact label="Tipo" value={genetic.type} />
        <ReferenceFact label="Floracion publicada" value={formatRange(genetic.flowering_weeks_range, "semanas")} />
        <ReferenceFact label="THC publicado" value={formatRange(genetic.thc_percent_range, "%")} />
      </dl>
      <p className="mt-3 text-xs font-bold leading-5 text-stone-700">{formatNotesLabel("Sabor", isSpanish)}: {genetic.flavor_notes}</p>
      <p className="mt-2 text-xs font-bold leading-5 text-stone-700">{formatNotesLabel("Efecto", isSpanish)}: {genetic.effect_notes}</p>
      <p className="mt-3 rounded-md bg-amber-50 px-2.5 py-2 text-xs font-black leading-5 text-amber-900">
        Solo lectura: no calcula fechas ni completa valores.
      </p>
    </aside>
  );
}

function formatRange([min, max]: [number, number], unit: string) {
  return min === max ? `${min} ${unit}` : `${min}-${max} ${unit}`;
}

function formatNotesLabel(label: "Sabor" | "Efecto", isSpanish: boolean) {
  if (isSpanish) return label;
  return label === "Sabor" ? "Flavor" : "Effect";
}

function ReferenceFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-moss-950/10 bg-paper/80 px-2.5 py-2">
      <dt className="text-[11px] font-black uppercase text-stone-500">{label}</dt>
      <dd className="mt-1 font-black text-moss-950">{value}</dd>
    </div>
  );
}

function FormField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="grid gap-1 text-sm font-black text-moss-950">
      {label}
      <input className="form-control" placeholder={placeholder} />
    </label>
  );
}
