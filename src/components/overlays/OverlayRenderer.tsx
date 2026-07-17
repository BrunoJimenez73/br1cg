import React, { useEffect, useState } from 'react';
import { OVERLAY_COMPONENTS, type ExtendedOverlayType } from './index';

interface OverlayRendererProps {
  type: string;
}

export default function OverlayRenderer({ type }: OverlayRendererProps) {
  const Component = OVERLAY_COMPONENTS[type as ExtendedOverlayType];
  const [overlayId, setOverlayId] = useState<string | undefined>();
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    setOverlayId(id || undefined);

    // Fetch config from API if we have an ID
    if (id) {
      const baseUrl = window.location.port === '4321' ? 'http://localhost:3001' : '';
      fetch(`${baseUrl}/api/overlays/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            setConfig(data.data);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
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

  if (loading) {
    return null;
  }

  return <Component overlayId={overlayId} config={config} />;
}
