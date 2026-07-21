"use client";

import { useMemo, useState } from "react";

import { HorticultureCalculator } from "@/components/horticulture-calculator";
import { ManualCannabisForm } from "@/components/manual-cannabis-form";
import {
  CULTIVATION_REFERENCE,
  type CultivationReferenceRow
} from "@/lib/cultivation-reference";
import {
  GENETICS_CATALOG,
  searchGeneticsByName,
  type GeneticReferenceEntry
} from "@/lib/genetics-catalog";
import { seedCatalog } from "@/lib/seed-catalog";
import type { Locale } from "@/lib/types";

type SeedsSectionProps = {
  locale: Locale;
};

type SeedTab = "manual" | "horticultural" | "reference";

const tabs: Array<{ id: SeedTab; label: string }> = [
  { id: "manual", label: "Mi cultivo" },
  { id: "horticultural", label: "Catalogo horticola" },
  { id: "reference", label: "Referencia" }
];

const regulatedSeedOptions = seedCatalog.filter((seed) => seed.regulated);

export function SeedsSection({ locale }: SeedsSectionProps) {
  const [activeTab, setActiveTab] = useState<SeedTab>("manual");

  return (
    <section className="mx-auto mt-7 max-w-7xl px-4 sm:px-6 lg:px-8" id="seeds">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader eyebrow="Semillas" title="Registro y referencia" />
        <span className="pill pill-soft">Regla legal activa</span>
      </div>

      <div className="mt-4 rounded-lg border border-moss-950/10 bg-white/88 p-3 text-sm font-bold leading-6 text-stone-700">
        Para cannabis o cultivos regulados, las referencias son solo lectura y no completan ni calculan campos. Las
        estimaciones automaticas quedan limitadas al catalogo horticola no regulado.
      </div>

      <div className="mt-5">
        <div className="seed-tabs" role="tablist" aria-label="Secciones de semillas">
          {tabs.map((tab) => (
            <button
              aria-selected={activeTab === tab.id}
              className={activeTab === tab.id ? "seed-tab active" : "seed-tab"}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {activeTab === "manual" ? (
            <section className="surface p-4 sm:p-5" aria-labelledby="manual-seed-title">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="eyebrow text-emerald-800">Carga manual</p>
                  <h3 className="mt-1 text-xl font-black tracking-tight text-moss-950" id="manual-seed-title">
                    Mi cultivo
                  </h3>
                </div>
                <ModeBadge mode="manual" />
              </div>
              <div className="mt-4">
                <ManualCannabisForm />
              </div>
            </section>
          ) : null}

          {activeTab === "horticultural" ? <HorticultureCalculator /> : null}

          {activeTab === "reference" ? <ReferenceTab locale={locale} /> : null}
        </div>
      </div>
    </section>
  );
}

function ReferenceTab({ locale }: { locale: Locale }) {
  const [seedId, setSeedId] = useState(regulatedSeedOptions[0]?.id ?? "");
  const [geneticsSearch, setGeneticsSearch] = useState("");
  const [selectedGenetic, setSelectedGenetic] = useState<GeneticReferenceEntry | null>(null);
  const geneticsResults = useMemo(() => searchGeneticsByName(geneticsSearch), [geneticsSearch]);
  const selectedSeed = regulatedSeedOptions.find((seed) => seed.id === seedId);
  const isSpanish = locale === "es";

  return (
    <section className="surface p-4 sm:p-5" aria-labelledby="reference-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader eyebrow="Solo lectura" id="reference-title" title="Referencia" />
        <ModeBadge mode="manual" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          <label className="grid gap-1 text-sm font-black text-moss-950">
            Tipos regulados disponibles
            <select className="form-control" value={seedId} onChange={(event) => setSeedId(event.target.value)}>
              {regulatedSeedOptions.map((seed) => (
                <option key={seed.id} value={seed.id}>
                  {seed.crop} - {seed.name}
                </option>
              ))}
            </select>
          </label>

          {selectedSeed ? (
            <div className="rounded-lg border border-moss-950/10 bg-paper/80 p-3">
              <p className="font-black text-moss-950">{selectedSeed.name}</p>
              <p className="mt-1 text-sm font-semibold text-stone-600">{selectedSeed.seedType}</p>
              <p className="mt-2 text-sm leading-6 text-stone-700">{selectedSeed.careNote}</p>
            </div>
          ) : null}

          <label className="grid gap-1 text-sm font-black text-moss-950">
            Buscar genetica
            <input
              className="form-control"
              placeholder="Ej. Gorilla, AK, Auto"
              value={geneticsSearch}
              onChange={(event) => setGeneticsSearch(event.target.value)}
            />
          </label>

          {geneticsResults.length > 0 ? (
            <div className="grid max-h-64 gap-1 overflow-auto rounded-lg border border-moss-950/10 bg-white/80 p-2">
              {geneticsResults.map((genetic) => (
                <button
                  className="rounded-md px-2.5 py-2 text-left text-sm font-black text-moss-950 transition hover:bg-mint-100"
                  key={genetic.id}
                  type="button"
                  onClick={() => {
                    setSelectedGenetic(genetic);
                    setGeneticsSearch("");
                  }}
                >
                  {genetic.name}
                  <span className="ml-2 text-xs font-bold text-stone-500">{formatGeneticType(genetic.type)}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-3">
          <details className="reference-details">
            <summary>Referencia por tipo</summary>
            <div className="mt-3 grid gap-3">
              {CULTIVATION_REFERENCE.map((row) => (
                <CultivationReferenceCard isSpanish={isSpanish} key={row.type} row={row} />
              ))}
            </div>
          </details>

          <details className="reference-details" open={Boolean(selectedGenetic)}>
            <summary>Ficha de genetica</summary>
            <GeneticsReferencePanel genetic={selectedGenetic} />
          </details>
        </div>
      </div>
    </section>
  );
}

function CultivationReferenceCard({ isSpanish, row }: { isSpanish: boolean; row: CultivationReferenceRow }) {
  return (
    <article className="rounded-lg border border-moss-950/10 bg-white/76 p-3 text-sm">
      <h4 className="font-black text-moss-950">{isSpanish ? row.label_es : row.label_en}</h4>
      <dl className="mt-3 grid gap-2 sm:grid-cols-3">
        <ReferenceFact label="Dias a flora" value={row.days_to_flower_range} />
        <ReferenceFact label="Floracion" value={row.flowering_weeks_range} />
        <ReferenceFact label="Maceta" value={row.pot_liters_range} />
      </dl>
      <p className="mt-3 text-xs font-bold leading-5 text-stone-700">
        {isSpanish ? row.light_notes_es : row.light_notes_en}
      </p>
      <p className="mt-2 text-xs font-bold leading-5 text-stone-700">
        {isSpanish ? row.watering_notes_es : row.watering_notes_en}
      </p>
    </article>
  );
}

function GeneticsReferencePanel({ genetic }: { genetic: GeneticReferenceEntry | null }) {
  if (!genetic) {
    return (
      <div className="mt-3 rounded-lg border border-moss-950/10 bg-white/70 p-3 text-sm font-bold leading-6 text-stone-700">
        Elegi una genetica del buscador para ver la ficha publicada.
      </div>
    );
  }

  return (
    <article className="mt-3 rounded-lg border border-moss-950/10 bg-white/76 p-3 text-sm">
      <h4 className="font-black text-moss-950">{genetic.name}</h4>
      <p className="mt-1 text-xs font-bold text-stone-600">{genetic.source}</p>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        <ReferenceFact label="Cruza" value={genetic.cross} />
        <ReferenceFact label="Tipo" value={formatGeneticType(genetic.type)} />
        <ReferenceFact label="Floracion publicada" value={formatRange(genetic.flowering_weeks_range, "semanas")} />
        <ReferenceFact label="THC publicado" value={formatRange(genetic.thc_percent_range, "%")} />
      </dl>
      <p className="mt-3 text-xs font-bold leading-5 text-stone-700">Sabor: {genetic.flavor_notes}</p>
      <p className="mt-2 text-xs font-bold leading-5 text-stone-700">Efecto: {genetic.effect_notes}</p>
    </article>
  );
}

function ModeBadge({ mode }: { mode: "automatic" | "manual" }) {
  return (
    <span className={mode === "automatic" ? "mode-badge automatic" : "mode-badge manual"}>
      {mode === "automatic" ? "Automatico" : "Manual"}
    </span>
  );
}

function SectionHeader({ eyebrow, id, title }: { eyebrow: string; id?: string; title: string }) {
  return (
    <div>
      <p className="eyebrow text-emerald-800">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-black tracking-tight text-moss-950 sm:text-2xl" id={id}>
        {title}
      </h2>
    </div>
  );
}

function ReferenceFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-moss-950/10 bg-paper/80 px-2.5 py-2">
      <dt className="text-[11px] font-black uppercase text-stone-500">{label}</dt>
      <dd className="mt-1 font-black text-moss-950">{value}</dd>
    </div>
  );
}

function formatRange([min, max]: [number, number], unit: string) {
  return min === max ? `${min} ${unit}` : `${min}-${max} ${unit}`;
}

function formatGeneticType(type: GeneticReferenceEntry["type"]) {
  if (type === "autoflowering") return "Automatica";
  if (type === "faster_flowering") return "Faster flowering";
  return "Feminizada";
}
