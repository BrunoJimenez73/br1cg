# Adding a New Overlay Type

Step-by-step guide to add a new overlay to br1cg.

---

## Overview

Each overlay type requires changes in 6 files. The pattern is consistent across all 15 existing overlays.

---

## Step 1: Define the type

Add the type string to the `OverlayType` union in `src/lib/types.ts`:

```typescript
export type OverlayType =
  | 'lower-third'
  | 'timer'
  // ... existing types ...
  | 'my-new-type';  // ← add here
```

## Step 2: Define the config interface

In `src/lib/types.ts`, add your config interface:

```typescript
export interface MyNewTypeConfig {
  title: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  // ... your fields
}
```

Follow the pattern of existing configs:
- Colors use `string` (hex/rgb)
- Font sizes use `number` (px)
- Durations use `number` (ms)
- Booleans for feature flags

## Step 3: Add defaults

In `src/lib/defaults.ts`, add a case to `getDefaultConfig()`:

```typescript
case 'my-new-type':
  return {
    title: 'Hello',
    bgColor: '#1a1a2e',
    textColor: '#ffffff',
    accentColor: '#3b82f6',
    // ...
  };
```

Also add a default elements case if your overlay uses the element system:

```typescript
case 'my-new-type':
  return [
    { id: 'title', type: 'text', x: 40, y: 540, width: 600, height: 60, text: 'Hello', style: { color: '#ffffff', fontSize: 32, fontWeight: 700 } },
  ];
```

## Step 4: Create the component

Create `src/components/overlays/MyNewType.tsx`:

```tsx
import React, { useMemo } from 'react';
import type { MyNewTypeConfig } from '../../lib/types';
import { useWebSocket } from '../../lib/ws-client';

interface MyNewTypeProps {
  config?: Partial<MyNewTypeConfig>;
  overlayId?: string;
}

export function MyNewType({ config: c, overlayId }: MyNewTypeProps) {
  const cfg = useMemo<MyNewTypeConfig>(() => ({
    title: 'Hello',
    bgColor: '#1a1a2e',
    textColor: '#ffffff',
    accentColor: '#3b82f6',
    ...c,
  }), [c]);

  useWebSocket({
    overlayId,
    onMessage: (msg) => {
      if (msg.type === 'command') {
        // Handle show/hide/update
      }
    },
  });

  return (
    <div style={{
      position: 'absolute', inset: 0,
      width: 1920, height: 1080,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: cfg.bgColor,
    }}>
      <div style={{ color: cfg.textColor, fontSize: 48, fontWeight: 800 }}>
        {cfg.title}
      </div>
    </div>
  );
}
```

Key patterns:
- Use `useWebSocket({ overlayId, onMessage })` for control
- Use `useMemo` for config merging (static defaults + dynamic props)
- Use inline `style` for all styling (not CSS classes)
- Canvas is always 1920x1080
- Use `position: absolute; inset: 0` for fullscreen overlays

## Step 5: Register the component

In `src/components/overlays/index.ts`:

1. Add export:
```typescript
export { MyNewType } from './MyNewType';
```

2. Add to `OVERLAY_COMPONENTS` map:
```typescript
import { MyNewType as _MyNewType } from './MyNewType';

export const OVERLAY_COMPONENTS: Partial<Record<OverlayType, React.ComponentType<any>>> = {
  // ... existing entries ...
  'my-new-type': _MyNewType,
};
```

## Step 6: Add presets (optional)

In `src/lib/presets.ts`, add a preset:

```typescript
export const MY_NEW_TYPE_PRESETS: TemplatePreset[] = [
  {
    id: 'my-new-basic',
    name: 'My New Type Basic',
    category: 'basico',
    type: 'my-new-type',
    description: 'A basic version',
    config: {
      title: 'Hello World',
      bgColor: '#1a1a2e',
      textColor: '#ffffff',
      accentColor: '#3b82f6',
    },
  },
];
```

Then add to `ALL_PRESETS`:
```typescript
import { MY_NEW_TYPE_PRESETS } from './presets';
// ...
export const ALL_PRESETS = [
  ...LOWER_THIRD_PRESETS,
  ...TIMER_PRESETS,
  // ...
  ...MY_NEW_TYPE_PRESETS,
];
```

## Step 7: Create the page route

Create `src/pages/overlay/my-new-type.astro`:

```astro
---
import OverlayLayout from '../../layouts/OverlayLayout.astro';
import { MyNewType } from '../../components/overlays/MyNewType';
---

<OverlayLayout title="My New Type">
  <MyNewType />
</OverlayLayout>
```

The page is accessible at `/overlay/my-new-type`.

## Step 8: Add tests

Add to `tests/overlays.test.tsx`:

```typescript
describe('MyNewType', () => {
  it('renders with default config', () => {
    render(<MyNewType />);
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('applies custom config', () => {
    render(<MyNewType config={{ title: 'Custom' }} />);
    expect(screen.getByText('Custom')).toBeTruthy();
  });
});
```

Add to `tests/types.test.ts`:
```typescript
it('has valid default config for my-new-type', () => {
  const cfg = getDefaultConfig('my-new-type');
  expect(cfg).toHaveProperty('title');
  expect(cfg).toHaveProperty('bgColor');
});
```

---

## Checklist

- [ ] `OverlayType` updated in `src/lib/types.ts`
- [ ] Config interface added to `src/lib/types.ts`
- [ ] Defaults added to `src/lib/defaults.ts`
- [ ] Component created in `src/components/overlays/MyNewType.tsx`
- [ ] Exported in `src/components/overlays/index.ts`
- [ ] Added to `OVERLAY_COMPONENTS` map
- [ ] Presets added (optional)
- [ ] Page route created at `src/pages/overlay/my-new-type.astro`
- [ ] Tests added
- [ ] Runs with `bun run dev:astro` at `/overlay/my-new-type`
- [ ] Controlled from dashboard at `/control`
