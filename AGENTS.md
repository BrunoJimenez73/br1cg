# br1cg — Sistema Local de CG/Overlays para OBS/vMix

> **Punto de entrada** para cualquier agente (IA o humano) que trabaje en este repositorio.
> Lee solo lo que necesites (divulgación progresiva).

---

## 1. Antes de empezar (obligatorio)

1. Carga `skill_view(name='br1cg-session-start')` para el workflow de inicio de sesión.
2. `git pull` para asegurar latest.
3. Ejecuta `powershell -File init.ps1` y verifica que termina sin errores. Si falla, **para**.
4. Lee `progress/current.md` para entender el estado actual.
5. Lee `feature_list.json` y elige **una** tarea con estado `pending`.
6. Si es una tarea nueva sin ticket, usa `br1cg-new-feature` skill.

---

## 2. Visión General

Sistema local para generar y controlar overlays HTML (CG) en OBS, vMix, Streamlabs y cualquier software que acepte Browser Source. Inspirado en [overlays.uno](https://overlays.uno/).

**Stack:** Bun + Astro + React + Tailwind + SQLite (bun:sqlite) + WebSocket nativo

**Estado actual:** Core (1-10) ✅ + Parallel Library (101-106) ✅ + Refactor (201-207) ✅ completadas.
**Siguiente fase:** Production Hardening (301-307) — `thoughts/shared/plans/PL-03-production-hardening.md`
**Tests:** ~126 tests reales (vitest + bun test) — todos pasan.
**CI/CD:** GitHub Actions (lint → test → test:server → build) en cada push.
**Editor visual:** Conectado a API + WS + template picker (Zustand store existe pero no se usa aún).
**Server:** Refactorizado en orquestador + middleware + routes modulares (pendiente router rewrite).

**Repositorio:** [github.com/BrunoJimenez73/br1cg](https://github.com/BrunoJimenez73/br1cg)

## 3. Mapa del repositorio

```
br1cg/
├── AGENTS.md                  # Este archivo (punto de entrada)
├── CHECKPOINTS.md             # Criterios de "estado final correcto"
├── feature_list.json          # Alcance: una feature a la vez
├── init.ps1                   # Verificación e inicialización
├── package.json
├── astro.config.mjs
├── tsconfig.json
├── tailwind.config.mjs
│
├── progress/
│   ├── current.md             # Sesión activa (estado vivo)
│   └── history.md             # Bitácora append-only
│
├── thoughts/                  # Context Engineering (AI Engineering Harness)
│   └── shared/
│       ├── tickets/           # Features, bugs, tareas (.md)
│       ├── plans/             # Planes de implementación
│       └── research/          # Investigaciones y decisiones técnicas
│
├── docs/
│   ├── architecture.md        # Decisiones arquitectónicas
│   ├── conventions.md         # Estilo, nombres, convenciones
│   └── verification.md        # Cómo demostrar que funciona
│
├── tools/
│   └── dev.js                 # Lanza servidor + astro en paralelo
│
├── src/
│   ├── components/
│   │   ├── overlays/          # Renderers individuales (LowerThird, Timer, etc.)
│   │   ├── controls/          # Paneles de control por tipo (ControlDashboard + sub-componentes)
│   │   ├── editor/            # Editor visual con preview en vivo
│   │   └── library/           # Explorador de overlays
│   ├── pages/
│   │   ├── index.astro        # Library / Home
│   │   ├── overlay/
│   │   │   └── [type].astro   # 🎯 Browser Source pages para OBS (standalone)
│   │   ├── control/
│   │   │   └── index.astro    # Dashboard de control
│   │   └── editor/
│   │       └── index.astro    # Editor (usa query param ?id=)
│   ├── layouts/
│   │   ├── OverlayLayout.astro    # Layout limpio (sin chrome, para OBS)
│   │   └── BaseLayout.astro       # Layout con navegación
│   ├── lib/
│   │   ├── types.ts           # Todos los tipos compartidos
│   │   ├── ws-client.ts       # Cliente WebSocket (broadcast a overlays)
│   │   ├── api-client.ts      # Cliente REST para overlays (CRUD)
│   │   ├── defaults.ts        # Configs default por tipo de overlay
│   │   ├── presets.ts         # Presets de templates
│   │   └── pack-presets.ts    # 10 Stream Packs temáticos
│   └── styles/
│       ├── overlay.css         # Estilos base para overlays
│       └── animations.css      # Animaciones reutilizables
│
└── server/
    ├── index.ts               # Orquestador (78 líneas)
    ├── middleware.ts           # CORS, JSON, static helpers
    ├── routes/
    │   └── overlays.ts        # Rutas REST de overlays + templates
    ├── ws-handler.ts          # Gestión WS: conexiones, rooms, broadcast
    └── db.ts                  # SQLite init + queries (bun:sqlite)

## Archivos adicionales presentes

| Archivo | Propósito |
|---------|-----------|
| `data/store.db` | Base de datos SQLite (persistente, en `.gitignore`) |
| `dist/` | Build de Astro (servido por Bun en producción) |
| `src/lib/presets.ts` | Presets de templates (Lower Third, Timer, Ticker, ScoreBug) |
| `src/lib/pack-presets.ts` | 10 Stream Packs temáticos con paletas coherentes |
| `src/components/overlays/StreamPack.tsx` | Renderizador de paquetes completos |
| `src/lib/api-client.ts` | Cliente REST (CRUD + WS commands) |
| `src/lib/overlay-store.ts` | Zustand store del editor |
| `src/components/editor/TemplatePicker.tsx` | Selector de plantillas |
| `tests/` | Tests de tipos, componentes, y server (~126 tests reales) |
| `.github/workflows/ci.yml` | CI/CD (lint → test → build) |
| `eslint.config.mjs` | ESLint flat config |
| `.prettierrc` | Prettier config |
| `thoughts/shared/plans/PL-02-refactor-quality.md` | Plan de refactor 201-207 |
| `thoughts/shared/plans/PL-03-production-hardening.md` | Plan de production hardening 301-307 |
| `src/pages/editor/[id].astro` | Editor dinámico por ruta |
```

---

## 4. Arquitectura

```
┌────────────────────────────────────────────────────────────┐
│                    Bun Server (server/index.ts)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Static Files  │  │ WebSocket    │  │ REST API         │  │
│  │ (Astro build) │  │ /ws          │  │ /api/overlays/*  │  │
│  └──────────────┘  └──────┬───────┘  └──────────────────┘  │
│                           │                                 │
│                    ┌──────┴──────┐                          │
│                    │   SQLite    │ overlay_configs           │
│                    │  (bun:sqlite)│ overlay_templates        │
│                    └─────────────┘                          │
└────────────────────────────────────────────────────────────┘
         ▲                      ▲              ▲
         │ ws events            │ ws events    │ REST + ws
         │ rooms/               │              │
┌────────┴────────┐   ┌────────┴────────┐   ┌─┴──────────────┐
│ Overlay in OBS  │   │ Control Panel   │   │ Overlay Editor │
│ (Browser Source)│   │ (Browser)       │   │ (Browser)      │
│ ws://.../ws?id=X │   │ Emisor activo   │   │ CRUD + Preview │
└─────────────────┘   └─────────────────┘   └────────────────┘
```

### Capas de comunicación

| Capa | Protocolo | Ruta | Propósito |
|------|-----------|------|-----------|
| Tiempo real | WebSocket (nativo) | `ws://localhost:3001/ws` | Control remoto de overlays activos (con rooms) |
| Datos | REST | `http://localhost:3001/api/overlays` | CRUD de configuraciones guardadas |
| Plantillas | REST | `http://localhost:3001/api/templates` | Lista de plantillas predefinidas |
| Estático | HTTP | `http://localhost:3001/overlay/[type]` | Páginas Browser Source para OBS |
| Fallback | BroadcastChannel | Mismo origen | Canal extra si overlay y control están en mismo origen |

---

## 5. Tipos de Overlay

Ver `src/lib/types.ts` y `src/components/overlays/index.ts` para la lista completa. Resumen:

| Tipo | Descripción | Variantes |
|------|-------------|-----------|
| `lower-third` | Nombre + título | Dropzone, Glaze, On Air, Prime, Palladium |
| `timer` | Cronómetro / cuenta regresiva | Nitrogen, Lithium, Minimal |
| `scorebug` | Marcador deportivo | Soccer, Basketball, Football, Baseball, Hockey, Tennis, Rugby, Volleyball |
| `title-card` | Título fullscreen/banner | Genérico |
| `ticker` | Crawl de texto scrolling | Prime, Headline, Juice, Dusk, Lithium |
| `alert` | Popup de notificación | Genérico |
| `webcam-border` | Frame decorativo para webcam | Minimal, Arc Raiders, Sci-Fi, Fortnite |
| `sponsor-logo` | Logo con fade in/out | Genérico |
| `brb` | Pantalla de "Vuelvo enseguida" | Classic, Nursery |
| `2x-counter` | Contador de raids/donaciones | Burst, Glide |
| `money-effect` | Efecto de donación con $ | Genérico |
| `social-looper` | Rotador de redes sociales | Sociable |
| `weather-bug` | Clima en vivo | Breeze |
| `yt-view-count` | Contador de viewers YouTube | Live |
| `driveby` | Notificación de raid/driveby | Genérico |

### Stream Packs

10 paquetes temáticos completos con paleta coherente (lower third + scorebug + ticker + webcam + timer):
Accent, Juice, Lithium, Pyrite, Prime, Clean, Horizon, Workflow, Palladium, Stepback

---

## 6. Harness de Trabajo (Context Engineering)

Este proyecto sigue los patrones del [AI Engineering Harness](https://github.com/adrielp/ai-engineering-harness).

### Workflow principal

```
Ticket (en thoughts/shared/tickets/)
    │
    ▼
Seleccionar feature de feature_list.json
    │
    ▼
Implementar (una feature a la vez)
    │
    ▼
Verificar con init.ps1
    │
    ▼
Actualizar progress/current.md → history.md
    │
    ▼
Marcar feature como done en feature_list.json
```

### Una sesión típica

```bash
# 1. Inicializar/verificar entorno
powershell -File init.ps1

# 2. Leer estado actual
#    → progress/current.md
#    → feature_list.json

# 3. Elegir una feature pendiente

# 4. Si necesita investigación, crear ticket:
#    thoughts/shared/tickets/FEAT-XX-descripcion.md

# 5. Si necesita plan, crear plan:
#    thoughts/shared/plans/FEAT-XX-plan.md

# 6. Implementar

# 7. Verificar
powershell -File init.ps1

# 8. Documentar en progress/
# 9. Marcar feature como done
```

### Skills del agente

Este proyecto incluye skills personalizados para Hermes:

| Skill | Propósito |
|-------|-----------|
| `br1cg-session-start` | Inicia sesión de trabajo (init + leer estado + elegir feature) |
| `br1cg-session-end` | Cierra sesión (verify + documentar + marcar feature done) |
| `br1cg-init` | Inicializa y verifica el entorno de desarrollo |
| `br1cg-verify` | Ejecuta init.ps1 y reporta resultados detallados |
| `br1cg-dev` | Comandos de desarrollo diario (servidores, build, test) |
| `br1cg-new-overlay` | Genera scaffold de un nuevo tipo de overlay |
| `br1cg-new-feature` | Crea ticket + feature_list entry |

Carga cualquiera con `skill_view(name='br1cg-xxx')`.

---

## 7. Reglas duras (no negociables)

- **Una sola feature a la vez.** No mezcles cambios de varias tareas en la misma sesión.
- **No declares una tarea `done` sin verificación.** Ejecuta `init.ps1` y asegúrate de que pasa.
- **Documenta lo que haces** en `progress/current.md` mientras trabajas, no al final.
- **Deja el repositorio limpio** antes de cerrar la sesión (sin `console.log()` de debug, sin TODOs sin contexto, sin archivos temporales).
- **Si no sabes algo, busca en `docs/`** antes de inventar.

---

## 8. Flujo de Desarrollo Local

```bash
# Terminal 1: Servidor Bun (API + WS + estáticos en prod)
bun run dev:server

# Terminal 2: Astro dev (frontend + overlays, hot reload)
bun run dev:astro

# O todo en uno:
bun run dev
```

### Comandos

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Ambos en paralelo |
| `bun run dev:server` | Bun dev con watch (puerto 3001) |
| `bun run dev:astro` | Astro dev server (puerto 4321) |
| `bun run build` | Build Astro + compila server |
| `bun run lint` | ESLint check |
| `bun run lint:fix` | ESLint auto-fix |
| `bun run format` | Prettier formateo automático |
| `bun run format:check` | Prettier check |
| `bun run test` | Tests con vitest (componentes + tipos) |
| `bun run test:server` | Tests de server con bun test (SQLite) |
| `bun run test:all` | Tests completos (vitest + bun test) |
| `bun run start` | Servidor producción (puerto 3001) |
| `bun run db:seed` | Inserta templates por defecto |
| `bun run tools/dev.js` | Lanzador paralelo (alternativa a `bun run dev`) |

### URLs

| URL | Propósito |
|-----|-----------|
| `http://localhost:4321` | Astro dev (hot reload) |
| `http://localhost:3001` | Bun server (API + WS + estáticos) |
| `http://localhost:3001/` | Overlay Library (grid con todos los overlays) |
| `http://localhost:3001/control` | Dashboard de control |
| `http://localhost:3001/editor?id=new` | Editor de overlays (legacy) |
| `http://localhost:3001/editor/abc-123` | Editor de overlays dinámico |
| `http://localhost:3001/api/templates` | Plantillas predefinidas |
| `http://localhost:3001/overlay/timer` | Overlay Timer (Browser Source para OBS) |
| `http://localhost:3001/overlay/lower-third` | Lower Third overlay |
| `http://localhost:3001/overlay/scorebug` | Score Bug overlay |
| `http://localhost:3001/overlay/ticker` | Ticker overlay |
| `http://localhost:3001/overlay/alert` | Alert overlay |
| `http://localhost:3001/overlay/webcam-border` | Webcam Border overlay |
| `http://localhost:3001/overlay/sponsor-logo` | Sponsor Logo overlay |
| `http://localhost:3001/overlay/brb` | BRB overlay |
| `http://localhost:3001/overlay/2x-counter` | 2X Counter overlay |
| `http://localhost:3001/overlay/money-effect` | Money Effect overlay |
| `http://localhost:3001/overlay/social-looper` | Social Looper overlay |
| `http://localhost:3001/overlay/weather-bug` | Weather Bug overlay |
| `http://localhost:3001/overlay/yt-view-count` | YT View Count overlay |
| `http://localhost:3001/overlay/driveby` | DriveBy overlay |
| `ws://localhost:3001/ws` | WebSocket (control ↔ overlays) |
| `http://localhost:3001/api/health` | Health check + rooms info |

---

## 9. Convenciones de Código

Resumen (ver `docs/conventions.md` para versión completa):

- **TypeScript estricto** en toda la codebase
- **Componentes React** como funciones puras donde sea posible
- **Props explícitas**, nada de `any`
- **CSS Modules** o **Tailwind** para estilos de overlays (evitar runtime CSS-in-JS en overlays)
- **Nombres de archivos**: `kebab-case.ts` para utilidades, `PascalCase.tsx` para componentes
- **Overlay renderers** no deben depender de nada externo excepto WebSocket y URL params
- **Store Zustand** solo para el control panel, no para overlays
- **Mensajes WS** tipados con unión discriminada (`type` como discriminante)

---

## 10. Debugging

### Ver conexiones WS activas
```typescript
// En server/ws-handler.ts
console.table(rooms);  // { roomId: Set<WebSocket> }
```

### Probar overlay standalone (sin servidor)
```
http://localhost:4321/overlay/timer?minutes=5&seconds=0&mode=countdown&bgColor=%231a1a2e
```

### Logging de mensajes WS
```bash
WS_DEBUG=true bun run dev:server
```

---

## 11. Integración con OBS/vMix

### OBS — Browser Source
1. Agregar fuente → **Browser Source**
2. URL: `http://localhost:3001/overlay/timer?id=timer-1`
3. Ancho/Altura: según overlay (1920x1080 para fullscreen)
4. Marcar **"Refresh browser when scene becomes active"** si se necesita

### vMix — Browser Source
1. Agregar entrada → **Browser**
2. URL: `http://localhost:3001/overlay/timer?id=timer-1`
3. Para **Key/Fill**: añadir `?bgcolor=rgba(0,0,0,0)` al final

### Stream Deck
- Usar acción **"Website"** o **"HTTP Request"** para enviar comandos a la REST API
- Ej: `POST http://localhost:3001/api/overlays/timer-1/command` con body `{ "action": "show" }`

---

## 12. Tauri (Futuro)

Cuando se empacote con Tauri, el servidor Bun corre como **sidecar** y expone las URLs en un puerto real (`localhost:3001`), por lo que:
- ✅ OBS/vMix siguen cargando overlays como Browser Sources
- ✅ Cualquier dispositivo en la red LAN puede controlar desde `http://192.168.1.X:3001/control`
- ✅ No hay restricciones de protocolo interno (`tauri://`)
