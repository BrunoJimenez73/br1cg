# Sesión activa

---

## Feature en curso

```
ID:     UI-401 — Library + Controller + Editor UI Overhaul
Title:  Rediseño completo de UI: Library con categorías/filtros, Controller con preview redimensionable, Editor con elementos dinámicos
Status: completado
```

## Cambios realizados (Sesión 13)

### Types system (`src/lib/types.ts`)
- Nuevo: `OverlayCategory` type + `OVERLAY_CATEGORIES` mapping (15 types → 5 categories)
- Nuevo: `OVERLAY_CATEGORY_LABELS`, `OVERLAY_CATEGORY_ICONS` para UI
- Nuevo: `OVERLAY_TYPE_DESCRIPTIONS`, `OVERLAY_TYPE_ICONS` para preview cards
- Nuevo: `description` field en `OverlayConfig`
- Nuevo: `dynamic: boolean` field en `OverlayElement`

### DB + API (`server/db.ts`, `server/routes/overlays.ts`)
- Migración: columna `description` agregada a SQLite
- `createOverlay`/`updateOverlay`/`rowToOverlay` actualizados con description
- API route de creación/importación ahora acepta `description`

### Library (`src/components/library/OverlayLibrary.tsx`)
- **REESCRITO** con 5 category tabs (Graphics, Sports, Widgets, Media, Data)
- Filtro de búsqueda mejorado (busca por name, type, label, description)
- Filtro de favoritos toggle
- Cards rediseñadas con: icono de tipo, preview visual, descripción, badge de categoría
- Botón **Control** (enlace a `/control/[id]`) + **Edit** + **Delete**
- Contadores por categoría en cada tab
- Diseño responsive (1-4 columnas)

### Controller Page (`src/components/control/ControllerPage.tsx`) — NUEVO
- Split pane redimensionable con drag handle (30%-85% de ancho ajustable)
- Left: Preview en iframe 16:9 con botones "Open in new tab" y "Copy URL"
- Right: Tabs "Controls" + "Dynamic"
- **Controls tab**: Show/Hide, type-specific (Timer, Lower Third, Scorebug, Ticker), color pickers
- **Dynamic tab**: Elementos con `dynamic: true` — edita texto, color, tamaño, URL, opacidad en tiempo real
- WebSocket para comunicación en vivo + Activity Log colapsable
- Header con tipo, nombre, connection status, enlace a Editor

### Control Dashboard (`src/components/controls/ControlDashboard.tsx`)
- Agregado enlace 🎮 a `/control/[id]` por overlay card

### Editor PropertiesPanel (`src/components/editor/PropertiesPanel.tsx`)
- Nuevo toggle **Dynamic** en sección State con descripción "(editable from controller)"

### Server routing (`server/index.ts`)
- Nuevo redirect: `/control/[id]` → `/control?id=[id]`

### Home page (`src/pages/index.astro`)
- Simplificado: solo título + enlace a Dashboard + OverlayLibrary

---

## Estado actual

| Componente | Estado |
|-----------|--------|
| Tests | ✅ 188/188 pasan (137 vitest + 51 bun test) |
| Build | ✅ 19 páginas, 0 errores, 0 warnings |
| Library UI | ✅ Categorías, filtros, preview, descripciones, favoritos |
| Controller | ✅ Preview redimensionable + controles + elementos dinámicos |
| Editor | ✅ Dynamic element toggle |
| Routing | ✅ `/control/[id]` funcional |
| Timer fix | ✅ Botones Start/Pause/Reset funcionan |

---

## Hotfix (Sesión 14) — Timer start/pause/reset no funcionaban

### Causa raíz
`OverlayRenderer.tsx` renderizaba overlays mediante `SharedElementRenderer`, que tiene un `timer-display` **estático** (solo muestra "05:00") y no escucha mensajes WS tipo `event`. El componente nativo `Timer.tsx` (con `usePreciseTimer` + WS handler para `timer:start`/`pause`/`reset`) nunca se renderizaba en producción.

### Fix 1: `src/components/overlays/OverlayRenderer.tsx`
- Importado `OVERLAY_COMPONENTS` desde `./index`
- Cuando existe un componente nativo para el tipo de overlay (e.g., `Timer`), se renderiza con `config` y `overlayId` en vez de usar elementos estáticos
- El componente nativo maneja sus propios eventos WS (start/pause/reset)
- Fallback a elementos cuando no hay componente nativo

### Fix 2: `src/components/control/ControllerPage.tsx`
- `TimerControls` ahora usa la conexión WS **persistente** del ControllerPage (`sendCommand`) en vez de crear una conexión WebSocket nueva por cada clic
- Mensaje enviado: `sendCommand('timer:start')` → `overlay:timer:start` → server broadcast → Timer.tsx procesa el evento

### Verificación
- Build: ✅ 19 páginas, 0 errores
- Tests: ✅ 188/188 pasan (137 vitest + 51 bun test)
- `init.ps1`: ✅ OK

---

## Cierre

UI overhaul completado. Timer bugfix aplicado — los botones Start/Pause/Reset ahora usan la conexión WS persistente y el overlay renderiza el componente Timer nativo que sí responde a eventos.
