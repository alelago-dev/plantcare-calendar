import { isLocale } from "@/lib/i18n";
import { getInternalSectionHref } from "@/lib/navigation";
import type { Route } from "next";
import { notFound, redirect } from "next/navigation";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  redirect(getInternalSectionHref(locale, "today") as Route);
}
