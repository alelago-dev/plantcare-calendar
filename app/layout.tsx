import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlantCare Calendar",
  description: "Calendario PWA para seguimiento de cultivos horticolas legales.",
  applicationName: "PlantCare Calendar",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "PlantCare"
  }
};

export const viewport: Viewport = {
  themeColor: "#4f8f38",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
