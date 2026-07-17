# Plan: Refactor de Calidad, Arquitectura y Mantenibilidad

> Fecha: 2026-07-17
> Alcance: Limpieza de dead code, fixes de bugs, refactor arquitectónico, tests
> Features asociadas: 201-207 (refactor track)

---

## Resumen Ejecutivo

Auditoría completa del proyecto identificó **20 mejoras** organizadas en 7 features.
El objetivo es llevar el proyecto de "funciona" a "mantenible y escalable".

---

## Fase 1: Limpieza de Dead Code (Feature 201)

**Esfuerzo estimado: 1-2h | Riesgo: Bajo**

### 1.1 Eliminar componentes legacy

| Archivo | Acción | Razón |
|---------|--------|-------|
| `src/components/overlays/LowerThirdOverlay.tsx` | **Eliminar** | Versión anterior de LowerThird. Usa raw WS en vez de hook `useWebSocket`. Nunca se importa desde `index.ts`. |
| `src/components/overlays/TimerOverlay.tsx` | **Eliminar** | Versión anterior de Timer. Usa `setInterval` en vez de `performance.now()`. Nunca se importa desde `index.ts`. |

### 1.2 Eliminar exports muertos

| Archivo | Línea | Acción |
|---------|-------|--------|
| `src/components/overlays/Timer.tsx` | L165-167 | Eliminar `useTimerControls()` (stub no-op) |
| `src/components/overlays/DriveBy.tsx` | Export `DRIVEBY_CSS` | Eliminar — el keyframe ya está en `animations.css` |
| `src/components/overlays/MoneyEffect.tsx` | Export `MONEY_EFFECT_CSS` | Eliminar — el keyframe ya está en `animations.css` |

### 1.3 Completar UI incompleta

| Archivo | Acción |
|---------|--------|
| `src/components/editor/LayerPanel.tsx` | Agregar botones ↑↓ en JSX para `moveUp`/`moveDown` (funciones ya definidas, solo falta el botón) |

### 1.4 Corregir bugs menores

| Archivo | Bug | Fix |
|---------|-----|-----|
| `src/components/overlays/MoneyEffect.tsx` | `Math.random()` en render body de `Particle` — cambia posición en cada re-render | Mover a `useMemo` o calcular una vez al montar |

---

## Fase 2: Bugs Críticos (Feature 202)

**Esfuerzo estimado: 3-4h | Riesgo: Medio**

### 2.1 Agregar `command:update` a overlays faltantes

5 overlays no manejan `command:update`, por lo que los cambios desde el editor no se reflejan en vivo:

| Componente | Archivo | Patrón a seguir |
|------------|---------|-----------------|
| ScoreBug | `ScoreBug.tsx` | Copiar patrón de `LowerThird.tsx` — merge con `setLiveConfig` |
| SponsorLogo | `SponsorLogo.tsx` | Igual |
| WebcamBorder | `WebcamBorder.tsx` | Igual |
| WeatherBug | `WeatherBug.tsx` | Igual |
| YouTubeViewCount | `YouTubeViewCount.tsx` | Igual |

**Patrón común a agregar en el handler de `useWebSocket`:**
```tsx
else if (msg.action === 'update') {
  setLiveConfig(prev => ({ ...prev, ...(msg.payload as Partial<XConfig>) }));
}
```

Cada componente necesita:
1. Agregar `liveConfig` state (si no tiene)
2. Agregar `setLiveConfig` en el handler de `command:update`
3. Merge: `const cfg = useMemo(() => ({ ...defaults, ...c, ...liveConfig }), [c, liveConfig])`

### 2.2 Reconexión WebSocket

**Archivo:** `src/lib/ws-client.ts`

**Cambios:**
1. Agregar lógica de reconexión con backoff exponencial (1s → 2s → 4s → max 30s)
2. Agregar ping/pong heartbeat cada 30s
3. Log en `onclose`/`onerror` (solo warn, no error silencioso)
4. Agregar `onReconnect` callback opcional

**Resultado:**
```typescript
export function useWebSocket({ overlayId, onMessage, onReconnect }) {
  // ... reconexión automática con backoff
  // ... heartbeat cada 30s
}
```

### 2.3 Extraer nested components de ControlDashboard

**Archivo:** `src/components/controls/ControlDashboard.tsx`

**Problema:** `TimerControls`, `LowerThirdControls`, `ScorebugControls`, `GenericControls` están definidos dentro del componente padre. Se recrean en cada render → unmount/remount.

**Solución:** Extraer a componentes independientes en `src/components/controls/`:

