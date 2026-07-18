// ──────────────────────────────────────────────
// br1cg — REST API Client for overlays
// ──────────────────────────────────────────────

import type { OverlayConfig } from './types';

const API_BASE = 'http://localhost:3001/api/overlays';

/**
 * Returns the base API URL, handling dev (Astro) vs production (Bun) contexts.
 * In dev mode (port 4321), proxies to localhost:3001 to avoid CORS issues.
 * @returns The base URL for overlay API endpoints
 */
function getBaseUrl(): string {
  if (typeof window === 'undefined') return API_BASE;
  const port = window.location.port;
  return port === '4321' ? 'http://localhost:3001/api/overlays' : '/api/overlays';
}

/**
 * Generic HTTP request helper with error handling.
 * Automatically sets Content-Type to JSON and throws on non-2xx responses.
 * @param path - The API path to append to the base URL (e.g., '/timer-1')
 * @param options - Standard fetch RequestInit options
 * @returns Parsed JSON response
 * @throws Error with status code and message on API errors
 */
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

/**
 * Fetches all overlays from the server.
 * @returns Array of overlay configurations, ordered by most recently updated
 */
export async function getOverlays(): Promise<OverlayConfig[]> {
  return request<OverlayConfig[]>('');
}

/**
 * Fetches a single overlay by its unique ID.
 * @param id - The overlay UUID
 * @returns The overlay configuration
 */
export async function getOverlay(id: string): Promise<OverlayConfig> {
  return request<OverlayConfig>(`/${id}`);
}

/**
 * Creates a new overlay on the server.
 * @param data - Partial overlay data (type is required, others are optional)
 * @returns The created overlay with generated ID and timestamps
 */
export async function createOverlay(
  data: Partial<OverlayConfig>,
): Promise<OverlayConfig> {
  return request<OverlayConfig>('', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Updates an existing overlay by merging the provided fields.
 * @param id - The overlay UUID to update
 * @param data - Partial overlay data to merge
 * @returns The updated overlay configuration
 */
export async function updateOverlay(
  id: string,
  data: Partial<OverlayConfig>,
): Promise<OverlayConfig> {
  return request<OverlayConfig>(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Deletes an overlay from the server.
 * @param id - The overlay UUID to delete
 * @returns Success confirmation
 */
export async function deleteOverlay(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/${id}`, { method: 'DELETE' });
}

/**
 * Exports all overlays as a JSON-compatible object.
 * Includes metadata (version, timestamp, count) for import compatibility.
 * @returns Export package with all overlays
 */
export async function exportOverlays(): Promise<{
  version: number;
  exportedAt: string;
  count: number;
  overlays: OverlayConfig[];
}> {
  return request('/export');
}

/**
 * Imports overlays from a JSON array.
 * Skips overlays that already exist (by ID), validates types.
 * @param overlays - Array of overlay configurations to import
 * @returns Import results with counts and any validation errors
 */
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
