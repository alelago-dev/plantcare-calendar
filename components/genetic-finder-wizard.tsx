"use client";

import { useMemo, useState } from "react";

import {
  getGeneticsCatalogAlphabetically,
  type GeneticReferenceEntry,
  type GeneticRawFieldValue,
  type GeneticType
} from "@/lib/genetics-catalog";

type FinderGrowPlace = "any" | "indoor" | "outdoor";
type FinderSeedType = "any" | "autoflowering" | "feminized" | "regular";
type FinderEffect = "any" | "relax" | "energy" | "balanced";
type FinderFlavor =
  | "acid"
  | "citrus"
  | "creamy"
  | "earthy"
  | "fuel"
  | "fruity"
  | "skunk"
  | "spicy"
  | "sweet"
  | "wood";

type FinderState = {
  effect: FinderEffect;
  flavors: FinderFlavor[];
  growPlace: FinderGrowPlace;
  seedType: FinderSeedType;
};

type FinderStep = "place" | "type" | "effect" | "flavors";

type FinderOption<T extends string> = {
  description: string;
  icon: string;
  id: T;
  label: string;
};

type GeneticFinderWizardProps = {
  compact?: boolean;
  onSelectGenetic?: (name: string) => void;
};

const steps: FinderStep[] = ["place", "type", "effect", "flavors"];
const geneticsCatalog = getGeneticsCatalogAlphabetically();

const growPlaceOptions: Array<FinderOption<FinderGrowPlace>> = [
  {
    description: "Carpa, armario o habitacion controlada.",
    icon: "IN",
    id: "indoor",
    label: "Interior"
  },
  {
    description: "Balcon, terraza, patio, jardin o invernaculo.",
    icon: "EX",
    id: "outdoor",
    label: "Exterior"
  },
  {
    description: "Mostrar coincidencias sin filtrar por lugar.",
    icon: "ALL",
    id: "any",
    label: "Me da igual"
  }
];

const seedTypeOptions: Array<FinderOption<FinderSeedType>> = [
  {
    description: "Ciclo automatico declarado por el banco.",
    icon: "AU",
    id: "autoflowering",
    label: "Automatica"
  },
  {
    description: "Fotoperiodica feminizada declarada.",
    icon: "FE",
    id: "feminized",
    label: "Feminizada"
  },
  {
    description: "Regular declarada por el banco.",
    icon: "RE",
    id: "regular",
    label: "Regular"
  },
  {
    description: "No filtrar por tipo.",
    icon: "ALL",
    id: "any",
    label: "Cualquiera"
  }
];

const effectOptions: Array<FinderOption<FinderEffect>> = [
  {
    description: "Busca notas publicadas de calma o descanso.",
    icon: "REL",
    id: "relax",
    label: "Relajacion"
  },
  {
    description: "Busca notas de energia, creatividad o perfil activo.",
    icon: "ENE",
    id: "energy",
    label: "Energia"
  },
  {
    description: "Busca perfiles publicados como hibridos o balanceados.",
    icon: "BAL",
    id: "balanced",
    label: "Equilibrado"
  },
  {
    description: "No filtrar por efecto.",
    icon: "ALL",
    id: "any",
    label: "Cualquiera"
  }
];

const flavorOptions: Array<FinderOption<FinderFlavor>> = [
  { description: "Frutas, frutos rojos, tropical o banana.", icon: "FR", id: "fruity", label: "Afrutado" },
  { description: "Limon, lima, naranja, pomelo o mandarina.", icon: "CI", id: "citrus", label: "Citrico" },
  { description: "Notas dulces, caramelo, galleta o cola.", icon: "DU", id: "sweet", label: "Dulce" },
  { description: "Crema, vainilla o perfiles suaves.", icon: "CR", id: "creamy", label: "Cremoso" },
  { description: "Pimienta, especias o perfiles picantes.", icon: "SP", id: "spicy", label: "Especias" },
  { description: "Pino, cedro, madera o herbal.", icon: "MA", id: "wood", label: "Madera" },
  { description: "Skunk, queso o perfiles intensos.", icon: "SK", id: "skunk", label: "Skunk" },
  { description: "Acido, sour o notas punzantes.", icon: "AC", id: "acid", label: "Acido" },
  { description: "Gas, diesel, petroleo o combustible.", icon: "GA", id: "fuel", label: "Gasolina" },
  { description: "Tierra, mineral o sustrato.", icon: "TE", id: "earthy", label: "Terroso" }
];

