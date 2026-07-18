import type {
  LowerThirdConfig, TimerConfig, TickerConfig, ScoreBugConfig,
  AlertConfig, WebcamBorderConfig, SponsorLogoConfig, TitleCardConfig,
  BRBConfig, TwoXCounterConfig, MoneyEffectConfig, SocialLooperConfig,
  WeatherBugConfig, YouTubeViewCountConfig, DriveByConfig,
} from './types';

export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  category: string;
  config: Record<string, unknown>;
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

// ─── Alert Presets ───
export const ALERT_PRESETS: TemplatePreset[] = [
  {
    id: 'alert-subscription',
    name: 'New Subscription',
    description: 'Alerta de nueva suscripci\u00f3n con color p\u00farpura',
    category: 'alert',
    config: { message: 'New Subscriber!', submessage: 'Thanks for subscribing!', title: '\ud83c\udf89', icon: '\ud83c\udf89', duration: 5, position: 'top', animation: 'bounce-in', bgColor: '#7c3aed', textColor: '#ffffff', accentColor: '#a78bfa', fontSize: 24 },
  },
  {
    id: 'alert-donation',
    name: 'Donation',
    description: 'Alerta de donaci\u00f3n con color dorado',
    category: 'alert',
    config: { message: 'New Donation!', submessage: '$5.00 from Viewer', title: '\ud83d\udcb0', icon: '\ud83d\udcb0', duration: 6, position: 'center', animation: 'pop', bgColor: '#f59e0b', textColor: '#000000', accentColor: '#fbbf24', fontSize: 28 },
  },
];

// ─── Webcam Border Presets ───
export const WEBCAM_BORDER_PRESETS: TemplatePreset[] = [
  {
    id: 'wb-minimal',
    name: 'Minimal',
    description: 'Borde limpio y simple para webcam',
    category: 'webcam-border',
    config: { playerName: 'Streamer', width: 320, height: 180, borderRadius: 8, borderWidth: 2, borderColor: '#3b82f6', bgColor: 'transparent', showName: true, animation: 'static', style: 'minimal' },
  },
  {
    id: 'wb-sci-fi',
    name: 'Sci-Fi',
    description: 'Borde futurista con efecto ne\u00f3n',
    category: 'webcam-border',
    config: { playerName: 'Player', width: 340, height: 200, borderRadius: 4, borderWidth: 3, borderColor: '#00ff88', bgColor: 'rgba(0,255,136,0.05)', glowColor: '#00ff88', showName: true, animation: 'glow', style: 'sci-fi' },
  },
];

// ─── Sponsor Logo Presets ───
export const SPONSOR_LOGO_PRESETS: TemplatePreset[] = [
  {
    id: 'sponsor-center',
    name: 'Center Display',
    description: 'Logo centrado con fade in/out',
    category: 'sponsor-logo',
    config: { logoUrl: '', name: 'Sponsor', duration: 5, fadeIn: 1, fadeOut: 1, position: 'center', size: 'lg', opacity: 0.9, bgColor: 'rgba(0,0,0,0.8)' },
  },
  {
    id: 'sponsor-corner',
    name: 'Corner Bug',
    description: 'Logo peque\u00f1o en esquina',
    category: 'sponsor-logo',
    config: { logoUrl: '', name: 'Partner', duration: 8, fadeIn: 0.5, fadeOut: 0.5, position: 'bottom-right', size: 'sm', opacity: 0.7, bgColor: 'transparent' },
  },
];

// ─── Title Card Presets ───
export const TITLE_CARD_PRESETS: TemplatePreset[] = [
  {
    id: 'title-dramatic',
    name: 'Dramatic',
    description: 'T\u00edtulo fullscreen con efecto zoom dram\u00e1tico',
    category: 'title-card',
    config: { title: 'SHOW TITLE', subtitle: 'Episode 1', bgColor: '#000000', overlayColor: 'rgba(0,0,0,0.5)', textColor: '#ffffff', animation: 'zoom', duration: 5, fullscreen: true },
  },
  {
    id: 'title-minimal',
    name: 'Minimal',
    description: 'T\u00edtulo limpio con fade suave',
    category: 'title-card',
    config: { title: 'Event Name', subtitle: 'Live Now', bgColor: '#1e293b', overlayColor: 'rgba(30,41,59,0.8)', textColor: '#f8fafc', animation: 'fade', duration: 4, fullscreen: true },
  },
];

// ─── BRB Presets ───
export const BRB_PRESETS: TemplatePreset[] = [
  {
    id: 'brb-classic',
    name: 'Classic',
    description: 'Pantalla BRB cl\u00e1sica con temporizador',
    category: 'brb',
    config: { message: 'Be Right Back', subtitle: 'Taking a short break', bgColor: '#111827', textColor: '#ffffff', accentColor: '#3b82f6', style: 'classic', showTimer: true, timerMinutes: 5, timerSeconds: 0 },
  },
  {
    id: 'brb-nursery',
    name: 'Nursery',
    description: 'Pantalla BRB suave y c\u00e1lida',
    category: 'brb',
    config: { message: 'BRB', subtitle: 'Back soon!', bgColor: '#fef3c7', textColor: '#92400e', accentColor: '#f59e0b', style: 'nursery', showTimer: true, timerMinutes: 3, timerSeconds: 0 },
  },
];

