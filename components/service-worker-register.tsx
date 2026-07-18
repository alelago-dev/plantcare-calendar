"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      navigator.serviceWorker.register(`${basePath}/sw.js`, { scope: `${basePath || "/"}` }).catch(() => {
        // Registration failure should not block the app shell.
      });
    }
  }, []);

  return null;
}
