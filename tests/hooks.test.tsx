import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOverlayLifecycle } from '../src/hooks/useOverlayLifecycle';
import { sendWSMessage, clearWSCallbacks } from './setup';

describe('useOverlayLifecycle', () => {
  beforeEach(() => {
    clearWSCallbacks();
  });

  it('starts with visible=true by default', () => {
    const { result } = renderHook(() =>
      useOverlayLifecycle({ defaults: {}, overlayId: 'lifecycle-1' }),
    );
    expect(result.current.visible).toBe(true);
  });

  it('starts with visible=false when initialVisible=false', () => {
    const { result } = renderHook(() =>
      useOverlayLifecycle({ defaults: {}, overlayId: 'lifecycle-2', initialVisible: false }),
    );
    expect(result.current.visible).toBe(false);
  });

  it('shows overlay on WS show command', () => {
    const { result } = renderHook(() =>
      useOverlayLifecycle({ defaults: {}, overlayId: 'lifecycle-3', initialVisible: false }),
    );
    expect(result.current.visible).toBe(false);

    act(() => {
      sendWSMessage('lifecycle-3', { type: 'command', action: 'show', payload: {} });
    });

    expect(result.current.visible).toBe(true);
  });

  it('hides overlay on WS hide command', () => {
    const { result } = renderHook(() =>
      useOverlayLifecycle({ defaults: {}, overlayId: 'lifecycle-4', initialVisible: true }),
    );
    expect(result.current.visible).toBe(true);

    act(() => {
      sendWSMessage('lifecycle-4', { type: 'command', action: 'hide', payload: {} });
    });

    expect(result.current.visible).toBe(false);
  });

  it('merges config from WS update command', () => {
    const defaults = { title: 'Original', bgColor: '#000' } as Record<string, unknown>;
    const { result } = renderHook(() =>
      useOverlayLifecycle({ defaults, overlayId: 'lifecycle-5', initialVisible: false }),
    );

    act(() => {
      sendWSMessage('lifecycle-5', { type: 'command', action: 'update', payload: { title: 'New Title' } });
    });

    expect(result.current.cfg).toMatchObject({ title: 'New Title', bgColor: '#000' });
  });

  it('merges config from WS show command with data', () => {
    const defaults = { title: 'Original' } as Record<string, unknown>;
    const { result } = renderHook(() =>
      useOverlayLifecycle({ defaults, overlayId: 'lifecycle-6', initialVisible: false }),
    );

    act(() => {
      sendWSMessage('lifecycle-6', { type: 'command', action: 'show', payload: { title: 'Shown' } });
    });

    expect(result.current.visible).toBe(true);
  });

  it('auto-hides after autoHideMs', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useOverlayLifecycle({
        defaults: {},
        overlayId: 'lifecycle-7',
        initialVisible: false,
        autoHideMs: 1000,
      }),
    );

    act(() => {
      sendWSMessage('lifecycle-7', { type: 'command', action: 'show', payload: {} });
    });
    expect(result.current.visible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.visible).toBe(false);

    vi.useRealTimers();
  });

  it('calls onCommand callback when receiving update commands', () => {
    const onCommand = vi.fn();
    renderHook(() =>
      useOverlayLifecycle({ defaults: {}, overlayId: 'lifecycle-8', onCommand }),
    );

    act(() => {
      sendWSMessage('lifecycle-8', { type: 'command', action: 'update', payload: { foo: 'bar' } });
    });

    expect(onCommand).toHaveBeenCalledWith(
      expect.objectContaining({ foo: 'bar' }),
    );
  });
});
