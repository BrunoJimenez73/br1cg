import { useState } from 'react';
import type { WSClientMessage, OverlayConfig } from '../../lib/types';

interface Props { overlay: OverlayConfig; send: (msg: WSClientMessage) => void; }

export function LowerThirdControls({ overlay, send }: Props) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');

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
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded"
      />
      <input
        type="text"
        value={subtitle}
        onChange={e => setSubtitle(e.target.value)}
        placeholder="Subtitle"
        className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded"
      />
      <button
        onClick={() => send({
          type: 'overlay:update',
          overlayId: overlay.id,
          data: { title, subtitle }
        })}
        className="w-full px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-500 rounded"
      >
        Update Text
      </button>
    </div>
  );
}
