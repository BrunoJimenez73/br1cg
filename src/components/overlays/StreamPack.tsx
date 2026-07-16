import React, { useMemo } from 'react';
import { LowerThird } from './LowerThird';
import { ScoreBug } from './ScoreBug';
import { Ticker } from './Ticker';
import { WebcamBorder } from './WebcamBorder';
import { Timer } from './Timer';
import { STREAM_PACKS } from '../../lib/pack-presets';
import type { StreamPackId } from '../../lib/pack-presets';
import type { LowerThirdConfig, ScoreBugConfig, TickerConfig, WebcamBorderConfig, TimerConfig } from '../../lib/types';

interface StreamPackProps {
  pack: StreamPackId;
  lowerThird?: Partial<LowerThirdConfig>;
  scorebug?: Partial<ScoreBugConfig>;
  ticker?: Partial<TickerConfig>;
  webcam?: Partial<WebcamBorderConfig>;
  timer?: Partial<TimerConfig>;
  showLowerThird?: boolean;
  showScorebug?: boolean;
  showTicker?: boolean;
  showWebcam?: boolean;
  showTimer?: boolean;
  overlayId?: string;
}

export function StreamPack({
  pack: packId, lowerThird, scorebug, ticker, webcam, timer,
  showLowerThird = true, showScorebug = true, showTicker = true,
  showWebcam = true, showTimer = false, overlayId,
}: StreamPackProps) {
  const pack = useMemo(() => STREAM_PACKS[packId], [packId]);
  const [bgFrom, bgTo] = pack.colors.backgroundGradient;

  return (
    <div style={{ position: 'absolute', inset: 0, width: 1920, height: 1080, overflow: 'hidden', background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}>
      {showLowerThird && (
        <LowerThird config={{
          bgColor: pack.colors.backgroundGradient[0],
          textColor: pack.colors.primary,
          accentColor: pack.colors.accent,
          ...lowerThird,
        }} overlayId={overlayId} />
      )}
      {showScorebug && (
        <ScoreBug config={{
          bgColor: pack.colors.backgroundGradient[0],
          textColor: pack.colors.primary,
          accentColor: pack.colors.accent,
          homeTeam: { name: 'HOME', abbrev: 'HOM', score: 0, color: pack.colors.accent },
          awayTeam: { name: 'AWAY', abbrev: 'AWY', score: 0, color: pack.colors.muted },
          ...scorebug,
        }} overlayId={overlayId} />
      )}
      {showTicker && (
        <Ticker config={{
          bgColor: pack.colors.backgroundGradient[0],
          textColor: pack.colors.primary,
          accentColor: pack.colors.accent,
          ...ticker,
        }} overlayId={overlayId} />
      )}
      {showWebcam && (
        <WebcamBorder config={{
          bgColor: pack.colors.backgroundGradient[0],
          borderColor: pack.colors.accent,
          glowColor: pack.colors.accent + '33',
          accentColor: pack.colors.accent,
          ...webcam,
        }} overlayId={overlayId} />
      )}
      {showTimer && (
        <Timer config={{
          bgColor: pack.colors.backgroundGradient[0],
          textColor: pack.colors.accent,
          ...timer,
        }} overlayId={overlayId} />
      )}
    </div>
  );
}

// ─── 10 Pack Presets ───
interface PP { overlayId?: string; }
export const PackAccent = (p: PP) => <StreamPack pack="accent" overlayId={p.overlayId} />;
export const PackJuice = (p: PP) => <StreamPack pack="juice" overlayId={p.overlayId} />;
export const PackLithium = (p: PP) => <StreamPack pack="lithium" overlayId={p.overlayId} />;
export const PackPyrite = (p: PP) => <StreamPack pack="pyrite" overlayId={p.overlayId} />;
export const PackPrime = (p: PP) => <StreamPack pack="prime" overlayId={p.overlayId} />;
export const PackClean = (p: PP) => <StreamPack pack="clean" overlayId={p.overlayId} />;
export const PackHorizon = (p: PP) => <StreamPack pack="horizon" overlayId={p.overlayId} />;
export const PackWorkflow = (p: PP) => <StreamPack pack="workflow" overlayId={p.overlayId} />;
export const PackPalladium = (p: PP) => <StreamPack pack="palladium" overlayId={p.overlayId} />;
export const PackStepback = (p: PP) => <StreamPack pack="stepback" overlayId={p.overlayId} />;
