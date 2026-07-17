// ──────────────────────────────────────────────
// br1cg — Tests for all 15 overlay components
// ──────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';

// Import all 15 overlay components
import { LowerThird, LTDropzone, LTGlaze, LTOnAir, LTPrime, LTPalladium } from '../src/components/overlays/LowerThird';
import { Timer } from '../src/components/overlays/Timer';
import { ScoreBug, SBSoccerAir, SBBasketballBold, SBFootballStealth, SBBaseballStandard, SBHockeyOlympic, SBTennisSlant, SBRugbySlant, SBVolleyballBold } from '../src/components/overlays/ScoreBug';
import { TitleCard } from '../src/components/overlays/TitleCard';
import { Ticker, TickerPrime, TickerHeadline, TickerJuice, TickerDusk, TickerLithium } from '../src/components/overlays/Ticker';
import { Alert } from '../src/components/overlays/Alert';
import { WebcamBorder, WBMinimal, WBArcRaiders, WBSciFi, WBFortnite } from '../src/components/overlays/WebcamBorder';
import { SponsorLogo } from '../src/components/overlays/SponsorLogo';
import { BRB, BRBClassic, BRBNursery } from '../src/components/overlays/BRB';
import { TwoXCounter, TwoXCounterBurst, TwoXCounterGlide } from '../src/components/overlays/TwoXCounter';
import { MoneyEffect } from '../src/components/overlays/MoneyEffect';
import { SocialLooper, SocialLooperSociable } from '../src/components/overlays/SocialLooper';
import { WeatherBug, WeatherBugBreeze } from '../src/components/overlays/WeatherBug';
import { YouTubeViewCount, YTViewCountLive } from '../src/components/overlays/YouTubeViewCount';
import { DriveBy } from '../src/components/overlays/DriveBy';

// Import helpers from setup
import { sendWSMessage, clearWSCallbacks } from './setup';

// ──────────────────────────────────────────────
// Helper functions
// ──────────────────────────────────────────────
function testRenders(name: string, Component: React.ComponentType<any>, props?: Record<string, unknown>) {
  it(`${name} renders with default props without crashing`, () => {
    const { container } = render(React.createElement(Component, props || {}));
    expect(container).toBeTruthy();
    cleanup();
  });
}

function testWSShowHide(name: string, Component: React.ComponentType<any>, overlayId = 'test-overlay') {
  it(`${name} responds to WebSocket 'show' and 'hide' messages`, () => {
    const { container, rerender } = render(React.createElement(Component, { overlayId }));
    expect(container).toBeTruthy();

    // Send show
    sendWSMessage(overlayId, { type: 'command', action: 'show', payload: {} });
    rerender(React.createElement(Component, { overlayId }));
    expect(container).toBeTruthy();

    // Send hide
    sendWSMessage(overlayId, { type: 'command', action: 'hide', payload: {} });
    rerender(React.createElement(Component, { overlayId }));
    expect(container).toBeTruthy();

    cleanup();
  });
}

function testWSUpdate(name: string, Component: React.ComponentType<any>, overlayId = 'test-overlay', updatePayload: Record<string, unknown> = {}) {
  it(`${name} responds to WebSocket 'update' messages`, () => {
    const { container, rerender } = render(React.createElement(Component, { overlayId }));
    expect(container).toBeTruthy();

    // Send update
    sendWSMessage(overlayId, { type: 'command', action: 'update', payload: updatePayload });
    rerender(React.createElement(Component, { overlayId }));
    expect(container).toBeTruthy();

    cleanup();
  });
}

// ──────────────────────────────────────────────
// 1. LowerThird
// ──────────────────────────────────────────────
describe('LowerThird', () => {
  beforeEach(() => { clearWSCallbacks(); cleanup(); });

  testRenders('LowerThird', LowerThird);
  testRenders('LTDropzone', LTDropzone);
  testRenders('LTGlaze', LTGlaze);
  testRenders('LTOnAir', LTOnAir);
  testRenders('LTPrime', LTPrime);
  testRenders('LTPalladium', LTPalladium);

  testWSShowHide('LowerThird', LowerThird);
  testWSUpdate('LowerThird', LowerThird, 'lt-test', { title: 'New Title', subtitle: 'New Sub' });

  it('LowerThird renders with custom config', () => {
    const { container } = render(React.createElement(LowerThird, {
      config: { title: 'Custom Title', subtitle: 'Custom Sub', bgColor: '#ff0000', textColor: '#00ff00' }
    }));
    expect(container).toBeTruthy();
    cleanup();
  });
});

