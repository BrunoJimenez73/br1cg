// ──────────────────────────────────────────────
// br1cg — Tipos compartidos del sistema
// ──────────────────────────────────────────────

// --- Tipos de overlay ---
export type OverlayType =
  | 'lower-third'
  | 'timer'
  | 'scorebug'
  | 'title-card'
  | 'ticker'
  | 'alert'
  | 'webcam-border'
  | 'sponsor-logo';

// --- Lower Third ---
export type LowerThirdAnimation = 'slide-left' | 'slide-right' | 'fade' | 'bounce';
export type LowerThirdPosition = 'bottom-left' | 'bottom-center' | 'top-left' | 'top-right';

export interface LowerThirdConfig {
  title: string;
  subtitle?: string;
  logoUrl?: string;
  bgColor: string;
  backgroundColor?: string; // alternativa para gradientes
  textColor: string;
  accentColor: string;
  animation: LowerThirdAnimation;
  duration: number;
  position: LowerThirdPosition;
}

// --- Timer ---
export type TimerMode = 'countdown' | 'countup';
export type TimerFormat = 'mm:ss' | 'hh:mm:ss' | 'mm:ss.ms' | 'circular';
export type TimerStatus = 'stopped' | 'running' | 'paused' | 'completed';
export type TimerCompleteAction = 'stop' | 'loop' | 'flash';

export interface TimerConfig {
  minutes: number;
  seconds: number;
  mode: TimerMode;
  format: TimerFormat;
  autoStart: boolean;
  bgColor: string;
  textColor: string;
  fontSize: string;
  showMillis: boolean;
  onComplete: TimerCompleteAction;
}

// --- Scorebug ---
export type ScoreBugSport = 'generic' | 'soccer' | 'basketball' | 'football' | 'baseball' | 'hockey' | 'tennis' | 'boxing' | 'rugby' | 'volleyball' | 'futsal';
export type ScoreBugSportEmoji = Record<ScoreBugSport, string>;

export interface ScoreTeam {
  name: string;
  abbrev: string;
  score: number;
  color: string;
  logo?: string;
  sets?: number[];
}

export interface ScoreBugConfig {
  sport: ScoreBugSport;
  homeTeam: ScoreTeam;
  awayTeam: ScoreTeam;
  period?: string;
  periodTime?: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  showSport?: boolean;
  showTime?: boolean;
  style?: string;
  // Legacy flat fields for backwards compat
  homeName?: string;
  awayName?: string;
  homeScore?: number;
  awayScore?: number;
  homeLogo?: string;
  awayLogo?: string;
  clock?: string;
}

// --- Title Card ---
export interface TitleCardConfig {
  title: string;
  subtitle?: string;
  bgImage?: string;
  bgColor: string;
  overlayColor: string;
  textColor: string;
  animation: 'fade' | 'zoom' | 'slide-up';
  duration: number;
  fullscreen: boolean;
}

// --- Ticker ---
export type TickerAnimation = 'scroll' | 'fade' | 'slide';
export type TickerPosition = 'top' | 'bottom';

export interface TickerConfig {
  messages: string[];
  speed: number;
  direction?: 'left' | 'right';
  separator: string;
  bgColor: string;
  textColor: string;
  accentColor?: string;
  fontSize: number;
  height: number;
  animation?: TickerAnimation;
  position?: TickerPosition;
}

// --- Alert ---
export interface AlertConfig {
  message: string;
  submessage?: string;
  title?: string;
  icon?: string;
  sound?: string;
  duration: number;
  position?: 'top' | 'bottom' | 'center';
  animation: 'slide' | 'fade' | 'pop' | 'bounce-in';
  bgColor: string;
  textColor: string;
  accentColor?: string;
  fontSize?: number;
}

// --- Webcam Border ---
export type WebcamBorderStyle = 'minimal' | 'arc-raiders' | 'sci-fi' | 'fortnite';

