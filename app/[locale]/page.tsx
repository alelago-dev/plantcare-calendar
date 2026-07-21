import { isLocale } from "@/lib/i18n";
import { getSectionHref } from "@/lib/navigation";
import type { Route } from "next";
import { notFound, redirect } from "next/navigation";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  redirect(getSectionHref(locale, "today") as Route);
}
