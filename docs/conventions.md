# Convenciones de Código

## TypeScript

- **strict: true** en tsconfig.json. No usar `any` ni `@ts-ignore` a menos que sea estrictamente inevitable y documentado.
- Tipos compartidos en `src/lib/types.ts`. Unión discriminada para mensajes WS.
- Preferir `interface` sobre `type` para objetos de datos. Usar `type` para uniones y tuplas.

## Nombres de archivos

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componentes React | `PascalCase.tsx` | `LowerThird.tsx`, `TimerControl.tsx` |
| Utilidades / lib | `kebab-case.ts` | `ws-client.ts`, `overlay-store.ts` |
| Páginas Astro | `kebab-case.astro` | `[type].astro`, `index.astro` |
| Layouts Astro | `PascalCase.astro` | `OverlayLayout.astro` |
| Estilos globales | `kebab-case.css` | `animations.css`, `overlay.css` |
| Servidor | `kebab-case.ts` | `ws-handler.ts`, `db.ts` |

## Componentes React

- Funciones puras con `React.FC` implícito. Props tipadas con `interface` en el mismo archivo.
- Nada de `class components`, nada de `any` en props.
- Hooks personalizados en `src/lib/` o junto al componente si son específicos.

## Overlay Renderers

Los componentes en `src/components/overlays/` son el **corazón del sistema**. Deben:

1. **No depender de nada externo** excepto:
   - WebSocket client (para recibir comandos)
   - URL params (fallback para testing standalone)
   - Sus props de configuración
2. **Ser puramente visuales**: No tienen estado de aplicación, solo estado de animación local.
3. **Usar Tailwind + CSS animations**: Evitar runtime CSS-in-JS en overlays (mejor performance en Browser Source).
4. **Soportar `command:update`**: Todo overlay DEBE manejar el mensaje `command:update` para que los cambios desde el editor se reflejen en vivo. Usar el patrón de `liveConfig` state + merge con defaults.
5. **No usar `Math.random()` en render**: Calcular valores aleatorios con `useMemo` o `useRef` al montar.

## Server / API Routes

- Las rutas API van en `server/routes/` (un archivo por dominio: `overlays.ts`, `templates.ts`).
- `server/index.ts` solo maneja: serve, WS, y dispatch a routes.
- Validar entrada en POST/PUT antes de persistir.
- Usar `corsHeaders` de helper centralizado.

## Mensajes WebSocket

Todos los mensajes se tipan con unión discriminada:

```typescript
type WSMessage =
  | { type: "overlay:show"; overlayId: string; data: Record<string, unknown> }
  | { type: "overlay:hide"; overlayId: string }
  | { type: "overlay:update"; overlayId: string; data: Partial<OverlayConfig['data']> }
  | { type: "overlay:timer:start"; overlayId: string }
  | { type: "overlay:timer:pause"; overlayId: string }
  | { type: "ping" };
```

## CSS / Tailwind

- Usar Tailwind utility classes predominantemente.
- CSS modules solo para estilos específicos de overlay que no se pueden expresar con Tailwind.
- Las animaciones reutilizables van en `src/styles/animations.css`.
- Prefijos: `ol-` para clases de overlay, `ctrl-` para control panel.

## Git / Commits

- Mensajes en español o inglés (consistente dentro del proyecto).
- Prefijos: `feat:` para nuevas features, `fix:` para bugs, `docs:` para documentación, `chore:` para tareas de mantenimiento.
- Un commit por feature (no commits gigantes).

## Errores

- Errores de usuario: mostrar toast/notificación en el control panel.
- Errores de red: reintentar 3 veces antes de mostrar error.
- Errores de validación: mensaje claro en el formulario, no en consola.
- Usar `console.warn` para advertencias de desarrollo, nunca `console.log` en producción.