export interface WebcamBorderConfig {
  playerName: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  bgColor?: string;
  glowColor?: string;
  frameColor?: string;
  showName?: boolean;
  showStats?: boolean;
  stats?: { label: string; value: string }[];
  accentColor?: string;
  animation?: 'pulse' | 'glow' | 'static' | 'rainbow';
  style?: WebcamBorderStyle;
  position?: string;
}

// --- Sponsor Logo ---
export type SponsorPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center' | 'top-center';

export interface SponsorLogoConfig {
  logoUrl: string;
  name?: string;
  width?: number;
  height?: number;
  duration?: number;
  fadeIn?: number;
  fadeOut?: number;
  position: SponsorPosition;
  size?: 'sm' | 'md' | 'lg';
  opacity?: number;
  bgColor?: string;
}

// --- Editor Elements (visual editor) ---
export type OverlayElementType = 'text' | 'image' | 'shape' | 'timer-display' | 'score-display';

export interface OverlayElement {
  id: string;
  type: OverlayElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  props: Record<string, unknown>;
}

// --- Overlay Config unificado ---
export interface OverlayConfig {
  id: string;
  name: string;
  type: OverlayType;
  createdAt: string;
  updatedAt: string;
  data: OverlayConfigData;
  elements: OverlayElement[];
  tags: string[];
  favorite: boolean;
}

export type OverlayConfigData =
  | LowerThirdConfig
  | TimerConfig
  | ScoreBugConfig
  | TitleCardConfig
  | TickerConfig
  | AlertConfig
  | WebcamBorderConfig
  | SponsorLogoConfig;

// --- Mapa de tipo → interfaz de config ---
export interface OverlayConfigMap {
  'lower-third': LowerThirdConfig;
  'timer': TimerConfig;
  'scorebug': ScoreBugConfig;
  'title-card': TitleCardConfig;
  'ticker': TickerConfig;
  'alert': AlertConfig;
  'webcam-border': WebcamBorderConfig;
  'sponsor-logo': SponsorLogoConfig;
}

// --- Mensajes WebSocket ---
export type WSClientMessage =
  | { type: 'overlay:show'; overlayId: string; data?: Record<string, unknown> }
  | { type: 'overlay:hide'; overlayId: string }
  | { type: 'overlay:update'; overlayId: string; data: Record<string, unknown> }
  | { type: 'overlay:timer:start'; overlayId: string }
  | { type: 'overlay:timer:pause'; overlayId: string }
  | { type: 'overlay:timer:reset'; overlayId: string; data?: { minutes: number; seconds: number } }
  | { type: 'ping' };

export type WSServerMessage =
  | { type: 'command'; action: 'show' | 'hide' | 'update'; payload: Record<string, unknown> }
  | { type: 'event'; event: 'timer:tick'; data: { remaining: number; formatted: string } }
  | { type: 'event'; event: 'timer:complete'; data: Record<string, never> }
  | { type: 'event'; event: 'timer:start'; data: Record<string, unknown> }
  | { type: 'event'; event: 'timer:pause'; data: Record<string, unknown> }
  | { type: 'event'; event: 'timer:reset'; data: { minutes?: number; seconds?: number } }
  | { type: 'connected'; clientId: string }
  | { type: 'pong' }
  | { type: 'error'; message: string };

// --- Preset de template ---
export interface TimelineEntry {
  id: string;
  overlayId: string;
  action: 'show' | 'hide' | 'update';
  timestamp: number;
  data?: Record<string, unknown>;
}

export const OVERLAY_TYPES: OverlayType[] = [
  'lower-third', 'timer', 'scorebug', 'title-card',
  'ticker', 'alert', 'webcam-border', 'sponsor-logo',
];

export const OVERLAY_TYPE_LABELS: Record<OverlayType, string> = {
  'lower-third': 'Lower Third',
  'timer': 'Timer',
  'scorebug': 'Score Bug',
  'title-card': 'Title Card',
  'ticker': 'Ticker',
  'alert': 'Alert',
  'webcam-border': 'Webcam Border',
  'sponsor-logo': 'Sponsor Logo',
};
