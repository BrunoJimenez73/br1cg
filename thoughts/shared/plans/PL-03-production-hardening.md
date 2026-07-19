# PL-03 — Production Hardening: De POC a Herramienta Real

> Plan maestro para convertir br1cg de proof-of-concept funcional a herramienta
> de uso diario confiable. Cada fase es mergeable independientemente.

**Fecha:** 2026-07-19
**Estado:** Plan (pendiente de aprobación)
**Depende de:** PL-02 (refactor 201-207, completado)

---

## Diagnóstico

br1cg es un POC funcional: 15 overlays renderizan, el editor carga, el server responde.
Pero tiene deudas estructurales que impiden escalar:

1. **Triplicación de WebSocket** — 3 implementaciones independientes (hook, editor, dashboard)
2. **Zustand store muerto** — importado pero nunca usado, editor usa 7 useState
3. **13 overlays repiten** el mismo patrón WS boilerplate
4. **Server sin router** — if-else chain de 72 líneas
5. **Sin undo/redo** — editor visual sin historial
6. **Tests inflados** — dicen 230, son ~126 reales
7. **Seed roto** — escribe en tabla `overlay_configs` pero server lee `overlays`
8. **Docs parciales** — ejemplos de WSMessage desactualizados, test count falso

## Bugs conocidos

| # | Bug | Archivo | Línea |
|---|-----|---------|-------|
| B1 | `seed.ts` usa tabla `overlay_configs`, server usa `overlays` | `server/seed.ts` | 17 |
| B2 | `overlay:save` no está en `WSClientMessage` union | `src/lib/types.ts` | 357 |
| B3 | `ws.data.subscriptions` se crea pero nunca se lee | `server/ws-handler.ts` | 27 |
| B4 | `getOverlay` se llama 2x en cada PUT | `server/routes/overlays.ts` | 214+216 |
| B5 | LowerThird tiene clases de animación muertas (ANIM_IN/ANIM_OUT) | `LowerThird.tsx` | 6-7 |
| B6 | Toggle button envía `overlay:show` en vez de toggle real | `ControlDashboard.tsx` | 195 |
| B7 | Test count inflado: 230 vs ~126 reales | Múltiples docs | — |
| B8 | Features 203/205 marcadas pending en JSON pero done en CHECKPOINTS | `feature_list.json` | 151,167 |

---

## Roadmap por fases

Cada fase es un PR independiente. Orden recomendado pero flexible.

### Fase 301 — Bug Fixes (obligatorio primero)

**Objetivo:** Corregir bugs conocidos antes de refactorizar.

| Tarea | Archivos | Detalle |
|-------|----------|---------|
| Fix seed.ts | `server/seed.ts` | Cambiar `overlay_configs` → `overlays`, importar `getDb()` de `db.ts` |
| Fix WSClientMessage | `src/lib/types.ts` | Agregar `'overlay:save'` al union type |
| Fix dead subscriptions | `server/ws-handler.ts:27` | Eliminar `ws.data.subscriptions` |
| Fix double getOverlay | `server/routes/overlays.ts:216` | Usar `return jsonResponse(updated)` en vez de `getOverlay(id)` |
| Fix LowerThird dead anim | `LowerThird.tsx` | Aplicar ANIM_IN/ANIM_OUT al JSX, o eliminar si no aplica |
| Fix Toggle button | `ControlDashboard.tsx:195` | Enviar `overlay:show` → toggle real con `POST /:id/toggle` |
| Fix test count | CHECKPOINTS.md, current.md, architecture.md | Actualizar a ~126 tests reales |
| Fix feature_list status | `feature_list.json` | Marcar 203 y 205 como done |

**Estimación:** ~2 horas
**Verificación:** `bun run test:all && bun run build` pasan, `bun run db:seed` funciona

---

### Fase 302 — Server Router Rewrite

**Objetivo:** Reemplazar if-else chain por un router real con middleware pipeline.

**Enfoque:** Router propio con `Map<Method+Path, Handler>` (zero new deps).

#### Nuevo archivo: `server/router.ts`

```typescript
type RouteHandler = (req: Request, url: URL, params: Record<string, string>) => Promise<Response | null> | Response | null;

class Router {
  private routes: Array<{ method: string; pattern: RegExp; paramNames: string[]; handler: RouteHandler }> = [];
  private middlewares: Array<(req: Request) => Response | null> = [];

  use(middleware: (req: Request) => Response | null) { this.middlewares.push(middleware); }
  get(path: string, handler: RouteHandler) { this.addRoute('GET', path, handler); }
  post(path: string, handler: RouteHandler) { this.addRoute('POST', path, handler); }
  put(path: string, handler: RouteHandler) { this.addRoute('PUT', path, handler); }
  delete(path: string, handler: RouteHandler) { this.addRoute('DELETE', path, handler); }

  async handle(req: Request, url: URL): Promise<Response> {
    for (const mw of this.middlewares) { const r = mw(req); if (r) return r; }
    for (const route of this.routes) {
      if (req.method !== route.method) continue;
      const match = url.pathname.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
        const result = await route.handler(req, url, params);
        if (result) return result;
      }
    }
    return new Response('Not Found', { status: 404 });
  }
}
```

