# CHECKPOINTS — Criterios de "Estado Final Correcto"

> Cada feature se considera `done` solo cuando cumple TODOS los checkpoints aplicables.

---

## Checkpoints generales (aplican a toda feature)

- [x] **Sin errores de compilación**: `bun run build` passes without errors
- [x] **Sin errores de TypeScript**: `bun run tsc --noEmit` passes (strict mode)
- [x] **init.ps1 pasa sin errores**: El script de verificación se ejecuta limpio
- [x] **Sin console.log() de debug**: No hay `console.log()` ni `console.debug()` en producción
- [x] **Sin archivos temporales**: No hay `.tmp`, `.log` (excepto los intencionales), ni archivos huérfanos
- [x] **Repositorio en GitHub**: github.com/BrunoJimenez73/br1cg
- [x] **progress/current.md actualizado**: La sesión queda documentada
- [x] **feature_list.json actualizado**: La feature marcada como `done`

## Checkpoints por capa

### Servidor (server/)

- [x] **Arranca sin errores**: `bun run dev:server` inicia en < 2 segundos
- [x] **API REST responde**: `GET /api/overlays` devuelve `200` con array
- [x] **WebSocket acepta conexiones**: Cliente puede conectar a `ws://localhost:3001/ws`
- [x] **Rooms funcionan**: Mensajes enviados a una room solo llegan a sus suscriptores
- [x] **SQLite persistente**: Datos sobreviven a reinicio del servidor

### Overlay (src/components/overlays/)

- [x] **Renderiza standalone**: La URL `http://localhost:3001/overlay/[type]` muestra el overlay sin errores
- [x] **Responsive**: Se ve correctamente en 1920x1080 y 1280x720
- [x] **Animación fluida**: ≥ 30fps en Chrome cargado como Browser Source
- [x] **WS funcional**: Responde a comandos show/hide/update desde WebSocket
- [x] **URL params fallback**: Funciona con parámetros en URL sin WebSocket

### Control Panel (src/pages/control/)

- [x] **Lista overlays**: Muestra todos los overlays guardados desde la API
- [x] **Show/Hide**: Botones envían comandos WS correctamente
- [x] **Estado en vivo**: Indicador visual de conexión WS
- [x] **Editor funciona**: Guarda cambios vía API REST

### Editor (src/pages/editor/)

- [x] **Carga overlay existente**: GET /api/overlays/:id y muestra configuración
- [x] **Preview en vivo**: Los cambios se reflejan en el preview sin recargar
- [x] **Guarda correctamente**: PUT /api/overlays/:id persiste cambios
- [x] **Valida campos**: No permite guardar configuraciones inválidas

## Checkpoints de integración

- [x] **Control ↔ Overlay**: Show en control panel → overlay visible en OBS
- [x] **Hide → desaparece**: Overlay se oculta con animación
- [x] **Update en caliente**: Cambiar texto en editor → se actualiza en overlay sin parpadear
- [x] **Timer preciso**: No más de 100ms de deriva en 5 minutos de cuenta regresiva

## Checkpoints de empaquetado (Fase 5+)

- [x] **Stream Deck**: Una acción HTTP puede show/hide un overlay
- [ ] **Export/Import**: Configuraciones se exportan a JSON y se importan de vuelta
- [ ] **Backup automático**: SQLite se respalda antes de cada migración
