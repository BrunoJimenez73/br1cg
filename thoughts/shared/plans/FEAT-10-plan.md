# Plan: Feature 10 — Stream Deck Integration + Pulido Final

## Resumen

Agregar endpoints API optimizados para Stream Deck y realizar el pulido final del sistema.

---

## Fase 1: API para Stream Deck

### 1.1 Endpoint `POST /api/overlays/:id/command`

```typescript
// Body: { action: "show" | "hide" | "update", data?: Record<string, unknown> }
// Response: { success: boolean, overlayId: string, action: string }
```

**Implementación:**
- Recibir comando HTTP
- Buscar overlay en DB
- Enviar mensaje WS a la room del overlay
- Retornar confirmación HTTP

### 1.2 Endpoint `GET /api/overlays/quick`

```typescript
// Response: Array<{ id: string, name: string, type: string, lastUsed?: string }>
```

**Propósito:** Lista ligera para que Stream Deck muestre los overlays disponibles.

### 1.3 Endpoint `POST /api/overlays/:id/toggle`

```typescript
// Response: { success: boolean, newState: "visible" | "hidden" }
```

**Implementación:**
- Mantener estado en memoria (`Map<string, boolean>`)
- Alternar entre show/hide
- Retornar nuevo estado

---

## Fase 2: Helper WS para comandos

### 2.1 Función `sendOverlayCommand()`

```typescript
// server/ws-handler.ts
export function sendOverlayCommand(
  overlayId: string, 
  action: 'show' | 'hide' | 'update',
  data?: Record<string, unknown>
): boolean
```

**Propósito:** Reutilizar lógica de envío WS desde la API REST.

---

## Fase 3: Pulido Final

### 3.1 Limpieza de código
- [ ] Eliminar console.log() de debug
- [ ] Verificar que no hay archivos temporales
- [ ] Revisar imports no usados

### 3.2 Verificación de overlays
- [ ] Test manual de cada overlay type en browser
- [ ] Verificar animaciones en 1920x1080
- [ ] Confirmar que WS funciona para todos

### 3.3 Documentación
- [ ] Actualizar README.md con sección "Stream Deck Integration"
- [ ] Agregar ejemplos de configuración de Stream Deck
- [ ] Actualizar CHECKPOINTS.md si es necesario

---

## Orden de implementación

1. Crear helper `sendOverlayCommand()` en ws-handler.ts
2. Agregar endpoint `POST /api/overlays/:id/command`
3. Agregar endpoint `GET /api/overlays/quick`
4. Agregar endpoint `POST /api/overlays/:id/toggle`
5. Agregar estado en memoria para toggle
6. Limpieza de código
7. Documentación
8. Verificación final con init.ps1

---

## Estimación

~1-2 horas de implementación