#### Cambios en archivos existentes

| Archivo | Cambio |
|---------|--------|
| `server/index.ts` | Reemplazar fetch handler por `router.handle(req, url)` |
| `server/routes/overlays.ts` | Dividir en rutas individuales registradas en el router |
| `server/routes/overlays.ts` | Eliminar `await import()` dinámicos → imports estáticos |
| `server/middleware.ts` | Mover mime map a module-level, añadir security headers |
| `server/db.ts` | Añadir `PRAGMA journal_mode=WAL`, `closeDb()`, fix migration catch |

#### Nuevos middlewares

- `securityHeaders` — `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`
- `requestLogger` — Log method, path, status, duration (opcional, solo en dev)
- `jsonBodyLimit` — Rechazar bodies > 1MB

#### Eliminar

- Template routes hardcoded → usar la tabla `templates` del DB (o eliminar la tabla si no se usa)

**Estimación:** ~4 horas
**Verificación:** Todas las rutas existentes siguen funcionando, tests pasan

---

### Fase 303 — useOverlayLifecycle Hook

**Objetivo:** Eliminar la duplicación de WS boilerplate en 13 overlays.

#### Nuevo archivo: `src/hooks/use-overlay-lifecycle.ts`

```typescript
export function useOverlayLifecycle<T extends Record<string, unknown>>(
  overlayId: string | undefined,
  defaults: T,
  initialConfig?: Partial<T>
) {
  const [visible, setVisible] = useState(true);
  const [live, setLive] = useState<Partial<T>>({});
  const config = useMemo<T>(
    () => ({ ...defaults, ...initialConfig, ...live }) as T,
    [defaults, initialConfig, live]
  );

  useWebSocket({
    overlayId,
    onMessage: useCallback((msg: WSServerMessage) => {
      if (msg.type === 'command') {
        if (msg.action === 'show') {
          setVisible(true);
          if (msg.payload && Object.keys(msg.payload).length > 0) {
            setLive(p => ({ ...p, ...msg.payload } as Partial<T>));
          }
        } else if (msg.action === 'hide') {
          setVisible(false);
        } else if (msg.action === 'update') {
          setLive(p => ({ ...p, ...msg.payload } as Partial<T>));
        }
      }
    }, []),
  });

  return { config, visible, setVisible };
}
```

#### Migración de overlays

Cada overlay cambia de:

```tsx
// ANTES (13 líneas duplicadas)
const [visible, setVisible] = useState(true);
const [live, setLive] = useState<Partial<Config>>({});
const cfg = useMemo(() => ({ ...defaults, ...c, ...live }), [c, live]);
useWebSocket({ overlayId, onMessage: (msg) => {
  if (msg.type === 'command') {
    if (msg.action === 'show') { setVisible(true); /* ... */ }
    else if (msg.action === 'hide') setVisible(false);
    else if (msg.action === 'update') setLive(p => ({ ...p, ...msg.payload }));
  }
}});
if (!visible) return null;
```

A:

```tsx
// DESPUÉS (3 líneas)
const { config: cfg, visible } = useOverlayLifecycle(overlayId, DEFAULT_CONFIG, c);
if (!visible) return null;
```

**Overlays a migrar:** Timer, LowerThird, ScoreBug, Ticker, Alert, WebcamBorder, SponsorLogo, BRB, TwoXCounter, SocialLooper, WeatherBug, YouTubeViewCount, TitleCard

**Excepciones:** OverlayRenderer (usa fetch + WS), MoneyEffect (auto-hide logic), DriveBy (onAnimationEnd pattern)

#### Fix: Eliminar tipos locales duplicados

BRB, TwoXCounter, MoneyEffect, SocialLooper, WeatherBug, YouTubeViewCount, DriveBy definen interfaces locales. Eliminar y usar las de `types.ts`.

#### Fix: Extraer usePreciseTimer

Mover de `Timer.tsx` a `src/hooks/use-precise-timer.ts`.

**Estimación:** ~3 horas
**Verificación:** Todos los overlays siguen funcionando, test suite pasa

---

### Fase 304 — Editor: Activar Zustand + Undo/Redo

**Objetivo:** Migrar editor de 7 useState al store existente, añadir undo/redo.

#### Cambios en `src/lib/overlay-store.ts`

Agregar campos y acciones:

```typescript
export interface EditorState {
  // ... existente ...
  history: Array<{ form: Partial<OverlayConfig>; selectedId: string | null }>;
  historyIndex: number;
  // Acciones nuevas
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}
```

#### Cambios en `OverlayEditor.tsx`

