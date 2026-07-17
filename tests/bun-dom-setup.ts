// ──────────────────────────────────────────────
// br1cg — DOM setup for bun test (via happy-dom)
// ──────────────────────────────────────────────
// Provides document, window, and other DOM globals
// so @testing-library/react works in bun's native test runner.

import { Window } from 'happy-dom';

const window = new Window();

// Copy DOM globals to the global scope
globalThis.window = window as any;
globalThis.document = window.document;
globalThis.navigator = window.navigator;
globalThis.HTMLElement = window.HTMLElement;
globalThis.Node = window.Node;
globalThis.CustomEvent = window.CustomEvent;
globalThis.Event = window.Event;
globalThis.URL = window.URL as any;
globalThis.location = window.location;

// Copy common DOM APIs
globalThis.getComputedStyle = window.getComputedStyle.bind(window) as any;
globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => setTimeout(cb, 0)) as any;
globalThis.cancelAnimationFrame = ((id: number) => clearTimeout(id)) as any;

// Mock matchMedia (used by some CSS-in-JS and media queries)
window.matchMedia =
  window.matchMedia ||
  ((query: string) => ({
    matches: false,
    media: query,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as any;

// Mock ResizeObserver (used by some components)
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
}

// Mock IntersectionObserver (used by lazy loading)
if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  } as any;
}
