# Plan: Restructuración a 3 Páginas (Studio + Editor + Library)

> Fecha: 2026-07-18
> Inspiración: https://app.overlays.uno/control/4LIAI58UYdO71QKZBuFuQx
> Features asociadas: 301-304

---

## Visión Final

La app se divide en 3 experiencias claras:

### 1. `/` — Library (punto de entrada)
- Grid de overlays con thumbnails
- Botones: **Open Studio** | **Open Editor** | **Delete**
- Import/ Export
- Búsqueda y filtros

### 2. `/studio/:id` — Control + Preview (como overlays.uno)
**Layout: Split pane**
```
┌─────────────────────────┬─────────────────────────────┐
│                         │  CONTROLS                   │
│   PREVIEW EN VIVO       │  ┌─────────────────────┐    │
│   (iframe del overlay   │  │ ● Show / Hide        │    │
│    como lo ve OBS)      │  │ ● Connection status  │    │
│                         │  └─────────────────────┘    │
│   Se actualiza en       │  ┌─────────────────────┐    │
│   tiempo real via WS    │  │ Type-specific ctrl   │    │
│                         │  │ (Timer: start/pause) │    │
│                         │  │ (LT: edit text)      │    │
│                         │  └─────────────────────┘    │
│                         │  ┌─────────────────────┐    │
│                         │  │ Quick config         │    │
│                         │  │ (colors, text, etc.) │    │
│                         │  └─────────────────────┘    │
│                         │  ┌─────────────────────┐    │
│                         │  │ Activity log         │    │
│                         │  └─────────────────────┘    │
└─────────────────────────┴─────────────────────────────┘
```

**Componentes:**
- `StudioPage.tsx` — Layout principal split-pane
- `PreviewPane.tsx` — iframe del overlay + status indicator
- `ControlPane.tsx` — Controles agrupados por sección
- `QuickConfig.tsx` — Campos de configuración rápida (text, colors)
- `ActivityLog.tsx` — Log de eventos WS

**Flujo:**
1. Usuario selecciona overlay en Library → click "Open Studio"
2. Navega a `/studio/:id`
3. Preview pane muestra el overlay en iframe
4. Control pane muestra controles relevantes al tipo
5. Cambios se envían via WS → overlay se actualiza en vivo
6. Botón "Open Editor" lleva al editor visual

### 3. `/editor/:id` — Editor Visual (tipo Figma)
**Layout: 3 columnas**
```
┌──────────┬──────────────────────┬───────────────────┐
│ ELEMENTS │   CANVAS             │  PROPERTIES       │
│          │                      │                   │
│ Text     │  ┌────────────────┐  │  Position: x, y   │
│ Shape    │  │                │  │  Size: w, h       │
│ Image    │  │  [draggable    │  │  Rotation         │
│ Timer    │  │   elements]    │  │  Colors           │
│          │  │                │  │  Font             │
│ ─────── │  └────────────────┘  │  ─────────────    │
│ TEMPLATES│                      │  DYNAMIC FIELDS   │
│ Lower    │  Zoom: 100%         │  (API-bound)      │
│ Timer    │  Grid: ON/OFF       │  title: [____]    │
│ Score    │                     │  subtitle: [____] │
└──────────┴──────────────────────┴───────────────────┘
```

### 4. `/overlay/:type` — OBS Browser Source (sin cambios)
- Página limpia, solo el overlay
- Connecta via WS para updates en vivo

---

## Fase 1: Studio Page (`/studio/:id`)

### Archivos a crear
- `src/pages/studio/[id].astro` — Página Astro
- `src/components/studio/StudioPage.tsx` — Layout principal
- `src/components/studio/PreviewPane.tsx` — iframe preview
- `src/components/studio/ControlPane.tsx` — Controles
- `src/components/studio/QuickConfig.tsx` — Config rápida
- `src/components/studio/ActivityLog.tsx` — Log

### Archivos a modificar
- `src/pages/index.astro` — Agregar botón "Open Studio"
- `src/components/library/OverlayLibrary.tsx` — Botones Studio/Editor

### API needed
- Ninguna nueva — usa API existente (`/api/overlays/:id`)
- WS existente para tiempo real

---

## Fase 2: Library Simplificada

### Cambios
- Grid más limpio con cards más grandes
- Botones prominentes: Studio (primario), Editor (secundario)
- Remove: vista de detalles inline
- Keep: Import/Export, búsqueda

---

## Fase 3: Editor Figma-like

### Archivos a crear
- `src/pages/editor/[id].astro` — Reemplaza el actual
- `src/components/editor/EditorCanvas.tsx` — Canvas drag/drop
- `src/components/editor/ElementPanel.tsx` — Lista de elementos
- `src/components/editor/PropertyPanel.tsx` — Propiedades del elemento seleccionado
- `src/components/editor/DynamicFields.tsx` — Campos vinculados a API

### Componentes reutilizados
- `src/components/editor/TemplatePicker.tsx` — Selector de plantillas
- `src/components/editor/OverlayEditor.tsx` — Se integra en el canvas

---

## Fase 4: Limpieza

### Eliminar
- `/control` (reemplazada por `/studio/:id`)
- `/editor` legacy (reemplazada por `/editor/:id` mejorado)

### Mantener
- `/overlay/:type` — Sin cambios
- `/` — Library actualizada

---

## Criterios de Aceptación

1. `/studio/:id` muestra preview en vivo del overlay
2. Cambios en control se reflejan en preview via WS
3. Layout split-pane responsive (desktop: side-by-side, mobile: stacked)
4. Library tiene botones Studio/Editor funcionales
5. Editor permite drag/drop de elementos
6. `bun run build` pasa sin errores
7. Tests existentes pasan
