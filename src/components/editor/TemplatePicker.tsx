  // ──────────────────────────────────────────────
// br1cg — Template Picker for Overlay Editor
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { getAPIBase } from '../../lib/ws-client';
import type { OverlayType } from '../../lib/types';

interface Template {
  id: string;
  name: string;
  type: OverlayType;
  category: string;
  description?: string;
}

interface TemplatePickerProps {
  onSelect: (type: OverlayType, templateName: string) => void;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  basico: 'Básicos',
  deportes: 'Deportes',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  basico: '🎯',
  deportes: '🏟️',
};

export default function TemplatePicker({ onSelect, onClose }: TemplatePickerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${getAPIBase()}/api/templates`)
      .then((r) => r.json())
      .then((data) => {
        setTemplates(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const grouped = templates.reduce<Record<string, Template[]>>((acc, t) => {
    (acc[t.category] = acc[t.category] || []).push(t);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold">Choose a Template</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No templates available</div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                  {CATEGORY_EMOJIS[category] || '📁'} {CATEGORY_LABELS[category] || category}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {items.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => onSelect(tpl.type, tpl.name)}
                      className="text-left p-4 rounded-lg border border-gray-800 bg-gray-850 hover:border-indigo-500/50 hover:bg-gray-800 transition-all group"
                    >
                      <div className="font-medium text-sm text-white group-hover:text-indigo-300 transition-colors">
                        {tpl.name}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-900/40 text-indigo-300 capitalize">
                          {tpl.type}
                        </span>
                        <span className="text-[10px] text-gray-600">{tpl.description || ''}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer — option to start blank */}
        <div className="px-6 py-3 border-t border-gray-800 flex justify-center">
          <button
            onClick={() => onSelect('timer', 'Blank')}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            or start from scratch →
          </button>
        </div>
      </div>
    </div>
  );
}
