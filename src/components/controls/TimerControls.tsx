import { useState } from 'react';
import type { WSClientMessage, OverlayConfig } from '../../lib/types';

interface Props { overlay: OverlayConfig; send: (msg: WSClientMessage) => void; }

export function TimerControls({ overlay, send }: Props) {
  const [customMinutes, setCustomMinutes] = useState('5');
  const [customSeconds, setCustomSeconds] = useState('0');

  return (
    <div className="space-y-2">
      <button
        onClick={() => send({ type: 'overlay:show', overlayId: overlay.id })}
        className="w-full text-left px-3 py-2 bg-green-800 hover:bg-green-700 rounded transition-colors text-sm"
      >
        ▶ Show
      </button>
      <button
        onClick={() => send({ type: 'overlay:hide', overlayId: overlay.id })}
        className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors text-sm"
      >
        ■ Hide
      </button>
      <div className="border-t border-gray-700 my-2" />
      <button
        onClick={() => send({ type: 'overlay:timer:start', overlayId: overlay.id })}
        className="w-full text-left px-3 py-2 bg-indigo-800 hover:bg-indigo-700 rounded transition-colors text-sm"
      >
        ▶ Start
      </button>
      <button
        onClick={() => send({ type: 'overlay:timer:pause', overlayId: overlay.id })}
        className="w-full text-left px-3 py-2 bg-yellow-800 hover:bg-yellow-700 rounded transition-colors text-sm"
      >
        ⏸ Pause
      </button>
      <div className="flex gap-2 mt-2">
        <input
          type="number"
          min="0"
          max="99"
          value={customMinutes}
          onChange={e => setCustomMinutes(e.target.value)}
          className="w-16 px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded"
          placeholder="Min"
        />
        <span className="text-gray-500 self-center">:</span>
        <input
          type="number"
          min="0"
          max="59"
          value={customSeconds}
          onChange={e => setCustomSeconds(e.target.value)}
          className="w-16 px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded"
          placeholder="Sec"
        />
        <button
          onClick={() => send({
            type: 'overlay:timer:reset',
            overlayId: overlay.id,
            data: { minutes: parseInt(customMinutes) || 0, seconds: parseInt(customSeconds) || 0 }
          })}
          className="px-3 py-1 text-sm bg-purple-800 hover:bg-purple-700 rounded"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
