# PlantCare Calendar

PlantCare Calendar es una PWA mobile-first para seguimiento de cultivos horticolas legalmente permitidos. El MVP incluye arquitectura Next.js App Router, TypeScript, Tailwind CSS, contrato de Supabase, esquema SQL, i18n preparado, pantallas principales con datos demo e interfaz lista para conectar una API meteorologica.

## Incluye

- Registro e inicio de sesion preparado para Supabase Auth.
- Espacios de cultivo y plantas asociadas.
- Campos para variedad o semilla, fecha de inicio, modalidad, region aproximada, maceta, sustrato e iluminacion.
- Selector de semillas con categorias horticultoras y categorias cannabicas legales para registro manual.
- Plan manual legal con banco/catalogo, genetica, tipo declarado, dias informados por el usuario, espacio, tamano de indoor, luz, litros de maceta y fechas definidas por el usuario.
- Tareas manuales y recurrentes con vista de hoy.
- Calendario mensual.
- Bitacora de observaciones y fotografias.
- Interfaz de clima preparada para proveedor externo.
- Consentimiento de privacidad y uso legal.
- Base para exportacion y eliminacion completa de datos del usuario.

La app evita recomendaciones destinadas a maximizar sustancias controladas o evadir controles legales.
Para cultivos regulados, la app permite carga manual de datos solo donde sea legal, sin recomendador automatico de semilla, clima, cosecha ni rendimiento.
La demo no debe guardar numeros de registro, domicilios exactos ni datos medicos.

## Instalacion

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000/es`.

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_WEATHER_PROVIDER=
NEXT_PUBLIC_WEATHER_API_KEY=
```

## Supabase

1. Crear un proyecto en Supabase.
2. Ejecutar `supabase/schema.sql` en el SQL editor.
3. Configurar el bucket privado `plant-photos` si no se creo automaticamente.
4. Completar las variables de entorno.
5. Reemplazar los datos demo por llamadas a Supabase usando `lib/supabase/client.ts`.

## Scripts

```bash
npm run lint
npm run typecheck
npm run build
```

## Estructura

```text
app/                  rutas App Router e interfaz
components/           componentes de pantalla
lib/                  tipos, datos demo, i18n, clima y Supabase
public/               manifest PWA y service worker basico
supabase/schema.sql   esquema PostgreSQL, RLS y storage
```
