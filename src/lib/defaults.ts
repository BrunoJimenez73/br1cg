// ──────────────────────────────────────────────
// br1cg — Configuraciones default por tipo de overlay
// ──────────────────────────────────────────────

import type {
  LowerThirdConfig, TimerConfig, ScoreBugConfig,
  TickerConfig, AlertConfig, WebcamBorderConfig,
  SponsorLogoConfig, TitleCardConfig, OverlayType,
  OverlayConfigData, OverlayElement,
} from './types';

export const DEFAULT_LOWER_THIRD: LowerThirdConfig = {
  title: 'Nombre',
  subtitle: 'Subtítulo',
  logoUrl: '',
  bgColor: '#1a1a2e',
  textColor: '#ffffff',
  accentColor: '#ff6b35',
  animation: 'slide-left',
  duration: 0,
  position: 'bottom-left',
};

export const DEFAULT_TIMER: TimerConfig = {
  minutes: 5,
  seconds: 0,
  mode: 'countdown',
  format: 'mm:ss',
  autoStart: false,
  bgColor: '#000000',
  textColor: '#ffffff',
  fontSize: '72px',
  showMillis: false,
  onComplete: 'stop',
};

export const DEFAULT_SCORE_BUG: ScoreBugConfig = {
  sport: 'soccer',
  homeTeam: { name: 'HOME', abbrev: 'HOM', score: 0, color: '#3b82f6' },
  awayTeam: { name: 'AWAY', abbrev: 'AWY', score: 0, color: '#ef4444' },
  period: '1T',
  periodTime: '',
  bgColor: '#111827',
  textColor: '#ffffff',
  accentColor: '#3b82f6',
  showSport: true,
  showTime: true,
  style: 'default',
};

export const DEFAULT_TICKER: TickerConfig = {
  messages: ['Bienvenidos a la transmisión', 'Síguenos en redes sociales'],
  speed: 80,
  separator: '•',
  bgColor: '#000000',
  textColor: '#ffffff',
  fontSize: 18,
  height: 40,
  animation: 'scroll',
  position: 'bottom',
};

export const DEFAULT_ALERT: AlertConfig = {
  message: '¡Nuevo seguidor!',
  submessage: 'Gracias por el soporte',
  icon: '🔔',
  duration: 5000,
  position: 'top',
  animation: 'bounce-in',
  bgColor: '#7c3aed',
  textColor: '#ffffff',
  accentColor: '#a78bfa',
  fontSize: 48,
};

export const DEFAULT_WEBCAM_BORDER: WebcamBorderConfig = {
  playerName: 'Player',
  width: 320,
  height: 240,
  borderRadius: 8,
  borderWidth: 2,
  borderColor: '#3b82f6',
  bgColor: '#0f172a',
  glowColor: '#3b82f633',
  frameColor: '#3b82f6',
  showName: true,
  showStats: false,
  accentColor: '#60a5fa',
  animation: 'static',
  style: 'minimal',
  position: 'bottom-right',
};

export const DEFAULT_SPONSOR_LOGO: SponsorLogoConfig = {
  logoUrl: '',
  name: 'Sponsor',
  width: 200,
  height: 80,
  duration: 10000,
  fadeIn: 500,
  fadeOut: 500,
  position: 'bottom-right',
  size: 'md',
  opacity: 0.8,
};

export const DEFAULT_TITLE_CARD: TitleCardConfig = {
  title: 'Título',
  subtitle: 'Subtítulo',
  bgImage: '',
  bgColor: '#0f172a',
  overlayColor: 'rgba(0,0,0,0.6)',
  textColor: '#ffffff',
  animation: 'fade',
  duration: 5000,
  fullscreen: true,
};

export const DEFAULTS: Record<OverlayType, OverlayConfigData> = {
  'lower-third': DEFAULT_LOWER_THIRD,
  'timer': DEFAULT_TIMER,
  'scorebug': DEFAULT_SCORE_BUG,
  'ticker': DEFAULT_TICKER,
  'alert': DEFAULT_ALERT,
  'webcam-border': DEFAULT_WEBCAM_BORDER,
  'sponsor-logo': DEFAULT_SPONSOR_LOGO,
  'title-card': DEFAULT_TITLE_CARD,
};

export function getDefaultConfig(type: OverlayType): OverlayConfigData {
  return DEFAULTS[type];
}

function el(
  id: string, type: OverlayElement['type'],
  x: number, y: number, w: number, h: number,
  props: Record<string, unknown>,
  partial?: Partial<OverlayElement>,
): OverlayElement {
  return { id, type, x, y, width: w, height: h, rotation: 0, zIndex: 1, opacity: 1, visible: true, locked: false, props, ...partial };
}

