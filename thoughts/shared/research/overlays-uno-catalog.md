# Catálogo de overlays.uno — Referencia para port

> Fuente: Análisis del JS bundle, Playwright snapshots y API pública de overlays.uno
> Fecha: 2026-07-16

## Categorías de la homepage

1. Podcast
2. Game
3. Weather
4. News
5. Sport
6. Holiday
7. Business & Finance
8. Art & Design
9. Education
10. Spiritual

## Overlays identificados (free tier + visibles públicamente)

### Lower Thirds
- Lower Third | Dropzone
- Lower Third | Eclipse
- Lower Third | Glaze
- Lower Third | Juice
- Lower Third | On Air
- Lower Third | Palladium
- Lower Third | Prime
- Starting Lineup Lower Third | Bold
- Matchup Lower Third | Glass
- Matchup Lower Third | Slant
- Soccer Scorers Lower Third | Fresh
- Soccer Shootout Lower Third | Pixel
- Stats Lower Third | Slant

### Scorebugs
- Soccer Scorebug | Air, Fresh, Lunar
- Football Scorebug | Air, Bold, Stealth, (short stacked)
- Basketball Scorebug | Air, (Stacked)
- Baseball Scorebug + Scorebug (Scorebird) | Bold
- Hockey Scorebug | Olympic
- Hockey Shootout Scorebug | Bold
- Rugby Union Scorebug | Bold, Pixel, Slant
- Rugby League Scorebug | Slant
- Tennis Scorebug | Slant
- Volleyball Scorebug | Bold, (Scorebird)
- Futsal Scorebug | Fresh
- Netball Scorebug | Lunar
- Lacrosse Scorebug | Standard
- Petanque Scorebug | Standard
- Pickleball Scorebug | Bold
- Boxing / Fighting Scorebug | Bold
- Judo Scorebug | Slant

### Scoreboards
- Baseball Scoreboard
- Bowling Team Scoreboard | Standard
- Jiu Jitsu Scoreboard | Olympic
- Weightlifting Scoreboard (Google Sheets) | Olympic
- Axe Throwing Scoreboard | Bold

### Tickers
- RSS News Ticker | Dusk, Headline, Juice, Lithium, On Air, Prime, Pyrite

### Stream Packs
- Stream Pack | Accent, Clean, Horizon, Juice, Lithium, Palladium, Prime, Pyrite, Stepback, Workflow
- Stream Pack Two Box | Accent
- Stream Pack Three Box | Sociable
- Poker Stream Pack | Standard
- Quiz Show Stream Pack

### Countdowns
- Countdown Until Bug | Lithium
- Countdown - Nitrogen (URL: library/282-Countdown---Nitrogen)

### Webcam Borders
- Webcam Border Arc Raiders
- Webcam Border Minimal
- Webcam Border Sci-Fi
- Webcam Border | Fortnite

### Game Frames
- Game Frame | PNG, Spartan, Standard
- Pick and Ban Game Frame | Fade
- Team Matchup Game Frame | Fade

### Panels
- Leaderboard Panel | Dropzone
- Lineup Panel | Air, Standard
- Player Cards | Dropzone
- Talking Points Panel | Executive, Glaze, Horizon, Insight, Talk Show
- Standings | Dropzone

### Fullscreen
- Group Fixtures Fullscreen | Air, Bold, Fresh
- Group Results Fullscreen | Air, Bold, Fresh
- Group Stages Fullscreen | Air, Bold, Fresh
- Map Veto Fullscreen | Champion
- Match Stats Fullscreen | Air
- Matchup Fullscreen | Bold
- Matchups Baseline | Bold

### Bugs / Efectos
- Live Bug | Juice
- Weather Bug | Breeze
- Social Looper Bug 3 | Sociable
- 2X Counter | Burst, Glide
- Money Effect, Money Effect 2
- Drive-By
- YouTube View Count
- Crypto Table | Pyrite
- Crypto Ticker | Pyrite
- Progress Bar Baseline | Burst, Charge

### Popups / BRB
- Be Right Back 1
- Be Right Back Fullscreen | Nursery
- Subscribe Popup 1, 2, 3, 4
- Subscribe Popup | Transparent
- Border Lights 1 | Christmas
- Merch Slideshow | Clean
- Spin The Wheel
- Game Time Chat
- Quiz Show Three Box | Sociable
- Columns Control Layout

## API endpoints identificados

```
GET /apiv2/unooverlays/search?q={query}&limit={limit}
GET /apiv2/unooverlays/folder/root/items
GET /apiv2/unooverlays/folder/root/items?type=folder&sortby=name&sortdirection=asc
GET /apiv2/unooverlays/folder/all/items
GET /apiv2/unooverlays/folder/{folderId}/items
```

## Asset URLs (públicas)

```
https://assets.singular.live/{hash}/jsons/{id}.json
https://image.singular.live/{hash}/images/{id}_w{width}h{height}.webp
```

Ejemplo de JSON de assets (hero):
```json
{
  "file": "//assets.singular.live/{hash}/bin/{id}.riv",
  "overlays": [
    {
      "id": "01",
      "overlay": "https://image.singular.live/.../overlay_w1280h720.webp",
      "background": "https://image.singular.live/.../bg_w1280h720.webp",
      "url": "https://overlays.uno/library/{id}-{name}"
    }
  ]
}
```

## Notas

- Los overlays de overlays.uno usan **Rive** (.riv) con state machines para animaciones vectoriales
- Nosotros los replicamos con **HTML + CSS + Tailwind + GSAP** (mucho más ligero para Browser Source)
- Las paletas de color son la clave de la identidad de cada "Pack"
- Los nombres de los packs (Accent, Juice, Lithium, etc.) definen una personalidad cromática recurrente
