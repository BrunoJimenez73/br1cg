import { useState, useEffect, useRef, useCallback } from 'react';
import type { OverlayConfig, OverlayElement } from '../../lib/types';
import { OVERLAY_TYPE_LABELS, OVERLAY_TYPE_ICONS, OVERLAY_CATEGORIES, OVERLAY_CATEGORY_ICONS } from '../../lib/types';
import { getWSBase } from '../../lib/ws-client';
import * as api from '../../lib/api-client';

interface ControllerPageProps {
  overlayId?: string;
}

export default function ControllerPage({ overlayId: propId }: ControllerPageProps) {
  const [overlayId] = useState(() => {
    if (propId) return propId;
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || '';
  });
  const [overlay, setOverlay] = useState<OverlayConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [panelWidth, setPanelWidth] = useState(60);
  const [tab, setTab] = useState<'controls' | 'dynamic'>('controls');
  const [showLog, setShowLog] = useState(false);
  const [checkerboard, setCheckerboard] = useState(false);
  const resizing = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!overlayId) {
      setError('No overlay ID provided');
      setLoading(false);
      return;
    }

    api.getOverlay(overlayId)
      .then(data => {
        setOverlay(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load overlay');
        setLoading(false);
      });
  }, [overlayId]);

  useEffect(() => {
    const ws = new WebSocket(`${getWSBase()}/ws?subscribe=${overlayId}`);
    ws.onopen = () => { setConnected(true); addLog('Connected to server'); };
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'connected') addLog(`Client: ${msg.clientId?.slice(0, 8)}`);
      } catch {}
    };
    ws.onclose = () => { setConnected(false); addLog('Disconnected'); };
    ws.onerror = () => addLog('Connection error');
    wsRef.current = ws;
    return () => { ws.close(); wsRef.current = null; };
  }, [overlayId]);

  function addLog(message: string) {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${message}`, ...prev].slice(0, 50));
  }

  function sendCommand(action: string, data?: Record<string, unknown>) {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: `overlay:${action}`, overlayId, data: data || {} }));
    addLog(`→ ${action}`);
  }

  async function handleConfigChange(field: string, value: unknown) {
    if (!overlay) return;
    const newData = { ...overlay.data, [field]: value };
    setOverlay({ ...overlay, data: newData });
    sendCommand('save', newData);
    try { await api.updateOverlay(overlayId, { data: newData }); }
    catch (err) { addLog(`Save error: ${err instanceof Error ? err.message : 'unknown'}`); }
  }

  async function handleElementUpdate(elementId: string, props: Record<string, unknown>) {
    if (!overlay || !overlay.elements) return;
    const elements = overlay.elements.map(el =>
      el.id === elementId ? { ...el, props: { ...el.props, ...props } } : el
    );
    const updated = { ...overlay, elements };
    setOverlay(updated);
    sendCommand('save', { data: overlay.data, elements });
    try { await api.updateOverlay(overlayId, { elements } as Partial<OverlayConfig>); }
    catch (err) { addLog(`Save error: ${err instanceof Error ? err.message : 'unknown'}`); }
  }

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;
    const startX = e.clientX;
    const startPct = panelWidth;

    function onMouseMove(e: MouseEvent) {
      if (!resizing.current) return;
      const container = document.getElementById('split-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setPanelWidth(Math.max(30, Math.min(85, pct)));
    }

    function onMouseUp() {
      resizing.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [panelWidth]);

  const dynamicElements = overlay?.elements?.filter(el => el.dynamic) || [];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="text-gray-400 animate-pulse">Loading overlay...</div>
      </div>
    );
  }

  if (error || !overlay) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-2">Error</div>
          <div className="text-gray-400">{error || 'Overlay not found'}</div>
          <a href="/" className="mt-4 inline-block px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">← Back to Library</a>
        </div>
      </div>
    );
  }

  const typeLabel = OVERLAY_TYPE_LABELS[overlay.type] || overlay.type;
  const typeIcon = OVERLAY_TYPE_ICONS[overlay.type] || '📦';
  const cat = OVERLAY_CATEGORIES[overlay.type];

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* Header */}
      <header className="h-12 border-b border-gray-800 flex items-center px-4 gap-3 shrink-0 bg-gray-900/80 backdrop-blur-sm">
        <a href="/" className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Library
        </a>
        <div className="h-4 w-px bg-gray-700" />
        <span className="text-sm">{typeIcon}</span>
        <h1 className="font-semibold truncate text-sm">{overlay.name}</h1>
        <span className="text-[11px] px-2 py-0.5 bg-gray-800 rounded text-gray-400 flex items-center gap-1">
          {cat && OVERLAY_CATEGORY_ICONS[cat]} {typeLabel}
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {connected ? 'Live' : 'Off'}
        </div>
        <button
          onClick={() => setShowLog(!showLog)}
          className={`px-2 py-1 text-xs rounded transition-colors ${showLog ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}
        >
          Log
        </button>
        <a
          href={`/editor?id=${overlayId}`}
          className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded transition-colors"
        >
          Edit
        </a>
      </header>

      {/* Split pane: Preview + Controls */}
      <div id="split-container" className="flex-1 flex min-h-0">
        {/* Preview */}
        <div className="flex flex-col min-w-0" style={{ width: `${panelWidth}%` }}>
          <div className="flex-1 p-4 flex items-center justify-center bg-gray-950/50">
            <div
              className="w-full rounded-xl overflow-hidden border border-gray-800 shadow-2xl shadow-black/50 transition-all"
              style={{
                maxWidth: '100%', aspectRatio: '16/9',
                background: checkerboard
                  ? 'repeating-conic-gradient(#e5e7eb 0% 25%, #f9fafb 0% 50%) 0px 0px / 16px 16px'
                  : '#000',
              }}
            >
              <iframe
                src={`/overlay/${overlay.type}?id=${overlay.id}`}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
                title="Overlay Preview"
              />
            </div>
          </div>
          {/* Preview actions */}
          <div className="px-4 pb-3 flex gap-2">
            <a
              href={`/overlay/${overlay.type}?id=${overlay.id}`}
              target="_blank"
              className="flex-1 text-center px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs transition-colors"
            >
              Open in new tab
            </a>
            <button
              onClick={() => setCheckerboard(!checkerboard)}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                checkerboard ? 'bg-indigo-600 text-white' : 'bg-gray-800 hover:bg-gray-700'
              }`}
              title="Toggle transparent grid"
            >
              {checkerboard ? 'Grid' : 'Grid'}
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.origin + `/overlay/${overlay.type}?id=${overlay.id}`)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs transition-colors"
            >
              Copy URL
            </button>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="w-1.5 bg-gray-800 hover:bg-indigo-500 cursor-col-resize shrink-0 relative transition-colors group"
          onMouseDown={startResize}
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-gray-600 group-hover:bg-indigo-300 transition-colors" />
        </div>

        {/* Controls Panel */}
        <div className="flex flex-col shrink-0" style={{ width: `${100 - panelWidth}%` }}>
          {/* Tabs */}
          <div className="flex border-b border-gray-800 bg-gray-900/50 shrink-0">
            <TabBtn active={tab === 'controls'} onClick={() => setTab('controls')}>Controls</TabBtn>
            <TabBtn active={tab === 'dynamic'} onClick={() => setTab('dynamic')}>
              Dynamic
              {dynamicElements.length > 0 && (
                <span className="ml-1.5 text-[10px] px-1 py-0.5 bg-indigo-600 rounded-full">{dynamicElements.length}</span>
              )}
            </TabBtn>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {tab === 'controls' ? (
              <ControlsSection
                overlay={overlay}
                onShow={() => sendCommand('show')}
                onHide={() => sendCommand('hide')}
                onConfigChange={handleConfigChange}
                sendCommand={sendCommand}
              />
            ) : (
              <div className="space-y-6">
                <ConfigFieldsSection
                  overlay={overlay}
                  onConfigChange={handleConfigChange}
                />
                <DynamicElementsSection
                  elements={dynamicElements}
                  onUpdate={handleElementUpdate}
                />
              </div>
            )}
          </div>

          {/* Activity Log (collapsible) */}
          {showLog && (
            <div className="h-32 border-t border-gray-800 bg-gray-900/80 shrink-0">
              <div className="p-2 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Activity Log</div>
              <div className="overflow-y-auto h-[calc(100%-28px)] px-2 pb-2">
                {logs.length === 0 ? (
                  <div className="text-xs text-gray-600 italic">No activity yet</div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="text-[11px] text-gray-500 font-mono">{log}</div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 text-xs font-medium transition-colors ${
        active ? 'text-white border-b-2 border-indigo-500 bg-gray-800/50' : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Controls Section ───

function ControlsSection({
  overlay, onShow, onHide, onConfigChange, sendCommand,
}: {
  overlay: OverlayConfig;
  onShow: () => void;
  onHide: () => void;
  onConfigChange: (field: string, value: unknown) => void;
  sendCommand: (action: string, data?: Record<string, unknown>) => void;
}) {
  const config = overlay.data as Record<string, unknown>;

  return (
    <div className="space-y-4">
      {/* Visibility */}
      <Section title="Visibility">
        <div className="flex gap-2">
          <button onClick={onShow} className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded font-medium text-xs transition-colors">Show</button>
          <button onClick={onHide} className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded font-medium text-xs transition-colors">Hide</button>
        </div>
      </Section>

      {/* Timer Actions */}
      {overlay.type === 'timer' && (
        <Section title="Timer Controls">
          <div className="flex gap-2">
            <button onClick={() => sendCommand('timer:start')} className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded text-xs font-medium transition-colors">Start</button>
            <button onClick={() => sendCommand('timer:pause')} className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 rounded text-xs font-medium transition-colors">Pause</button>
            <button onClick={() => sendCommand('timer:reset')} className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 rounded text-xs font-medium transition-colors">Reset</button>
          </div>
        </Section>
      )}

      {/* Lower Third Animation */}
      {overlay.type === 'lower-third' && (
        <Section title="Animation">
          <div className="space-y-2">
            <button onClick={onShow} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-medium transition-colors">Show with animation</button>
            <Field label="Style">
              <select value={String(config.animation || 'slide-left')}
                onChange={e => onConfigChange('animation', e.target.value)}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs">
                <option value="slide-left">Slide Left</option>
                <option value="slide-right">Slide Right</option>
                <option value="fade">Fade</option>
                <option value="bounce">Bounce</option>
              </select>
            </Field>
          </div>
        </Section>
      )}

      {/* Quick Colors */}
      <Section title="Colors">
        <div className="space-y-2">
          <ColorField label="Background" value={String(config.bgColor || '#000000')} onChange={v => onConfigChange('bgColor', v)} />
          <ColorField label="Text" value={String(config.textColor || '#ffffff')} onChange={v => onConfigChange('textColor', v)} />
          {config.accentColor !== undefined && (
            <ColorField label="Accent" value={String(config.accentColor || '#3b82f6')} onChange={v => onConfigChange('accentColor', v)} />
          )}
        </div>
      </Section>
    </div>
  );
}

// ─── Dynamic Elements Section ───

function DynamicElementsSection({
  elements,
  onUpdate,
}: {
  elements: OverlayElement[];
  onUpdate: (elementId: string, props: Record<string, unknown>) => void;
}) {
  if (elements.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-3xl mb-3 text-gray-600">🔒</div>
        <p className="text-sm text-gray-500 font-medium">No dynamic elements</p>
        <p className="text-xs text-gray-600 mt-1">Open the Editor and mark elements as dynamic to edit them here</p>
        <p className="text-[10px] text-gray-700 mt-3">In Properties Panel → toggle "Dynamic" on any element</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-gray-500">
        {elements.length} dynamic element{elements.length !== 1 ? 's' : ''} — changes update in real-time
      </p>
      {elements.map(el => (
        <DynamicElementCard key={el.id} element={el} onUpdate={onUpdate} />
      ))}
    </div>
  );
}

function DynamicElementCard({
  element,
  onUpdate,
}: {
  element: OverlayElement;
  onUpdate: (elementId: string, props: Record<string, unknown>) => void;
}) {
  const p = element.props;

  function handleChange(key: string, value: unknown) {
    onUpdate(element.id, { [key]: value });
  }

  const typeIcon: Record<string, string> = { text: 'T', image: '🖼', shape: '⬡', 'timer-display': '⏱', 'score-display': '🏆' };
  const typeColors: Record<string, string> = { text: 'text-blue-400', image: 'text-green-400', shape: 'text-purple-400', 'timer-display': 'text-emerald-400', 'score-display': 'text-orange-400' };

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 hover:border-indigo-600/30 transition-colors">
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`text-xs font-bold ${typeColors[element.type] || 'text-gray-400'}`}>
          {typeIcon[element.type] || '?'}
        </span>
        <span className="text-xs font-medium text-gray-300 truncate">
          {element.type === 'text' ? String(p.text || '(empty)') : element.type}
        </span>
        <span className="text-[10px] text-gray-600 ml-auto">{element.type}</span>
      </div>

      <div className="space-y-2">
        {element.type === 'text' && (
          <>
            <Field label="Text">
              <input type="text" value={String(p.text || '')} onChange={e => handleChange('text', e.target.value)}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs" />
            </Field>
            <Field label="Color">
              <input type="color" value={String(p.color || '#ffffff')} onChange={e => handleChange('color', e.target.value)}
                className="w-full h-7 rounded cursor-pointer" />
            </Field>
            <Field label="Size">
              <input type="number" value={Number(p.fontSize || 16)} onChange={e => handleChange('fontSize', parseInt(e.target.value) || 16)}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs" min={8} max={200} />
            </Field>
          </>
        )}

        {element.type === 'image' && (
          <Field label="Image URL">
            <input type="text" value={String(p.src || '')} onChange={e => handleChange('src', e.target.value)}
              className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs font-mono" placeholder="https://..." />
          </Field>
        )}

        {element.type === 'shape' && (
          <>
            <Field label="Fill Color">
              <input type="color" value={String(p.backgroundColor || '#333333')} onChange={e => handleChange('backgroundColor', e.target.value)}
                className="w-full h-7 rounded cursor-pointer" />
            </Field>
            <Field label="Opacity">
              <input type="range" min={0} max={1} step={0.05} value={Number(element.opacity)}
                onChange={e => handleChange('opacity', parseFloat(e.target.value))}
                className="w-full accent-indigo-500" />
            </Field>
          </>
        )}

        {element.type === 'timer-display' && (
          <>
            <Field label="Color">
              <input type="color" value={String(p.color || '#22c55e')} onChange={e => handleChange('color', e.target.value)}
                className="w-full h-7 rounded cursor-pointer" />
            </Field>
            <Field label="Format">
              <select value={String(p.format || 'mm:ss')} onChange={e => handleChange('format', e.target.value)}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs">
                <option value="mm:ss">mm:ss</option>
                <option value="hh:mm:ss">hh:mm:ss</option>
                <option value="mm:ss.ms">mm:ss.ms</option>
              </select>
            </Field>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Config Fields Section (Dynamic tab) ───

function ConfigFieldsSection({
  overlay, onConfigChange,
}: {
  overlay: OverlayConfig;
  onConfigChange: (field: string, value: unknown) => void;
}) {
  const config = overlay.data as Record<string, unknown>;
  const type = overlay.type;

  if (type === 'timer') {
    return (
      <Section title="Timer Config">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Minutes">
              <input type="number" min={0} max={99} value={Number(config.minutes ?? 5)}
                onChange={e => onConfigChange('minutes', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs" />
            </Field>
            <Field label="Seconds">
              <input type="number" min={0} max={59} value={Number(config.seconds ?? 0)}
                onChange={e => onConfigChange('seconds', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs" />
            </Field>
          </div>
          <Field label="Mode">
            <select value={String(config.mode || 'countdown')}
              onChange={e => onConfigChange('mode', e.target.value)}
              className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs">
              <option value="countdown">Countdown</option>
              <option value="countup">Count Up</option>
            </select>
          </Field>
          <Field label="Format">
            <select value={String(config.format || 'mm:ss')}
              onChange={e => onConfigChange('format', e.target.value)}
              className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs">
              <option value="mm:ss">mm:ss</option>
              <option value="hh:mm:ss">hh:mm:ss</option>
              <option value="mm:ss.ms">mm:ss.ms</option>
              <option value="circular">Circular</option>
            </select>
          </Field>
          <Field label="Auto Start">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={Boolean(config.autoStart)}
                onChange={e => onConfigChange('autoStart', e.target.checked)}
                className="accent-indigo-500" />
              <span className="text-xs text-gray-400">Start automatically when shown</span>
            </label>
          </Field>
        </div>
      </Section>
    );
  }

  if (type === 'lower-third') {
    return (
      <Section title="Content">
        <div className="space-y-2">
          <Field label="Title">
            <input type="text" value={String(config.title || '')}
              onChange={e => onConfigChange('title', e.target.value)}
              className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs" />
          </Field>
          <Field label="Subtitle">
            <input type="text" value={String(config.subtitle || '')}
              onChange={e => onConfigChange('subtitle', e.target.value)}
              className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs" />
          </Field>
          <Field label="Animation">
            <select value={String(config.animation || 'slide-left')}
              onChange={e => onConfigChange('animation', e.target.value)}
              className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs">
              <option value="slide-left">Slide Left</option>
              <option value="slide-right">Slide Right</option>
              <option value="fade">Fade</option>
              <option value="bounce">Bounce</option>
            </select>
          </Field>
        </div>
      </Section>
    );
  }

  if (type === 'scorebug') {
    const homeTeam = (config.homeTeam || {}) as Record<string, unknown>;
    const awayTeam = (config.awayTeam || {}) as Record<string, unknown>;
    return (
      <Section title="Score">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Home Score">
              <input type="number" min={0} value={Number(homeTeam.score ?? 0)}
                onChange={e => onConfigChange('homeTeam', { ...homeTeam, score: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs" />
            </Field>
            <Field label="Away Score">
              <input type="number" min={0} value={Number(awayTeam.score ?? 0)}
                onChange={e => onConfigChange('awayTeam', { ...awayTeam, score: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs" />
            </Field>
          </div>
          <Field label="Period">
            <input type="text" value={String(config.period || '')}
              onChange={e => onConfigChange('period', e.target.value)}
              className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs" />
          </Field>
        </div>
      </Section>
    );
  }

  if (type === 'ticker') {
    const messages = (config.messages || []) as string[];
    return (
      <Section title="Ticker">
        <div className="space-y-2">
          <Field label="Messages">
            <textarea value={messages.join('\n')}
              onChange={e => onConfigChange('messages', e.target.value.split('\n').filter(Boolean))}
              rows={3} className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs resize-none" />
          </Field>
          <Field label="Speed">
            <input type="range" min={20} max={200} value={Number(config.speed ?? 80)}
              onChange={e => onConfigChange('speed', parseInt(e.target.value))}
              className="w-full accent-indigo-500" />
          </Field>
        </div>
      </Section>
    );
  }

  return null;
}

// ─── Shared UI ───

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] text-gray-500 mb-0.5">{label}</label>
      {children}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-gray-500 w-16 shrink-0">{label}</span>
      <input type="color" value={value} onChange={e => onChange(e.target.value)}
        className="w-8 h-7 rounded cursor-pointer bg-transparent border border-gray-700 shrink-0" />
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs font-mono" />
    </div>
  );
}
