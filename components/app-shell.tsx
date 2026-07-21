"use client";

import { useEffect, useMemo, useState } from "react";

import { SeedsSection } from "@/components/seeds-section";
import {
  buildMonthGrid,
  buildWeekGrid,
  createEventId,
  expandEventOccurrences,
  getEventKindLabel,
  getTodayIso
} from "@/lib/calendar-events";
import { getSectionHref, navigationByLocale, type AppSection } from "@/lib/navigation";
import { seedCatalog } from "@/lib/seed-catalog";
import type { CalendarEvent, CalendarEventOccurrence, CareEntry, Dictionary, GrowSpace, Locale, Plant, Task } from "@/lib/types";
import { getWeatherReadiness } from "@/lib/weather";

type AppShellProps = {
  calendarEvents: CalendarEvent[];
  currentSection: AppSection;
  dictionary: Dictionary;
  entries: CareEntry[];
  locale: Locale;
  plants: Plant[];
  spaces: GrowSpace[];
  tasks: Task[];
};

type AgendaItem = {
  id: string;
  title: string;
  description: string;
  status: "open" | "done";
  frequency: Task["frequency"];
  category: Task["category"];
  plantId?: string;
  source: "task" | "event";
  eventId?: string;
  occurrenceDate?: string;
};

type QuickPlantInput = {
  name: string;
  seedId: string;
  startDate: string;
  region: string;
  mode: Plant["mode"];
  pot: string;
  substrate: string;
  reminderOffset: number;
  recurrenceDays: number;
};

const careScore = 86;
const manualPlantId = "plant-manual-regulated";
const storageKeys = {
  calendarDate: "plantcare-calendar-selected-date",
  events: "plantcare-calendar-events",
  plants: "plantcare-plants",
  tasks: "plantcare-tasks"
};

