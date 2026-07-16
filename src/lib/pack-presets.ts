export interface StreamPackColors {
  primary: string;
  accent: string;
  muted: string;
  backgroundGradient: [string, string];
}

export interface StreamPackTypography {
  heading: string;
  body: string;
  mono: string;
}

export interface StreamPackConfig {
  id: string;
  name: string;
  description: string;
  colors: StreamPackColors;
  typography: StreamPackTypography;
}

export type StreamPackId = 'accent' | 'juice' | 'lithium' | 'pyrite' | 'prime' | 'clean' | 'horizon' | 'workflow' | 'palladium' | 'stepback';

export const STREAM_PACKS: Record<StreamPackId, StreamPackConfig> = {
  accent: {
    id: 'accent',
    name: 'Accent',
    description: 'Naranja vibrante sobre fondo oscuro',
    colors: { primary: '#ffffff', accent: '#ff6b35', muted: '#1a1a2e', backgroundGradient: ['#0f0f1a', '#1a1a2e'] },
    typography: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
  },
  juice: {
    id: 'juice',
    name: 'Juice',
    description: 'Verde neón gaming extremo',
    colors: { primary: '#ffffff', accent: '#22c55e', muted: '#0a1a0a', backgroundGradient: ['#000000', '#052e16'] },
    typography: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
  },
  lithium: {
    id: 'lithium',
    name: 'Lithium',
    description: 'Azul eléctrico tecnológico',
    colors: { primary: '#e2e8f0', accent: '#3b82f6', muted: '#1e293b', backgroundGradient: ['#0f172a', '#1e293b'] },
    typography: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
  },
  pyrite: {
    id: 'pyrite',
    name: 'Pyrite',
    description: 'Dorado premium sobre oscuro',
    colors: { primary: '#fef3c7', accent: '#f59e0b', muted: '#1a1600', backgroundGradient: ['#0f0f00', '#1a1600'] },
    typography: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
  },
  prime: {
    id: 'prime',
    name: 'Prime',
    description: 'Blanco limpio minimalista',
    colors: { primary: '#ffffff', accent: '#3b82f6', muted: '#1e293b', backgroundGradient: ['#0f172a', '#1e293b'] },
    typography: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
  },
  clean: {
    id: 'clean',
    name: 'Clean',
    description: 'Blanco y gris corporativo',
    colors: { primary: '#f1f5f9', accent: '#64748b', muted: '#334155', backgroundGradient: ['#1e293b', '#334155'] },
    typography: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
  },
  horizon: {
    id: 'horizon',
    name: 'Horizon',
    description: 'Azul marino fresco',
    colors: { primary: '#e0f2fe', accent: '#0ea5e9', muted: '#0c4a6e', backgroundGradient: ['#082f49', '#0c4a6e'] },
    typography: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
  },
  workflow: {
    id: 'workflow',
    name: 'Workflow',
    description: 'Púrpura creativo',
    colors: { primary: '#f3e8ff', accent: '#a855f7', muted: '#3b0764', backgroundGradient: ['#1e0533', '#3b0764'] },
    typography: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
  },
  palladium: {
    id: 'palladium',
    name: 'Palladium',
    description: 'Plateado elegante metálico',
    colors: { primary: '#f8fafc', accent: '#94a3b8', muted: '#1e293b', backgroundGradient: ['#0f172a', '#1e293b'] },
    typography: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
  },
  stepback: {
    id: 'stepback',
    name: 'Stepback',
    description: 'Retro 80s neón vibrante',
    colors: { primary: '#ffffff', accent: '#f472b6', muted: '#1a0033', backgroundGradient: ['#1a0033', '#330066'] },
    typography: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
  },
};

export function getPackById(id: StreamPackId): StreamPackConfig | undefined {
  return STREAM_PACKS[id];
}

export function getPackNames(): StreamPackId[] {
  return Object.keys(STREAM_PACKS) as StreamPackId[];
}
