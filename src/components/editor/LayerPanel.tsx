import type { OverlayElement } from '../../lib/types';

interface Props {
  elements: OverlayElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: Partial<OverlayElement>) => void;
}

const TYPE_ICONS: Record<string, string> = {
  'text': 'T',
  'image': '🖼',
  'shape': '■',
  'timer-display': '⏱',
  'score-display': '🏆',
};

export default function LayerPanel({ elements, selectedId, onSelect, onUpdate }: Props) {
  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  function moveUp(el: OverlayElement) {
    const above = elements.find(e => e.zIndex > el.zIndex);
    if (above) {
      const tmp = el.zIndex;
      onUpdate(el.id, { zIndex: above.zIndex });
      onUpdate(above.id, { zIndex: tmp });
    }
  }

  function moveDown(el: OverlayElement) {
    const below = elements.find(e => e.zIndex < el.zIndex);
    if (below) {
      const tmp = el.zIndex;
      onUpdate(el.id, { zIndex: below.zIndex });
      onUpdate(below.id, { zIndex: tmp });
    }
  }

  return (
    <div className="space-y-1">
      {sorted.map((el, i) => (
        <div
          key={el.id}
          onClick={() => onSelect(el.id)}
          className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs transition-colors ${
            selectedId === el.id
              ? 'bg-indigo-900/50 text-indigo-200 ring-1 ring-indigo-700'
              : 'hover:bg-gray-800 text-gray-400'
          }`}
        >
          <span className="w-5 text-center">{TYPE_ICONS[el.type] || '?'}</span>
          <span className="flex-1 truncate">{el.type === 'text' ? (el.props.text as string) || 'Text' : el.type}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate(el.id, { visible: !el.visible }); }}
            className={`opacity-60 hover:opacity-100 ${el.visible ? '' : 'text-red-400'}`}
            title={el.visible ? 'Hide' : 'Show'}
          >
            {el.visible ? '👁' : '👁‍🗨'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate(el.id, { locked: !el.locked }); }}
            className={`opacity-60 hover:opacity-100 ${el.locked ? 'text-yellow-400' : ''}`}
            title={el.locked ? 'Unlock' : 'Lock'}
          >
            {el.locked ? '🔒' : '🔓'}
          </button>
        </div>
      ))}
      {sorted.length === 0 && (
        <p className="text-xs text-gray-600 text-center py-4">No elements</p>
      )}
    </div>
  );
}
