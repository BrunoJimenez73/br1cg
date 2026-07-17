import { useState, useEffect } from 'react';
import type { OverlayConfig } from '../../lib/types';
import { OVERLAY_TYPE_LABELS } from '../../lib/types';
import * as api from '../../lib/api-client';

export default function OverlayLibrary() {
  const [overlays, setOverlays] = useState<OverlayConfig[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverlays();
  }, []);

  async function fetchOverlays() {
    try {
      setLoading(true);
      const data = await api.getOverlays();
      setOverlays(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setError('API server not running. Start it with: bun run dev:server');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  const filtered = overlays.filter(o =>
    o.name.toLowerCase().includes(filter.toLowerCase()) ||
    o.type.toLowerCase().includes(filter.toLowerCase())
  );

  async function handleDelete(id: string) {
    try {
      await api.deleteOverlay(id);
      setOverlays(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading overlays...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 text-red-200">
        <h3 className="font-semibold mb-2">⚠️ Error loading overlays</h3>
        <p className="text-sm">{error}</p>
        <p className="text-xs mt-3 text-red-300">
          Make sure the API server is running on port 3001
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search overlays..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
        />
        <a
          href="/editor?id=new"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap"
        >
          + New Overlay
        </a>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No overlays found</p>
          <p className="text-sm mt-2">Create your first overlay to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(overlay => (
            <div
              key={overlay.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-indigo-700 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium px-2 py-1 bg-indigo-900/50 text-indigo-300 rounded">
                  {OVERLAY_TYPE_LABELS[overlay.type] || overlay.type}
                </span>
                <button
                  onClick={() => handleDelete(overlay.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all text-sm"
                >
                  ✕
                </button>
              </div>
              <h3 className="font-semibold text-white mb-2 truncate">{overlay.name}</h3>
              <p className="text-xs text-gray-500 mb-4">
                Updated {new Date(overlay.updatedAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <a
                  href={`/editor?id=${overlay.id}`}
                  className="flex-1 text-center text-sm px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                >
                  Edit
                </a>
                <a
                  href={`/overlay/${overlay.type}?id=${overlay.id}`}
                  target="_blank"
                  className="flex-1 text-center text-sm px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded transition-colors"
                >
                  Open
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
