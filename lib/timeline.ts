import { addDays, expandEventOccurrences, getTodayIso } from "@/lib/calendar-events";
import type { CalendarEvent, CareEntry, Plant, Task } from "@/lib/types";

export type PlantTimelineType =
  | "event"
  | "maintenance"
  | "observation"
  | "photo"
  | "stage"
  | "task"
  | "watering";

export type PlantTimelineItem = {
  id: string;
  type: PlantTimelineType;
  title: string;
  body: string;
  date: string;
  badge: string;
  status?: "completed" | "pending";
  source: "calendar" | "entry" | "plant" | "task";
  photoDataUrl?: string;
};

export const plantTimelineFilters: Array<{ label: string; value: PlantTimelineType | "all" }> = [
  { label: "Todo", value: "all" },
  { label: "Notas", value: "observation" },
  { label: "Fotos", value: "photo" },
  { label: "Riego", value: "watering" },
  { label: "Tareas", value: "task" },
  { label: "Etapas", value: "stage" }
];

export function buildPlantTimeline({
  calendarEvents,
  entries,
  plant,
  tasks
}: {
  calendarEvents: CalendarEvent[];
  entries: CareEntry[];
  plant: Plant;
  tasks: Task[];
}) {
  const today = getTodayIso();
  const futureLimit = addDays(today, 90);
  const plantCalendarEvents = calendarEvents.filter((event) => event.plantId === plant.id);
  const calendarItems: PlantTimelineItem[] = expandEventOccurrences(plantCalendarEvents, "1970-01-01", futureLimit).map(
    (occurrence) => ({
      badge: occurrence.completed ? "Hecho" : "Pendiente",
      body: occurrence.description,
      date: occurrence.date,
      id: `calendar-${occurrence.occurrenceId}`,
      source: "calendar",
      status: occurrence.completed ? "completed" : "pending",
      title: occurrence.title,
      type: mapCalendarKindToTimelineType(occurrence.kind)
    })
  );
  const entryItems: PlantTimelineItem[] = entries
    .filter((entry) => entry.plantId === plant.id)
    .map((entry) => ({
      badge: entry.photoDataUrl ? "Foto" : entry.tags[0] ?? "Nota",
      body: entry.note,
      date: entry.createdAt,
      id: `entry-${entry.id}`,
      photoDataUrl: entry.photoDataUrl,
      source: "entry",
      title: entry.title,
      type: entry.photoDataUrl ? "photo" : "observation"
    }));
  const taskItems: PlantTimelineItem[] = tasks
    .filter((task) => task.plantId === plant.id)
    .map((task) => ({
      badge: task.status === "done" ? "Hecha" : "Pendiente",
      body: task.description,
      date: task.dueDate ?? plant.startedAt,
      id: `task-${task.id}`,
      source: "task",
      status: task.status === "done" ? "completed" : "pending",
      title: task.title,
      type: task.category === "Riego" ? "watering" : "task"
    }));
  const plantItems: PlantTimelineItem[] = [
    {
      badge: "Inicio",
      body: `Inicio declarado para ${plant.variety}. Etapa actual: ${plant.stage}.`,
      date: plant.startedAt,
      id: `plant-start-${plant.id}`,
      source: "plant",
      title: "Inicio del ciclo",
      type: "stage"
    }
  ];

  return [...calendarItems, ...entryItems, ...taskItems, ...plantItems].sort((first, second) => {
    const dateOrder = second.date.localeCompare(first.date);
    return dateOrder === 0 ? first.title.localeCompare(second.title) : dateOrder;
  });
}

function mapCalendarKindToTimelineType(kind: CalendarEvent["kind"]): PlantTimelineType {
  if (kind === "watering") return "watering";
  if (kind === "photo") return "photo";
  if (kind === "cleaning") return "maintenance";
  return "event";
}
