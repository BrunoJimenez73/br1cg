# CHECKPOINTS — Criterios de "Estado Final Correcto"

> Cada feature se considera `done` solo cuando cumple TODOS los checkpoints aplicables.

---

## Checkpoints generales (aplican a toda feature)

- [ ] **Sin errores de compilación**: `bun run build` passes without errors
- [ ] **Sin errores de TypeScript**: `bun run tsc --noEmit` passes (strict mode)
- [ ] **init.ps1 pasa sin errores**: El script de verificación se ejecuta limpio
- [ ] **Sin console.log() de debug**: No hay `console.log()` ni `console.debug()` en producción
- [ ] **Sin archivos temporales**: No hay `.tmp`, `.log` (excepto los intencionales), ni archivos huérfanos
- [ ] **progress/current.md actualizado**: La sesión queda documentada
- [ ] **feature_list.json actualizado**: La feature marcada como `done`

## Checkpoints por capa

### Servidor (server/)

- [ ] **Arranca sin errores**: `bun run dev:server` inicia en < 2 segundos
- [ ] **API REST responde**: `GET /api/overlays` devuelve `200` con array
- [ ] **WebSocket acepta conexiones**: Cliente puede conectar a `ws://localhost:3001/ws`
- [ ] **Rooms funcionan**: Mensajes enviados a una room solo llegan a sus suscriptores
- [ ] **SQLite persistente**: Datos sobreviven a reinicio del servidor

### Overlay (src/components/overlays/)

- [ ] **Renderiza standalone**: La URL `http://localhost:3001/overlay/[type]` muestra el overlay sin errores
- [ ] **Responsive**: Se ve correctamente en 1920x1080 y 1280x720
- [ ] **Animación fluida**: ≥ 30fps en Chrome cargado como Browser Source
- [ ] **WS funcional**: Responde a comandos show/hide/update desde WebSocket
- [ ] **URL params fallback**: Funciona con parámetros en URL sin WebSocket

### Control Panel (src/pages/control/)

- [ ] **Lista overlays**: Muestra todos los overlays guardados desde la API
- [ ] **Show/Hide**: Botones envían comandos WS correctamente
- [ ] **Estado en vivo**: Indicador visual de conexión WS
- [ ] **Editor funciona**: Guarda cambios vía API REST

### Editor (src/pages/editor/)

- [ ] **Carga overlay existente**: GET /api/overlays/:id y muestra configuración
- [ ] **Preview en vivo**: Los cambios se reflejan en el preview sin recargar
- [ ] **Guarda correctamente**: PUT /api/overlays/:id persiste cambios
- [ ] **Valida campos**: No permite guardar configuraciones inválidas

## Checkpoints de integración

- [ ] **Control ↔ Overlay**: Show en control panel → overlay visible en OBS
- [ ] **Hide → desaparece**: Overlay se oculta con animación
- [ ] **Update en caliente**: Cambiar texto en editor → se actualiza en overlay sin parpadear
- [ ] **Timer preciso**: No más de 100ms de deriva en 5 minutos de cuenta regresiva

## Checkpoints de empaquetado (Fase 5+)

- [ ] **Stream Deck**: Una acción HTTP puede show/hide un overlay
- [ ] **Export/Import**: Configuraciones se exportan a JSON y se importan de vuelta
- [ ] **Backup automático**: SQLite se respalda antes de cada migración
