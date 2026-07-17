// ──────────────────────────────────────────────
// br1cg — Error Boundary for overlay components
// ──────────────────────────────────────────────
// Catches render errors in child overlay components
// and displays a fallback instead of crashing the page.

import React from 'react';

interface ErrorBoundaryProps {
  type: string;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class OverlayErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[br1cg] Overlay "${this.props.type}" crashed:`, error.message, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: '#ff4444',
            fontFamily: 'monospace',
            padding: 32,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            Overlay &quot;{this.props.type}&quot; crashed
          </div>
          <div style={{ fontSize: 14, color: '#aaa', maxWidth: 600, wordBreak: 'break-word' }}>
            {this.state.error?.message || 'Unknown error'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: 24,
              padding: '8px 24px',
              backgroundColor: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
