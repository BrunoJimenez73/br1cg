// ──────────────────────────────────────────────
// br1cg — Preview Pane (live overlay iframe)
// ──────────────────────────────────────────────

import type { OverlayConfig } from '../../lib/types';

interface PreviewPaneProps {
  overlay: OverlayConfig;
  connected: boolean;
}

export default function PreviewPane({ overlay, connected }: PreviewPaneProps) {
  const overlayUrl = `/overlay/${overlay.type}?id=${overlay.id}`;

  return (
    <div className="h-full flex flex-col">
      {/* Preview label */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-300">Live Preview</span>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-xs text-gray-500">
            {connected ? 'Updates in real-time' : 'Waiting for connection...'}
          </span>
        </div>
      </div>

      {/* Preview container with 16:9 aspect ratio */}
      <div className="flex-1 bg-black rounded-lg overflow-hidden border border-gray-800 relative">
        {/* 16:9 aspect ratio wrapper */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full" style={{ maxWidth: '100%', aspectRatio: '16/9' }}>
            <iframe
              src={overlayUrl}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Overlay Preview"
            />
          </div>
        </div>

        {/* Overlay info badge */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-gray-400">
          {overlay.type} • {overlay.id.slice(0, 8)}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mt-3">
        <a
          href={overlayUrl}
          target="_blank"
          className="flex-1 text-center px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
        >
          Open in new tab
        </a>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.origin + overlayUrl);
          }}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
          title="Copy URL for OBS"
        >
          📋 Copy URL
        </button>
      </div>
    </div>
  );
}
