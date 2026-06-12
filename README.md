# Vegas Red Zone — Ops Console

Interactive prototype of the production interface for the **Vegas Red Zone** AI-TV broadcast operator.

Translates the Balsamiq wireframe into a working React app: track tiles, channel queue, alternate-screen library, drag-and-drop, take-now, live clock + countdowns.

## Run locally

```bash
npm install
npm run dev
```

Opens at http://localhost:5173/vegas-redzone-ops/

## Build

```bash
npm run build
```

## Deploy

Pushes to `main` auto-deploy to GitHub Pages via the included workflow.

Live: https://todd-dynk.github.io/vegas-redzone-ops/

## Layout

- **Top row** — Live streams of upcoming tracks + upcoming-races sidebar
- **Middle row** — Channel tabs (Ch 1 / 2 / 3 / Featured · Vegas Red Zone), 4 next-screen slots per channel with countdowns
- **Bottom row** — Alternate screen library, drag onto a slot or click TAKE NOW

## Stack

- Vite + React + TypeScript
- Zero external UI deps — just CSS

---

Prototype only. BetMakers internal.
