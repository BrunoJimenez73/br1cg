# Verificación

> Cómo demostrar que el sistema funciona correctamente.

## Prueba rápida (humano)

```bash
# 1. Iniciar servidor
bun run dev

# 2. Abrir control panel
start http://localhost:3001/control

# 3. Abrir overlay timer en otra pestaña (simula OBS)
start http://localhost:3001/overlay/timer

# 4. Desde el control panel, hacer clic en "Show Timer"
#    → El overlay debe aparecer con el timer corriendo

# 5. Hacer clic en "Hide"
#    → El overlay debe desaparecer con animación
```

## Prueba con OBS real

1. Abrir OBS Studio
2. Agregar fuente → **Browser Source**
3. URL: `http://localhost:3001/overlay/timer`
4. Ancho: 1920, Alto: 1080
5. Abrir control panel en navegador: `http://localhost:3001/control`
6. Click "Show Timer" → debe aparecer en OBS
7. Click "Hide" → debe desaparecer

## Prueba de integridad (init.ps1)

El script `init.ps1` verifica:

- ✅ Bun instalado y versión correcta
- ✅ Dependencias instaladas (`bun install` opcional)
- ✅ TypeScript compila sin errores (`bun run tsc --noEmit`)
- ✅ Build de Astro exitoso (`bun run build`)
- ✅ Servidor arranca en < 2 segundos
- ✅ API responde (GET /api/overlays → 200)
- ✅ WebSocket acepta conexiones
- ✅ Tests pasan (si existen)

## Prueba de WebSocket (manual con curl no, mejor con script)

```typescript
// tools/test-ws.ts — prueba rápida de WS
const ws = new WebSocket('ws://localhost:3001/ws');
ws.onopen = () => {
  console.log('✅ Conectado');
  ws.send(JSON.stringify({ type: 'ping' }));
};
ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);
  console.log('📩 Recibido:', data.type);
  if (data.type === 'pong') {
    console.log('✅ WebSocket funcional');
    ws.close();
  }
};
```

## Prueba de Timer (precisión)

```typescript
// tools/test-timer-precision.ts
// Configura timer de 5 segundos, mide deriva al completar
```

## Criterios de aceptación por feature

Ver `CHECKPOINTS.md` para la lista completa de checkpoints por feature.