export function AppShell({
  calendarEvents,
  currentSection,
  dictionary,
  entries,
  locale,
  plants,
  spaces,
  tasks
}: AppShellProps) {
  const [plantState, setPlantState] = useStoredState(storageKeys.plants, plants);
  const [taskState, setTaskState] = useStoredState(storageKeys.tasks, tasks);
  const [eventState, setEventState] = useStoredState(storageKeys.events, calendarEvents);
  const todayIso = getTodayIso();
  const weather = getWeatherReadiness(spaces[0]?.region ?? "Region sin definir");
  const navItems = navigationByLocale[locale];
  const todayOccurrences = useMemo(
    () => expandEventOccurrences(eventState, todayIso, todayIso),
    [eventState, todayIso]
  );
  const agendaItems = useMemo(
    () => buildAgendaItems(taskState, todayOccurrences),
    [taskState, todayOccurrences]
  );
  const openTasks = agendaItems.filter((task) => task.status === "open").length;
  const todayHref = getSectionHref(locale, "today");

  function handleToggleTask(item: AgendaItem) {
    if (item.source === "event" && item.eventId && item.occurrenceDate) {
      setEventState((events) => toggleEventCompletion(events, item.eventId!, item.occurrenceDate!));
      return;
    }

    setTaskState((existingTasks) =>
      existingTasks.map((task) =>
        task.id === item.id ? { ...task, status: task.status === "done" ? "open" : "done" } : task
      )
    );
  }

  function handleAddManualEvents(events: CalendarEvent[]) {
    const manualPlant: Plant = {
      id: manualPlantId,
      lighting: "Declarado por usuario",
      mode: "Interior",
      name: "Cultivo manual",
      pot: "Declarado por usuario",
      spaceId: spaces[0]?.id ?? "space-patio",
      stage: "Agenda manual",
      startedAt: todayIso,
      substrate: "Declarado por usuario",
      variety: "Declarada por usuario"
    };
    const nextPlants = plantState.some((plant) => plant.id === manualPlantId)
      ? plantState
      : [...plantState, manualPlant];
    const nextEvents = [...events, ...eventState];

    setPlantState(nextPlants);
    setEventState(nextEvents);
    persistStoredState(storageKeys.plants, nextPlants);
    persistStoredState(storageKeys.events, nextEvents);
    persistCalendarDate(events[0]?.startDate ?? todayIso);
  }

  function handleCreateQuickPlant(input: QuickPlantInput) {
    const selectedSeed = seedCatalog.find((seed) => seed.id === input.seedId);
    const plantId = createEventId("plant");
    const plantName = input.name.trim() || selectedSeed?.crop || "Nueva planta";
    const nextPlant: Plant = {
      id: plantId,
      lighting: "Definida por usuario",
      mode: input.mode,
      name: plantName,
      pot: input.pot,
      spaceId: spaces[0]?.id ?? "space-patio",
      stage: "Inicio",
      startedAt: input.startDate,
      substrate: input.substrate,
      variety: selectedSeed?.name ?? "Semilla horticola"
    };
    const nextEvents: CalendarEvent[] = [
      {
        completedDates: [],
        description: "Evento creado desde el alta rapida de planta.",
        id: createEventId("event-review"),
        kind: "review",
        plantId,
        source: "horticultural",
        startDate: input.startDate,
        title: "Revision inicial"
      }
    ];

    if (input.reminderOffset > 0) {
      nextEvents.push({
        completedDates: [],
        description: "Recordatorio horticola declarado en el alta rapida.",
        id: createEventId("event-water"),
        kind: "watering",
        plantId,
        recurrence:
          input.recurrenceDays > 0
            ? {
                active: true,
                everyDays: input.recurrenceDays
              }
            : undefined,
        source: "horticultural",
        startDate: offsetDate(input.startDate, input.reminderOffset),
        title: "Revisar riego"
      });
    }

    const nextPlantState = [nextPlant, ...plantState];
    const nextEventState = [...nextEvents, ...eventState];

    setPlantState(nextPlantState);
    setEventState(nextEventState);
    persistStoredState(storageKeys.plants, nextPlantState);
    persistStoredState(storageKeys.events, nextEventState);
    goToCalendar(nextEvents[0]?.startDate ?? todayIso, locale);
  }

  return (
    <main className="min-h-screen pb-28 text-moss-950 lg:pb-0">
      <header className="sticky top-0 z-20 border-b border-moss-950/10 bg-paper/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <a className="flex items-center gap-3" href={todayHref} aria-label="PlantCare Calendar">
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
                className={currentSection === item.key ? "desktop-nav-item active" : "desktop-nav-item"}
                href={getSectionHref(locale, item.key)}
                key={item.key}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LegalInfoSummary />
            <div className="hidden items-center gap-2 rounded-lg border border-emerald-700/15 bg-white/88 px-3 py-2 text-sm font-bold text-moss-900 shadow-sm sm:flex">
              <span className="status-dot" aria-hidden="true" />
              Demo seguro
            </div>
          </div>
        </div>
      </header>

      {currentSection === "today" ? (
        <TodaySection
          agendaItems={agendaItems}
          careScore={careScore}
          dictionary={dictionary}
          onToggleTask={handleToggleTask}
          openTasks={openTasks}
          plants={plantState}
          weather={weather}
        />
      ) : null}

      {currentSection === "seeds" ? (
        <SeedsSection
          calendarHref={getSectionHref(locale, "calendar")}
          locale={locale}
          onCreateManualEvents={handleAddManualEvents}
        />
      ) : null}
      {currentSection === "spaces" ? <SpacesSection plants={plantState} spaces={spaces} /> : null}
      {currentSection === "calendar" ? (
        <CalendarSection
          events={eventState}
          locale={locale}
          onToggleOccurrence={(eventId, date) => setEventState((events) => toggleEventCompletion(events, eventId, date))}
          plants={plantState}
        />
      ) : null}
      {currentSection === "journal" ? <JournalSection entries={entries} onCreateQuickPlant={handleCreateQuickPlant} /> : null}
      {currentSection === "privacy" ? <PrivacySection /> : null}

      <nav className="mobile-tab-bar" aria-label="Navegacion principal">
        {navItems.map((item) => (
          <a className={currentSection === item.key ? "mobile-tab active" : "mobile-tab"} href={getSectionHref(locale, item.key)} key={item.key}>
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.short}</span>
          </a>
        ))}
      </nav>
    </main>
  );
}

