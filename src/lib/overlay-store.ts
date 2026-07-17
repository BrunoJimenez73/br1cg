// ──────────────────────────────────────────────
// br1cg — Zustand store for overlay editor state
// ──────────────────────────────────────────────

import { create } from 'zustand';
import type { OverlayConfig, OverlayElement, OverlayType, OverlayConfigData } from './types';
import { getDefaultConfig, getDefaultElements } from './defaults';

export interface EditorState {
  /** The overlay being edited (null = new) */
  editedOverlay: Partial<OverlayConfig> | null;
  /** Currently selected element ID in the canvas */
  selectedElementId: string | null;
  /** Whether the editor is loading data */
  loading: boolean;
  /** Whether a save is in progress */
  saving: boolean;
  /** Whether the last save succeeded (auto-clears) */
  saved: boolean;
  /** Error message, if any */
  error: string | null;
  /** The overlay ID being edited ('new' for new overlays) */
  overlayId: string;
  /** Whether this is a new overlay */
  isNew: boolean;

  // Actions
  setOverlayId: (id: string) => void;
  setEditedOverlay: (overlay: Partial<OverlayConfig>) => void;
  setSelectedElementId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setSaved: (saved: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  editedOverlay: null as Partial<OverlayConfig> | null,
  selectedElementId: null as string | null,
  loading: false,
  saving: false,
  saved: false,
  error: null as string | null,
  overlayId: 'new',
  isNew: true,
};

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,

  setOverlayId: (id: string) =>
    set({ overlayId: id, isNew: id === 'new' }),

  setEditedOverlay: (overlay: Partial<OverlayConfig>) =>
    set({ editedOverlay: overlay }),

  setSelectedElementId: (id: string | null) =>
    set({ selectedElementId: id }),

  setLoading: (loading: boolean) => set({ loading }),
  setSaving: (saving: boolean) => set({ saving }),
  setSaved: (saved: boolean) => set({ saved }),
  setError: (error: string | null) => set({ error }),

  reset: () => set({ ...initialState }),
}));