| Cambio | Detalle |
|--------|---------|
| Eliminar 7 useState | Migrar todo al `useEditorStore` |
| Eliminar WS raw | Usar `useWebSocket` de `ws-client.ts` |
| Eliminar `wsRef` | El hook maneja la conexión |
| Añadir `Ctrl+Z` / `Ctrl+Shift+Z` | `useEffect` con keydown listener |
| Añadir `pushHistory` | Llamar en cada cambio significativo (con throttle) |
| Fix `window.location.pathname` crash | Mover a `useEffect` o usar guard SSR |

#### Cambios en `EditorCanvas.tsx`

- Añadir zoom/pan con `transform: scale(zoom) translate(panX, panY)`
- Añadir snap-to-grid (toggle, default 10px)
- Añadir alignment guides (centro horizontal/vertical)

**Estimación:** ~5 horas
**Verificación:** Editor funciona, undo/redo funciona, no hay regressions

---

### Fase 305 — Dashboard Rewrite

**Objetivo:** Reescribir ControlDashboard usando hooks compartidos.

#### Cambios

| Cambio | Detalle |
|--------|---------|
| Eliminar WS raw | Usar `useWebSocket` de `ws-client.ts` |
| Eliminar Quick Test section | Mover a `tools/` o eliminar |
| Fix Toggle button | Usar `POST /:id/toggle` real |
| Añadir ScorebugControls | Home/away score +/-, period editor, clock |
| Añadir TickerControls | Texto (textarea), velocidad |
| Añadir reconnect indicator | Mostrar estado de reconexión |
| Confirmación antes de delete | `window.confirm()` o modal |

#### Nuevos archivos en `src/components/controls/`

- `ScorebugControls.tsx` — Score increment, period, clock (reemplazar stub)
- `TickerControls.tsx` — Messages editor, speed slider
- `SocialLooperControls.tsx` — Accounts list editor

**Estimación:** ~3 horas
**Verificación:** Dashboard funciona, todos los controles envían WS correctamente

---

### Fase 306 — Tests Reales

**Objetiro:** Tests que verifican comportamiento, no solo "no crashea".

#### Fixes

| Fix | Detalle |
|-----|---------|
| Importar de `db.ts` | `tests/server/db.test.ts` re-implementa funciones → importar |
| Fix test count | Documentar ~126 tests reales |
| Mejorar assertions | Reemplazar `expect(container).toBeTruthy()` con checks de contenido |

#### Nuevos tests

| Test | Runner | Detalle |
|------|--------|---------|
| WS handler: subscribe/unsubscribe/broadcast | bun:test | Testear `handleWS`, `subscribe`, `broadcastToRoom` |
| REST endpoints | bun:test | Testear `handleOverlayRoutes` con Request mock |
| useOverlayLifecycle hook | vitest | Testear show/hide/update/visible |
| Editor state transitions | vitest | Testear undo/redo, save, load |
| Preset correctness | vitest | Verificar que cada preset tiene config válida |

#### Eliminar

- Doble counting de tests (vitest + bun test corren los mismos archivos)

**Estimación:** ~4 horas
**Verificación:** `bun run test:all` pasa, cobertura real de código

---

### Fase 307 — Docs & Cleanup

**Objetivo:** Documentación precisa y actualizada.

| Tarea | Archivo |
|-------|---------|
| Fix WSMessage example | `docs/conventions.md` |
| Update test count | CHECKPOINTS.md, current.md, architecture.md |
| Merge history.md | `progress/history.md` |
| API reference | `docs/api.md` (nuevo) |
| "How to add overlay" guide | `docs/new-overlay.md` (nuevo) |
| Remove dead CSS | `overlay.css` (~200 líneas muertas) |
| Add `getWSBase()` shared | Reemplazar port detection duplicado en 3 archivos |

**Estimación:** ~2 horas

---

## Resumen de esfuerzo

| Fase | Nombre | Horas | Dependencias |
|------|--------|:-----:|-------------|
| 301 | Bug Fixes | 2h | — |
| 302 | Server Router | 4h | 301 |
| 303 | useOverlayLifecycle | 3h | 301 |
| 304 | Editor Zustand + Undo | 5h | 301 |
| 305 | Dashboard Rewrite | 3h | 301, 303 |
| 306 | Tests Reales | 4h | 302, 303 |
| 307 | Docs & Cleanup | 2h | Todas |
| **Total** | | **~23h** | |

## Orden recomendado de ejecución

```
301 (Bug Fixes) → 302 (Server Router) → 303 (Overlay Hook)
                                           ↓
                              304 (Editor Zustand)
                                           ↓
                              305 (Dashboard Rewrite)
                                           ↓
                              306 (Tests Reales) → 307 (Docs)
```

302, 303 y 304 pueden ejecutarse en paralelo después de 301.
305 depende de 303 (usa el hook).
306 y 307 van al final.

## Lo que NO se toca

- `types.ts` — la estructura de tipos es sólida
- `api-client.ts` — bien diseñado
- `pack-presets.ts` — excelente
- `defaults.ts` — completo
- `animations.css` — funciona bien
- `EditorCanvas.tsx` — buen componente base
- `SharedElementRenderer.tsx` — limpio
- CI/CD pipeline — funciona
- Overlay pages `[type].astro` — no cambiar
