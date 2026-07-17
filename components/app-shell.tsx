import type { CalendarDay, CareEntry, Dictionary, GrowSpace, Locale, Plant, Task } from "@/lib/types";
import { getRecommendedSeeds, seedCatalog, seedClimateOptions } from "@/lib/seed-catalog";
import { getWeatherReadiness } from "@/lib/weather";

type AppShellProps = {
  calendarDays: CalendarDay[];
  dictionary: Dictionary;
  entries: CareEntry[];
  locale: Locale;
  plants: Plant[];
  spaces: GrowSpace[];
  tasks: Task[];
};

const navItems = [
  { href: "#today", label: "Hoy", short: "Hoy" },
  { href: "#seeds", label: "Semillas", short: "Seeds" },
  { href: "#spaces", label: "Espacios", short: "Cultivos" },
  { href: "#calendar", label: "Calendario", short: "Agenda" },
  { href: "#journal", label: "Diario", short: "Diario" },
  { href: "#privacy", label: "Privacidad", short: "Legal" }
];

const careScore = 86;

export function AppShell({
  calendarDays,
  dictionary,
  entries,
  locale,
  plants,
  spaces,
  tasks
}: AppShellProps) {
  const weather = getWeatherReadiness(spaces[0]?.region ?? "Region sin definir");
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const openTasks = tasks.length - completedTasks;
  const outdoorPlants = plants.filter((plant) => plant.mode === "Exterior").length;
  const selectedClimate = "Templado";
  const recommendedSeeds = getRecommendedSeeds(selectedClimate);

  return (
    <main className="min-h-screen pb-28 text-moss-950 lg:pb-0">
      <header className="sticky top-0 z-20 border-b border-moss-950/10 bg-paper/86 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <a className="flex items-center gap-3" href="#today" aria-label="PlantCare Calendar">
            <span className="brand-mark" aria-hidden="true">
              PC
            </span>
            <span>
              <span className="block text-xs font-black uppercase text-moss-700">PlantCare</span>
              <span className="block text-lg font-black leading-none tracking-tight text-moss-950">Calendar</span>
            </span>
          </a>

          <nav className="hidden items-center gap-1 rounded-lg border border-moss-950/10 bg-white/82 p-1 shadow-sm lg:flex">
            {navItems.map((item) => (
              <a
                className="rounded-md px-3 py-2 text-sm font-bold text-moss-800 transition hover:bg-mint-100"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 rounded-lg border border-emerald-700/15 bg-white/88 px-3 py-2 text-sm font-bold text-moss-900 shadow-sm sm:flex">
            <span className="status-dot" aria-hidden="true" />
            Demo seguro
          </div>
        </div>
      </header>

      <section className="hero-shell mx-auto grid max-w-7xl gap-5 px-4 pb-8 pt-5 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-10 lg:pt-8">
        <div className="hero-card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-mint-100">{dictionary.hero.kicker}</p>
              <h1 className="mt-3 max-w-2xl text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl">
                {dictionary.hero.title}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-mint-50/86 sm:text-lg">{dictionary.hero.body}</p>
            </div>
            <span className="rounded-md border border-white/18 bg-white/12 px-3 py-2 text-sm font-black text-mint-50">
              {locale.toUpperCase()}
            </span>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Metric label="Cultivos" value={plants.length.toString()} tone="light" />
            <Metric label="Pendientes" value={openTasks.toString()} tone="light" />
            <Metric label="Cuidado" value={`${careScore}%`} tone="light" />
          </div>
        </div>

        <section className="grow-visual-card" aria-labelledby="grow-preview-title">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-emerald-800">Grow log</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-moss-950" id="grow-preview-title">
                Vista diaria compacta
              </h2>
            </div>
            <span className="rounded-md bg-amber-100 px-3 py-2 text-xs font-black text-amber-900">Hoy</span>
          </div>

          <div className="mt-5 grid gap-3">
            <VisualPlantCard title="Patio norte" subtitle="Tomate Roma" value="62%" label="humedad" />
            <VisualPlantCard title="Balcon luminoso" subtitle="Lavanda" value="18 C" label="clima" />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <MiniStat label="Exterior" value={outdoorPlants.toString()} />
            <MiniStat label="Fotos" value="2" />
            <MiniStat label="Alertas" value="0" />
          </div>
        </section>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8" id="today">
        <section className="surface p-4 sm:p-5" aria-labelledby="today-title">
          <SectionHeader eyebrow="Panel principal" title="Tareas de hoy" />
          <div className="mt-5 grid gap-3">
            {tasks.map((task) => (
              <article className="task-row" key={task.id}>
                <span className={task.status === "done" ? "task-check done" : "task-check"} aria-hidden="true">
                  {task.status === "done" ? "OK" : ""}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-moss-950">{task.title}</h3>
                    <span className={task.status === "done" ? "pill pill-green" : "pill pill-amber"}>
                      {task.status === "done" ? "Hecha" : "Pendiente"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-stone-700">{task.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-black text-stone-600">
                    <span className="pill pill-soft">{task.frequency}</span>
                    <span className="pill pill-blue">{task.category}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="surface p-4 sm:p-5" aria-labelledby="weather-title">
          <SectionHeader eyebrow="Clima" title="Condiciones del espacio" />
          <div className="mt-5 grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
            <div className="weather-panel">
              <p className="eyebrow text-teal-900">{weather.providerLabel}</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-moss-950" id="weather-title">
                {weather.region}
              </h3>
              <p className="mt-3 text-sm leading-6 text-stone-700">{weather.message}</p>
            </div>
            <dl className="grid grid-cols-2 gap-3">
              {weather.preview.map((item) => (
                <div className="metric-tile" key={item.label}>
                  <dt className="text-xs font-black uppercase text-stone-500">{item.label}</dt>
                  <dd className="mt-2 text-2xl font-black tracking-tight text-moss-950">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </section>

      <section className="mx-auto mt-8 grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8" id="seeds">
        <section className="surface p-4 sm:p-5" aria-labelledby="seed-selector-title">
          <SectionHeader eyebrow="Semillas" title="Selector por clima" />
          <div className="mt-5 grid gap-3">
            <label className="grid gap-1 text-sm font-black text-moss-950">
              Tipo de semilla
              <select className="form-control" defaultValue="tomato-roma">
                {seedCatalog.map((seed) => (
                  <option key={seed.id} value={seed.id}>
                    {seed.crop} - {seed.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-black text-moss-950">
              Clima del lugar
              <select className="form-control" defaultValue={selectedClimate}>
                {seedClimateOptions.map((climate) => (
                  <option key={climate}>{climate}</option>
                ))}
              </select>
            </label>
            <div className="seed-result">
              <p className="text-sm font-black text-moss-950">Resultado demo</p>
              <p className="mt-1 text-sm leading-6 text-stone-700">
                Para clima {selectedClimate.toLowerCase()}, el banco sugiere {recommendedSeeds.length} opciones
                horticolas legales con ventana estimada de cosecha.
              </p>
            </div>
          </div>
        </section>

        <section className="surface p-4 sm:p-5" aria-labelledby="seed-bank-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <SectionHeader eyebrow="Banco demo" title="Compatibilidad y cosecha" />
            <span className="pill pill-blue">Horticola legal</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {recommendedSeeds.slice(0, 4).map((seed) => (
              <article className="seed-card" key={seed.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-moss-950">
                      {seed.crop} {seed.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-stone-600">{seed.seedType}</p>
                  </div>
                  <span className="pill pill-green">{seed.daysToHarvest}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-700">{seed.careNote}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {seed.climates.map((climate) => (
                    <span className="pill pill-soft text-xs font-black" key={climate}>
                      {climate}
                    </span>
                  ))}
                </div>
              </article>
            ))}
            <article className="seed-card border-amber-700/20 bg-amber-50/72">
              <h3 className="font-black text-moss-950">Cultivos regulados</h3>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                Se pueden registrar manualmente solo donde sean legales. El recomendador no calcula variedad, clima ni
                cosecha para cultivos regulados.
              </p>
            </article>
          </div>
        </section>
      </section>

      <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8" id="spaces">
        <SectionHeader eyebrow="Cultivos" title="Espacios y plantas" />
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {spaces.map((space) => (
            <article className="surface overflow-hidden" key={space.id}>
              <div className="space-banner">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-white">{space.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-mint-50/86">{space.region} - {space.mode}</p>
                </div>
                <span className="rounded-md bg-white/16 px-3 py-1.5 text-xs font-black text-white">
                  {space.privacyLevel}
                </span>
              </div>
              <div className="grid gap-0 divide-y divide-moss-950/10 p-4">
                {plants
                  .filter((plant) => plant.spaceId === space.id)
                  .map((plant) => (
                    <div className="plant-row" key={plant.id}>
                      <div className="plant-avatar" aria-hidden="true">
                        {plant.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h4 className="font-black text-moss-950">{plant.name}</h4>
                            <p className="mt-1 text-sm text-stone-600">{plant.variety} - inicio {plant.startedAt}</p>
                          </div>
                          <span className="pill pill-green">{plant.stage}</span>
                        </div>
                        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                          <PlantFact label="Maceta" value={plant.pot} />
                          <PlantFact label="Sustrato" value={plant.substrate} />
                          <PlantFact label="Luz" value={plant.lighting} />
                          <PlantFact label="Modo" value={plant.mode} />
                        </dl>
                      </div>
                    </div>
                  ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8" id="calendar">
        <SectionHeader eyebrow="Agenda" title="Calendario mensual" />
        <div className="surface mt-5 p-3 sm:p-5">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-black uppercase text-stone-500">
            {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
              <span className="py-2" key={`${day}-${index}`}>
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => (
              <div className={day.isCurrentMonth ? "day-cell" : "day-cell muted"} key={day.isoDate}>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-black">{day.label}</span>
                  {day.isToday ? <span className="today-dot" aria-label="Hoy" /> : null}
                </div>
                <div className="mt-2 grid gap-1">
                  {day.items.map((item) => (
                    <span className="truncate rounded-md bg-white px-1.5 py-1 text-[11px] font-black text-moss-900" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8" id="journal">
        <div className="surface p-4 sm:p-5">
          <SectionHeader eyebrow="Bitacora" title="Observaciones y fotos" />
          <div className="mt-5 grid gap-3">
            {entries.map((entry) => (
              <article className="journal-row" key={entry.id}>
                <div className="photo-thumb" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-black text-moss-950">{entry.title}</h3>
                    <span className="text-sm font-bold text-stone-600">{entry.createdAt}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-700">{entry.note}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-black text-moss-700">
                    {entry.tags.map((tag) => (
                      <span className="pill pill-soft" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <section className="surface p-4 sm:p-5" aria-labelledby="new-plant-title">
          <p className="eyebrow text-emerald-800">Alta rapida</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-moss-950" id="new-plant-title">
            Nueva planta
          </h2>
          <form className="mt-5 grid gap-3">
            <FormField label="Nombre" placeholder="Ej. Tomate patio" />
            <label className="grid gap-1 text-sm font-black text-moss-950">
              Variedad o semilla
              <select className="form-control" defaultValue="tomato-roma">
                {seedCatalog.map((seed) => (
                  <option key={seed.id} value={seed.id}>
                    {seed.crop} - {seed.name}
                  </option>
                ))}
              </select>
            </label>
            <FormField label="Fecha de inicio" placeholder="2026-07-17" />
            <FormField label="Region aproximada" placeholder="Ciudad o region, nunca direccion exacta" />
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Maceta" placeholder="10 L" />
              <FormField label="Sustrato" placeholder="Organico liviano" />
            </div>
            <label className="grid gap-1 text-sm font-black text-moss-950">
              Modalidad
              <select className="form-control">
                <option>Exterior</option>
                <option>Interior</option>
                <option>Invernadero</option>
              </select>
            </label>
            <button className="primary-button" type="button">
              Guardar demo
            </button>
          </form>
        </section>
      </section>

      <section className="mx-auto mt-8 max-w-7xl px-4 pb-12 sm:px-6 lg:px-8" id="privacy">
        <SectionHeader eyebrow="Cumplimiento" title="Privacidad y uso legal" />
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <InfoCard
            title="Consentimiento"
            body="El alta del usuario registra mayoria de edad, privacidad y uso exclusivo en jurisdicciones donde el cultivo sea legal."
          />
          <InfoCard
            title="Datos personales"
            body="La ubicacion se guarda como region aproximada. La app incluye base para exportar o eliminar todos los datos del usuario."
          />
          <InfoCard
            title="Limites del producto"
            body="El contenido se limita a seguimiento horticola general, mantenimiento y registro. No incluye guias para maximizar sustancias controladas ni evadir controles."
          />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="secondary-button" type="button">
            Exportar mis datos
          </button>
          <button className="dark-button" type="button">
            Solicitar eliminacion completa
          </button>
        </div>
      </section>

      <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-6 rounded-lg border border-moss-950/10 bg-white/94 p-1 shadow-soft backdrop-blur lg:hidden" aria-label="Navegacion principal">
        {navItems.map((item) => (
          <a className="rounded-md px-1 py-3 text-center text-[11px] font-black text-moss-900 hover:bg-mint-100" href={item.href} key={item.href}>
            {item.short}
          </a>
        ))}
      </nav>
    </main>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "light" }) {
  return (
    <div className={tone === "light" ? "metric-card light" : "metric-card"}>
      <p className="text-3xl font-black tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-bold">{label}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-moss-950/10 bg-white/72 p-3">
      <p className="text-2xl font-black tracking-tight text-moss-950">{value}</p>
      <p className="mt-1 text-xs font-black uppercase text-stone-500">{label}</p>
    </div>
  );
}

function VisualPlantCard({ title, subtitle, value, label }: { title: string; subtitle: string; value: string; label: string }) {
  return (
    <div className="visual-plant-row">
      <div className="plant-swatch" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-black text-moss-950">{title}</p>
        <p className="text-sm font-semibold text-stone-600">{subtitle}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-black text-moss-950">{value}</p>
        <p className="text-xs font-black uppercase text-stone-500">{label}</p>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="eyebrow text-emerald-800">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-black tracking-tight text-moss-950 sm:text-3xl">{title}</h2>
    </div>
  );
}

function PlantFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-black uppercase text-stone-500">{label}</dt>
      <dd className="mt-1 truncate font-bold text-moss-950">{value}</dd>
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

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="surface p-5">
      <h3 className="font-black text-moss-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-700">{body}</p>
    </article>
  );
}
