import { useEffect, useCallback } from 'react';
import { OVERLAY_TYPE_LABELS, OVERLAY_TYPES, type OverlayType, type OverlayConfigData, type OverlayElement } from '../../lib/types';
import { getDefaultConfig, getDefaultElements } from '../../lib/defaults';
import { getOverlay, createOverlay, updateOverlay } from '../../lib/api-client';
import { useEditorStore } from '../../lib/overlay-store';
import { useWebSocket } from '../../lib/ws-client';
import type { WSServerMessage } from '../../lib/types';
import EditorCanvas from './EditorCanvas';
import PropertiesPanel from './PropertiesPanel';
import LayerPanel from './LayerPanel';
import TemplatePicker from './TemplatePicker';

function getEditorId(): { id: string; isNew: boolean } {
  if (typeof window === 'undefined') return { id: 'new', isNew: true };
  const params = new URLSearchParams(window.location.search);
  const pathParts = window.location.pathname.split('/');
  const id = params.get('id') || pathParts[pathParts.length - 1] || 'new';
  return { id, isNew: id === 'new' };
}

export default function OverlayEditor() {
  const { id, isNew } = getEditorId();

  const overlayId = useEditorStore(s => s.overlayId);
  const isNewStore = useEditorStore(s => s.isNew);
  const tab = useEditorStore(s => s.tab);
  const editedOverlay = useEditorStore(s => s.editedOverlay);
  const selectedElementId = useEditorStore(s => s.selectedElementId);
  const saving = useEditorStore(s => s.saving);
  const saved = useEditorStore(s => s.saved);
  const showTemplatePicker = useEditorStore(s => s.showTemplatePicker);

  const setOverlayId = useEditorStore(s => s.setOverlayId);
  const setEditedOverlay = useEditorStore(s => s.setEditedOverlay);
  const updateOverlayState = useEditorStore(s => s.updateOverlay);
  const updateData = useEditorStore(s => s.updateData);
  const updateElement = useEditorStore(s => s.updateElement);
  const addElement = useEditorStore(s => s.addElement);
  const removeElement = useEditorStore(s => s.removeElement);
  const changeType = useEditorStore(s => s.changeType);
  const setSelectedElementId = useEditorStore(s => s.setSelectedElementId);
  const setSaving = useEditorStore(s => s.setSaving);
  const setSaved = useEditorStore(s => s.setSaved);
  const setTab = useEditorStore(s => s.setTab);
  const setShowTemplatePicker = useEditorStore(s => s.setShowTemplatePicker);
  const undo = useEditorStore(s => s.undo);
  const redo = useEditorStore(s => s.redo);

  // Initialize overlay ID on mount
  useEffect(() => {
    setOverlayId(id);
  }, [id, setOverlayId]);

  // Keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
      if (e.key === 'y') { e.preventDefault(); redo(); }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // WebSocket for live overlay updates (sends save commands after REST)
  const { send: wsSend } = useWebSocket({
    overlayId: isNewStore ? undefined : overlayId,
    onMessage: useCallback((_msg: WSServerMessage) => {
      // Editor doesn't need to process incoming messages
    }, []),
  });

  // Load overlay from API
  useEffect(() => {
    if (!isNew) {
      getOverlay(id)
        .then(data => {
          setEditedOverlay({
            name: data.name,
            type: data.type,
            data: data.data,
            elements: data.elements?.length ? data.elements : getDefaultElements(data.type),
            tags: data.tags,
          });
        })
        .catch(console.error);
    }
  }, [id, isNew, setEditedOverlay]);

  function handleElementAdd(type: OverlayElement['type']) {
    const newEl: OverlayElement = {
      id: crypto.randomUUID(),
      type,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: type === 'timer-display' ? 400 : 200,
      height: type === 'timer-display' ? 80 : type === 'text' ? 40 : 100,
      rotation: 0,
      zIndex: (editedOverlay?.elements?.length || 0) + 1,
      opacity: 1,
      visible: true,
      locked: false,
      props: getDefaultProps(type),
    };
    addElement(newEl);
    setSelectedElementId(newEl.id);
  }

  async function handleSave() {
    if (!editedOverlay) return;
    setSaving(true);
    setSaved(false);
    try {
      const payload = {
        name: editedOverlay.name,
        type: editedOverlay.type,
        data: editedOverlay.data,
        elements: editedOverlay.elements,
        tags: editedOverlay.tags,
      };

      let savedId = overlayId;
      if (isNewStore) {
        const created = await createOverlay(payload);
        savedId = created.id;
        setOverlayId(savedId);
        const newUrl = `/editor?id=${savedId}`;
        window.history.replaceState(null, '', newUrl);
      } else {
        await updateOverlay(overlayId, payload);
      }

      setSaved(true);

      // Notify live overlay via WebSocket
      wsSend({
        type: 'overlay:save',
        overlayId: savedId,
        data: {
          ...editedOverlay.data,
          elements: editedOverlay.elements,
        },
      });

      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }

  const selectedElement = editedOverlay?.elements?.find(el => el.id === selectedElementId) || null;

  function handleTemplateSelect(type: OverlayType, templateName: string) {
    setEditedOverlay({
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
            {isNewStore ? 'New Overlay' : 'Edit Overlay'}
          </h1>
          <span className="text-xs px-2 py-1 bg-indigo-900/50 text-indigo-300 rounded">
            {OVERLAY_TYPE_LABELS[editedOverlay?.type as OverlayType] || editedOverlay?.type}
          </span>
          {!isNewStore && (
            <button
              onClick={() => setShowTemplatePicker(true)}
              className="text-xs text-gray-500 hover:text-gray-300 ml-2"
            >
              Change template →
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Undo/Redo buttons */}
          <div className="flex gap-1">
            <UndoRedoBtn label="Undo" shortcut="Ctrl+Z" onClick={undo} />
            <UndoRedoBtn label="Redo" shortcut="Ctrl+Shift+Z" onClick={redo} />
          </div>
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
                elements={editedOverlay?.elements || []}
                selectedId={selectedElementId}
                onSelect={setSelectedElementId}
                onUpdate={(elementId, patch) => updateElement(elementId, patch)}
                onAdd={handleElementAdd}
                onDelete={removeElement}
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
                    onChange={(patch) => updateElement(selectedElement.id, patch)}
                  />
                ) : (
                  <p className="text-xs text-gray-600">Select an element</p>
                )}
              </div>

              {/* Layers */}
              <div className="p-4 flex-1">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Layers</h3>
                <LayerPanel
                  elements={editedOverlay?.elements || []}
                  selectedId={selectedElementId}
                  onSelect={setSelectedElementId}
                  onUpdate={(elementId, patch) => updateElement(elementId, patch)}
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
                  value={editedOverlay?.name || ''}
                  onChange={e => updateOverlayState({ name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="My Overlay"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <select
                  value={editedOverlay?.type}
                  onChange={e => changeType(e.target.value as OverlayType)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  {OVERLAY_TYPES.map(type => (
                    <option key={type} value={type}>{OVERLAY_TYPE_LABELS[type]}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Overlay Data</h3>
                {editedOverlay?.data && Object.entries(editedOverlay.data).map(([key, value]) => {
                  if (typeof value === 'boolean') {
                    return (
                      <div key={key}>
                        <label className="flex items-center gap-2 text-sm text-gray-400">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={e => updateData(key, e.target.checked)}
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
                          onChange={e => updateData(key, Number(e.target.value))}
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
                          onChange={e => updateData(key, e.target.value.split('\n').filter(Boolean))}
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
                            onChange={e => updateData(key, e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer bg-transparent border border-gray-700"
                          />
                          <input
                            type="text"
                            value={typeof value === 'string' ? value : ''}
                            onChange={e => updateData(key, e.target.value)}
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
                        onChange={e => updateData(key, e.target.value)}
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

function UndoRedoBtn({ label, shortcut, onClick }: { label: string; shortcut: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={`${label} (${shortcut})`}
      className="px-2 py-1 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors"
    >
      {label === 'Undo' ? '↩' : '↪'}
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
