import type { LowerThirdConfig, TimerConfig, TickerConfig, ScoreBugConfig } from './types';

export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  category: 'lower-third' | 'timer' | 'ticker' | 'scorebug';
  config: LowerThirdConfig | TimerConfig | TickerConfig | ScoreBugConfig;
}

// ─── Lower Third Presets ───
export const LOWER_THIRD_PRESETS: TemplatePreset[] = [
  {
    id: 'lt-dropzone',
    name: 'Dropzone',
    description: 'Lower third con fondo sólido oscuro y barra de color',
    category: 'lower-third',
    config: { title: 'Nombre', subtitle: 'Título / Rol', logoUrl: '', bgColor: '#1a1a2e', textColor: '#ffffff', accentColor: '#ff6b35', animation: 'slide-left', duration: 0, position: 'bottom-left' },
  },
  {
    id: 'lt-glaze',
    name: 'Glaze',
    description: 'Fondo translúcido con efecto vidrio esmerilado',
    category: 'lower-third',
    config: { title: 'Nombre', subtitle: 'Título / Rol', logoUrl: '', bgColor: 'rgba(255,255,255,0.08)', textColor: '#ffffff', accentColor: '#7c3aed', animation: 'fade', duration: 0, position: 'bottom-left' },
  },
  {
    id: 'lt-onair',
    name: 'On Air',
    description: 'Diseño para streams en vivo con indicador rojo',
    category: 'lower-third',
    config: { title: 'En Vivo', subtitle: 'Nombre del streamer', logoUrl: '', bgColor: '#000000', textColor: '#ffffff', accentColor: '#ef4444', animation: 'slide-right', duration: 0, position: 'top-left' },
  },
  {
    id: 'lt-prime',
    name: 'Prime',
    description: 'Minimalista con borde izquierdo de color',
    category: 'lower-third',
    config: { title: 'Nombre', subtitle: 'Título / Rol', logoUrl: '', bgColor: 'transparent', textColor: '#ffffff', accentColor: '#3b82f6', animation: 'slide-left', duration: 0, position: 'bottom-left' },
  },
  {
    id: 'lt-palladium',
    name: 'Palladium',
    description: 'Gradiente metálico elegante',
    category: 'lower-third',
    config: { title: 'Nombre', subtitle: 'Título / Rol', logoUrl: '', bgColor: 'linear-gradient(135deg, #e2e8f0, #94a3b8)', textColor: '#0f172a', accentColor: '#64748b', animation: 'fade', duration: 0, position: 'bottom-left' },
  },
];

// ─── Timer Presets ───
export const TIMER_PRESETS: TemplatePreset[] = [
  {
    id: 'timer-nitrogen',
    name: 'Nitrogen',
    description: 'Timer con estilo industrial',
    category: 'timer',
    config: { minutes: 5, seconds: 0, mode: 'countdown', format: 'mm:ss', autoStart: false, bgColor: 'transparent', textColor: '#22c55e', fontSize: '72px', showMillis: false, onComplete: 'stop' },
  },
  {
    id: 'timer-lithium',
    name: 'Lithium',
    description: 'Timer minimalista con línea inferior',
    category: 'timer',
    config: { minutes: 5, seconds: 0, mode: 'countdown', format: 'mm:ss', autoStart: false, bgColor: 'transparent', textColor: '#3b82f6', fontSize: '72px', showMillis: false, onComplete: 'stop' },
  },
  {
    id: 'timer-minimal',
    name: 'Minimal',
    description: 'Timer simple y limpio',
    category: 'timer',
    config: { minutes: 5, seconds: 0, mode: 'countdown', format: 'mm:ss', autoStart: false, bgColor: 'transparent', textColor: '#ffffff', fontSize: '64px', showMillis: false, onComplete: 'stop' },
  },
];

