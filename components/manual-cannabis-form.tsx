"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import type { SeedType } from "@/lib/cultivation-reference";

const seedTypeOptions: Array<{ label: string; value: SeedType }> = [
  { label: "Feminizada", value: "feminized" },
  { label: "Regular", value: "regular" },
  { label: "Automatica", value: "autoflowering" }
];

export function ManualCannabisForm() {
  const [seedType, setSeedType] = useState<SeedType>("feminized");

  return (
    <div className="grid gap-4">
      <FormGroup title="Identificacion">
        <FormField label="Banco o catalogo" placeholder="Opcional" />
        <FormField label="Nombre de la genetica" placeholder="Carga manual del usuario" />
        <label className="grid gap-1 text-sm font-black text-moss-950">
          Registro legal
          <select className="form-control" defaultValue="Confirmado">
            <option>Confirmado</option>
            <option>Pendiente de verificar</option>
            <option>No aplica</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-black text-moss-950">
          Tipo declarado
          <select
            className="form-control"
            value={seedType}
            onChange={(event) => setSeedType(event.target.value as SeedType)}
          >
            {seedTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </FormGroup>

      <FormGroup title="Datos de cultivo">
        <FormField label="Dias a flora" placeholder="Carga manual, ej. 30 dias" />
        <FormField label="Semanas de floracion" placeholder="Carga manual, ej. 9 semanas" />
        <label className="grid gap-1 text-sm font-black text-moss-950">
          Tipo de espacio
          <select className="form-control" defaultValue="Interior">
            <option>Interior</option>
            <option>Exterior</option>
            <option>Invernadero</option>
          </select>
        </label>
        <FormField label="Tamano indoor" placeholder="Ej. 80 x 80 cm" />
        <label className="grid gap-1 text-sm font-black text-moss-950">
          Tipo de luz
          <select className="form-control" defaultValue="LED">
            <option>LED</option>
            <option>Sodio</option>
            <option>Mixta</option>
            <option>Luz natural</option>
          </select>
        </label>
        <FormField label="Maceta en litros" placeholder="Ej. 10 L" />
      </FormGroup>

      <FormGroup title="Fechas y recordatorios">
        <FormField label="Proxima revision de humedad" placeholder="Fecha definida por el usuario" />
        <FormField label="Cambio de etapa / flora" placeholder="Fecha definida por el usuario" />
        <FormField label="Secado de ramas" placeholder="Fecha definida por el usuario" />
        <FormField label="Mantenimiento" placeholder="Fecha definida por el usuario" />
      </FormGroup>

      <p className="text-xs font-bold leading-5 text-stone-600">
        Estos campos sirven para agenda y recordatorios definidos por el usuario. Evita guardar numeros de registro,
        domicilios exactos o datos medicos en esta demo publica.
      </p>
    </div>
  );
}

function FormGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-lg border border-moss-950/10 bg-white/70 p-3">
      <h3 className="text-xs font-black uppercase text-stone-500">{title}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function FormField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="grid gap-1 text-sm font-black text-moss-950">
      {label}
      <input className="form-control" placeholder={placeholder} />
    </label>
  );
}