| Nuevo archivo | Componente |
|---------------|-----------|
| `TimerControls.tsx` | TimerControls |
| `LowerThirdControls.tsx` | LowerThirdControls |
| `ScorebugControls.tsx` | ScorebugControls |
| `GenericControls.tsx` | GenericControls |

Cada uno recibe `{ overlay: OverlayConfig; send: (msg: WSClientMessage) => void }` como props.

---

## Fase 3: Arquitectura (Feature 203)

**Esfuerzo estimado: 4-6h | Riesgo: Medio**

### 3.1 Extraer API routes de server/index.ts

**Archivo actual:** `server/index.ts` (312 líneas, todo inline)

**Nuevo esquema:**

```
server/
├── index.ts          # Solo: serve, WS, routing dispatcher (~100 LOC)
├── routes/
│   ├── overlays.ts   # GET/POST/PUT/DELETE /api/overlays/*
│   └── templates.ts  # GET /api/templates
├── middleware/
│   └── cors.ts       # CORS headers helper
├── ws-handler.ts     # Sin cambios
├── db.ts             # Sin cambios
└── seed.ts           # Sin cambios
```

**`server/routes/overlays.ts`:**
```typescript
export async function handleOverlaysAPI(
  req: Request, url: URL, corsHeaders: Record<string, string>
): Promise<Response> {
  // GET /api/overlays
  // POST /api/overlays
  // GET /api/overlays/quick
  // GET /api/overlays/:id
  // PUT /api/overlays/:id
  // DELETE /api/overlays/:id
  // POST /api/overlays/:id/command
  // POST /api/overlays/:id/toggle
}
```

**`server/index.ts` reducido:**
```typescript
if (url.pathname.startsWith('/api/overlays')) {
  const { handleOverlaysAPI } = await import('./routes/overlays');
  return handleOverlaysAPI(req, url, corsHeaders);
}
if (url.pathname === '/api/templates') {
  const { handleTemplatesAPI } = await import('./routes/templates');
  return handleTemplatesAPI(req, url, corsHeaders);
}
```

### 3.2 Corregir referencias en AGENTS.md

| Referencia | Estado actual | Fix |
|------------|--------------|-----|
| `src/components/shared/` | Lista `ConnectionStatus`, `ColorPicker`, `WSIndicator` | Directorio está vacío — actualizar mapa |
| `server/api/templates.ts` | Lista como "(no implementado)" | Mover a `server/routes/templates.ts` |
| `editor/index.astro` | Lista como `[id].astro` | El archivo real es `index.astro` (usa query param `?id=`) |

### 3.3 Unificar sistema de animaciones

**Problema:** Doble sistema de keyframes:
- `tailwind.config.mjs` define: `slideLeft`, `slideRight`, `slideUp`, `fadeIn`, `pop`, `bounceIn`, `glow`, `pulseSoft`
- `animations.css` define: `ol-slide-left`, `ol-slide-right`, `ol-fade-in`, `ol-bounce-in`, etc.

**Solución:** Mantener `animations.css` como sistema para overlays (prefijo `ol-`). Eliminar keyframes duplicados de `tailwind.config.mjs` que no se usan en control panel. Los del control panel se quedan en Tailwind.

### 3.4 Agregar validación de entrada en API

**Archivo:** `server/routes/overlays.ts` (nuevo)

Agregar validación mínima en POST/PUT:
- `name` debe ser string no vacío
- `type` debe estar en `OVERLAY_TYPES`
- `data` debe ser object
- Retornar 400 con mensaje claro si falla

---

## Fase 4: Calidad de Código (Feature 204)

**Esfuerzo estimado: 3-4h | Riesgo: Bajo**

### 4.1 Error Boundary para overlays

**Archivo nuevo:** `src/components/overlays/ErrorBoundary.tsx`

```tsx
class OverlayErrorBoundary extends React.Component {
  // Captura errores de render y muestra fallback
  // Evita que un overlay roto destruya toda la página
}
```

**Uso en `OverlayRenderer.tsx`:**
```tsx
<OverlayErrorBoundary type={type}>
  <ActualComponent config={config} overlayId={overlayId} />
</OverlayErrorBoundary>
```

### 4.2 Fix Ticker estado redundante

**Archivo:** `src/components/overlays/Ticker.tsx`

**Problema:** Mantiene `messages` state + lee `c?.messages` en useEffect → sync issue.

**Fix:** Eliminar `messages` state. Derivar directamente de `cfg.messages`:
```tsx
const cfg = useMemo(() => ({ ...defaults, ...c, ...liveConfig }), [c, liveConfig]);
// Usar cfg.messages directamente en el render
```