function TodaySection({
  agendaItems,
  careScore,
  dictionary,
  onToggleTask,
  openTasks,
  plants,
  weather
}: {
  agendaItems: AgendaItem[];
  careScore: number;
  dictionary: Dictionary;
  onToggleTask: (item: AgendaItem) => void;
  openTasks: number;
  plants: Plant[];
  weather: ReturnType<typeof getWeatherReadiness>;
}) {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-5 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <div className="intro-panel">
          <div className="min-w-0">
            <p className="eyebrow text-emerald-800">{dictionary.hero.kicker}</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-moss-950 sm:text-3xl">PlantCare Calendar</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-700">{dictionary.hero.body}</p>
          </div>
          <div className="summary-grid">
            <MiniStat label="Cultivos" value={plants.length.toString()} />
            <MiniStat featured label="Pendientes" value={openTasks.toString()} />
            <MiniStat label="Cuidado" value={`${careScore}%`} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <section className="surface p-4 sm:p-5" aria-labelledby="today-title">
          <SectionHeader eyebrow="Panel principal" title="Tareas de hoy" />
          <div className="mt-5 grid gap-3">
            {agendaItems.map((task, index) => (
              <TaskCard
                isPrimary={index === 0 && task.status !== "done"}
                key={`${task.source}-${task.id}`}
                onToggle={() => onToggleTask(task)}
                plant={plants.find((plant) => plant.id === task.plantId)}
                task={task}
              />
            ))}
          </div>
        </section>

        <section className="surface p-4 sm:p-5" aria-labelledby="weather-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <SectionHeader eyebrow="Clima" title="Condiciones del espacio" />
            <span className="pill pill-blue">Datos de ejemplo</span>
          </div>
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
    </>
  );
}

