import { useState } from 'react';
import type { WSClientMessage, OverlayConfig } from '../../lib/types';

interface Props { overlay: OverlayConfig; send: (msg: WSClientMessage) => void; }

export function TickerControls({ overlay, send }: Props) {
  const data = (overlay.data || {}) as Record<string, unknown>;
  const messages = (data.messages as string[]) ?? [];
  const speed = (data.speed as number) ?? 60;
  const [draft, setDraft] = useState(messages.join('\n'));
  const [draftSpeed, setDraftSpeed] = useState(String(speed));

  function sendUpdate(patch: Record<string, unknown>) {
    send({ type: 'overlay:update', overlayId: overlay.id, data: patch });
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-gray-400 mb-1">Messages (one per line)</p>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={() => {
            const lines = draft.split('\n').filter(Boolean);
            sendUpdate({ messages: lines });
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && e.ctrlKey) {
              const lines = draft.split('\n').filter(Boolean);
              sendUpdate({ messages: lines });
            }
          }}
          className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-white h-20 font-mono resize-none"
          placeholder="Breaking news...\nLive update..."
        />
        <p className="text-[10px] text-gray-600 mt-1">Ctrl+Enter or click outside to apply</p>
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-1">Speed (px/s)</p>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="20"
            max="200"
            value={draftSpeed}
            onChange={e => setDraftSpeed(e.target.value)}
            onMouseUp={() => sendUpdate({ speed: Number(draftSpeed) })}
            onTouchEnd={() => sendUpdate({ speed: Number(draftSpeed) })}
            className="flex-1"
          />
          <span className="text-xs text-gray-300 w-8 text-right">{draftSpeed}</span>
        </div>
      </div>
    </div>
  );
}
