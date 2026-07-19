// ──────────────────────────────────────────────
// Tests for useEditorStore (Zustand store)
// ──────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../src/lib/overlay-store';

describe('useEditorStore', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  it('starts with initial state', () => {
    const state = useEditorStore.getState();
    expect(state.overlayId).toBe('new');
    expect(state.isNew).toBe(true);
    expect(state.editedOverlay).toBeNull();
    expect(state.selectedElementId).toBeNull();
    expect(state.tab).toBe('design');
    expect(state.past).toEqual([]);
    expect(state.future).toEqual([]);
  });

  it('setOverlayId updates id and isNew', () => {
    useEditorStore.getState().setOverlayId('abc-123');
    expect(useEditorStore.getState().overlayId).toBe('abc-123');
    expect(useEditorStore.getState().isNew).toBe(false);
    expect(useEditorStore.getState().showTemplatePicker).toBe(false);
  });

  it('setOverlayId "new" shows template picker', () => {
    useEditorStore.getState().setOverlayId('new');
    expect(useEditorStore.getState().isNew).toBe(true);
    expect(useEditorStore.getState().showTemplatePicker).toBe(true);
  });

  describe('undo/redo', () => {
    it('updateOverlay pushes to past', () => {
      const store = useEditorStore.getState();
      store.setEditedOverlay({ name: 'Original', type: 'timer' });
      store.updateOverlay({ name: 'Changed' });
      const state = useEditorStore.getState();
      expect(state.past).toHaveLength(1);
      expect(state.past[0].name).toBe('Original');
      expect(state.editedOverlay?.name).toBe('Changed');
    });

    it('undo restores previous state', () => {
      const store = useEditorStore.getState();
      store.setEditedOverlay({ name: 'V1' });
      store.updateOverlay({ name: 'V2' });
      store.undo();
      expect(useEditorStore.getState().editedOverlay?.name).toBe('V1');
      expect(useEditorStore.getState().future).toHaveLength(1);
      expect(useEditorStore.getState().future[0].name).toBe('V2');
    });

    it('redo restores undone state', () => {
      const store = useEditorStore.getState();
      store.setEditedOverlay({ name: 'V1' });
      store.updateOverlay({ name: 'V2' });
      store.undo();
      store.redo();
      expect(useEditorStore.getState().editedOverlay?.name).toBe('V2');
      expect(useEditorStore.getState().past).toHaveLength(1);
    });

    it('undo does nothing when past is empty', () => {
      useEditorStore.getState().setEditedOverlay({ name: 'X' });
      useEditorStore.getState().undo();
      expect(useEditorStore.getState().editedOverlay?.name).toBe('X');
    });

    it('redo does nothing when future is empty', () => {
      useEditorStore.getState().setEditedOverlay({ name: 'X' });
      useEditorStore.getState().redo();
      expect(useEditorStore.getState().editedOverlay?.name).toBe('X');
    });

    it('new edit clears future', () => {
      const store = useEditorStore.getState();
      store.setEditedOverlay({ name: 'V1' });
      store.updateOverlay({ name: 'V2' });
      store.undo();
      expect(useEditorStore.getState().future).toHaveLength(1);
      store.updateOverlay({ name: 'V3' });
      expect(useEditorStore.getState().future).toHaveLength(0);
    });

    it('limits history to 50 entries', () => {
      const store = useEditorStore.getState();
      store.setEditedOverlay({ name: 'start' });
      for (let i = 0; i < 60; i++) {
        useEditorStore.getState().updateOverlay({ name: `v${i}` });
      }
      expect(useEditorStore.getState().past.length).toBeLessThanOrEqual(50);
    });
  });

  describe('atomic actions', () => {
    it('updateData updates just the data field', () => {
      const store = useEditorStore.getState();
      store.setEditedOverlay({ name: 'Test', type: 'timer', data: { minutes: 5 } as any });
      store.updateData('minutes', 10);
      expect(useEditorStore.getState().editedOverlay?.data).toEqual({ minutes: 10 });
      expect(useEditorStore.getState().editedOverlay?.name).toBe('Test');
    });

    it('updateElement patches a specific element', () => {
      const store = useEditorStore.getState();
      store.setEditedOverlay({
        elements: [
          {
            id: 'el-1',
            type: 'text',
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            rotation: 0,
            zIndex: 1,
            opacity: 1,
            visible: true,
            locked: false,
            props: { text: 'A' },
          },
          {
            id: 'el-2',
            type: 'text',
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            rotation: 0,
            zIndex: 2,
            opacity: 1,
            visible: true,
            locked: false,
            props: { text: 'B' },
          },
        ] as any,
      });
      store.updateElement('el-1', { x: 200 });
      const el = useEditorStore.getState().editedOverlay?.elements?.find((e) => e.id === 'el-1');
      expect(el?.x).toBe(200);
      const el2 = useEditorStore.getState().editedOverlay?.elements?.find((e) => e.id === 'el-2');
      expect(el2?.x).toBe(0);
    });

    it('addElement appends to elements', () => {
      const store = useEditorStore.getState();
      store.setEditedOverlay({ elements: [] });
      store.addElement({
        id: 'new-el',
        type: 'text',
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        rotation: 0,
        zIndex: 1,
        opacity: 1,
        visible: true,
        locked: false,
        props: {},
      } as any);
      expect(useEditorStore.getState().editedOverlay?.elements).toHaveLength(1);
    });

    it('removeElement removes from elements', () => {
      const store = useEditorStore.getState();
      store.setEditedOverlay({
        elements: [
          {
            id: 'a',
            type: 'text',
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            rotation: 0,
            zIndex: 1,
            opacity: 1,
            visible: true,
            locked: false,
            props: {},
          },
          {
            id: 'b',
            type: 'text',
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            rotation: 0,
            zIndex: 2,
            opacity: 1,
            visible: true,
            locked: false,
            props: {},
          },
        ] as any,
      });
      store.removeElement('a');
      expect(useEditorStore.getState().editedOverlay?.elements).toHaveLength(1);
      expect(useEditorStore.getState().editedOverlay?.elements?.[0].id).toBe('b');
    });

    it('changeType resets data and elements to defaults for new type', () => {
      const store = useEditorStore.getState();
      store.setEditedOverlay({ type: 'timer', data: { custom: true } as any, elements: [{ id: 'x' }] as any });
      store.changeType('scorebug');
      const state = useEditorStore.getState();
      expect(state.editedOverlay?.type).toBe('scorebug');
      expect(state.editedOverlay?.data).not.toEqual({ custom: true });
      expect(Array.isArray(state.editedOverlay?.elements)).toBe(true);
      expect(state.editedOverlay?.elements?.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('reset returns to initial state', () => {
    const store = useEditorStore.getState();
    store.setOverlayId('test-id');
    store.setEditedOverlay({ name: 'Test' });
    store.updateOverlay({ name: 'Changed' });
    store.reset();
    const state = useEditorStore.getState();
    expect(state.overlayId).toBe('new');
    expect(state.editedOverlay).toBeNull();
    expect(state.past).toEqual([]);
  });
});
