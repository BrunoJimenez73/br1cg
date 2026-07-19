import { useState } from 'react';
import type { WSClientMessage, OverlayConfig } from '../../lib/types';

interface Props { overlay: OverlayConfig; send: (msg: WSClientMessage) => void; }

export function ScorebugControls({ overlay, send }: Props) {
  const data = (overlay.data || {}) as Record<string, unknown>;
  const homeScore = (data.homeScore as number) ?? 0;
  const awayScore = (data.awayScore as number) ?? 0;
  const period = (data.period as string) ?? '';
  const [customPeriod, setCustomPeriod] = useState(period);

  function sendUpdate(patch: Record<string, unknown>) {
    send({ type: 'overlay:update', overlayId: overlay.id, data: patch });
  }

  return (
    <div className="space-y-3">
      {/* Home score */}
      <div>
        <p className="text-xs text-gray-400 mb-1">Home</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => sendUpdate({ homeScore: Math.max(0, homeScore - 1) })}
            className="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
          >
            −1
          </button>
          <span className="text-lg font-bold text-white w-10 text-center">{homeScore}</span>
          <button
            onClick={() => sendUpdate({ homeScore: homeScore + 1 })}
            className="px-2 py-1 text-sm bg-green-700 hover:bg-green-600 rounded"
          >
            +1
          </button>
          <button
            onClick={() => sendUpdate({ homeScore: homeScore + 3 })}
            className="px-2 py-1 text-xs bg-green-800 hover:bg-green-700 rounded"
          >
            +3
          </button>
        </div>
      </div>

      {/* Away score */}
      <div>
        <p className="text-xs text-gray-400 mb-1">Away</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => sendUpdate({ awayScore: Math.max(0, awayScore - 1) })}
            className="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
          >
            −1
          </button>
          <span className="text-lg font-bold text-white w-10 text-center">{awayScore}</span>
          <button
            onClick={() => sendUpdate({ awayScore: awayScore + 1 })}
            className="px-2 py-1 text-sm bg-green-700 hover:bg-green-600 rounded"
          >
            +1
          </button>
          <button
            onClick={() => sendUpdate({ awayScore: awayScore + 3 })}
            className="px-2 py-1 text-xs bg-green-800 hover:bg-green-700 rounded"
          >
            +3
          </button>
        </div>
      </div>

      {/* Period */}
      <div>
        <p className="text-xs text-gray-400 mb-1">Period</p>
        <div className="flex gap-1">
          {['1H', '2H', 'OT', 'FT'].map(p => (
            <button
              key={p}
              onClick={() => { setCustomPeriod(p); sendUpdate({ period: p }); }}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                customPeriod === p ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {p}
            </button>
          ))}
          <input
            type="text"
            value={customPeriod}
            onChange={e => setCustomPeriod(e.target.value)}
            onBlur={() => sendUpdate({ period: customPeriod })}
            onKeyDown={e => e.key === 'Enter' && sendUpdate({ period: customPeriod })}
            className="w-14 px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-white"
            placeholder="..."
          />
        </div>
      </div>
    </div>
  );
}