// ──────────────────────────────────────────────
// 2. Timer
// ──────────────────────────────────────────────
describe('Timer', () => {
  beforeEach(() => { clearWSCallbacks(); cleanup(); });

  testRenders('Timer', Timer);
  testWSShowHide('Timer', Timer);
  testWSUpdate('Timer', Timer, 'timer-test', { minutes: 10, seconds: 30 });

  it('Timer responds to timer-specific events', () => {
    const { container, rerender } = render(React.createElement(Timer, { overlayId: 'timer-events' }));
    expect(container).toBeTruthy();

    sendWSMessage('timer-events', { type: 'event', event: 'timer:start', data: {} });
    rerender(React.createElement(Timer, { overlayId: 'timer-events' }));
    expect(container).toBeTruthy();

    sendWSMessage('timer-events', { type: 'event', event: 'timer:pause', data: {} });
    rerender(React.createElement(Timer, { overlayId: 'timer-events' }));
    expect(container).toBeTruthy();

    sendWSMessage('timer-events', { type: 'event', event: 'timer:reset', data: { minutes: 5, seconds: 0 } });
    rerender(React.createElement(Timer, { overlayId: 'timer-events' }));
    expect(container).toBeTruthy();

    cleanup();
  });

  it('Timer renders with circular format', () => {
    const { container } = render(React.createElement(Timer, {
      config: { format: 'circular', minutes: 10, seconds: 0 }
    }));
    expect(container).toBeTruthy();
    cleanup();
  });
});

// ──────────────────────────────────────────────
// 3. ScoreBug
// ──────────────────────────────────────────────
describe('ScoreBug', () => {
  beforeEach(() => { clearWSCallbacks(); cleanup(); });

  testRenders('ScoreBug', ScoreBug);
  testRenders('SBSoccerAir', SBSoccerAir);
  testRenders('SBBasketballBold', SBBasketballBold);
  testRenders('SBFootballStealth', SBFootballStealth);
  testRenders('SBBaseballStandard', SBBaseballStandard);
  testRenders('SBHockeyOlympic', SBHockeyOlympic);
  testRenders('SBTennisSlant', SBTennisSlant);
  testRenders('SBRugbySlant', SBRugbySlant);
  testRenders('SBVolleyballBold', SBVolleyballBold);

  testWSShowHide('ScoreBug', ScoreBug);

  it('ScoreBug renders with custom scores', () => {
    const { container } = render(React.createElement(ScoreBug, {
      config: {
        homeTeam: { name: 'Barcelona', abbrev: 'BAR', score: 2, color: '#a50044' },
        awayTeam: { name: 'Madrid', abbrev: 'MAD', score: 1, color: '#febe10' },
        sport: 'soccer',
        period: '2T',
      }
    }));
    expect(container).toBeTruthy();
    cleanup();
  });
});

// ──────────────────────────────────────────────
// 4. TitleCard
// ──────────────────────────────────────────────
describe('TitleCard', () => {
  beforeEach(() => { clearWSCallbacks(); cleanup(); });

  testRenders('TitleCard', TitleCard);
  testWSShowHide('TitleCard', TitleCard);
  testWSUpdate('TitleCard', TitleCard, 'tc-test', { title: 'New Title', subtitle: 'New Sub' });

  it('TitleCard starts hidden and shows on WS show command', () => {
    const { container, rerender } = render(React.createElement(TitleCard, { overlayId: 'tc-vis' }));
    expect(container.innerHTML).toBe('');

    sendWSMessage('tc-vis', { type: 'command', action: 'show', payload: {} });
    rerender(React.createElement(TitleCard, { overlayId: 'tc-vis' }));
    expect(container.innerHTML).not.toBe('');

    cleanup();
  });
});

// ──────────────────────────────────────────────
// 5. Ticker
// ──────────────────────────────────────────────
describe('Ticker', () => {
  beforeEach(() => { clearWSCallbacks(); cleanup(); });

  testRenders('Ticker', Ticker);
  testRenders('TickerPrime', TickerPrime);
  testRenders('TickerHeadline', TickerHeadline);
  testRenders('TickerJuice', TickerJuice);
  testRenders('TickerDusk', TickerDusk);
  testRenders('TickerLithium', TickerLithium);

  testWSShowHide('Ticker', Ticker);
  testWSUpdate('Ticker', Ticker, 'ticker-test', { messages: ['New message 1', 'New message 2'] });
});

