import { useState } from 'react';
import ControlDashboard from '../controls/ControlDashboard';
import ControllerPage from './ControllerPage';

export default function ControlRouter() {
  const [showController] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.has('id');
  });
  const [overlayId] = useState(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || '';
  });

  if (showController && overlayId) {
    return <ControllerPage overlayId={overlayId} />;
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Control Panel</h1>
            <p className="text-gray-400 mt-1">Controla tus overlays en tiempo real</p>
          </div>
          <a
            href="/"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
          >
            ← Library
          </a>
        </div>
        <ControlDashboard />
      </div>
    </main>
  );
}
