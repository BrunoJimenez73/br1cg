import React, { useState, useMemo } from 'react';
import type { ScoreBugConfig, ScoreBugSport } from '../../lib/types';
import { useWebSocket } from '../../lib/ws-client';
interface ScoreBugProps { config?: Partial<ScoreBugConfig>; overlayId?: string; }

const SPORT_EMOJI: Record<ScoreBugSport, string> = {
  generic: '🏟️', soccer: '⚽', basketball: '🏀', football: '🏈', baseball: '⚾',
  hockey: '🏒', tennis: '🎾', boxing: '🥊', rugby: '🏉', volleyball: '🏐', futsal: '⚽',
};

export function ScoreBug({ config: c, overlayId }: ScoreBugProps) {
  const [visible, setVisible] = useState(true);
  const cfg = useMemo<ScoreBugConfig>(() => ({
    sport: 'soccer', homeTeam: { name: 'HOME', abbrev: 'HOM', score: 0, color: '#3b82f6' },
    awayTeam: { name: 'AWAY', abbrev: 'AWY', score: 0, color: '#ef4444' },
    period: '1T', periodTime: '', bgColor: '#111827', textColor: '#ffffff',
    accentColor: '#3b82f6', showSport: true, showTime: true, style: 'default', ...c
  }), [c]);

  useWebSocket({
    overlayId,
    onMessage: (msg) => {
      if (msg.type === 'command') {
        if (msg.action === 'show') setVisible(true);
        else if (msg.action === 'hide') setVisible(false);
      }
    },
  });

  if (!visible) return null;

  const { homeTeam: h, awayTeam: a } = cfg;

  if (cfg.sport === 'tennis') {
    const sets = (s: number[]) => s.map((v, i) => <span key={i} style={{ color: v > 0 ? cfg.accentColor : '#666' }}>{v}</span>);
    return (
      <div style={{
        position: 'absolute', top: 0, right: 0, backgroundColor: cfg.bgColor,
        display: 'flex', alignItems: 'stretch', height: 44, fontFamily: 'monospace',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', backgroundColor: h.color, color: '#ffffff', fontWeight: 900, fontSize: 18, letterSpacing: '0.05em' }}>{h.abbrev}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px', color: cfg.textColor, fontSize: 18 }}>
          {[0, 1, 2].map(i => <React.Fragment key={i}><span style={{ fontWeight: 700 }}>{h.sets?.[i] || 0}</span><span>{a.sets?.[i] || 0}</span>{i < 2 && <span style={{ color: '#666' }}>|</span>}</React.Fragment>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', backgroundColor: a.color, color: '#ffffff', fontWeight: 900, fontSize: 18, letterSpacing: '0.05em' }}>{a.abbrev}</div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 48,
      backgroundColor: cfg.bgColor, display: 'flex',
      alignItems: 'center', justifyContent: 'center', gap: 0,
    }}>
      {cfg.showSport && <div style={{ padding: '0 12px', fontSize: 18 }}>{SPORT_EMOJI[cfg.sport]}</div>}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', backgroundColor: h.color, padding: '0 16px' }}>
        {cfg.showTime && <div style={{ color: cfg.accentColor, fontWeight: 900, fontSize: 14, marginRight: 8 }}>●</div>}
        <span style={{ color: '#ffffff', fontWeight: 900, fontSize: 16 }}>{h.abbrev}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', backgroundColor: cfg.accentColor, padding: '0 16px' }}>
        <span style={{ color: '#ffffff', fontWeight: 900, fontSize: 28 }}>{h.score}</span>
        <span style={{ color: '#ffffff', opacity: 0.5, margin: '0 8px' }}>-</span>
        <span style={{ color: '#ffffff', fontWeight: 900, fontSize: 28 }}>{a.score}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', backgroundColor: a.color, padding: '0 16px' }}>
        <span style={{ color: '#ffffff', fontWeight: 900, fontSize: 16 }}>{a.abbrev}</span>
      </div>
      {cfg.period && <div style={{ marginLeft: 12, color: cfg.textColor, fontSize: 14, fontWeight: 600 }}>{cfg.period}</div>}
    </div>
  );
}

// Preset components
interface SP { homeName?: string; awayName?: string; homeScore?: number; awayScore?: number; overlayId?: string; }
export function SBSoccerAir(p: SP) {
  return <ScoreBug overlayId={p.overlayId} config={{ sport: 'soccer', homeTeam: { name: p.homeName || 'HOME', abbrev: (p.homeName || 'HOM').slice(0, 3).toUpperCase(), score: p.homeScore || 0, color: '#3b82f6' }, awayTeam: { name: p.awayName || 'AWAY', abbrev: (p.awayName || 'AWY').slice(0, 3).toUpperCase(), score: p.awayScore || 0, color: '#ef4444' }, period: '1T', accentColor: '#3b82f6' }} />;
}
export function SBBasketballBold(p: SP) {
  return <ScoreBug overlayId={p.overlayId} config={{ sport: 'basketball', homeTeam: { name: p.homeName || 'HOME', abbrev: (p.homeName || 'HOM').slice(0, 3).toUpperCase(), score: p.homeScore || 0, color: '#1d428a' }, awayTeam: { name: p.awayName || 'AWAY', abbrev: (p.awayName || 'AWY').slice(0, 3).toUpperCase(), score: p.awayScore || 0, color: '#c8102e' }, period: 'Q1', accentColor: '#f97316' }} />;
}
export function SBFootballStealth(p: SP) {
  return <ScoreBug overlayId={p.overlayId} config={{ sport: 'football', homeTeam: { name: p.homeName || 'HOME', abbrev: (p.homeName || 'HOM').slice(0, 3).toUpperCase(), score: p.homeScore || 0, color: '#013369' }, awayTeam: { name: p.awayName || 'AWAY', abbrev: (p.awayName || 'AWY').slice(0, 3).toUpperCase(), score: p.awayScore || 0, color: '#d50a0a' }, period: '1Q', accentColor: '#000000' }} />;
}
export function SBBaseballStandard(p: SP) {
  return <ScoreBug overlayId={p.overlayId} config={{ sport: 'baseball', homeTeam: { name: p.homeName || 'HOME', abbrev: (p.homeName || 'HOM').slice(0, 3).toUpperCase(), score: p.homeScore || 0, color: '#002d72' }, awayTeam: { name: p.awayName || 'AWAY', abbrev: (p.awayName || 'AWY').slice(0, 3).toUpperCase(), score: p.awayScore || 0, color: '#bf0d3e' }, period: 'T3', accentColor: '#3b82f6' }} />;
}
export function SBHockeyOlympic(p: SP) {
  return <ScoreBug overlayId={p.overlayId} config={{ sport: 'hockey', homeTeam: { name: p.homeName || 'HOME', abbrev: (p.homeName || 'HOM').slice(0, 3).toUpperCase(), score: p.homeScore || 0, color: '#0062a3' }, awayTeam: { name: p.awayName || 'AWAY', abbrev: (p.awayName || 'AWY').slice(0, 3).toUpperCase(), score: p.awayScore || 0, color: '#c8102e' }, period: 'P1', accentColor: '#ffd700' }} />;
}
export function SBTennisSlant(p: SP) {
  return <ScoreBug overlayId={p.overlayId} config={{ sport: 'tennis', homeTeam: { name: p.homeName || 'HOME', abbrev: (p.homeName || 'HOM').slice(0, 3).toUpperCase(), score: 0, color: '#16a34a', sets: [6, 4, 3] }, awayTeam: { name: p.awayName || 'AWAY', abbrev: (p.awayName || 'AWY').slice(0, 3).toUpperCase(), score: 0, color: '#dc2626', sets: [4, 6, 5] }, accentColor: '#facc15' }} />;
}
export function SBRugbySlant(p: SP) {
  return <ScoreBug overlayId={p.overlayId} config={{ sport: 'rugby', homeTeam: { name: p.homeName || 'HOME', abbrev: (p.homeName || 'HOM').slice(0, 3).toUpperCase(), score: p.homeScore || 0, color: '#000000' }, awayTeam: { name: p.awayName || 'AWAY', abbrev: (p.awayName || 'AWY').slice(0, 3).toUpperCase(), score: p.awayScore || 0, color: '#7c3aed' }, period: '1T', accentColor: '#009b77' }} />;
}
export function SBVolleyballBold(p: SP) {
  return <ScoreBug overlayId={p.overlayId} config={{ sport: 'volleyball', homeTeam: { name: p.homeName || 'HOME', abbrev: (p.homeName || 'HOM').slice(0, 3).toUpperCase(), score: p.homeScore || 0, color: '#e11d48' }, awayTeam: { name: p.awayName || 'AWAY', abbrev: (p.awayName || 'AWY').slice(0, 3).toUpperCase(), score: p.awayScore || 0, color: '#2563eb' }, period: 'S1', accentColor: '#f97316' }} />;
}
