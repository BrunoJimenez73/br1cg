import React, { useEffect, useState } from 'react';
import { OVERLAY_COMPONENTS, type ExtendedOverlayType } from './index';

interface OverlayRendererProps {
  type: string;
}

export default function OverlayRenderer({ type }: OverlayRendererProps) {
  const Component = OVERLAY_COMPONENTS[type as ExtendedOverlayType];
  const [overlayId, setOverlayId] = useState<string | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOverlayId(params.get('id') || type || undefined);
  }, []);

  if (!Component) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100%', height: '100%', color: '#fff', fontSize: 24,
      }}>
        Overlay "{type}" no encontrado
      </div>
    );
  }

  return <Component overlayId={overlayId} />;
}
