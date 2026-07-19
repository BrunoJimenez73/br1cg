// ──────────────────────────────────────────────
// br1cg — Lightweight HTTP router
// ──────────────────────────────────────────────

type Handler = (req: Request, url: URL) => Promise<Response | null> | Response | null;

interface RouteEntry {
  method: string;
  pattern: string;
  handler: Handler;
}

export class Router {
  private routes: RouteEntry[] = [];

  add(method: string, pattern: string, handler: Handler): this {
    this.routes.push({ method, pattern, handler });
    return this;
  }

  get(pattern: string, handler: Handler): this { return this.add('GET', pattern, handler); }
  post(pattern: string, handler: Handler): this { return this.add('POST', pattern, handler); }
  put(pattern: string, handler: Handler): this { return this.add('PUT', pattern, handler); }
  patch(pattern: string, handler: Handler): this { return this.add('PATCH', pattern, handler); }
  delete(pattern: string, handler: Handler): this { return this.add('DELETE', pattern, handler); }

  async run(req: Request, url: URL): Promise<Response | null> {
    const method = req.method;
    for (const route of this.routes) {
      if (route.method !== method && route.method !== '*') continue;

      // Pattern matching: if pattern ends with *, use prefix match
      if (route.pattern.endsWith('*')) {
        const prefix = route.pattern.slice(0, -1);
        if (url.pathname.startsWith(prefix) || url.pathname === prefix.slice(0, -1)) {
          return route.handler(req, url);
        }
      }

      // Exact match
      if (route.pattern === url.pathname) {
        return route.handler(req, url);
      }
    }
    return null;
  }
}