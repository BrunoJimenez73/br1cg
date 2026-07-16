# PL-01: Port de Lower Thirds — Dropzone, Glaze, On Air, Prime, Palladium

- **ID**: `PL-01`
- **Parent ticket**: `FEAT-PL-00`
- **Status**: `ready`
- **Created**: 2026-07-16

## Objetivo

Replicar 5 diseños de Lower Third de overlays.uno como componentes React standalone.

## Diseños a implementar

### 1. Dropzone
```
┌──────────────────────────────────────────────┐
│  ████████████                                 │ ← barra acento naranja
│  Juan Pérez                                   │ ← título bold
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ ← línea sutil
│  Comentarista invitado                        │ ← subtítulo
│  ───────────────────────────────────────────  │
└──────────────────────────────────────────────┘
Posición: bottom-left
Animación: slide-left con cubic-bezier bounce
```

### 2. Glaze (Glassmorphism)
```
┌──────────────────────────────────────────────┐
│  ┌────────────────────────────────────────┐  │
│  │  🖼️ Logo    JUAN PÉREZ                │  │ ← fondo blur/glass
│  │             Comentarista invitado      │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
Posición: bottom-left
Animación: fade + slide-up
```

### 3. On Air
```
┌──────────────────────────────────────────────┐
│  🔴 EN VIVO     Juan Pérez                   │ ← indicador rojo pulsante
│  ─────────────  Comentarista invitado         │
└──────────────────────────────────────────────┘
Posición: top-left
Animación: slide-right con pulse en indicador
```

### 4. Prime (Minimal)
```
┌──────────────────────────────────────────────┐
│                    │  JUAN PÉREZ              │ ← línea vertical acento
│                    │  comentarista invitado   │
└──────────────────────────────────────────────┘
Posición: bottom-left
Animación: slide-left suave (ease-out)
```

### 5. Palladium (Metálico)
```
┌──────────────────────────────────────────────┐
│  ┌─gradiente plateado─┐                      │
│  │  JUAN PÉREZ        │                      │ ← gradiente metálico
│  │  Comentarista       │                      │
│  └────────────────────┘                      │
└──────────────────────────────────────────────┘
Posición: bottom-left
Animación: fade + zoom sutil
```

## Especificación técnica

### Interfaz (ya en types.ts)
```typescript
interface LowerThirdConfig {
  title: string;
  subtitle?: string;
  logoUrl?: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  animation: 'slide-left' | 'slide-right' | 'fade' | 'bounce';
  duration: number;
  position: 'bottom-left' | 'bottom-center' | 'top-left' | 'top-right';
}
```

### Variantes → se mapean como templates presets

```typescript
const LOWER_THIRD_PRESETS = {
  dropzone: {
    name: 'Lower Third | Dropzone',
    data: {
      bgColor: '#1a1a2e',
      textColor: '#ffffff',
      accentColor: '#ff6b35',
      animation: 'slide-left',
      position: 'bottom-left',
      duration: 0,
    }
  },
  glaze: {
    name: 'Lower Third | Glaze',
    data: {
      bgColor: 'rgba(255,255,255,0.08)',
      textColor: '#ffffff',
      accentColor: '#7c3aed',
      animation: 'fade',
      position: 'bottom-left',
      duration: 0,
    }
  },
  onAir: {
    name: 'Lower Third | On Air',
    data: {
      bgColor: '#000000',
      textColor: '#ffffff',
      accentColor: '#ef4444',
      animation: 'slide-right',
      position: 'top-left',
      duration: 0,
    }
  },
  prime: {
    name: 'Lower Third | Prime',
    data: {
      bgColor: 'transparent',
      textColor: '#ffffff',
      accentColor: '#3b82f6',
      animation: 'slide-left',
      position: 'bottom-left',
      duration: 0,
    }
  },
  palladium: {
    name: 'Lower Third | Palladium',
    data: {
      bgColor: 'linear-gradient(135deg, #e2e8f0, #94a3b8)',
      textColor: '#0f172a',
      accentColor: '#64748b',
      animation: 'fade',
      position: 'bottom-left',
      duration: 0,
    }
  }
};
```

### Animaciones CSS

```css
/* Dropzone bounce */
@keyframes ol-slide-left-bounce {
  0% { transform: translateX(-120%); }
  60% { transform: translateX(2%); }
  80% { transform: translateX(-0.5%); }
  100% { transform: translateX(0); }
}

/* Glaze fade + slide-up */
@keyframes ol-fade-up {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* On Air pulse */
@keyframes ol-pulse-record {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* Palladium zoom */
@keyframes ol-fade-zoom {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}
```

## Criterios de aceptación

- [ ] 5 componentes Lower Third renderizan correctamente
- [ ] Cada uno con su animación de entrada/salida
- [ ] Aceptan props de configuración (title, subtitle, colors)
- [ ] Se ven bien en 1920x1080 como Browser Source
- [ ] Funcionan con WebSocket (show/hide/update)
- [ ] Funcionan con URL params como fallback
- [ ] Templates registrados en `server/api/templates.ts`
