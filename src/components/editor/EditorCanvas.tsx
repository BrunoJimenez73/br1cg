import { useState, useRef, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import type { OverlayElement } from '../../lib/types';

interface EditorCanvasProps {
  elements: OverlayElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, patch: Partial<OverlayElement>) => void;
  onAdd: (type: OverlayElement['type']) => void;
  onDelete: (id: string) => void;
}

const CANVAS_W = 1920;
const CANVAS_H = 1080;
const SCALE = 0.5;

export default function EditorCanvas({ elements, selectedId, onSelect, onUpdate, onAdd, onDelete }: EditorCanvasProps) {
  const [dragType, setDragType] = useState<OverlayElement['type'] | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDelete = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
      onDelete(selectedId);
      onSelect(null);
    }
  }, [selectedId, onDelete, onSelect]);

  return (
    <div className="flex flex-col h-full" tabIndex={0} onKeyDown={handleDelete}>
      <Toolbar onAdd={onAdd} />
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden bg-gray-950"
        style={{
          backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
        onClick={(e) => { if (e.target === canvasRef.current) onSelect(null); }}
      >
        <div
          style={{
            width: CANVAS_W * SCALE,
            height: CANVAS_H * SCALE,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: CANVAS_W,
              height: CANVAS_H,
              transform: `scale(${SCALE})`,
              transformOrigin: 'top left',
              position: 'relative',
              backgroundColor: '#000',
            }}
          >
            {elements
              .filter(el => el.visible)
              .sort((a, b) => a.zIndex - b.zIndex)
              .map(el => (
                <Rnd
                  key={el.id}
                  size={{ width: el.width, height: el.height }}
                  position={{ x: el.x, y: el.y }}
                  onDragStop={(_, d) => onUpdate(el.id, { x: d.x, y: d.y })}
                  onResizeStop={(_, __, ref, ___, { x, y }) => {
                    onUpdate(el.id, {
                      width: parseInt(ref.style.width),
                      height: parseInt(ref.style.height),
                      x, y,
                    });
                  }}
                  onClick={(e) => { e.stopPropagation(); onSelect(el.id); }}
                  onDragStart={() => onSelect(el.id)}
                  bounds="parent"
                  enableResizing={!el.locked}
                  disableDragging={el.locked}
                  className={`rounded ${selectedId === el.id ? 'ring-2 ring-indigo-500' : 'ring-1 ring-transparent hover:ring-white/20'}`}
                  style={{
                    zIndex: el.zIndex,
                    opacity: el.opacity,
                    cursor: el.locked ? 'default' : 'move',
                  }}
                >
                  <ElementRenderer element={el} />
                </Rnd>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Toolbar({ onAdd }: { onAdd: (type: OverlayElement['type']) => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-800">
      <span className="text-xs text-gray-400 mr-2">Add:</span>
      <button onClick={() => onAdd('text')} className="px-2 py-1 text-xs bg-gray-800 hover:bg-indigo-700 rounded transition-colors">Text</button>
      <button onClick={() => onAdd('image')} className="px-2 py-1 text-xs bg-gray-800 hover:bg-indigo-700 rounded transition-colors">Image</button>
      <button onClick={() => onAdd('shape')} className="px-2 py-1 text-xs bg-gray-800 hover:bg-indigo-700 rounded transition-colors">Shape</button>
      <button onClick={() => onAdd('timer-display')} className="px-2 py-1 text-xs bg-gray-800 hover:bg-indigo-700 rounded transition-colors">Timer</button>
      <div className="flex-1" />
      <span className="text-xs text-gray-600">1920 × 1080</span>
    </div>
  );
}

function ElementRenderer({ element }: { element: OverlayElement }) {
  const p = element.props;

  switch (element.type) {
    case 'text':
      return (
        <div
          style={{
            width: '100%', height: '100%',
            fontFamily: (p.fontFamily as string) || 'Inter, sans-serif',
            fontSize: ((p.fontSize as number) || 16) + 'px',
            fontWeight: (p.fontWeight as number) || 400,
            color: (p.color as string) || '#fff',
            textAlign: (p.textAlign as string) || 'left',
            letterSpacing: ((p.letterSpacing as number) || 0) + 'px',
            lineHeight: ((p.lineHeight as number) || 1.4),
            backgroundColor: (p.backgroundColor as string) || 'transparent',
            padding: ((p.padding as number) || 0) + 'px',
            overflow: 'hidden',
            textShadow: (p.textShadow as string) || undefined,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {(p.text as string) || 'Text'}
        </div>
      );

    case 'image':
      return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
          {p.src ? (
            <img
              src={p.src as string}
              alt={(p.alt as string) || ''}
              style={{
                width: '100%', height: '100%',
                objectFit: (p.fit as string) || 'contain',
                borderRadius: ((p.borderRadius as number) || 0) + 'px',
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-800 text-gray-500 text-xs">
              Image
            </div>
          )}
        </div>
      );

    case 'shape':
      return (
        <div
          style={{
            width: '100%', height: '100%',
            backgroundColor: (p.backgroundColor as string) || '#333',
            border: ((p.borderWidth as number) || 0) > 0 ? `${p.borderWidth}px solid ${(p.borderColor as string) || '#fff'}` : undefined,
            borderRadius: (p.shapeType as string) === 'circle' ? '50%' : ((p.borderRadius as number) || 0) + 'px',
          }}
        />
      );

    case 'timer-display':
      return (
        <div
          style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: (p.fontFamily as string) || 'monospace',
            fontSize: ((p.fontSize as number) || 72) + 'px',
            color: (p.color as string) || '#22c55e',
            fontWeight: 900,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {(p.format as string) === 'mm:ss' ? '05:00' : '00:05:00'}
        </div>
      );

    case 'score-display':
      return (
        <div
          style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: (p.fontFamily as string) || 'Inter, sans-serif',
            fontSize: ((p.fontSize as number) || 36) + 'px',
            color: (p.color as string) || '#fff',
            fontWeight: 900,
          }}
        >
          0
        </div>
      );

    default:
      return null;
  }
}
