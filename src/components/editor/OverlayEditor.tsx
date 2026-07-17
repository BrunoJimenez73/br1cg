import { useState, useEffect, useRef, useCallback } from 'react';
import { OVERLAY_TYPE_LABELS, OVERLAY_TYPES, type OverlayConfig, type OverlayType, type OverlayConfigData, type OverlayElement } from '../../lib/types';
import { getDefaultConfig, getDefaultElements } from '../../lib/defaults';
import { getOverlay, createOverlay, updateOverlay } from '../../lib/api-client';
import { useEditorStore } from '../../lib/overlay-store';
import EditorCanvas from './EditorCanvas';
import PropertiesPanel from './PropertiesPanel';
import LayerPanel from './LayerPanel';
import TemplatePicker from './TemplatePicker';

type Tab = 'config' | 'design';

export default function OverlayEditor() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const id = params.get('id') || 'new';
  const isNew = id === 'new';

  const [tab, setTab] = useState<Tab>('design');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<OverlayConfig>>({
    name: '',
    type: 'timer',
    data: getDefaultConfig('timer'),
    elements: getDefaultElements('timer'),
    tags: [],
  });
  const [showTemplatePicker, setShowTemplatePicker] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentId, setCurrentId] = useState(id);
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket for live updates
  useEffect(() => {
    if (isNew || !currentId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.port === '4321' ? 'localhost:3001' : window.location.host;
    const ws = new WebSocket(`${protocol}//${host}/ws?subscribe=${currentId}`);

    ws.onopen = () => {
      console.log('[Editor] WebSocket connected to overlay:', currentId);
    };

    wsRef.current = ws;
    return () => ws.close();
  }, [currentId, isNew]);

  // Load overlay from API
  useEffect(() => {
    if (!isNew) {
      getOverlay(id)
        .then(data => {
          setForm({
            name: data.name,
            type: data.type,
            data: data.data,
            elements: data.elements?.length ? data.elements : getDefaultElements(data.type),
            tags: data.tags,
          });
        })
        .catch(console.error);
    }
  }, [id, isNew]);

  function handleTypeChange(type: OverlayType) {
    setForm(prev => ({
      ...prev,
      type,
      data: getDefaultConfig(type),
      elements: getDefaultElements(type),
    }));
  }

  function handleDataChange(key: string, value: unknown) {
    setForm(prev => ({
      ...prev,
      data: { ...prev.data, [key]: value } as OverlayConfigData,
    }));
  }

  function handleElementUpdate(elementId: string, patch: Partial<OverlayElement>) {
    setForm(prev => ({
      ...prev,
      elements: (prev.elements || []).map(el =>
        el.id === elementId ? { ...el, ...patch } : el
      ),
    }));
  }

  function handleElementAdd(type: OverlayElement['type']) {
    const newEl: OverlayElement = {
      id: crypto.randomUUID(),
      type,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: type === 'timer-display' ? 400 : 200,
      height: type === 'timer-display' ? 80 : type === 'text' ? 40 : 100,
      rotation: 0,
      zIndex: (form.elements?.length || 0) + 1,
      opacity: 1,
      visible: true,
      locked: false,
      props: getDefaultProps(type),
    };
    setForm(prev => ({
      ...prev,
      elements: [...(prev.elements || []), newEl],
    }));
    setSelectedId(newEl.id);
  }

  function handleElementDelete(elementId: string) {
    setForm(prev => ({
      ...prev,
      elements: (prev.elements || []).filter(el => el.id !== elementId),
    }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const method = isNew ? 'POST' : 'PUT';
      const payload = {
        name: form.name,
        type: form.type,
        data: form.data,
        elements: form.elements,
        tags: form.tags,
      };

      let savedId = currentId;
      if (isNew) {
        const created = await createOverlay(payload);
        savedId = created.id;
        setCurrentId(savedId);
        const newUrl = `/editor?id=${savedId}`;
        window.history.replaceState(null, '', newUrl);
      } else {
        await updateOverlay(currentId, payload);
      }

      setSaved(true);

      // Send WebSocket update to live overlay with full data + elements
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const updateMsg = {
          type: 'overlay:save',
          overlayId: savedId,
          data: {
            ...form.data,
            elements: form.elements,
          },
        };
        wsRef.current.send(JSON.stringify(updateMsg));
        console.log('[Editor] Sent WebSocket save:', updateMsg);
      }

      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }

  const selectedElement = form.elements?.find(el => el.id === selectedId) || null;

  function handleTemplateSelect(type: OverlayType, templateName: string) {
    setForm({
      name: templateName,
      type,
      data: getDefaultConfig(type),
      elements: getDefaultElements(type),
      tags: [],
    });
    setShowTemplatePicker(false);
  }

  return (
    <div className="flex flex-col h-full">
      {showTemplatePicker && (
        <TemplatePicker
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">
            {isNew ? 'New Overlay' : 'Edit Overlay'}
          </h1>
          <span className="text-xs px-2 py-1 bg-indigo-900/50 text-indigo-300 rounded">
            {OVERLAY_TYPE_LABELS[form.type as OverlayType] || form.type}
          </span>
          {!isNew && (
            <button
              onClick={() => setShowTemplatePicker(true)}
              className="text-xs text-gray-500 hover:text-gray-300 ml-2"
            >
              Change template →
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
              saved ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-500'
            } disabled:opacity-50`}
          >
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 bg-gray-900/50">
        <TabBtn active={tab === 'design'} onClick={() => setTab('design')}>Design</TabBtn>
        <TabBtn active={tab === 'config'} onClick={() => setTab('config')}>Config</TabBtn>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {tab === 'design' ? (
          <>
            {/* Canvas */}
            <div className="flex-1">
              <EditorCanvas
                elements={form.elements || []}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onUpdate={handleElementUpdate}
                onAdd={handleElementAdd}
                onDelete={handleElementDelete}
              />
            </div>

            {/* Right panel: Properties + Layers */}
            <div className="w-72 bg-gray-900 border-l border-gray-800 flex flex-col overflow-y-auto">
              {/* Properties */}
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Properties</h3>
                {selectedElement ? (
                  <PropertiesPanel
                    element={selectedElement}
                    onChange={(patch) => handleElementUpdate(selectedElement.id, patch)}
                  />
                ) : (
                  <p className="text-xs text-gray-600">Select an element</p>
                )}
              </div>

              {/* Layers */}
              <div className="p-4 flex-1">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Layers</h3>
                <LayerPanel
                  elements={form.elements || []}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onUpdate={handleElementUpdate}
                />
              </div>
            </div>
          </>
        ) : (
          /* Config tab */
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="My Overlay"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => handleTypeChange(e.target.value as OverlayType)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  {OVERLAY_TYPES.map(type => (
                    <option key={type} value={type}>{OVERLAY_TYPE_LABELS[type]}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Overlay Data</h3>
                {form.data && Object.entries(form.data).map(([key, value]) => {
                  if (typeof value === 'boolean') {
                    return (
                      <div key={key}>
                        <label className="flex items-center gap-2 text-sm text-gray-400">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={e => handleDataChange(key, e.target.checked)}
                            className="rounded bg-gray-800 border-gray-700"
                          />
                          {key}
                        </label>
                      </div>
                    );
                  }

                  if (typeof value === 'number') {
                    return (
                      <div key={key}>
                        <label className="block text-sm text-gray-400 mb-1">{key}</label>
                        <input
                          type="number"
                          value={value}
                          onChange={e => handleDataChange(key, Number(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    );
                  }

                  if (Array.isArray(value)) {
                    return (
                      <div key={key}>
                        <label className="block text-sm text-gray-400 mb-1">{key}</label>
                        <textarea
                          value={value.join('\n')}
                          onChange={e => handleDataChange(key, e.target.value.split('\n').filter(Boolean))}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 h-24 font-mono text-xs"
                        />
                      </div>
                    );
                  }

                  if (key.toLowerCase().includes('color')) {
                    return (
                      <div key={key}>
                        <label className="block text-sm text-gray-400 mb-1">{key}</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={typeof value === 'string' ? value : '#000000'}
                            onChange={e => handleDataChange(key, e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer bg-transparent border border-gray-700"
                          />
                          <input
                            type="text"
                            value={typeof value === 'string' ? value : ''}
                            onChange={e => handleDataChange(key, e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-sm"
                          />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={key}>
                      <label className="block text-sm text-gray-400 mb-1">{key}</label>
                      <input
                        type="text"
                        value={typeof value === 'string' ? value : String(value)}
                        onChange={e => handleDataChange(key, e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 text-sm font-medium transition-colors ${
        active
          ? 'text-white border-b-2 border-indigo-500 bg-gray-800/50'
          : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

function getDefaultProps(type: OverlayElement['type']): Record<string, unknown> {
  switch (type) {
    case 'text':
      return { text: 'Text', fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 700, color: '#ffffff', textAlign: 'left', letterSpacing: 0, lineHeight: 1.4 };
    case 'image':
      return { src: '', fit: 'contain', borderRadius: 0 };
    case 'shape':
      return { shapeType: 'rectangle', backgroundColor: '#333333', borderWidth: 0, borderColor: '#ffffff', borderRadius: 0 };
    case 'timer-display':
      return { format: 'mm:ss', fontSize: 72, color: '#22c55e', fontFamily: 'monospace' };
    case 'score-display':
      return { team: 'home', fontSize: 36, color: '#ffffff', fontFamily: 'Inter, sans-serif' };
  }
}
