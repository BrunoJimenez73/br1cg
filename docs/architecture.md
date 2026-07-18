# Arquitectura

## Stack

| Capa | Tecnología | Justificación |
|------|-----------|--------------|
| Runtime | **Bun** | Unifica server y build, `bun:sqlite` nativo, rápido, compatible con npm |
| Frontend framework | **Astro** | Perfecto para overlays standalone (páginas [type].astro) + islas React interactivas |
| UI interactiva | **React + Tailwind** | Componentes reutilizables, ecosistema amplio |
| Estado (control panel) | **Zustand** | Liviano, tipado, sin boilerplate, ideal para stores locales |
| Base de datos | **bun:sqlite** | Zero configuración, embedded, sin procesos externos |
| Comunicación en tiempo real | **WebSocket nativo** (Bun) | Sin dependencias externas, control total, rooms por overlay |
| Animaciones overlays | **CSS + Tailwind + GSAP** (opcional) | GPU-accelerated, sin bundle pesado para overlays |

## Decisiones clave

### ¿Por qué Bun y no Node.js?
- `bun:sqlite` nativo sin necesidad de `better-sqlite3` ni compilación
- WebSocket nativo con Bun.serve() sin `ws` ni `socket.io`
- `bun run` significativamente más rápido que Node
- Un runtime para server y build

### ¿Por qué Astro y no solo React?
- Cada overlay es una página HTML independiente que OBS carga como Browser Source
- Astro genera HTML estático sin JavaScript runtime (cero JS si el overlay no lo necesita)
- Las "islas" React se activan solo donde se necesita interactividad (control panel, editor)
- Rutas como `/overlay/[type]` son naturales en Astro

### ¿Por qué WebSocket con rooms y no BroadcastChannel?
- Los overlays en OBS se cargan en contexto de Browser Source (no mismo origen que el control)
- WebSocket permite control desde cualquier dispositivo en la red LAN
- Rooms permite dirigir comandos a un overlay específico (ej. `timer-1` vs `timer-2`)

### ¿Por qué SQLite y no PostgreSQL/MySQL?
- Es una aplicación local monousuario
- Zero configuración para el usuario final
- El archivo `.db` es fácil de respaldar, transportar y versionar
- `bun:sqlite` lo hace trivial

## Flujo de datos

```
Control Panel                    Servidor Bun                    OBS Browser Source
  (React/Zustand)                  (Bun HTTP+WS)                 (Overlay standalone)
       │                               │                               │
       │── POST /api/overlays ──────►  │                               │
       │                               │── INSERT INTO SQLite ──────── │
       │◄── 201 { overlay } ─────────  │                               │
       │                               │                               │
       │── WS connect ───────────────► │                               │
       │                               │                               │
       │── WS: { type: "show", ... } ► │                               │
       │                               │── WS: { type: "command", ... }►│
       │                               │                               │── animateIn()
       │                               │                               │
       │── WS: { type: "update", ...}► │                               │
       │                               │── WS: { type: "command", ... }►│
       │                               │                               │── updateText()
```

## Rooms de WebSocket

```
Servidor WS
  │
  ├─ room "timer-1"
  │   ├── ◄── Browser Source (OBS) suscrito a "timer-1"
  │   └── ◄── (puede haber múltiples sinks)
  │
  ├─ room "lower-third-main"
  │   └── ◄── Browser Source (OBS)
  │
  └─ room "__control__" (broadcast a todos los controles)
      └── ◄── Control Panel

Cada overlay se conecta con ?subscribe=timer-1 en la URL.
El servidor mantiene Map<roomId, Set<WebSocket>>.
```

## Estado del proyecto (Features 201-207)

Plan detallado: `thoughts/shared/plans/PL-02-refactor-quality.md`

| Fase | Cambio | Estado |
|------|--------|--------|
| 201 | Limpieza de dead code (legacy components, exports muertos) | ✅ Completado |
| 202 | Bugs críticos (command:update, WS reconnect, ControlDashboard) | ✅ Completado |
| 203 | API routes modulares (`server/routes/`), validación de entrada | ✅ Completado |
| 204 | Error boundaries, presets completos (34 presets, 15 tipos) | ✅ Completado |
| 205 | Tests (componentes, API, tipos) | ✅ Completado (230 tests) |
| 206 | Export/Import (`GET /export`, `POST /import`, UI buttons) | ✅ Completado |
| 207 | Documentación actualizada | ✅ Completado |

## Seguridad y validación

### API Validation
- `POST /api/overlays` valida: type (debe ser uno de 15 válidos), name (string no vacío), data (objeto), elements/tags (arrays)
- `PUT /api/overlays/:id` valida los mismos campos si se proveen
- `POST /api/overlays/import` valida cada overlay del array, salta existentes por ID
- `POST /api/overlays/:id/command` valida action (show/hide/update)

### Error Boundary
- `OverlayErrorBoundary` envuelve cada overlay en `OverlayRenderer`
- Captura errores de render y muestra fallback UI con botón de retry
- Previene que un overlay roto destruya toda la página