// ─── 2X Counter Presets ───
export const TWO_X_COUNTER_PRESETS: TemplatePreset[] = [
  {
    id: 'counter-burst',
    name: 'Burst',
    description: 'Contador con efecto de explosi\u00f3n',
    category: '2x-counter',
    config: { label: 'Raids', count: 0, maxCount: 100, style: 'burst', bgColor: '#111827', textColor: '#ffffff', accentColor: '#ef4444', showMax: true, size: 'lg' },
  },
  {
    id: 'counter-glide',
    name: 'Glide',
    description: 'Contador con transici\u00f3n suave',
    category: '2x-counter',
    config: { label: 'Donations', count: 0, maxCount: 50, style: 'glide', bgColor: '#0f172a', textColor: '#22c55e', accentColor: '#22c55e', showMax: true, size: 'md' },
  },
];

// ─── Money Effect Presets ───
export const MONEY_EFFECT_PRESETS: TemplatePreset[] = [
  {
    id: 'money-celebration',
    name: 'Celebration',
    description: 'Efecto de dinero con part\u00edculas doradas',
    category: 'money-effect',
    config: { amount: '$5.00', currency: '$', label: 'Donation!', duration: 5, particleCount: 30, bgColor: 'transparent', textColor: '#fbbf24', accentColor: '#f59e0b' },
  },
];

// ─── Social Looper Presets ───
export const SOCIAL_LOOPER_PRESETS: TemplatePreset[] = [
  {
    id: 'social-sociable',
    name: 'Sociable',
    description: 'Rotador de redes sociales con iconos',
    category: 'social-looper',
    config: { accounts: [
      { platform: 'twitch', handle: '@streamer', url: '' },
      { platform: 'twitter', handle: '@streamer', url: '' },
      { platform: 'youtube', handle: '@streamer', url: '' },
    ], interval: 4, bgColor: '#1e1b4b', textColor: '#c4b5fd', accentColor: '#7c3aed', animation: 'fade', iconSize: 20, fontSize: 16, position: 'bottom-right' },
  },
];

// ─── Weather Bug Presets ───
export const WEATHER_BUG_PRESETS: TemplatePreset[] = [
  {
    id: 'weather-breeze',
    name: 'Breeze',
    description: 'Widget de clima compacto y limpio',
    category: 'weather-bug',
    config: { weather: { temp: 22, condition: 'Sunny', icon: '\u2600\ufe0f', high: 25, low: 18, humidity: 45, wind: 12 }, bgColor: 'rgba(15,23,42,0.9)', textColor: '#ffffff', accentColor: '#f59e0b', showDetails: true, position: 'top-right' },
  },
];

// ─── YouTube View Count Presets ───
export const YT_VIEW_COUNT_PRESETS: TemplatePreset[] = [
  {
    id: 'yt-live',
    name: 'Live Counter',
    description: 'Contador de viewers en vivo con estilo YouTube',
    category: 'yt-view-count',
    config: { count: 0, label: 'watching now', bgColor: 'rgba(255,0,0,0.9)', textColor: '#ffffff', accentColor: '#ff0000', animation: 'counting', format: 'compact', position: 'top-right' },
  },
];

// ─── DriveBy Presets ───
export const DRIVEBY_PRESETS: TemplatePreset[] = [
  {
    id: 'driveby-raid',
    name: 'Raid Notification',
    description: 'Notificaci\u00f3n de raid que cruza la pantalla',
    category: 'driveby',
    config: { message: '\ud83c\udf89 Raid incoming!', fontSize: 32, speed: 3, textColor: '#ffffff', bgColor: '#7c3aed', direction: 'right', yPosition: 50, repeat: false, repeatDelay: 0 },
  },
];

export const ALL_PRESETS = [
  ...LOWER_THIRD_PRESETS,
  ...TIMER_PRESETS,
  ...TICKER_PRESETS,
  ...SCOREBUG_PRESETS,
  ...ALERT_PRESETS,
  ...WEBCAM_BORDER_PRESETS,
  ...SPONSOR_LOGO_PRESETS,
  ...TITLE_CARD_PRESETS,
  ...BRB_PRESETS,
  ...TWO_X_COUNTER_PRESETS,
  ...MONEY_EFFECT_PRESETS,
  ...SOCIAL_LOOPER_PRESETS,
  ...WEATHER_BUG_PRESETS,
  ...YT_VIEW_COUNT_PRESETS,
  ...DRIVEBY_PRESETS,
];
