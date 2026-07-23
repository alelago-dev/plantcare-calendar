/**
 * copy-button.tsx
 *
 * Boton de copiar al portapapeles para usar dentro de los paneles de
 * referencia (genetics-catalog.ts / cultivation-reference.ts).
 *
 * Sigue siendo una ACCION DEL USUARIO: copia un valor de referencia al
 * portapapeles para que el usuario lo pegue el mismo en el campo del
 * formulario manual. No escribe en ningun input directamente, no hay
 * autofill ni binding automatico entre el panel de referencia y el
 * formulario de carga manual.
 */

"use client";

import { useState } from "react";

interface CopyValueButtonProps {
  value: string;
  label: string;
}

export function CopyValueButton({ value, label }: CopyValueButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail in some contexts, so the value remains visible for manual copy.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copiar para pegar en ${label}: ${value}`}
      title={`Copiar para pegar en ${label}`}
      className="copy-value-button"
    >
      {copied ? "Copiado" : "Copiar valor"}
    </button>
  );
}