const initialFinderState: FinderState = {
  effect: "any",
  flavors: [],
  growPlace: "indoor",
  seedType: "any"
};

export function GeneticFinderWizard({ compact = false, onSelectGenetic }: GeneticFinderWizardProps) {
  const [finderState, setFinderState] = useState<FinderState>(initialFinderState);
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex];
  const matches = useMemo(() => filterGenetics(finderState, compact ? 6 : 10), [compact, finderState]);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  function goNext() {
    setStepIndex((value) => Math.min(steps.length - 1, value + 1));
  }

  function goBack() {
    setStepIndex((value) => Math.max(0, value - 1));
  }

  function toggleFlavor(flavor: FinderFlavor) {
    setFinderState((current) => ({
      ...current,
      flavors: current.flavors.includes(flavor)
        ? current.flavors.filter((selectedFlavor) => selectedFlavor !== flavor)
        : [...current.flavors, flavor]
    }));
  }

  return (
    <section className={compact ? "genetic-finder compact" : "genetic-finder"} aria-labelledby="genetic-finder-title">
      <div className="finder-header">
        <div>
          <p className="eyebrow text-emerald-800">Buscador guiado</p>
          <h3 id="genetic-finder-title">Encuentra una genetica de referencia</h3>
          <p>
            Filtra por ambiente, tipo, efecto y sabores publicados. No calcula tareas ni completa campos de cultivo.
          </p>
        </div>
        <span className="mode-badge manual">Manual</span>
      </div>

      <details className="finder-education">
        <summary>Como leer la informacion del catalogo</summary>
        <div className="finder-education-grid">
          <article>
            <h4>THC publicado</h4>
            <p>
              Como referencia comparativa: bajo es menos de 10%, medio entre 10% y 20%, y alto mas de 20%. Es un dato
              informado por la fuente, no una indicacion medica ni una prediccion del efecto.
            </p>
          </article>
          <article>
            <h4>Duracion de floracion</h4>
            <p>
              Corta: hasta 8 semanas. Media: 9 a 10 semanas. Larga: 11 semanas o mas. Son rangos publicados, no fechas
              calculadas para tu cultivo.
            </p>
          </article>
          <article>
            <h4>Tipo de semilla</h4>
            <p>
              Feminizada indica semillas comercializadas como femeninas; autofloreciente declara un ciclo automatico;
              regular puede producir plantas masculinas o femeninas.
            </p>
          </article>
        </div>
      </details>

      <div className="finder-progress" aria-label={`Paso ${stepIndex + 1} de ${steps.length}`}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <p className="finder-step-count">Paso {stepIndex + 1} de {steps.length}</p>

      {currentStep === "place" ? (
        <FinderOptionGrid
          options={growPlaceOptions}
          selectedValue={finderState.growPlace}
          onSelect={(growPlace) => {
            setFinderState((current) => ({ ...current, growPlace }));
            goNext();
          }}
        />
      ) : null}

      {currentStep === "type" ? (
        <FinderOptionGrid
          options={seedTypeOptions}
          selectedValue={finderState.seedType}
          onSelect={(seedType) => {
            setFinderState((current) => ({ ...current, seedType }));
            goNext();
          }}
        />
      ) : null}

      {currentStep === "effect" ? (
        <FinderOptionGrid
          options={effectOptions}
          selectedValue={finderState.effect}
          onSelect={(effect) => {
            setFinderState((current) => ({ ...current, effect }));
            goNext();
          }}
        />
      ) : null}

      {currentStep === "flavors" ? (
        <div className="finder-flavor-step">
          <h4>Que sabores buscas?</h4>
          <p>Marca uno o varios. Si no elegis ninguno, se muestran coincidencias por los otros filtros.</p>
          <div className="finder-flavor-grid">
            {flavorOptions.map((option) => {
              const selected = finderState.flavors.includes(option.id);

              return (
                <button
                  className={selected ? "finder-flavor active" : "finder-flavor"}
                  key={option.id}
                  onClick={() => toggleFlavor(option.id)}
                  type="button"
                >
                  <span>{option.icon}</span>
                  <strong>{option.label}</strong>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <FinderResults finderState={finderState} matches={matches} onSelectGenetic={onSelectGenetic} />

      <div className="finder-actions">
        <button className="secondary-button" disabled={stepIndex === 0} onClick={goBack} type="button">
          Atras
        </button>
        {stepIndex < steps.length - 1 ? (
          <button className="secondary-button" onClick={goNext} type="button">
            Continuar filtros
          </button>
        ) : (
          <button
            className="secondary-button"
            onClick={() => {
              setFinderState(initialFinderState);
              setStepIndex(0);
            }}
            type="button"
          >
            Empezar de nuevo
          </button>
        )}
      </div>
    </section>
  );
}

function FinderOptionGrid<T extends string>({
  onSelect,
  options,
  selectedValue
}: {
  onSelect: (value: T) => void;
  options: Array<FinderOption<T>>;
  selectedValue: T;
}) {
  return (
    <div className="finder-option-grid">
      {options.map((option) => (
        <button
          className={selectedValue === option.id ? "finder-option active" : "finder-option"}
          key={option.id}
          onClick={() => onSelect(option.id)}
          type="button"
        >
          <span>{option.icon}</span>
          <strong>{option.label}</strong>
          <small>{option.description}</small>
        </button>
      ))}
    </div>
  );
}

function FinderResults({
  finderState,
  matches,
  onSelectGenetic
}: {
  finderState: FinderState;
  matches: Array<{ genetic: GeneticReferenceEntry; score: number }>;
  onSelectGenetic?: (name: string) => void;
}) {
  return (
    <div className="finder-results">
      <div>
        <h4>Coincidencias de referencia</h4>
        <p>Estos datos vienen del catalogo estatico. El usuario decide que copiar o cargar manualmente.</p>
      </div>

      {matches.length > 0 ? (
        <div className="finder-result-grid">
          {matches.map(({ genetic }) => (
            <article className="finder-result-card" key={genetic.id}>
              <div className="finder-result-main">
                <div>
                  <h5>{genetic.name}</h5>
                  <p className="finder-source">
                    <span>Fuente</span>
                    {genetic.source}
                  </p>
                </div>
              </div>
              <p className="finder-match-summary">{formatMatchSummary(genetic, finderState)}</p>
              <div className="finder-chip-row">
                <span className={`finder-type-badge ${getGeneticTypeClass(genetic.type)}`}>
                  {formatGeneticType(genetic.type)}
                </span>
                <span className="finder-data-badge">{formatRange(genetic.flowering_weeks_range, "sem")}</span>
                <span className="finder-data-badge">{formatThcRange(genetic.thc_percent_range)}</span>
              </div>
              <p className="finder-notes">{compactText(genetic.flavor_notes || genetic.effect_notes)}</p>
              {onSelectGenetic ? (
                <button className="finder-use-button" onClick={() => onSelectGenetic(genetic.name)} type="button">
                  Agregar esta semilla
                </button>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="finder-empty">
          No encontre coincidencias con esos filtros. Proba dejando tipo, efecto o sabores en cualquiera.
        </div>
      )}
    </div>
  );
}

function filterGenetics(finderState: FinderState, limit: number) {
  return geneticsCatalog
    .map((genetic) => ({ genetic, score: scoreGenetic(genetic, finderState) }))
    .filter(({ score }) => score > 0 || hasOnlyAnyFilters(finderState))
    .sort((first, second) => second.score - first.score || first.genetic.name.localeCompare(second.genetic.name, "es"))
    .slice(0, limit);
}

function scoreGenetic(genetic: GeneticReferenceEntry, finderState: FinderState) {
  let score = 0;
  const searchableText = buildSearchableText(genetic);

  if (finderState.seedType !== "any") {
    score += geneticMatchesType(genetic.type, finderState.seedType) ? 7 : -4;
  }

  if (finderState.growPlace === "indoor" && /\b(indoor|interior|inside)\b/.test(searchableText)) {
    score += 3;
  }

  if (finderState.growPlace === "outdoor" && /\b(outdoor|exterior|terraza|balcon|jardin|invernaculo)\b/.test(searchableText)) {
    score += 3;
  }

  if (finderState.effect !== "any") {
    score += getEffectKeywords(finderState.effect).some((keyword) => searchableText.includes(keyword)) ? 4 : -1;
  }

  finderState.flavors.forEach((flavor) => {
    if (getFlavorKeywords(flavor).some((keyword) => searchableText.includes(keyword))) {
      score += 3;
    }
  });

  return score;
}

function formatMatchSummary(genetic: GeneticReferenceEntry, finderState: FinderState) {
  const searchableText = buildSearchableText(genetic);
  const criteria: boolean[] = [];

  if (finderState.growPlace !== "any") {
    criteria.push(
      finderState.growPlace === "indoor"
        ? /\b(indoor|interior|inside)\b/.test(searchableText)
        : /\b(outdoor|exterior|terraza|balcon|jardin|invernaculo)\b/.test(searchableText)
    );
  }

  if (finderState.seedType !== "any") {
    criteria.push(geneticMatchesType(genetic.type, finderState.seedType));
  }

  if (finderState.effect !== "any") {
    criteria.push(getEffectKeywords(finderState.effect).some((keyword) => searchableText.includes(keyword)));
  }

  if (finderState.flavors.length > 0) {
    criteria.push(
      finderState.flavors.some((flavor) =>
        getFlavorKeywords(flavor).some((keyword) => searchableText.includes(keyword))
      )
    );
  }

  if (criteria.length === 0) {
    return "Mostrada sin filtros especificos";
  }

  const matchingCriteria = criteria.filter(Boolean).length;
  return `Coincide con ${matchingCriteria} de ${criteria.length} filtros elegidos`;
}

function geneticMatchesType(geneticType: GeneticType, selectedType: FinderSeedType) {
  if (selectedType === "any") return true;
  if (selectedType === "feminized") return geneticType === "feminized" || geneticType === "faster_flowering";
  return geneticType === selectedType;
}

function getEffectKeywords(effect: FinderEffect) {
  if (effect === "relax") return ["relaj", "sedant", "calm", "body", "indica", "descanso", "somn"];
  if (effect === "energy") return ["energia", "energi", "creativ", "activo", "uplift", "sativa", "cerebral", "eufor"];
  if (effect === "balanced") return ["balance", "equilibr", "hybrid", "hibrid", "indica / sativa", "mild"];
  return [];
}

function getFlavorKeywords(flavor: FinderFlavor) {
  const keywords: Record<FinderFlavor, string[]> = {
    acid: ["acid", "sour", "punz"],
    citrus: ["citr", "limon", "lima", "orange", "naranja", "pomelo", "mandarina", "lemon"],
    creamy: ["cream", "crema", "vainilla", "suave"],
    earthy: ["earth", "tierra", "terroso", "mineral"],
    fuel: ["gas", "diesel", "petroleo", "fuel", "combustible"],
    fruity: ["frut", "berry", "berries", "banana", "mango", "tropical", "pineapple", "pina"],
    skunk: ["skunk", "queso", "cheese"],
    spicy: ["spic", "pimienta", "pepper", "picante", "especia", "cinnamon"],
    sweet: ["dulce", "sweet", "caramelo", "cookie", "galleta", "cola"],
    wood: ["wood", "madera", "pino", "pine", "cedro", "herbal"]
  };

  return keywords[flavor];
}

function buildSearchableText(genetic: GeneticReferenceEntry) {
  const rawText = genetic.raw_fields ? Object.values(genetic.raw_fields).map(formatRawValue).join(" ") : "";

  return normalizeText([
    genetic.name,
    genetic.cross,
    genetic.type,
    genetic.source,
    genetic.effect_notes,
    genetic.flavor_notes,
    rawText
  ].join(" "));
}

function formatRawValue(value: GeneticRawFieldValue) {
  if (value === null) return "";
  return String(value);
}

function hasOnlyAnyFilters(finderState: FinderState) {
  return finderState.growPlace === "any" && finderState.seedType === "any" && finderState.effect === "any" && finderState.flavors.length === 0;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatGeneticType(type: GeneticReferenceEntry["type"]) {
  if (type === "autoflowering") return "Automatica";
  if (type === "faster_flowering") return "Rapida";
  if (type === "regular") return "Regular";
  return "Feminizada";
}

function getGeneticTypeClass(type: GeneticReferenceEntry["type"]) {
  if (type === "autoflowering") return "autoflowering";
  if (type === "regular") return "regular";
  if (type === "faster_flowering") return "fast";
  return "feminized";
}

function formatRange([min, max]: [number, number], unit: string) {
  return min === max ? `${min} ${unit}` : `${min}-${max} ${unit}`;
}

function formatThcRange([min, max]: [number, number]) {
  if (min === 0 && max === 0) return "THC s/d";
  return min === max ? `${min}% THC` : `${min}-${max}% THC`;
}

function compactText(value: string) {
  if (!value || value === "No declarado en Excel") return "Sin notas publicadas de sabor o efecto.";
  return value.length > 118 ? `${value.slice(0, 115)}...` : value;
}
