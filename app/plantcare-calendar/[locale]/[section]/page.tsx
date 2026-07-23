import { isLocale } from "@/lib/i18n";
import { allSectionStaticParams, getInternalSectionHref, getSectionFromSlug } from "@/lib/navigation";
import type { Route } from "next";
import { notFound, redirect } from "next/navigation";

export function generateStaticParams() {
  return allSectionStaticParams;
}

export default async function DuplicateBasePathRedirectPage({
  params
}: {
  params: Promise<{ locale: string; section: string }>;
}) {
  const { locale, section } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const currentSection = getSectionFromSlug(locale, section);

  if (!currentSection) {
    notFound();
  }

  redirect(getInternalSectionHref(locale, currentSection) as Route);
}
