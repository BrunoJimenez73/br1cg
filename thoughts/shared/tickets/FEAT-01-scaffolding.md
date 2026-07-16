# Scaffolding: Bun + Astro + React + Tailwind + estructura

- **ID**: `FEAT-01`
- **Type**: `feature`
- **Status**: `ready`
- **Feature list ref**: 1
- **Created**: 2026-07-16
- **Updated**: 2026-07-16

## Descripción

Inicializar el proyecto br1cg con Bun, instalar Astro + React + Tailwind, crear la estructura de carpetas completa y los archivos de configuración base.

## Contexto

Es el punto de partida del proyecto. Sin este scaffolding no se puede empezar a codificar ningún overlay ni el servidor.

## Criterios de aceptación

- [ ] `bun init` ejecutado en la raíz del proyecto
- [ ] Astro instalado con `@astrojs/react` y `@astrojs/tailwind`
- [ ] React + React DOM instalados
- [ ] Tailwind CSS configurado (`tailwind.config.mjs`)
- [ ] TypeScript configurado con strict mode (`tsconfig.json`)
- [ ] Estructura de carpetas creada (src/, server/, docs/, thoughts/, progress/, tools/)
- [ ] `package.json` con scripts: dev, dev:astro, dev:server, build, start, db:seed
- [ ] `astro.config.mjs` con integraciones React y Tailwind
- [ ] Layout OverlayLayout.astro creado (sin chrome, para OBS)
- [ ] Layout BaseLayout.astro creado (con navegación)
- [ ] `init.ps1` se ejecuta sin errores

## Notas técnicas

- Usar `bun create astro` o instalar manualmente los paquetes
- Astro en modo `output: hybrid` (server-side + static)
- Tailwind v4 (o v3 si v4 no es estable con Astro)

## Archivos probablemente afectados

- `package.json` (creación)
- `astro.config.mjs` (creación)
- `tsconfig.json` (creación)
- `tailwind.config.mjs` (creación)
- `src/layouts/OverlayLayout.astro` (creación)
- `src/layouts/BaseLayout.astro` (creación)
