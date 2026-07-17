import type { WSClientMessage, OverlayConfig } from '../../lib/types';

interface Props { overlay: OverlayConfig; send: (msg: WSClientMessage) => void; }

export function ScorebugControls({ overlay, send }: Props) {
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
    </div>
  );
}