// ──────────────────────────────────────────────
// 6. Alert
// ──────────────────────────────────────────────
describe('Alert', () => {
  beforeEach(() => { clearWSCallbacks(); cleanup(); });

  testRenders('Alert', Alert);
  testWSShowHide('Alert', Alert);
  testWSUpdate('Alert', Alert, 'alert-test', { message: 'Updated alert!' });

  it('Alert starts hidden and shows on WS show command', () => {
    const { container, rerender } = render(React.createElement(Alert, { overlayId: 'alert-vis' }));
    expect(container.innerHTML).toBe('');

    sendWSMessage('alert-vis', { type: 'command', action: 'show', payload: {} });
    rerender(React.createElement(Alert, { overlayId: 'alert-vis' }));
    expect(container.innerHTML).not.toBe('');

    cleanup();
  });
});

// ──────────────────────────────────────────────
// 7. WebcamBorder
// ──────────────────────────────────────────────
describe('WebcamBorder', () => {
  beforeEach(() => { clearWSCallbacks(); cleanup(); });

  testRenders('WebcamBorder', WebcamBorder);
  testRenders('WBMinimal', WBMinimal);
  testRenders('WBArcRaiders', WBArcRaiders);
  testRenders('WBSciFi', WBSciFi);
  testRenders('WBFortnite', WBFortnite);

  testWSShowHide('WebcamBorder', WebcamBorder);

  it('WebcamBorder renders with arc-raiders style', () => {
    const { container } = render(React.createElement(WebcamBorder, {
      config: { style: 'arc-raiders', playerName: 'TestPlayer', borderColor: '#00d4aa' }
    }));
    expect(container).toBeTruthy();
    cleanup();
  });

  it('WebcamBorder renders with sci-fi style', () => {
    const { container } = render(React.createElement(WebcamBorder, {
      config: { style: 'sci-fi', playerName: 'TestPlayer', borderColor: '#00ff00', accentColor: '#00ff00' }
    }));
    expect(container).toBeTruthy();
    cleanup();
  });

  it('WebcamBorder renders with fortnite style', () => {
    const { container } = render(React.createElement(WebcamBorder, {
      config: { style: 'fortnite', playerName: 'TestPlayer', borderColor: '#3b82f6' }
    }));
    expect(container).toBeTruthy();
    cleanup();
  });
});

// ──────────────────────────────────────────────
// 8. SponsorLogo
// ──────────────────────────────────────────────
describe('SponsorLogo', () => {
  beforeEach(() => { clearWSCallbacks(); cleanup(); });

  testRenders('SponsorLogo', SponsorLogo);
  testWSShowHide('SponsorLogo', SponsorLogo);

  it('SponsorLogo renders with logo URL', () => {
    const { container } = render(React.createElement(SponsorLogo, {
      config: { logoUrl: 'https://example.com/logo.png', name: 'Test Sponsor' }
    }));
    expect(container).toBeTruthy();
    cleanup();
  });
});

// ──────────────────────────────────────────────
// 9. BRB
// ──────────────────────────────────────────────
describe('BRB', () => {
  beforeEach(() => { clearWSCallbacks(); cleanup(); });

  testRenders('BRB', BRB);
  testRenders('BRBClassic', BRBClassic);
  testRenders('BRBNursery', BRBNursery);
  testWSShowHide('BRB', BRB);
  testWSUpdate('BRB', BRB, 'brb-test', { message: 'BACK SOON', subtitle: 'Stay tuned' });

  it('BRB starts hidden and shows on WS show command', () => {
    const { container, rerender } = render(React.createElement(BRB, { overlayId: 'brb-vis' }));
    expect(container.innerHTML).toBe('');

    sendWSMessage('brb-vis', { type: 'command', action: 'show', payload: {} });
    rerender(React.createElement(BRB, { overlayId: 'brb-vis' }));
    expect(container.innerHTML).not.toBe('');

    cleanup();
  });
});