### 4.3 Agregar presets faltantes

**Archivo:** `src/lib/presets.ts`

Agregar presets para los 11 tipos restantes:
- alert, webcam-border, sponsor-logo, title-card, brb
- 2x-counter, money-effect, social-looper, weather-bug, yt-view-count, driveby

Cada preset con 1-2 variantes realistas.

### 4.4 Agregar JSDoc a funciones clave

Archivos:
- `server/db.ts` — Documentar cada función exportada
- `server/ws-handler.ts` — Documentar flujo de mensajes
- `src/lib/ws-client.ts` — Documentar hook y opciones
- `src/lib/api-client.ts` — Documentar cada endpoint

---

## Fase 5: Tests (Feature 205)

**Esfuerzo estimado: 3-4h | Riesgo: Bajo**

### 5.1 Tests de hooks

| Hook | Archivo de test | Qué testear |
|------|----------------|-------------|
| `useWebSocket` | `tests/hooks/use-websocket.test.ts` | Conexión, parse, cleanup |
| `usePreciseTimer` | `tests/hooks/use-precise-timer.test.ts` | Start, pause, reset, formato |

### 5.2 Tests de API

| Endpoint | Archivo | Qué testear |
|----------|---------|-------------|
| GET /api/overlays | `tests/server/api.test.ts` | Retorna array, status 200 |
| POST /api/overlays | `tests/server/api.test.ts` | Crea overlay, retorna 201 |
| GET /api/overlays/:id | `tests/server/api.test.ts` | Retorna overlay, 404 si no existe |
| PUT /api/overlays/:id | `tests/server/api.test.ts` | Actualiza, merge fields |
| DELETE /api/overlays/:id | `tests/server/api.test.ts` | Elimina, retorna success |

### 5.3 Tests de utils

| Util | Archivo | Qué testear |
|------|---------|-------------|
| `rowToOverlay` | `tests/server/db.test.ts` | Mapeo correcto de DB row a OverlayConfig |
| `getDefaultConfig` | `tests/types.test.ts` | Retorna config válida para cada tipo |

---

## Fase 6: Features Pendientes (Feature 206)

**Esfuerzo estimado: 2-3h | Riesgo: Bajo**

### 6.1 Export/Import

| Archivo | Acción |
|---------|--------|
| `server/routes/overlays.ts` | `GET /api/overlays/export` → JSON completo de todos los overlays |
| `server/routes/overlays.ts` | `POST /api/overlays/import` → Recibe array de overlays, inserta los que no existen |
| `src/components/library/OverlayLibrary.tsx` | Botones de Export (descarga JSON) e Import (file picker) |

### 6.2 Backup automático

| Archivo | Acción |
|---------|--------|
| `server/db.ts` | Antes de `initSchema`, copiar `store.db` → `data/backup/store-{timestamp}.db` |
| `server/db.ts` | Crear directorio `data/backup/` si no existe |

---

## Fase 7: Documentación (Feature 207)

**Esfuerzo estimado: 1-2h | Riesgo: Bajo**

### 7.1 Actualizar docs

| Archivo | Cambios |
|---------|---------|
| `AGENTS.md` | Corregir mapa del repo (shared/ vacío, api/ vacío, editor/[id].astro) |
| `docs/architecture.md` | Agregar sección de API routes modular, WS reconnect |
| `docs/conventions.md` | Agregar: "Un overlay siempre debe soportar command:update" |
| `CHECKPOINTS.md` | Agregar checkpoints de refactor (WS reconnect, command:update, tests) |
| `progress/history.md` | Agregar entrada de sesión de refactor |

---

## Orden de Ejecución

```
Feature 201 (Limpieza)     ← Arranca primero, reduce ruido
    ↓
Feature 202 (Bugs)         ← Fix inmediato de funcionalidad rota
    ↓
Feature 203 (Arquitectura) ← Reorganizar sin cambiar funcionalidad
    ↓
Feature 204 (Calidad)      ← Error boundaries, presets, JSDoc
    ↓
Feature 205 (Tests)        ← Tests después de tener el código estable
    ↓
Feature 206 (Features)     ← Export/Import + Backup
    ↓
Feature 207 (Docs)         ← Documentar todo al final
```

## Criterios de Aceptación (por feature)

Cada feature se considera `done` cuando:
1. `bun run build` pasa sin errores
2. `bun run lint` pasa sin warnings
3. `bun run test` pasa (los tests existentes + nuevos)
4. `init.ps1` pasa
5. No hay `console.log()` de debug
6. `progress/current.md` documentado
7. `feature_list.json` actualizado
