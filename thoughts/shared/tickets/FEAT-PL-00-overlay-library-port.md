# Parallel Track: Port de la Overlay Library de overlays.uno

- **ID**: `FEAT-PL-00`
- **Type**: `research` → `feature` (parallel track)
- **Status**: `ready`
- **Created**: 2026-07-16
- **Updated**: 2026-07-16

## Descripción

Crear una librería de overlays HTML/CSS/JS que replique los diseños más icónicos y funcionales de overlays.uno, adaptados a nuestra arquitectura Bun + Astro. Esto corre en **paralelo** al desarrollo del core (Features 1-10).

## Estrategia de no-interferencia

```
Core App (Features 1-10)          Parallel Track (PL)
──────────────────────────        ──────────────────────
Scaffolding, server, DB           Research + catálogo de diseños
Timer funcional                   → Lower Thirds (5 variantes)
Lower Third + editor              → Scorebugs (10 deportes)
Library, Score Bug, Ticker        → Stream Packs (temáticos)
Alertas, Borders, Sponsors        → Tickers, Countdowns, Webcam Borders
Stream Deck + pulido              → QA + consistencia visual
```

**Regla**: La paralela solo produce:
1. Componentes React en `src/components/overlays/`
2. CSS/Tailwind en `src/styles/`
3. Templates JSON seed en `server/api/templates.ts`
4. Documentación de diseño

Nunca toca: server/, API, DB, control panel, editor.

## Catálogo de overlays a portar

Basado en el análisis de overlays.uno (free tier + públicas):

### Categoría 1: Lower Thirds (5 diseños)
Son el overlay más usado. Cada uno con personalidad distinta:

| Nombre | Estilo | Animación | Elementos |
|--------|--------|-----------|-----------|
| **Dropzone** | Moderno, gradiente, esquinas drop | Slide-left con bounce | Título + subtítulo + barra acento |
| **Glaze** | Glassmorphism, blurred bg | Fade + slide-up | Título + subtítulo + logo translúcido |
| **On Air** | Rojo clásico "en vivo" | Pulse + slide-right | Título + indicador rojo + barra |
| **Prime** | Minimalista, línea fina | Slide-left suave | Título + línea acento + subtítulo |
| **Palladium** | Metálico, elegante | Fade + zoom | Título + subtítulo + gradiente metálico |

### Categoría 2: Scorebugs (10 deportes)
Cada uno con diseño específico para el deporte:

| Deporte | Estilo | Elementos clave |
|---------|--------|-----------------|
| **Soccer** | Clean, scores arriba | Home/Away, score, tiempo, escudo |
| **Basketball** | Stacked vertical | Home/Away, score, período, shot clock |
| **Football** | Barra inferior ancha | Home/Away, score, down, yardas, tiempo |
| **Baseball** | Scoreboard tradicional | Home/Away, runs, hits, errors, inning |
| **Hockey** | Compacto, cronómetro | Home/Away, score, período, tiempo |
| **Tennis** | Minimal, sets | Jugador1/Jugador2, sets, games, puntos |
| **Boxing/Fighting** | Centrado, dramático | Boxeador1/Boxeador2, round, scorecards |
| **Rugby** | Score grande, clean | Home/Away, score, tries, conversions |
| **Volleyball** | Vertical compacto | Home/Away, sets, points, serving indicator |
| **Futsal** | Similar a soccer, compacto | Home/Away, score, período |

### Categoría 3: Stream Packs (temáticos)
Paquetes que incluyen lower third + scorebug + ticker + webcam border con misma paleta:

| Pack | Paleta | Elementos incluidos |
|------|--------|---------------------|
| **Accent** | Naranja/negro | Lower third, scorebug, ticker, webcam border |
| **Juice** | Verde neón/oscuro | Lower third, scorebug, ticker, logo bug |
| **Lithium** | Azul eléctrico/blanco | Lower third, scorebug, ticker, progress bar |
| **Pyrite** | Dorado/negro | Lower third, scorebug, ticker, webcam border |
| **Prime** | Blanco/negro/accento | Lower third, ticker, webcam border minimal |
| **Clean** | Blanco/gris, minimal | Lower third, scorebug minimal, ticker |
| **Horizon** | Azul marino/cyan | Lower third, scorebug, ticker, weather bug |
| **Workflow** | Púrpura/gradiente | Lower third, scorebug, progress bar, countdown |
| **Palladium** | Plateado/negro | Lower third, ticker, webcam border metálico |
| **Stepback** | Retro/80s neón | Lower third, scorebug retro, countdown |

### Categoría 4: Tickers (5 diseños)
Cada ticker con personalidad:

| Nombre | Estilo | Animación |
|--------|--------|-----------|
| **Prime** | Barra sólida, texto blanco | Scroll left continuo |
| **Headline** | Tipo CNN, barra roja | Scroll con pausa por noticia |
| **Juice** | Translúcido, neón | Scroll rápido con separador animado |
| **Dusk** | Oscuro, opaco | Scroll lento, elegante |
| **Lithium** | Azul eléctrico | Scroll con destellos entre mensajes |

### Categoría 5: Countdowns & Timers (3 diseños)

| Nombre | Estilo | Uso típico |
|--------|--------|------------|
| **Nitrogen** | Grande, bold, neón verde | Cuenta regresiva para show |
| **Lithium** | Circular con arco | Timer elegante con barra de progreso |
| **Minimal** | Solo texto, clean | Cronómetro de partido |

### Categoría 6: Webcam Borders (4 diseños)

| Nombre | Estilo |
|--------|--------|
| **Minimal** | Línea fina, 1 color, sin nombre |
| **Arc Raiders** | Bordes en arco, sci-fi, nombre jugador |
| **Sci-Fi** | Hexagonal, cibernético, stats |
| **Fortnite** | Estilo battle royale, colorido |

### Categoría 7: Efectos & Bugs (5 diseños)

| Nombre | Descripción |
|--------|-------------|
| **2X Counter** | Contador de kills/streak |
| **Money Effect** | Animación de dinero/dólares |
| **Drive-By** | Efecto de paso rápido |
| **Be Right Back** | Pantalla de "volvemos en breve" |
| **YouTube View Count** | Contador de viewers en vivo |

### Categoría 8: Widgets especiales

| Nombre | Descripción |
|--------|-------------|
| **Spin The Wheel** | Ruleta interactiva |
| **Quiz Show** | Preguntas y respuestas |
| **Crypto Ticker** | Cotizaciones crypto |
| **Weather Bug** | Clima con iconos |
| **Social Looper** | Redes sociales rotando |

## Entregables por sesión

Cada sesión de la paralela produce exactamente:

1. **1-2 componentes overlay** en `src/components/overlays/<Nombre>.tsx`
2. **CSS de animación** en `src/styles/` (si la animación es única)
3. **Template seed** añadido a `server/api/templates.ts`
4. **1-2 capturas** de referencia (de overlays.uno) guardadas en `thoughts/shared/research/`

## Dependencias

- No depende de Features 1-10 (los componentes se integran después)
- Solo necesita: `src/lib/types.ts`, `src/styles/overlay.css`, `src/styles/animations.css`
- Se puede trabajar en cualquier momento

## Archivos probablemente afectados

- `src/components/overlays/*.tsx` (nuevos)
- `src/styles/animations.css` (adiciones)
- `src/lib/types.ts` (si se necesita extender tipos)
- `server/api/templates.ts` (nuevos templates seed)
- `src/lib/defaults.ts` (nuevos defaults)