export const DEFAULT_ELEMENTS: Record<OverlayType, OverlayElement[]> = {
  'lower-third': [
    el('bg-bar', 'shape', 40, 920, 700, 100, { shapeType: 'rounded-rect', backgroundColor: '#1a1a2e', borderRadius: 4 }),
    el('accent-bar', 'shape', 40, 920, 6, 100, { shapeType: 'rectangle', backgroundColor: '#ff6b35' }),
    el('title', 'text', 60, 928, 650, 36, { text: 'Nombre', fontFamily: 'Inter, sans-serif', fontSize: 28, fontWeight: 700, color: '#ffffff', textAlign: 'left' }),
    el('subtitle', 'text', 60, 968, 650, 24, { text: 'Subtítulo', fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, color: '#cccccc', textAlign: 'left' }),
  ],
  'timer': [
    el('time-text', 'timer-display', 660, 440, 600, 120, { format: 'mm:ss', fontSize: 96, color: '#22c55e', fontFamily: 'monospace' }),
  ],
  'scorebug': [
    el('bg-bar', 'shape', 40, 980, 600, 80, { shapeType: 'rounded-rect', backgroundColor: '#111827', borderRadius: 6 }),
    el('home-name', 'text', 60, 992, 200, 28, { text: 'HOME', fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, color: '#ffffff', textAlign: 'left' }),
    el('away-name', 'text', 60, 1020, 200, 28, { text: 'AWAY', fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, color: '#ffffff', textAlign: 'left' }),
    el('home-score', 'text', 300, 990, 60, 60, { text: '0', fontFamily: 'Inter, sans-serif', fontSize: 36, fontWeight: 900, color: '#3b82f6', textAlign: 'center' }),
    el('away-score', 'text', 300, 1020, 60, 60, { text: '0', fontFamily: 'Inter, sans-serif', fontSize: 36, fontWeight: 900, color: '#ef4444', textAlign: 'center' }),
  ],
  'ticker': [
    el('bg-bar', 'shape', 0, 1040, 1920, 40, { shapeType: 'rectangle', backgroundColor: '#000000' }),
    el('messages', 'text', 10, 1040, 1900, 40, { text: 'Bienvenidos a la transmisión  •  Síguenos en redes sociales', fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 400, color: '#ffffff', textAlign: 'left' }),
  ],
  'alert': [
    el('bg-box', 'shape', 560, 380, 800, 200, { shapeType: 'rounded-rect', backgroundColor: '#7c3aed', borderRadius: 12 }),
    el('icon', 'text', 620, 410, 60, 60, { text: '🔔', fontFamily: 'sans-serif', fontSize: 32, color: '#ffffff', textAlign: 'center' }),
    el('message', 'text', 700, 410, 600, 40, { text: '¡Nuevo seguidor!', fontFamily: 'Inter, sans-serif', fontSize: 28, fontWeight: 700, color: '#ffffff', textAlign: 'left' }),
    el('submessage', 'text', 700, 460, 600, 30, { text: 'Gracias por el soporte', fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 400, color: '#d8b4fe', textAlign: 'left' }),
  ],
  'webcam-border': [
    el('frame', 'shape', 40, 40, 320, 240, { shapeType: 'rounded-rect', backgroundColor: 'transparent', borderColor: '#3b82f6', borderWidth: 2, borderRadius: 8 }),
    el('player-name', 'text', 50, 250, 300, 24, { text: 'Player', fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: '#ffffff', textAlign: 'center' }),
  ],
  'sponsor-logo': [
    el('logo', 'image', 1620, 900, 200, 80, { src: '', fit: 'contain' }),
  ],
  'title-card': [
    el('bg', 'shape', 0, 0, 1920, 1080, { shapeType: 'rectangle', backgroundColor: '#0f172a' }),
    el('overlay', 'shape', 0, 0, 1920, 1080, { shapeType: 'rectangle', backgroundColor: 'rgba(0,0,0,0.6)' }),
    el('title', 'text', 160, 440, 1600, 80, { text: 'Título', fontFamily: 'Inter, sans-serif', fontSize: 64, fontWeight: 900, color: '#ffffff', textAlign: 'center' }),
    el('subtitle', 'text', 160, 540, 1600, 50, { text: 'Subtítulo', fontFamily: 'Inter, sans-serif', fontSize: 32, fontWeight: 400, color: '#94a3b8', textAlign: 'center' }),
  ],
};

export function getDefaultElements(type: OverlayType): OverlayElement[] {
  return DEFAULT_ELEMENTS[type] ?? [];
}
