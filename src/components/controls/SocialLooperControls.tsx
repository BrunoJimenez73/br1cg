import { useState } from 'react';
import type { WSClientMessage, OverlayConfig } from '../../lib/types';

interface Props { overlay: OverlayConfig; send: (msg: WSClientMessage) => void; }

interface SocialAccount {
  platform: string;
  handle: string;
  url?: string;
}

export function SocialLooperControls({ overlay, send }: Props) {
  const data = (overlay.data || {}) as Record<string, unknown>;
  const accounts = (data.accounts as SocialAccount[]) ?? [];
  const interval = (data.interval as number) ?? 5000;
  const [draftInterval, setDraftInterval] = useState(String(interval / 1000));
  const [newPlatform, setNewPlatform] = useState('');
  const [newHandle, setNewHandle] = useState('');

  function sendUpdate(patch: Record<string, unknown>) {
    send({ type: 'overlay:update', overlayId: overlay.id, data: patch });
  }

  function addAccount() {
    if (!newPlatform.trim() || !newHandle.trim()) return;
    const updated = [...accounts, { platform: newPlatform.trim(), handle: newHandle.trim() }];
    sendUpdate({ accounts: updated });
    setNewPlatform('');
    setNewHandle('');
  }

  function removeAccount(index: number) {
    const updated = accounts.filter((_, i) => i !== index);
    sendUpdate({ accounts: updated });
  }

  return (
    <div className="space-y-3">
      {/* Current accounts */}
      <div>
        <p className="text-xs text-gray-400 mb-1">Accounts</p>
        {accounts.length === 0 ? (
          <p className="text-xs text-gray-600">No accounts added</p>
        ) : (
          <div className="space-y-1">
            {accounts.map((acc, i) => (
              <div key={i} className="flex items-center gap-2 text-xs bg-gray-800 rounded px-2 py-1">
                <span className="text-indigo-400 font-medium">{acc.platform}</span>
                <span className="text-gray-300 truncate flex-1">{acc.handle}</span>
                <button
                  onClick={() => removeAccount(i)}
                  className="text-gray-500 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add new */}
      <div className="flex gap-1">
        <input
          type="text"
          value={newPlatform}
          onChange={e => setNewPlatform(e.target.value)}
          placeholder="Platform"
          className="w-20 px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-white"
          onKeyDown={e => e.key === 'Enter' && addAccount()}
        />
        <input
          type="text"
          value={newHandle}
          onChange={e => setNewHandle(e.target.value)}
          placeholder="@handle"
          className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-white"
          onKeyDown={e => e.key === 'Enter' && addAccount()}
        />
        <button
          onClick={addAccount}
          className="px-2 py-1 text-xs bg-green-700 hover:bg-green-600 rounded"
        >
          +
        </button>
      </div>

      {/* Rotation interval */}
      <div>
        <p className="text-xs text-gray-400 mb-1">Rotation (seconds)</p>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="2"
            max="15"
            step="0.5"
            value={draftInterval}
            onChange={e => setDraftInterval(e.target.value)}
            onMouseUp={() => sendUpdate({ interval: Number(draftInterval) * 1000 })}
            onTouchEnd={() => sendUpdate({ interval: Number(draftInterval) * 1000 })}
            className="flex-1"
          />
          <span className="text-xs text-gray-300 w-8 text-right">{draftInterval}s</span>
        </div>
      </div>
    </div>
  );
}
