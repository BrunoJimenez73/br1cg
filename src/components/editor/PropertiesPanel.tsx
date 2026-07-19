import type { OverlayElement } from '../../lib/types';

interface Props {
  element: OverlayElement;
  onChange: (patch: Partial<OverlayElement>) => void;
}

export default function PropertiesPanel({ element, onChange }: Props) {
  const p = element.props;

  function updateProp(key: string, value: unknown) {
    onChange({ props: { ...p, [key]: value } });
  }

  return (
    <div className="space-y-3">
      <Section title="Position">
        <Row label="X">
          <NumberInput value={element.x} onChange={v => onChange({ x: v })} />
        </Row>
        <Row label="Y">
          <NumberInput value={element.y} onChange={v => onChange({ y: v })} />
        </Row>
        <Row label="W">
          <NumberInput value={element.width} onChange={v => onChange({ width: v })} min={10} />
        </Row>
        <Row label="H">
          <NumberInput value={element.height} onChange={v => onChange({ height: v })} min={10} />
        </Row>
      </Section>

      <Section title="Transform">
        <Row label="Rotate">
          <NumberInput value={element.rotation} onChange={v => onChange({ rotation: v })} min={-360} max={360} />
        </Row>
        <Row label="Opacity">
          <input
            type="range"
            min={0} max={1} step={0.05}
            value={element.opacity}
            onChange={e => onChange({ opacity: parseFloat(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </Row>
        <Row label="Z-Index">
          <NumberInput value={element.zIndex} onChange={v => onChange({ zIndex: v })} />
        </Row>
      </Section>

      <Section title="State">
        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input type="checkbox" checked={element.visible} onChange={e => onChange({ visible: e.target.checked })} className="rounded bg-gray-800 border-gray-700" />
          Visible
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input type="checkbox" checked={element.locked} onChange={e => onChange({ locked: e.target.checked })} className="rounded bg-gray-800 border-gray-700" />
          Locked
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-300 border-t border-gray-700/50 pt-2 mt-1">
          <input
            type="checkbox"
            checked={element.dynamic}
            onChange={e => onChange({ dynamic: e.target.checked })}
            className="rounded bg-gray-800 border-gray-700 text-indigo-500 focus:ring-indigo-500"
          />
          <span className="flex items-center gap-1">
            Dynamic
            <span className="text-[10px] text-indigo-400">(editable from controller)</span>
          </span>
        </label>
      </Section>

      {element.type === 'text' && (
        <Section title="Text">
          <Row label="Content">
            <input type="text" value={(p.text as string) || ''} onChange={e => updateProp('text', e.target.value)} className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs" />
          </Row>
          <Row label="Size">
            <NumberInput value={(p.fontSize as number) || 16} onChange={v => updateProp('fontSize', v)} min={8} max={200} />
          </Row>
          <Row label="Weight">
            <select value={(p.fontWeight as number) || 400} onChange={e => updateProp('fontWeight', parseInt(e.target.value))} className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs">
              <option value={300}>Light</option>
              <option value={400}>Regular</option>
              <option value={600}>Semi Bold</option>
              <option value={700}>Bold</option>
              <option value={900}>Black</option>
            </select>
          </Row>
          <Row label="Color">
            <div className="flex gap-1">
              <input type="color" value={(p.color as string) || '#ffffff'} onChange={e => updateProp('color', e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border border-gray-700" />
              <input type="text" value={(p.color as string) || '#ffffff'} onChange={e => updateProp('color', e.target.value)} className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs font-mono" />
            </div>
          </Row>
          <Row label="Align">
            <select value={(p.textAlign as string) || 'left'} onChange={e => updateProp('textAlign', e.target.value)} className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs">
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </Row>
          <Row label="Font">
            <input type="text" value={(p.fontFamily as string) || ''} onChange={e => updateProp('fontFamily', e.target.value)} className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs" placeholder="Inter, sans-serif" />
          </Row>
        </Section>
      )}

      {element.type === 'image' && (
        <Section title="Image">
          <Row label="URL">
            <input type="text" value={(p.src as string) || ''} onChange={e => updateProp('src', e.target.value)} className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs" placeholder="https://..." />
          </Row>
          <Row label="Fit">
            <select value={(p.fit as string) || 'contain'} onChange={e => updateProp('fit', e.target.value)} className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs">
              <option value="contain">Contain</option>
              <option value="cover">Cover</option>
              <option value="fill">Fill</option>
              <option value="none">None</option>
            </select>
          </Row>
          <Row label="Radius">
            <NumberInput value={(p.borderRadius as number) || 0} onChange={v => updateProp('borderRadius', v)} min={0} max={999} />
          </Row>
        </Section>
      )}

      {element.type === 'shape' && (
        <Section title="Shape">
          <Row label="Type">
            <select value={(p.shapeType as string) || 'rectangle'} onChange={e => updateProp('shapeType', e.target.value)} className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs">
              <option value="rectangle">Rectangle</option>
              <option value="rounded-rect">Rounded</option>
              <option value="circle">Circle</option>
            </select>
          </Row>
          <Row label="Fill">
            <div className="flex gap-1">
              <input type="color" value={(p.backgroundColor as string) || '#333'} onChange={e => updateProp('backgroundColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border border-gray-700" />
              <input type="text" value={(p.backgroundColor as string) || '#333'} onChange={e => updateProp('backgroundColor', e.target.value)} className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs font-mono" />
            </div>
          </Row>
          <Row label="Border">
            <NumberInput value={(p.borderWidth as number) || 0} onChange={v => updateProp('borderWidth', v)} min={0} max={20} />
          </Row>
          <Row label="Border Color">
            <div className="flex gap-1">
              <input type="color" value={(p.borderColor as string) || '#fff'} onChange={e => updateProp('borderColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border border-gray-700" />
              <input type="text" value={(p.borderColor as string) || '#fff'} onChange={e => updateProp('borderColor', e.target.value)} className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs font-mono" />
            </div>
          </Row>
          <Row label="Radius">
            <NumberInput value={(p.borderRadius as number) || 0} onChange={v => updateProp('borderRadius', v)} min={0} max={999} />
          </Row>
        </Section>
      )}

      {element.type === 'timer-display' && (
        <Section title="Timer">
          <Row label="Format">
            <select value={(p.format as string) || 'mm:ss'} onChange={e => updateProp('format', e.target.value)} className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs">
              <option value="mm:ss">mm:ss</option>
              <option value="hh:mm:ss">hh:mm:ss</option>
              <option value="mm:ss.ms">mm:ss.ms</option>
            </select>
          </Row>
          <Row label="Size">
            <NumberInput value={(p.fontSize as number) || 72} onChange={v => updateProp('fontSize', v)} min={8} max={300} />
          </Row>
          <Row label="Color">
            <div className="flex gap-1">
              <input type="color" value={(p.color as string) || '#22c55e'} onChange={e => updateProp('color', e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border border-gray-700" />
              <input type="text" value={(p.color as string) || '#22c55e'} onChange={e => updateProp('color', e.target.value)} className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs font-mono" />
            </div>
          </Row>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-12 shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function NumberInput({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      min={min}
      max={max}
      className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs"
    />
  );
}
