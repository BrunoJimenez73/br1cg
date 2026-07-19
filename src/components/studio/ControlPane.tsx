// ──────────────────────────────────────────────
// br1cg — Control Pane (type-specific controls)
// ──────────────────────────────────────────────

import type { OverlayConfig } from '../../lib/types';
import { OVERLAY_TYPE_LABELS } from '../../lib/types';
import { getWSBase } from '../../lib/ws-client';

interface ControlPaneProps {
  overlay: OverlayConfig;
  onShow: () => void;
  onHide: () => void;
  onConfigChange: (field: string, value: unknown) => void;
  addLog: (msg: string) => void;
}

export default function ControlPane({ overlay, onShow, onHide, onConfigChange, addLog }: ControlPaneProps) {
  const config = overlay.data as Record<string, unknown>;

  return (
    <div className="space-y-5">
      {/* Visibility controls */}
      <Section title="Visibility">
        <div className="flex gap-2">
          <button
            onClick={onShow}
            className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded font-medium text-sm transition-colors"
          >
            ▶ Show
          </button>
          <button
            onClick={onHide}
            className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded font-medium text-sm transition-colors"
          >
            ◼ Hide
          </button>
        </div>
      </Section>

      {/* Type-specific controls */}
      {overlay.type === 'timer' && (
        <TimerControls config={config} onConfigChange={onConfigChange} addLog={addLog} overlayId={overlay.id} />
      )}

      {overlay.type === 'lower-third' && (
        <LowerThirdControls config={config} onConfigChange={onConfigChange} />
      )}

      {overlay.type === 'scorebug' && (
        <ScorebugControls config={config} onConfigChange={onConfigChange} />
      )}

      {overlay.type === 'ticker' && (
        <TickerControls config={config} onConfigChange={onConfigChange} />
      )}

      {/* Quick config for all types */}
      <Section title="Quick Config">
        <div className="space-y-3">
          <Field label="Background">
            <input
              type="color"
              value={String(config.bgColor || '#000000')}
              onChange={(e) => onConfigChange('bgColor', e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </Field>
          <Field label="Text Color">
            <input
              type="color"
              value={String(config.textColor || '#ffffff')}
              onChange={(e) => onConfigChange('textColor', e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </Field>
          {config.accentColor !== undefined && (
            <Field label="Accent">
              <input
                type="color"
                value={String(config.accentColor || '#3b82f6')}
                onChange={(e) => onConfigChange('accentColor', e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </Field>
          )}
        </div>
      </Section>

      {/* Links */}
      <Section title="Links">
        <div className="space-y-2">
          <a
            href={`/editor?id=${overlay.id}`}
            className="block w-full text-center px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
          >
            ✏️ Open in Editor
          </a>
          <a
            href={`/overlay/${overlay.type}?id=${overlay.id}`}
            target="_blank"
            className="block w-full text-center px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
          >
            🔗 Open Overlay URL
          </a>
        </div>
      </Section>
    </div>
  );
}

// ─── Shared sub-components ───

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  );
}

// ─── Timer Controls ───

function TimerControls({ config, onConfigChange, addLog, overlayId }: {
  config: Record<string, unknown>;
  onConfigChange: (field: string, value: unknown) => void;
  addLog: (msg: string) => void;
  overlayId: string;
}) {
  function sendTimerCommand(action: string) {
    const ws = new WebSocket(`${getWSBase()}/ws`);
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: `overlay:timer:${action}`, overlayId, data: {} }));
      addLog(`timer:${action}`);
      setTimeout(() => ws.close(), 100);
    };
  }

  return (
    <Section title="Timer Controls">
      <div className="space-y-3">
        <div className="flex gap-2">
          <button onClick={() => sendTimerCommand('start')} className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-medium">
            ▶ Start
          </button>
          <button onClick={() => sendTimerCommand('pause')} className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 rounded text-sm font-medium">
            ⏸ Pause
          </button>
          <button onClick={() => sendTimerCommand('reset')} className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm font-medium">
            ↺ Reset
          </button>
        </div>
        <Field label="Minutes">
          <input
            type="number"
            min={0}
            max={99}
            value={Number(config.minutes || 0)}
            onChange={(e) => onConfigChange('minutes', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
          />
        </Field>
        <Field label="Seconds">
          <input
            type="number"
            min={0}
            max={59}
            value={Number(config.seconds || 0)}
            onChange={(e) => onConfigChange('seconds', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
          />
        </Field>
      </div>
    </Section>
  );
}

// ─── Lower Third Controls ───

function LowerThirdControls({ config, onConfigChange }: {
  config: Record<string, unknown>;
  onConfigChange: (field: string, value: unknown) => void;
}) {
  return (
    <Section title="Lower Third">
      <div className="space-y-3">
        <Field label="Title">
          <input
            type="text"
            value={String(config.title || '')}
            onChange={(e) => onConfigChange('title', e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
          />
        </Field>
        <Field label="Subtitle">
          <input
            type="text"
            value={String(config.subtitle || '')}
            onChange={(e) => onConfigChange('subtitle', e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
          />
        </Field>
      </div>
    </Section>
  );
}

// ─── Scorebug Controls ───

function ScorebugControls({ config, onConfigChange }: {
  config: Record<string, unknown>;
  onConfigChange: (field: string, value: unknown) => void;
}) {
  const homeTeam = (config.homeTeam || {}) as Record<string, unknown>;
  const awayTeam = (config.awayTeam || {}) as Record<string, unknown>;

  return (
    <Section title="Scorebug">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Home Score">
            <input
              type="number"
              min={0}
              value={Number(homeTeam.score || 0)}
              onChange={(e) => onConfigChange('homeTeam', { ...homeTeam, score: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
            />
          </Field>
          <Field label="Away Score">
            <input
              type="number"
              min={0}
              value={Number(awayTeam.score || 0)}
              onChange={(e) => onConfigChange('awayTeam', { ...awayTeam, score: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
            />
          </Field>
        </div>
        <Field label="Period">
          <input
            type="text"
            value={String(config.period || '')}
            onChange={(e) => onConfigChange('period', e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
          />
        </Field>
      </div>
    </Section>
  );
}

// ─── Ticker Controls ───

function TickerControls({ config, onConfigChange }: {
  config: Record<string, unknown>;
  onConfigChange: (field: string, value: unknown) => void;
}) {
  const messages = (config.messages || []) as string[];

  return (
    <Section title="Ticker">
      <div className="space-y-3">
        <Field label="Messages (one per line)">
          <textarea
            value={messages.join('\n')}
            onChange={(e) => onConfigChange('messages', e.target.value.split('\n').filter(Boolean))}
            rows={3}
            className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm resize-none"
          />
        </Field>
        <Field label="Speed">
          <input
            type="range"
            min={20}
            max={200}
            value={Number(config.speed || 80)}
            onChange={(e) => onConfigChange('speed', parseInt(e.target.value))}
            className="w-full"
          />
        </Field>
      </div>
    </Section>
  );
}