// ─── Ticker Presets ───
export const TICKER_PRESETS: TemplatePreset[] = [
  {
    id: 'ticker-prime',
    name: 'Prime',
    description: 'Ticker superior minimalista',
    category: 'ticker',
    config: { messages: ['Título de noticia'], speed: 80, separator: '•', bgColor: 'transparent', textColor: '#ffffff', accentColor: '#3b82f6', fontSize: 16, animation: 'scroll', height: 36, position: 'top' },
  },
  {
    id: 'ticker-headline',
    name: 'Headline',
    description: 'Ticker rojo de noticias urgentes',
    category: 'ticker',
    config: { messages: ['Noticia urgente'], speed: 60, separator: '|', bgColor: '#dc2626', textColor: '#ffffff', accentColor: '#991b1b', fontSize: 20, animation: 'scroll', height: 48, position: 'bottom' },
  },
  {
    id: 'ticker-juice',
    name: 'Juice',
    description: 'Ticker verde estilo gaming',
    category: 'ticker',
    config: { messages: ['Actualización'], speed: 80, separator: '•', bgColor: '#000000', textColor: '#22c55e', accentColor: '#22c55e', fontSize: 18, animation: 'scroll', height: 40, position: 'bottom' },
  },
  {
    id: 'ticker-dusk',
    name: 'Dusk',
    description: 'Ticker púrpura elegante',
    category: 'ticker',
    config: { messages: ['Actualización del día'], speed: 80, separator: '•', bgColor: '#1e1b4b', textColor: '#c4b5fd', accentColor: '#7c3aed', fontSize: 18, animation: 'scroll', height: 44, position: 'bottom' },
  },
  {
    id: 'ticker-lithium',
    name: 'Lithium',
    description: 'Ticker azul tecnológico',
    category: 'ticker',
    config: { messages: ['Última noticia'], speed: 80, separator: '•', bgColor: '#0f172a', textColor: '#94a3b8', accentColor: '#3b82f6', fontSize: 16, animation: 'scroll', height: 36, position: 'bottom' },
  },
];

// ─── ScoreBug Presets ───
export const SCOREBUG_PRESETS: TemplatePreset[] = [
  {
    id: 'sb-soccer',
    name: 'Soccer Air',
    description: 'Scorebug para fútbol',
    category: 'scorebug',
    config: { sport: 'soccer', homeTeam: { name: 'Local', abbrev: 'LOC', score: 0, color: '#3b82f6' }, awayTeam: { name: 'Visitante', abbrev: 'VIS', score: 0, color: '#ef4444' }, period: '1T', periodTime: '', bgColor: '#111827', textColor: '#ffffff', accentColor: '#3b82f6', showSport: true, showTime: true, style: 'default' },
  },
  {
    id: 'sb-basketball',
    name: 'Basketball Bold',
    description: 'Scorebug para basketball',
    category: 'scorebug',
    config: { sport: 'basketball', homeTeam: { name: 'Local', abbrev: 'LOC', score: 0, color: '#1d428a' }, awayTeam: { name: 'Visitante', abbrev: 'VIS', score: 0, color: '#c8102e' }, period: 'Q1', periodTime: '', bgColor: '#111827', textColor: '#ffffff', accentColor: '#f97316', showSport: true, showTime: true, style: 'default' },
  },
  {
    id: 'sb-football',
    name: 'Football Stealth',
    description: 'Scorebug para football americano',
    category: 'scorebug',
    config: { sport: 'football', homeTeam: { name: 'Local', abbrev: 'LOC', score: 0, color: '#013369' }, awayTeam: { name: 'Visitante', abbrev: 'VIS', score: 0, color: '#d50a0a' }, period: '1Q', periodTime: '', bgColor: '#111827', textColor: '#ffffff', accentColor: '#000000', showSport: true, showTime: true, style: 'default' },
  },
];

export const ALL_PRESETS = [...LOWER_THIRD_PRESETS, ...TIMER_PRESETS, ...TICKER_PRESETS, ...SCOREBUG_PRESETS];
