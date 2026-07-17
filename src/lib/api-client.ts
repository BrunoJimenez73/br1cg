// ──────────────────────────────────────────────
// br1cg — REST API Client for overlays
// ──────────────────────────────────────────────

import type { OverlayConfig } from './types';

const API_BASE = 'http://localhost:3001/api/overlays';

function getBaseUrl(): string {
  if (typeof window === 'undefined') return API_BASE;
  const port = window.location.port;
  return port === '4321' ? 'http://localhost:3001/api/overlays' : '/api/overlays';
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const base = getBaseUrl();
  const url = `${base}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

/** Fetch all overlays */
export async function getOverlays(): Promise<OverlayConfig[]> {
  return request<OverlayConfig[]>('');
}

/** Fetch a single overlay by ID */
export async function getOverlay(id: string): Promise<OverlayConfig> {
  return request<OverlayConfig>(`/${id}`);
}

/** Create a new overlay */
export async function createOverlay(
  data: Partial<OverlayConfig>,
): Promise<OverlayConfig> {
  return request<OverlayConfig>('', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Update an existing overlay */
export async function updateOverlay(
  id: string,
  data: Partial<OverlayConfig>,
): Promise<OverlayConfig> {
  return request<OverlayConfig>(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** Delete an overlay */
export async function deleteOverlay(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/${id}`, { method: 'DELETE' });
}

/** Export all overlays as JSON */
export async function exportOverlays(): Promise<{
  version: number;
  exportedAt: string;
  count: number;
  overlays: OverlayConfig[];
}> {
  return request('/export');
}

/** Import overlays from JSON array */
export async function importOverlays(overlays: OverlayConfig[]): Promise<{
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}> {
  return request('/import', {
    method: 'POST',
    body: JSON.stringify({ overlays }),
  });
}
