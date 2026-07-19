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
  /** Active tab */
  tab: 'config' | 'design';
  /** Whether the template picker is visible */
  showTemplatePicker: boolean;

  // Undo/redo history (stores snapshots of editedOverlay)
  past: Partial<OverlayConfig>[];
  future: Partial<OverlayConfig>[];

  // Actions
  setOverlayId: (id: string) => void;
  setEditedOverlay: (overlay: Partial<OverlayConfig>) => void;
  /** Update overlay with undo history tracking */
  updateOverlay: (patch: Partial<OverlayConfig>) => void;
  /** Update just the data field */
  updateData: (key: string, value: unknown) => void;
  /** Update a single element */
  updateElement: (elementId: string, patch: Partial<OverlayElement>) => void;
  /** Add a new element */
  addElement: (element: OverlayElement) => void;
  /** Remove an element */
  removeElement: (elementId: string) => void;
  /** Change overlay type (resets data + elements) */
  changeType: (type: OverlayType) => void;
  setSelectedElementId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setSaved: (saved: boolean) => void;
  setError: (error: string | null) => void;
  setTab: (tab: 'config' | 'design') => void;
  setShowTemplatePicker: (show: boolean) => void;
  undo: () => void;
  redo: () => void;
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
  tab: 'design' as 'config' | 'design',
  showTemplatePicker: true,
  past: [] as Partial<OverlayConfig>[],
  future: [] as Partial<OverlayConfig>[],
};

const MAX_HISTORY = 50;

function pushHistory(state: EditorState): Pick<EditorState, 'past' | 'future'> {
  const current = state.editedOverlay;
  if (!current) return { past: state.past, future: [] };
  const past = [...state.past.slice(-(MAX_HISTORY - 1)), current];
  return { past, future: [] };
}

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,

  setOverlayId: (id: string) =>
    set({ overlayId: id, isNew: id === 'new', showTemplatePicker: id === 'new' }),

  setEditedOverlay: (overlay: Partial<OverlayConfig>) =>
    set({ editedOverlay: overlay }),

  updateOverlay: (patch: Partial<OverlayConfig>) =>
    set((state) => ({
      ...pushHistory(state),
      editedOverlay: state.editedOverlay ? { ...state.editedOverlay, ...patch } : patch,
    })),

  updateData: (key: string, value: unknown) =>
    set((state) => ({
      ...pushHistory(state),
      editedOverlay: state.editedOverlay
        ? { ...state.editedOverlay, data: { ...(state.editedOverlay.data || {}), [key]: value } as OverlayConfigData }
        : null,
    })),

  updateElement: (elementId: string, patch: Partial<OverlayElement>) =>
    set((state) => ({
      ...pushHistory(state),
      editedOverlay: state.editedOverlay
        ? {
          ...state.editedOverlay,
          elements: (state.editedOverlay.elements || []).map(el =>
            el.id === elementId ? { ...el, ...patch } : el
          ),
        }
        : null,
    })),

  addElement: (element: OverlayElement) =>
    set((state) => ({
      ...pushHistory(state),
      editedOverlay: state.editedOverlay
        ? { ...state.editedOverlay, elements: [...(state.editedOverlay.elements || []), element] }
        : null,
    })),

  removeElement: (elementId: string) =>
    set((state) => ({
      ...pushHistory(state),
      editedOverlay: state.editedOverlay
        ? { ...state.editedOverlay, elements: (state.editedOverlay.elements || []).filter(el => el.id !== elementId) }
        : null,
    })),

  changeType: (type: OverlayType) =>
    set((state) => ({
      ...pushHistory(state),
      editedOverlay: state.editedOverlay
        ? {
          ...state.editedOverlay,
          type,
          data: getDefaultConfig(type),
          elements: getDefaultElements(type),
        }
        : null,
    })),

  setSelectedElementId: (id: string | null) =>
    set({ selectedElementId: id }),

  setLoading: (loading: boolean) => set({ loading }),
  setSaving: (saving: boolean) => set({ saving }),
  setSaved: (saved: boolean) => set({ saved }),
  setError: (error: string | null) => set({ error }),
  setTab: (tab: 'config' | 'design') => set({ tab }),
  setShowTemplatePicker: (show: boolean) => set({ showTemplatePicker: show }),

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        future: state.editedOverlay ? [state.editedOverlay, ...state.future] : state.future,
        editedOverlay: previous,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        past: state.editedOverlay ? [...state.past, state.editedOverlay] : state.past,
        future: state.future.slice(1),
        editedOverlay: next,
      };
    }),

  reset: () => set({ ...initialState }),
}));