function SpacesSection({ plants, spaces }: { plants: Plant[]; spaces: GrowSpace[] }) {
  return (
    <section className="mx-auto mt-7 max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Cultivos" title="Espacios y plantas" />
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {spaces.map((space) => (
          <article className="surface overflow-hidden" key={space.id}>
            <div className="space-banner">
              <div>
                <h3 className="text-xl font-black tracking-tight text-white">{space.name}</h3>
                <p className="mt-1 text-sm font-semibold text-mint-50/86">
                  {space.region} - {space.mode}
                </p>
              </div>
              <span className="rounded-md bg-white/16 px-3 py-1.5 text-xs font-black text-white">{space.privacyLevel}</span>
            </div>
            <div className="grid gap-0 divide-y divide-moss-950/10 p-4">
              {plants
                .filter((plant) => plant.spaceId === space.id)
                .map((plant) => (
                  <details className="plant-row-details" id={plant.id} key={plant.id}>
                    <summary>
                      <PlantAvatar plant={plant} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-black text-moss-950">{plant.name}</span>
                        <span className="mt-1 block text-sm text-stone-600">{plant.variety}</span>
                      </span>
                      <span className="pill pill-green">{plant.stage}</span>
                    </summary>
                    <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                      <PlantFact label="Maceta" value={plant.pot} />
                      <PlantFact label="Sustrato" value={plant.substrate} />
                      <PlantFact label="Luz" value={plant.lighting} />
                      <PlantFact label="Modo" value={plant.mode} />
                    </dl>
                  </details>
                ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CalendarSection({
  events,
  locale,
  onToggleOccurrence,
  plants
}: {
  events: CalendarEvent[];
  locale: Locale;
  onToggleOccurrence: (eventId: string, date: string) => void;
  plants: Plant[];
}) {
  const todayIso = getTodayIso();
  const [anchorDate] = useState(() => getStoredCalendarDate(todayIso));
  const [viewMode, setViewMode] = useState<"month" | "week">(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches ? "week" : "month"
  );
  const [selectedDate, setSelectedDate] = useState(() => getStoredCalendarDate(todayIso));

  const days = useMemo(
    () => (viewMode === "month" ? buildMonthGrid(anchorDate) : buildWeekGrid(anchorDate)),
    [anchorDate, viewMode]
  );
  const firstDate = days[0]?.isoDate ?? todayIso;
  const lastDate = days[days.length - 1]?.isoDate ?? todayIso;
  const occurrences = useMemo(() => expandEventOccurrences(events, firstDate, lastDate), [events, firstDate, lastDate]);
  const selectedOccurrences = occurrences.filter((occurrence) => occurrence.date === selectedDate);

  return (
    <section className="mx-auto mt-7 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader eyebrow="Agenda" title={viewMode === "month" ? "Calendario mensual" : "Calendario semanal"} />
        <div className="view-toggle" aria-label="Vista de calendario">
          <button className={viewMode === "month" ? "active" : ""} onClick={() => setViewMode("month")} type="button">
            Mes
          </button>
          <button className={viewMode === "week" ? "active" : ""} onClick={() => setViewMode("week")} type="button">
            Semana
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-stone-600">
        <span className="event-legend event-water">Riego</span>
        <span className="event-legend event-photo">Foto</span>
        <span className="event-legend event-clean">Limpieza</span>
        <span className="event-legend event-review">Revision</span>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="surface p-3 sm:p-5">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-black uppercase text-stone-500">
            {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
              <span className="py-2" key={`${day}-${index}`}>
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayOccurrences = occurrences.filter((occurrence) => occurrence.date === day.isoDate);

              return (
                <button
                  className={`${day.isCurrentMonth ? "day-cell" : "day-cell muted"} ${selectedDate === day.isoDate ? "selected" : ""}`}
                  key={day.isoDate}
                  onClick={() => setSelectedDate(day.isoDate)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-black">{day.label}</span>
                    {day.isToday ? <span className="today-dot" aria-label="Hoy" /> : null}
                  </div>
                  <div className="mt-2 grid gap-1">
                    {dayOccurrences.slice(0, 3).map((occurrence) => (
                      <span className={`calendar-event ${getEventClass(occurrence.kind)}`} key={occurrence.occurrenceId}>
                        {occurrence.title}
                      </span>
                    ))}
                    {dayOccurrences.length > 3 ? <span className="calendar-event event-review">+{dayOccurrences.length - 3}</span> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="surface p-4 sm:p-5" aria-live="polite">
          <p className="eyebrow text-emerald-800">Detalle del dia</p>
          <h3 className="mt-1 text-lg font-black tracking-tight text-moss-950">{formatDisplayDate(selectedDate)}</h3>
          <div className="mt-4 grid gap-3">
            {selectedOccurrences.length > 0 ? (
              selectedOccurrences.map((occurrence) => (
                <CalendarOccurrenceCard
                  key={occurrence.occurrenceId}
                  locale={locale}
                  occurrence={occurrence}
                  onToggle={() => onToggleOccurrence(occurrence.eventId, occurrence.date)}
                  plant={plants.find((plant) => plant.id === occurrence.plantId)}
                />
              ))
            ) : (
              <p className="rounded-lg border border-moss-950/10 bg-white/70 p-3 text-sm font-bold text-stone-600">
                No hay eventos para este dia.
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function CalendarOccurrenceCard({
  locale,
  occurrence,
  onToggle,
  plant
}: {
  locale: Locale;
  occurrence: CalendarEventOccurrence;
  onToggle: () => void;
  plant?: Plant;
}) {
  return (
    <article className="calendar-detail-card">
      <div className="flex items-start gap-3">
        {plant ? <PlantAvatar plant={plant} /> : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`event-legend ${getEventClass(occurrence.kind)}`}>{getEventKindLabel(occurrence.kind)}</span>
            <span className={occurrence.completed ? "pill pill-green" : "pill pill-amber"}>
              {occurrence.completed ? "Hecho" : "Pendiente"}
            </span>
          </div>
          <h4 className="mt-2 font-black text-moss-950">{occurrence.title}</h4>
          <p className="mt-1 text-sm font-semibold text-stone-600">{plant?.name ?? "Planta sin detalle"}</p>
          <p className="mt-2 text-sm leading-6 text-stone-700">{occurrence.description}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="secondary-button" onClick={onToggle} type="button">
          {occurrence.completed ? "Marcar pendiente" : "Marcar hecho"}
        </button>
        {plant ? (
          <a className="secondary-button" href={`${getSectionHref(locale, "spaces")}#${plant.id}`}>
            Ver planta
          </a>
        ) : null}
      </div>
    </article>
  );
}

function JournalSection({ entries, onCreateQuickPlant }: { entries: CareEntry[]; onCreateQuickPlant: (input: QuickPlantInput) => void }) {
  return (
    <section className="mx-auto mt-7 grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
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
        <h2 className="mt-2 text-xl font-black tracking-tight text-moss-950 sm:text-2xl" id="new-plant-title">
          Nueva planta
        </h2>
        <DesktopQuickPlantForm onCreateQuickPlant={onCreateQuickPlant} />
        <MobileQuickPlantWizard onCreateQuickPlant={onCreateQuickPlant} />
      </section>
    </section>
  );
}

function PrivacySection() {
  return (
    <section className="mx-auto mt-8 max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
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
  );
}

function TaskCard({
  isPrimary,
  onToggle,
  plant,
  task
}: {
  isPrimary: boolean;
  onToggle: () => void;
  plant?: Plant;
  task: AgendaItem;
}) {
  return (
    <article className={isPrimary ? "task-row task-priority" : "task-row"} key={task.id}>
      <button className={task.status === "done" ? "task-check done" : "task-check"} onClick={onToggle} type="button">
        {task.status === "done" ? "OK" : ""}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-black text-moss-950">{task.title}</h3>
          <span className={task.status === "done" ? "pill pill-green" : "pill pill-amber"}>
            {task.status === "done" ? "Hecha" : "Pendiente"}
          </span>
          {isPrimary ? <span className="pill pill-blue">Prioritaria</span> : null}
        </div>
        <p className="mt-1 text-sm leading-6 text-stone-700">{task.description}</p>
        {plant ? <p className="mt-1 text-xs font-black text-stone-500">{plant.name}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-black text-stone-600">
          <span className="pill pill-soft">{task.frequency}</span>
          <span className="pill pill-blue">{task.category}</span>
        </div>
      </div>
    </article>
  );
}

function DesktopQuickPlantForm({ onCreateQuickPlant }: { onCreateQuickPlant: (input: QuickPlantInput) => void }) {
  return (
    <QuickPlantForm className="quick-plant-desktop mt-5 grid gap-3" onCreateQuickPlant={onCreateQuickPlant} />
  );
}

function MobileQuickPlantWizard({ onCreateQuickPlant }: { onCreateQuickPlant: (input: QuickPlantInput) => void }) {
  return (
    <div className="quick-plant-mobile mt-5 grid gap-3">
      <details className="reference-details" open>
        <summary>Alta guiada en 3 pasos</summary>
        <QuickPlantForm className="mt-3 grid gap-3" onCreateQuickPlant={onCreateQuickPlant} />
      </details>
    </div>
  );
}

function QuickPlantForm({
  className,
  onCreateQuickPlant
}: {
  className: string;
  onCreateQuickPlant: (input: QuickPlantInput) => void;
}) {
  const todayIso = getTodayIso();
  const horticultureSeeds = seedCatalog.filter((seed) => !seed.regulated);
  const [name, setName] = useState("");
  const [seedId, setSeedId] = useState(horticultureSeeds[0]?.id ?? "tomato-roma");
  const [startDate, setStartDate] = useState(todayIso);
  const [region, setRegion] = useState("Buenos Aires, AR");
  const [mode, setMode] = useState<Plant["mode"]>("Exterior");
  const [pot, setPot] = useState("10 L");
  const [substrate, setSubstrate] = useState("Organico liviano");
  const [reminderOffset, setReminderOffset] = useState(3);
  const [recurrenceDays, setRecurrenceDays] = useState(0);

  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        onCreateQuickPlant({ name, seedId, startDate, region, mode, pot, substrate, reminderOffset, recurrenceDays });
      }}
    >
      <FormField label="Nombre" onChange={setName} placeholder="Ej. Tomate patio" value={name} />
      <SeedSelect onChange={setSeedId} value={seedId} />
      <FormField label="Fecha de inicio" onChange={setStartDate} placeholder={todayIso} value={startDate} />
      <FormSelect label="Region aproximada" onChange={setRegion} options={["Buenos Aires, AR", "Region metropolitana", "Otra region"]} value={region} />
      <div className="grid gap-3 sm:grid-cols-2">
        <FormSelect label="Maceta" onChange={setPot} options={["5 L", "10 L", "15 L", "20 L", "25 L"]} value={pot} />
        <FormSelect
          label="Sustrato"
          onChange={setSubstrate}
          options={["Organico liviano", "Compost y fibra", "Drenante", "Universal"]}
          value={substrate}
        />
      </div>
      <ModeSelect onChange={setMode} value={mode} />
      <div className="grid gap-3 sm:grid-cols-2">
        <FormSelect
          label="Primer recordatorio"
          onChange={(value) => setReminderOffset(Number(value))}
          options={["0", "1", "3", "7"]}
          value={String(reminderOffset)}
          valueLabels={{ "0": "Sin recordatorio", "1": "Manana", "3": "En 3 dias", "7": "En 7 dias" }}
        />
        <FormSelect
          label="Repetir"
          onChange={(value) => setRecurrenceDays(Number(value))}
          options={["0", "3", "7", "14"]}
          value={String(recurrenceDays)}
          valueLabels={{ "0": "No repetir", "3": "Cada 3 dias", "7": "Cada 7 dias", "14": "Cada 14 dias" }}
        />
      </div>
      <button className="primary-button" type="submit">
        Guardar y crear eventos
      </button>
    </form>
  );
}

function LegalInfoSummary() {
  return (
    <details className="legal-popover">
      <summary>Info legal</summary>
      <div className="legal-popover-panel">
        <p className="font-black text-moss-950">Uso legal y privacidad</p>
        <p className="mt-2 text-sm leading-6 text-stone-700">
          Solo para jurisdicciones donde el cultivo sea legal. La ubicacion debe ser aproximada y el usuario puede
          exportar o eliminar sus datos.
        </p>
      </div>
    </details>
  );
}

function MiniStat({ featured = false, label, value }: { featured?: boolean; label: string; value: string }) {
  return (
    <div className={featured ? "metric-card featured" : "metric-card"}>
      <p className="text-2xl font-black tracking-tight text-moss-950">{value}</p>
      <p className="mt-1 text-xs font-black uppercase text-stone-500">{label}</p>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="eyebrow text-emerald-800">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-black tracking-tight text-moss-950 sm:text-2xl">{title}</h2>
    </div>
  );
}

function PlantAvatar({ plant }: { plant: Plant }) {
  return (
    <span className="plant-avatar" aria-hidden="true">
      {plant.name.slice(0, 2).toUpperCase()}
    </span>
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

function SeedSelect({ onChange, value }: { onChange: (value: string) => void; value: string }) {
  const horticultureSeeds = seedCatalog.filter((seed) => !seed.regulated);

  return (
    <label className="grid gap-1 text-sm font-black text-moss-950">
      Variedad o semilla
      <select className="form-control" value={value} onChange={(event) => onChange(event.target.value)}>
        {horticultureSeeds.map((seed) => (
          <option key={seed.id} value={seed.id}>
            {seed.crop} - {seed.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function ModeSelect({ onChange, value }: { onChange: (value: Plant["mode"]) => void; value: Plant["mode"] }) {
  return (
    <label className="grid gap-1 text-sm font-black text-moss-950">
      Modalidad
      <select className="form-control" value={value} onChange={(event) => onChange(event.target.value as Plant["mode"])}>
        <option>Exterior</option>
        <option>Interior</option>
        <option>Invernadero</option>
      </select>
    </label>
  );
}

function FormField({
  label,
  onChange,
  placeholder,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-black text-moss-950">
      {label}
      <input className="form-control" onChange={(event) => onChange(event.target.value)} placeholder={placeholder} value={value} />
    </label>
  );
}

function FormSelect({
  label,
  onChange,
  options,
  value,
  valueLabels
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
  valueLabels?: Record<string, string>;
}) {
  return (
    <label className="grid gap-1 text-sm font-black text-moss-950">
      {label}
      <select className="form-control" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {valueLabels?.[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="info-card p-5">
      <h3 className="font-black text-moss-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-700">{body}</p>
    </article>
  );
}

function getTaskPriority(task: AgendaItem) {
  if (task.status === "done") return 10;
  if (task.category === "Riego") return 0;
  if (task.category === "Registro") return 1;
  return 2;
}

function getEventClass(kind: CalendarEventOccurrence["kind"]) {
  if (kind === "watering") return "event-water";
  if (kind === "photo") return "event-photo";
  if (kind === "cleaning") return "event-clean";
  return "event-review";
}

function buildAgendaItems(tasks: Task[], occurrences: CalendarEventOccurrence[]): AgendaItem[] {
  const taskItems: AgendaItem[] = tasks.map((task) => ({
    category: task.category,
    description: task.description,
    frequency: task.frequency,
    id: task.id,
    plantId: task.plantId,
    source: "task",
    status: task.status,
    title: task.title
  }));
  const eventItems: AgendaItem[] = occurrences.map((occurrence) => ({
    category: eventKindToTaskCategory(occurrence.kind),
    description: occurrence.description,
    eventId: occurrence.eventId,
    frequency: "Manual",
    id: occurrence.occurrenceId,
    occurrenceDate: occurrence.date,
    plantId: occurrence.plantId,
    source: "event",
    status: occurrence.completed ? "done" : "open",
    title: occurrence.title
  }));

  return [...taskItems, ...eventItems].sort((first, second) => getTaskPriority(first) - getTaskPriority(second));
}

function eventKindToTaskCategory(kind: CalendarEventOccurrence["kind"]): Task["category"] {
  if (kind === "watering") return "Riego";
  if (kind === "cleaning") return "Mantenimiento";
  if (kind === "photo") return "Registro";
  return "Observacion";
}

function formatDisplayDate(isoDate: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(`${isoDate}T00:00:00`));
}

function offsetDate(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
}

function toggleEventCompletion(events: CalendarEvent[], eventId: string, date: string) {
  return events.map((event) => {
    if (event.id !== eventId) return event;

    const isCompleted = event.completedDates.includes(date);

    return {
      ...event,
      completedDates: isCompleted
        ? event.completedDates.filter((completedDate) => completedDate !== date)
        : [...event.completedDates, date]
    };
  });
}

function useStoredState<T>(key: string, initialState: T) {
  const [state, setState] = useState(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(key);

      if (storedValue) {
        setState(JSON.parse(storedValue) as T);
      }
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(key, JSON.stringify(state));
    }
  }, [hydrated, key, state]);

  return [state, setState] as const;
}

function goToCalendar(selectedDate: string, locale: Locale) {
  persistCalendarDate(selectedDate);
  window.location.assign(getSectionHref(locale, "calendar"));
}

function getStoredCalendarDate(fallbackDate: string) {
  if (typeof window === "undefined") {
    return fallbackDate;
  }

  return window.localStorage.getItem(storageKeys.calendarDate) ?? fallbackDate;
}

function persistStoredState<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

function persistCalendarDate(selectedDate: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKeys.calendarDate, selectedDate);
  }
}
