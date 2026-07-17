import { AppShell } from "@/components/app-shell";
import { demoCalendarDays, demoEntries, demoPlants, demoSpaces, demoTasks } from "@/lib/demo-data";
import { getDictionary, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <AppShell
      calendarDays={demoCalendarDays}
      dictionary={dictionary}
      entries={demoEntries}
      locale={locale}
      plants={demoPlants}
      spaces={demoSpaces}
      tasks={demoTasks}
    />
  );
}
