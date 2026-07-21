import type { CalendarDay, CalendarEvent, CareEntry, GrowSpace, Plant, Task } from "@/lib/types";

export const demoSpaces: GrowSpace[] = [
  {
    id: "space-patio",
    name: "Patio norte",
    mode: "Exterior",
    region: "Buenos Aires, AR",
    privacyLevel: "Region aproximada"
  },
  {
    id: "space-balcony",
    name: "Balcon luminoso",
    mode: "Invernadero",
    region: "Region metropolitana",
    privacyLevel: "Interior privado"
  }
];

export const demoPlants: Plant[] = [
  {
    id: "plant-roma",
    spaceId: "space-patio",
    name: "Tomate Roma",
    variety: "Roma",
    startedAt: "2026-07-01",
    stage: "Crecimiento",
    mode: "Exterior",
    pot: "20 L",
    substrate: "Organico aireado",
    lighting: "Sol de manana"
  },
  {
    id: "plant-basil",
    spaceId: "space-patio",
    name: "Albahaca",
    variety: "Genovesa",
    startedAt: "2026-07-08",
    stage: "Plantin",
    mode: "Exterior",
    pot: "8 L",
    substrate: "Compost y fibra",
    lighting: "Media sombra"
  },
  {
    id: "plant-lavender",
    spaceId: "space-balcony",
    name: "Lavanda",
    variety: "Dentata",
    startedAt: "2026-06-20",
    stage: "Establecida",
    mode: "Invernadero",
    pot: "12 L",
    substrate: "Drenante",
    lighting: "Luz indirecta"
  }
];

export const demoTasks: Task[] = [
  {
    id: "task-moisture",
    title: "Revisar humedad del sustrato",
    description: "Confirmar con tacto o sensor antes de decidir si corresponde regar.",
    status: "open",
    frequency: "Diaria",
    category: "Riego",
    dueDate: "2026-07-21",
    plantId: "plant-roma"
  },
  {
    id: "task-photo",
    title: "Registrar fotografia semanal",
    description: "Agregar una foto para comparar cambios visibles en la bitacora.",
    status: "open",
    frequency: "Semanal",
    category: "Registro",
    dueDate: "2026-07-21",
    plantId: "plant-basil"
  },
  {
    id: "task-clean",
    title: "Limpiar bandejas y herramientas",
    description: "Mantener el espacio ordenado para reducir riesgos sanitarios generales.",
    status: "done",
    frequency: "Recurrente",
    category: "Mantenimiento",
    dueDate: "2026-07-19",
    plantId: "plant-lavender"
  }
];

export const demoCalendarEvents: CalendarEvent[] = [
  {
    id: "event-moisture-roma",
    plantId: "plant-roma",
    title: "Revisar humedad",
    description: "Recordatorio manual para decidir si corresponde riego.",
    kind: "watering",
    startDate: "2026-07-21",
    recurrence: {
      active: true,
      everyDays: 3,
      endDate: "2026-08-15"
    },
    completedDates: [],
    source: "horticultural"
  },
  {
    id: "event-photo-basil",
    plantId: "plant-basil",
    title: "Foto semanal",
    description: "Registro visual para la bitacora.",
    kind: "photo",
    startDate: "2026-07-21",
    recurrence: {
      active: true,
      everyDays: 7,
      endDate: "2026-08-31"
    },
    completedDates: [],
    source: "horticultural"
  },
  {
    id: "event-clean-lavender",
    plantId: "plant-lavender",
    title: "Limpieza de espacio",
    description: "Mantenimiento general de bandejas y herramientas.",
    kind: "cleaning",
    startDate: "2026-07-19",
    completedDates: ["2026-07-19"],
    source: "horticultural"
  }
];

export const demoEntries: CareEntry[] = [
  {
    id: "entry-1",
    plantId: "plant-roma",
    title: "Control visual general",
    createdAt: "2026-07-17",
    note: "Hojas firmes, sustrato fresco y sin senales visibles de plagas. Se pospone riego hasta nueva revision.",
    tags: ["observacion", "salud"]
  },
  {
    id: "entry-2",
    plantId: "plant-lavender",
    title: "Mantenimiento del patio",
    createdAt: "2026-07-15",
    note: "Se ordenaron macetas, se limpio el area de trabajo y se actualizaron recordatorios recurrentes.",
    tags: ["mantenimiento", "tareas"]
  }
];

export const demoCalendarDays: CalendarDay[] = Array.from({ length: 35 }, (_, index) => {
  const day = index - 1;
  const label = day < 1 ? `${29 + index}` : `${day}`;
  const isCurrentMonth = day >= 1 && day <= 31;
  const isoDay = isCurrentMonth ? String(day).padStart(2, "0") : "00";

  return {
    isoDate: `2026-07-${isoDay}-${index}`,
    label,
    isToday: day === 17,
    isCurrentMonth,
    items:
      day === 17
        ? ["Humedad", "Foto"]
        : day === 19
          ? ["Limpieza"]
          : day === 22
            ? ["Revision"]
            : []
  };
});
