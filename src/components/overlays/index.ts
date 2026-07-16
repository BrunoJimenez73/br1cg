// ──────────────────────────────────────────────
// br1cg — Exportación centralizada de overlays
// ──────────────────────────────────────────────

// Lower Thirds
export { LowerThird } from './LowerThird';
export { LTDropzone, LTGlaze, LTOnAir, LTPrime, LTPalladium } from './LowerThird';

// Timers
export { Timer, useTimerControls } from './Timer';

// Tickers
export { Ticker } from './Ticker';
export { TickerPrime, TickerHeadline, TickerJuice, TickerDusk, TickerLithium } from './Ticker';

// Scorebugs
export { ScoreBug } from './ScoreBug';
export {
  SBSoccerAir, SBBasketballBold, SBFootballStealth, SBBaseballStandard,
  SBHockeyOlympic, SBTennisSlant, SBRugbySlant, SBVolleyballBold,
} from './ScoreBug';

// Webcam Borders
export { WebcamBorder } from './WebcamBorder';
export { WBMinimal, WBArcRaiders, WBSciFi, WBFortnite } from './WebcamBorder';

// Alert + Sponsor
export { Alert } from './Alert';
export { SponsorLogo } from './SponsorLogo';

// Stream Packs
export { StreamPack } from './StreamPack';
export {
  PackAccent, PackJuice, PackLithium, PackPyrite, PackPrime,
  PackClean, PackHorizon, PackWorkflow, PackPalladium, PackStepback,
} from './StreamPack';

// Especiales (Feature 106)
export { BRB, BRBClassic, BRBNursery } from './BRB';
export { TwoXCounter, TwoXCounterBurst, TwoXCounterGlide } from './TwoXCounter';
export { MoneyEffect, MONEY_EFFECT_CSS } from './MoneyEffect';
export { SocialLooper, SocialLooperSociable } from './SocialLooper';
export { WeatherBug, WeatherBugBreeze } from './WeatherBug';
export { YouTubeViewCount, YTViewCountLive } from './YouTubeViewCount';
export { DriveBy, DRIVEBY_CSS } from './DriveBy';

// Presets
export { STREAM_PACKS, getPackById, getPackNames } from '../../lib/pack-presets';
export { LOWER_THIRD_PRESETS, TIMER_PRESETS, TICKER_PRESETS, SCOREBUG_PRESETS, ALL_PRESETS } from '../../lib/presets';

// ─── Mapa de tipo → componente ───
import React from 'react';
import { LowerThird as _LowerThird } from './LowerThird';
import { Timer as _Timer } from './Timer';
import { ScoreBug as _ScoreBug } from './ScoreBug';
import { Ticker as _Ticker } from './Ticker';
import { Alert as _Alert } from './Alert';
import { WebcamBorder as _WebcamBorder } from './WebcamBorder';
import { SponsorLogo as _SponsorLogo } from './SponsorLogo';
import type { OverlayType } from '../../lib/types';
import { BRB as _BRB } from './BRB';
import { TwoXCounter as _TwoXCounter } from './TwoXCounter';
import { MoneyEffect as _MoneyEffect } from './MoneyEffect';
import { SocialLooper as _SocialLooper } from './SocialLooper';
import { WeatherBug as _WeatherBug } from './WeatherBug';
import { YouTubeViewCount as _YTViewCount } from './YouTubeViewCount';
import { DriveBy as _DriveBy } from './DriveBy';

export type ExtendedOverlayType = OverlayType | 'brb' | '2x-counter' | 'money-effect' | 'social-looper' | 'weather-bug' | 'yt-view-count' | 'driveby';

export const OVERLAY_COMPONENTS: Partial<Record<ExtendedOverlayType, React.ComponentType<any>>> = {
  'lower-third': _LowerThird,
  'timer': _Timer,
  'scorebug': _ScoreBug,
  'ticker': _Ticker,
  'alert': _Alert,
  'webcam-border': _WebcamBorder,
  'sponsor-logo': _SponsorLogo,
  'brb': _BRB,
  '2x-counter': _TwoXCounter,
  'money-effect': _MoneyEffect,
  'social-looper': _SocialLooper,
  'weather-bug': _WeatherBug,
  'yt-view-count': _YTViewCount,
  'driveby': _DriveBy,
};
