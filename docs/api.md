# API Reference

> Base URL: `http://localhost:3001`
> All responses are JSON with `Content-Type: application/json`.
> CORS: `Access-Control-Allow-Origin: *` on all responses.

---

## Health Check

```
GET /api/health
```

Returns server status, active WebSocket rooms, and uptime.

**Response:**
```json
{
  "status": "ok",
  "rooms": { "timer-1": 2, "lower-third-main": 1 },
  "uptime": 3600.5
}
```

---

## Overlays

### List All

```
GET /api/overlays
```

Returns all overlays ordered by `updatedAt` (most recent first).

**Response:**
```json
[
  {
    "id": "abc-123",
    "name": "Main Timer",
    "type": "timer",
    "data": { "minutes": 5, "seconds": 0, "mode": "countdown" },
    "elements": [],
    "tags": ["timer", "main"],
    "favorite": true,
    "createdAt": "2026-07-19T10:00:00.000Z",
    "updatedAt": "2026-07-19T12:00:00.000Z"
  }
]
```

### Quick List

```
GET /api/overlays/quick
```

Lightweight list with overlay status. Used by the control dashboard.

**Response:**
```json
[
  { "id": "abc-123", "name": "Main Timer", "type": "timer", "status": "visible" }
]
```

### Get One

```
GET /api/overlays/:id
```

Returns a single overlay by ID.

**Error:** `404` if not found.

### Create

```
POST /api/overlays
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Lower Third 1",
  "type": "lower-third",
  "data": { "title": "John Doe", "subtitle": "Host", "bgColor": "#1a1a2e" },
  "elements": [],
  "tags": ["host"]
}
```

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `type` | **yes** | `string` | One of the 15 overlay types |
| `name` | no | `string` | Display name (default: "Sin nombre") |
| `data` | no | `object` | Type-specific config (defaults applied) |
| `elements` | no | `array` | Layout elements (defaults applied) |
| `tags` | no | `string[]` | User tags for organization |

**Response:** `201` with created overlay.

**Validation errors:** `400` with `{ "error": "..." }`.

### Update

```
PUT /api/overlays/:id
Content-Type: application/json
```

Partial update — only provided fields are merged.

**Body:**
```json
{
  "name": "Updated Name",
  "data": { "title": "New Title" }
}
```

**Response:** Updated overlay object.

**Error:** `404` if not found, `400` on validation error.

### Delete

```
DELETE /api/overlays/:id
```

**Response:** `{ "success": true }`

**Error:** `404` if not found.

### Toggle Visibility

```
POST /api/overlays/:id/toggle
```

Toggles the overlay between visible and hidden via WebSocket broadcast.

**Response:**
```json
{ "success": true, "newState": "visible" }
```

### Send Command

```
POST /api/overlays/:id/command
Content-Type: application/json
```

**Body:**
```json
{
  "action": "show",
  "data": { "title": "Breaking News" }
}
```

| Action | Description |
|--------|-------------|
| `show` | Show overlay (with optional data merge) |
| `hide` | Hide overlay |
| `update` | Merge new data into overlay config |

**Response:** `{ "success": true, "overlayId": "abc-123", "action": "show" }`

### Export

```
GET /api/overlays/export
```

Exports all overlays as a JSON package with metadata.

**Response:**
```json
{
  "version": 1,
  "exportedAt": "2026-07-19T12:00:00.000Z",
  "count": 15,
  "overlays": [...]
}
```

### Import

```
POST /api/overlays/import
Content-Type: application/json
```

**Body:**
```json
{
  "overlays": [
    { "id": "imported-1", "name": "Timer", "type": "timer", "data": {}, "elements": [], "tags": [] }
  ]
}
```

Overlays with existing IDs are skipped. Invalid types are logged as errors.

**Response:**
```json
{
  "success": true,
  "imported": 1,
  "skipped": 0,
  "errors": []
}
```

---

## Templates

```
GET /api/templates
```

Returns predefined templates for the editor template picker.

**Response:**
```json
[
  { "id": "tmpl-lower-simple", "name": "Lower Third Simple", "type": "lower-third", "category": "basico", "description": "Name + title at bottom" }
]
```

---

## WebSocket

```
ws://localhost:3001/ws?subscribe=:overlayId
```

### Connection

On connect, the server sends:
```json
{ "type": "connected", "clientId": "uuid-string" }
```

### Client → Server Messages

```typescript
type WSClientMessage =
  | { type: 'overlay:show'; overlayId: string; data?: Record<string, unknown> }
  | { type: 'overlay:hide'; overlayId: string }
  | { type: 'overlay:update'; overlayId: string; data: Record<string, unknown> }
  | { type: 'overlay:save'; overlayId: string; data: Record<string, unknown> }
  | { type: 'overlay:timer:start'; overlayId: string }
  | { type: 'overlay:timer:pause'; overlayId: string }
  | { type: 'overlay:timer:reset'; overlayId: string; data?: { minutes: number; seconds: number } }
  | { type: 'ping' };
```

### Server → Client Messages

```typescript
type WSServerMessage =
  | { type: 'command'; action: 'show' | 'hide' | 'update'; payload: Record<string, unknown> }
  | { type: 'event'; event: 'timer:tick'; data: { remaining: number; formatted: string } }
  | { type: 'event'; event: 'timer:start'; data: Record<string, unknown> }
  | { type: 'event'; event: 'timer:pause'; data: Record<string, unknown> }
  | { type: 'event'; event: 'timer:reset'; data: { minutes?: number; seconds?: number } }
  | { type: 'connected'; clientId: string }
  | { type: 'pong' }
  | { type: 'error'; message: string };
```

### Rooms

Each overlay subscribes to its own room via `?subscribe=overlayId`. Messages are only delivered to subscribers of that room.

### Heartbeat

The client sends `{"type":"ping"}` every 30 seconds. The server responds with `{"type":"pong"}`.

### Reconnection

The `useWebSocket` hook in `src/lib/ws-client.ts` handles automatic reconnection with exponential backoff (1s → 30s).

---

## Overlay Types

All 15 valid overlay types (used in `type` field):

| Type | Description |
|------|-------------|
| `lower-third` | Name + title at bottom |
| `timer` | Countdown / elapsed timer |
| `scorebug` | Sports scoreboard |
| `title-card` | Fullscreen title/banner |
| `ticker` | Scrolling text crawl |
| `alert` | Notification popup |
| `webcam-border` | Decorative frame for webcam |
| `sponsor-logo` | Logo with fade in/out |
| `brb` | "Be Right Back" screen |
| `2x-counter` | Raid/donation counter |
| `money-effect` | Donation animation |
| `social-looper` | Social media rotator |
| `weather-bug` | Weather display |
| `yt-view-count` | YouTube viewer count |
| `driveby` | Raid/drive-by notification |

---

## Stream Deck Integration

Use HTTP requests to control overlays from a Stream Deck:

| Action | Method | URL | Body |
|--------|--------|-----|------|
| Show | POST | `/api/overlays/:id/command` | `{ "action": "show" }` |
| Hide | POST | `/api/overlays/:id/command` | `{ "action": "hide" }` |
| Toggle | POST | `/api/overlays/:id/toggle` | — |
| Update | POST | `/api/overlays/:id/command` | `{ "action": "update", "data": {...} }` |
