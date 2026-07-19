# Sesión activa

---

## Feature en curso

```
ID:     PL-03 Phase 307 — Docs Cleanup + API Reference
Title:  Docs cleanup + API reference + dead CSS removal
Status: completado
```

## Cambios realizados (Sesión 12+)

### docs/api.md (NUEVO)
Referencia completa de la API REST + WebSocket:
- Health check, CRUD overlays, toggle, command, export/import
- WebSocket protocol (messages, rooms, heartbeat)
- Stream Deck integration guide
- 15 overlay types reference table

### docs/new-overlay.md (NUEVO)
Guía paso a paso para agregar un nuevo tipo de overlay:
- 8 pasos: type → config → defaults → component → register → presets → page → tests
- Checklist al final

### docs/conventions.md (UPDATED)
- WSMessage example actualizado con tipos reales (`overlay:save`, `timer:tick`, etc.)

### docs/architecture.md (UPDATED)
- Test count actualizado: 188 tests

### CHECKPOINTS.md (UPDATED)
- Todos los checkpoints de 301-307 marcados como completados
- Test count actualizado a 188

### overlay.css (CLEANED)
- Eliminadas ~200 líneas de CSS muerto: ol-overlay, ol-hidden, ol-visible, ol-transition, ol-timer-display, ol-timer-millis, ol-timer-label, ol-ticker*, ol-scorebug*, ol-webcam-border/frame/name, ol-countdown*, ol-brb*
- Conservadas: posiciones, lower-third, onair-dot, glass, timer-circular, timer-corner/line, webcam-gradient

### Port detection refactor (5 archivos)
- `src/lib/ws-client.ts`: Nueva función `getAPIBase()` — resuelve el HTTP base URL (dev 4321 → localhost:3001)
- `src/lib/api-client.ts`: Refactorizado para usar `getAPIBase()` + `API_PATH`
- `src/components/overlays/OverlayRenderer.tsx`: Refactorizado para usar `getAPIBase()`
- `src/components/editor/templatePicker.tsx`: Refactorizado para usar `getAPIBase()`
- `src/components/studio/ControlPane.tsx`: Refactorizado para usar `getWSBase()`
- `src/components/studio/StudioPage.tsx`: Refactorizado para usar `getWSBase()`

### feature_list.json
- Feature #309 marcada como `done`

---

## Estado actual

| Componente | Estado |
|-----------|--------|
| Tests | ✅ 188/188 pasan (137 vitest + 51 bun test) |
| Build | ✅ 19 páginas, 0 errores, 0 warnings |
| Docs | ✅ api.md + new-overlay.md creados |
| CSS | ✅ ~200 líneas de dead code eliminadas |
| PL-03 | ✅ **TODAS LAS FASES COMPLETADAS** (301-309) |

---

## Cierre

**PL-03 Production Hardening COMPLETADO.** Todas las 9 features (301-309) terminadas:
- 301: Bug Fixes (7 bugs)
- 302: Server Router Rewrite
- 303: useOverlayLifecycle hook
- 304: Editor Zustand store + undo/redo
- 305: Dashboard rewrite
- 306: Tests reales (188 tests)
- 307-308: WYSIWYG renderer + Studio page
- 309: Docs cleanup + API reference

Siguiente paso: elegir nueva feature de `feature_list.json` o cerrar sesión.
