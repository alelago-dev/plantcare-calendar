import { AppShell } from "@/components/app-shell";
import { demoCalendarEvents, demoEntries, demoPlants, demoSpaces, demoTasks } from "@/lib/demo-data";
import { getDictionary, isLocale } from "@/lib/i18n";
import { allSectionStaticParams, getSectionFromSlug } from "@/lib/navigation";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return allSectionStaticParams;
}

export default async function SectionPage({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale, section } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const currentSection = getSectionFromSlug(locale, section);

  if (!currentSection) {
    notFound();
  }

  return (
    <AppShell
      calendarEvents={demoCalendarEvents}
      currentSection={currentSection}
      dictionary={getDictionary(locale)}
      entries={demoEntries}
      locale={locale}
      plants={demoPlants}
      spaces={demoSpaces}
      tasks={demoTasks}
    />
  );
}
