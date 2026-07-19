import { useState, useEffect, useMemo } from 'react';
import type { OverlayConfig, OverlayCategory } from '../../lib/types';
import {
  OVERLAY_TYPE_LABELS, OVERLAY_TYPE_ICONS, OVERLAY_TYPE_DESCRIPTIONS,
  OVERLAY_CATEGORIES, OVERLAY_CATEGORY_LABELS, OVERLAY_CATEGORY_ICONS,
} from '../../lib/types';
import * as api from '../../lib/api-client';

const CATEGORIES: OverlayCategory[] = ['graphics', 'sports', 'widgets', 'media', 'data'];

export default function OverlayLibrary() {
  const [overlays, setOverlays] = useState<OverlayConfig[]>([]);
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState<OverlayCategory | 'all'>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

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

  const filtered = useMemo(() => {
    let result = overlays;

    if (favoritesOnly) {
      result = result.filter(o => o.favorite);
    }

    if (category !== 'all') {
      result = result.filter(o => OVERLAY_CATEGORIES[o.type] === category);
    }

    if (filter.trim()) {
      const q = filter.toLowerCase();
      result = result.filter(o =>
        o.name.toLowerCase().includes(q) ||
        o.type.toLowerCase().includes(q) ||
        OVERLAY_TYPE_LABELS[o.type]?.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [overlays, filter, category, favoritesOnly]);

  async function handleDelete(id: string) {
    try {
      await api.deleteOverlay(id);
      setOverlays(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  }

  async function handleToggleFavorite(id: string, current: boolean) {
    try {
      await api.updateOverlay(id, { favorite: !current } as Partial<OverlayConfig>);
      setOverlays(prev => prev.map(o => o.id === id ? { ...o, favorite: !current } : o));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  }

  async function handleExport() {
    try {
      const data = await api.exportOverlays();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `br1cg-overlays-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  }

  function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setImporting(true);
        const data = JSON.parse(e.target?.result as string);
        const overlaysToImport = data.overlays || data;
        if (!Array.isArray(overlaysToImport)) {
          setError('Invalid file format: expected an array of overlays');
          return;
        }
        const result = await api.importOverlays(overlaysToImport);
        if (result.imported > 0) {
          await fetchOverlays();
        }
        const msg = `Imported: ${result.imported}, Skipped: ${result.skipped}`;
        if (result.errors.length > 0) {
          setError(`${msg} (${result.errors.length} errors: ${result.errors.slice(0, 3).join(', ')}${result.errors.length > 3 ? '...' : ''})`);
        } else {
          setError(null);
          alert(msg);
        }
      } catch {
        setError('Failed to parse import file');
      } finally {
        setImporting(false);
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: overlays.length };
    for (const cat of CATEGORIES) {
      counts[cat] = overlays.filter(o => OVERLAY_CATEGORIES[o.type] === cat).length;
    }
    return counts;
  }, [overlays]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading overlays...</div>
      </div>
    );
  }

  if (error && overlays.length === 0) {
    return (
      <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 text-red-200">
        <h3 className="font-semibold mb-2">Error loading overlays</h3>
        <p className="text-sm">{error}</p>
        <p className="text-xs mt-3 text-red-300">
          Make sure the API server is running on port 3001
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Search + Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search overlays by name, type, or description..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-500 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={overlays.length === 0}
            className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors text-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
          <label className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm cursor-pointer flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {importing ? 'Importing...' : 'Import'}
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" disabled={importing} />
          </label>
          <a
            href="/editor?id=new"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Overlay
          </a>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCategory('all')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
            category === 'all'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          All
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            category === 'all' ? 'bg-indigo-500' : 'bg-gray-700'
          }`}>{categoryCounts.all}</span>
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              category === cat
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span>{OVERLAY_CATEGORY_ICONS[cat]}</span>
            {OVERLAY_CATEGORY_LABELS[cat]}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              category === cat ? 'bg-indigo-500' : 'bg-gray-700'
            }`}>{categoryCounts[cat]}</span>
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm transition-all ${
            favoritesOnly
              ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
              : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <svg className="w-4 h-4" fill={favoritesOnly ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Favorites
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 px-4 py-2 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 ml-2">&times;</button>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4 text-gray-600">
            {category !== 'all' || favoritesOnly ? '🔍' : '🎬'}
          </div>
          <p className="text-lg text-gray-500 font-medium">
            {filter ? 'No overlays match your search' : favoritesOnly ? 'No favorite overlays yet' : category !== 'all' ? 'No overlays in this category' : 'No overlays found'}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {overlays.length === 0 ? 'Create your first overlay to get started' : 'Try adjusting your filters'}
          </p>
          {overlays.length === 0 && (
            <a
              href="/editor?id=new"
              className="inline-block mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-medium"
            >
              + Create Overlay
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(overlay => (
            <OverlayCard
              key={overlay.id}
              overlay={overlay}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OverlayCard({
  overlay,
  onDelete,
  onToggleFavorite,
}: {
  overlay: OverlayConfig;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
}) {
  const typeLabel = OVERLAY_TYPE_LABELS[overlay.type] || overlay.type;
  const typeIcon = OVERLAY_TYPE_ICONS[overlay.type] || '📦';
  const typeDesc = OVERLAY_TYPE_DESCRIPTIONS[overlay.type] || '';
  const category = OVERLAY_CATEGORIES[overlay.type];
  const catIcon = OVERLAY_CATEGORY_ICONS[category];

  return (
    <div className="group relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-indigo-600/50 hover:shadow-lg hover:shadow-indigo-600/5 transition-all duration-200">
      {/* Preview mini-bar */}
      <div className="h-24 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '16px 16px',
          }}
        />
        <span className="text-4xl opacity-30 group-hover:opacity-50 transition-opacity">
          {typeIcon}
        </span>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-900 to-transparent" />
        {/* Category badge */}
        <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 bg-black/50 rounded text-gray-400 flex items-center gap-1">
          {catIcon}
        </span>
        {/* Status indicator */}
        <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${overlay.favorite ? 'bg-yellow-400' : 'bg-gray-600'}`} />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm">{typeIcon}</span>
            <span className="text-[11px] font-medium px-1.5 py-0.5 bg-indigo-900/40 text-indigo-300 rounded whitespace-nowrap">
              {typeLabel}
            </span>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); onToggleFavorite(overlay.id, overlay.favorite); }}
            className={`shrink-0 transition-colors ${overlay.favorite ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400 opacity-0 group-hover:opacity-100'}`}
          >
            <svg className="w-4 h-4" fill={overlay.favorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>

        <h3 className="font-semibold text-white truncate text-sm mb-1">{overlay.name}</h3>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3 min-h-[2rem]">
          {overlay.description || typeDesc}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
            <span className={`px-1.5 py-0.5 rounded ${category ? 'bg-gray-800 text-gray-400' : ''}`}>
              {catIcon} {OVERLAY_CATEGORY_LABELS[category]}
            </span>
          </div>
          <span className="text-[11px] text-gray-600">
            {new Date(overlay.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <a
            href={`/control?id=${overlay.id}`}
            className="flex-1 text-center text-xs px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-medium"
          >
            Control
          </a>
          <a
            href={`/editor?id=${overlay.id}`}
            className="flex-1 text-center text-xs px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Edit
          </a>
          <button
            onClick={() => onDelete(overlay.id)}
            className="px-2 py-2 bg-gray-800 hover:bg-red-900/50 hover:text-red-400 rounded-lg transition-colors text-gray-500"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