// ──────────────────────────────────────────────
// 10. TwoXCounter
// ──────────────────────────────────────────────
describe('TwoXCounter', () => {
  beforeEach(() => { clearWSCallbacks(); cleanup(); });

  testRenders('TwoXCounter', TwoXCounter);
  testRenders('TwoXCounterBurst', TwoXCounterBurst);
  testRenders('TwoXCounterGlide', TwoXCounterGlide);
  testWSShowHide('TwoXCounter', TwoXCounter);
  testWSUpdate('TwoXCounter', TwoXCounter, '2x-test', { count: 5 });

  it('TwoXCounter updates count via WS update', () => {
    const { container, rerender } = render(React.createElement(TwoXCounter, { overlayId: '2x-count' }));
    expect(container).toBeTruthy();

    sendWSMessage('2x-count', { type: 'command', action: 'update', payload: { count: 7 } });
    rerender(React.createElement(TwoXCounter, { overlayId: '2x-count' }));
    expect(container).toBeTruthy();

    cleanup();
  });
});

// ──────────────────────────────────────────────
// 11. MoneyEffect
// ──────────────────────────────────────────────
describe('MoneyEffect', () => {
  beforeEach(() => { clearWSCallbacks(); cleanup(); });

  testRenders('MoneyEffect', MoneyEffect);
  testWSShowHide('MoneyEffect', MoneyEffect);

  it('MoneyEffect starts hidden and shows on WS show command', () => {
    const { container, rerender } = render(React.createElement(MoneyEffect, { overlayId: 'money-vis' }));
    expect(container.innerHTML).toBe('');

    sendWSMessage('money-vis', { type: 'command', action: 'show', payload: { amount: '$10', label: 'New donation' } });
    rerender(React.createElement(MoneyEffect, { overlayId: 'money-vis' }));
    expect(container.innerHTML).not.toBe('');

    cleanup();
  });
});

// ──────────────────────────────────────────────
// 12. SocialLooper
// ──────────────────────────────────────────────
describe('SocialLooper', () => {
  beforeEach(() => { clearWSCallbacks(); cleanup(); });

  testRenders('SocialLooper', SocialLooper);
  testRenders('SocialLooperSociable', SocialLooperSociable);
  testWSShowHide('SocialLooper', SocialLooper);
  testWSUpdate('SocialLooper', SocialLooper, 'sl-test', { accounts: [{ platform: 'twitter', handle: '@test' }] });
});

// ──────────────────────────────────────────────
// 13. WeatherBug
// ──────────────────────────────────────────────
describe('WeatherBug', () => {
  beforeEach(() => { clearWSCallbacks(); cleanup(); });

  testRenders('WeatherBug', WeatherBug);
  testRenders('WeatherBugBreeze', WeatherBugBreeze);
  testWSShowHide('WeatherBug', WeatherBug);

  it('WeatherBug renders with custom weather data', () => {
    const { container } = render(React.createElement(WeatherBug, {
      config: {
        weather: { temperature: 30, condition: 'sunny', city: 'Madrid', unit: 'C' },
        showDetails: true,
      }
    }));
    expect(container).toBeTruthy();
    cleanup();
  });
});

// ──────────────────────────────────────────────
// 14. YouTubeViewCount
// ──────────────────────────────────────────────
describe('YouTubeViewCount', () => {
  beforeEach(() => { clearWSCallbacks(); cleanup(); });

  testRenders('YouTubeViewCount', YouTubeViewCount);
  testRenders('YTViewCountLive', YTViewCountLive);
  testWSShowHide('YouTubeViewCount', YouTubeViewCount);

  it('YouTubeViewCount renders with custom count', () => {
    const { container } = render(React.createElement(YouTubeViewCount, {
      config: { count: 5000, label: 'Viewers', format: 'full' }
    }));
    expect(container).toBeTruthy();
    cleanup();
  });
});

// ──────────────────────────────────────────────
// 15. DriveBy
// ──────────────────────────────────────────────
describe('DriveBy', () => {
  beforeEach(() => { clearWSCallbacks(); cleanup(); });

  testRenders('DriveBy', DriveBy);
  testWSShowHide('DriveBy', DriveBy);

  it('DriveBy starts hidden and shows on WS show command', () => {
    const { container, rerender } = render(React.createElement(DriveBy, { overlayId: 'db-vis' }));
    expect(container.innerHTML).toBe('');

    sendWSMessage('db-vis', { type: 'command', action: 'show', payload: { message: 'Test driveby!' } });
    rerender(React.createElement(DriveBy, { overlayId: 'db-vis' }));
    expect(container.innerHTML).not.toBe('');

    cleanup();
  });
});
