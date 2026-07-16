# TITLE: Stream Deck Integration + Pulido Final

- **ID**: `FEAT-10`
- **Type**: `feature`
- **Status**: `done`
- **Feature list ref**: 10
- **Created**: 2026-07-16
- **Updated**: 2026-07-16

## Descripción

Integrar Stream Deck como dispositivo de control remoto y realizar el pulido final del sistema antes de considerar el proyecto completo.

## Contexto

Stream Deck es el dispositivo de control más popular para productores de streaming. Necesita una API REST simple y predecible para enviar comandos de show/hide/update a overlays. El pulido final asegura consistencia, rendimiento y documentación completa.

## Criterios de aceptación

### Stream Deck
- [ ] Endpoint `POST /api/overlays/:id/command` acepta `{ action: "show"|"hide"|"update", data?: {...} }`
- [ ] Endpoint `GET /api/overlays/quick` retorna lista simplificada para Stream Deck (id, name, type, status)
- [ ] Endpoint `POST /api/overlays/:id/toggle` alterna show/hide
- [ ] Endpoints son compatibles con HTTP Request action de Stream Deck
- [ ] Respuestas HTTP son consistentes (200 success, 404 not found, 400 bad request)

### Pulido Final
- [ ] Todos los overlays renderizan correctamente en 1920x1080
- [ ] Animaciones son fluidas (≥30fps)
- [ ] No hay console.log() de debug en producción
- [ ] TypeScript compila sin errores (strict mode)
- [ ] Documentación de API actualizada
- [ ] README con instrucciones de uso para Stream Deck

## Notas técnicas

### Stream Deck HTTP Request
Stream Deck usa "HTTP Request" plugin con configuración:
- Method: POST
- URL: `http://localhost:3001/api/overlays/{OVERLAY_ID}/command`
- Headers: `Content-Type: application/json`
- Body: `{ "action": "show" }` o `{ "action": "hide" }`

### Toggle endpoint
El toggle es útil para botones de Stream Deck que deben alternar entre show/hide con un solo botón.

## Archivos probablemente afectados

- `server/index.ts` — Nuevos endpoints API
- `server/ws-handler.ts` — Función helper para enviar comandos WS
- `README.md` — Documentación de uso
- `docs/verification.md` — Criterios de verificación actualizados
