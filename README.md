# GLE App Template

Build a health app on the ParagonDAO network in minutes.

## Quick Start

```bash
git clone https://github.com/paragon-dao/gle-app-template.git my-health-app
cd my-health-app
npm install
npm run dev
```

Open `http://localhost:5173` — you have a working GLE app.

## What This Template Does

1. **Captures** audio from the phone microphone (swap for any sensor)
2. **Encodes** via BAGLE API → 128 universal coefficients (512 bytes)
3. **Compares** encodings to detect changes over time

## Make It Your Own

### Change the Sensor

Edit `src/hooks/useSensor.js`. The GLE encoder only needs `number[]`. Replace the mic capture with:

- **Accelerometer**: `DeviceMotionEvent` → `[x, y, z, x, y, z, ...]`
- **Heart rate**: Camera PPG → `[peak_intervals...]`
- **Typing cadence**: Keydown timing → `[interval1, interval2, ...]`
- **Any time-series**: Just produce an array of numbers

### Change the Analysis

Edit `src/hooks/useBagle.js`. The API gives you 128 coefficients. You decide what to do with them:

- **Similarity**: Compare two recordings (authentication, change detection)
- **Trend**: Store daily encodings, track drift over time
- **Classification**: Train a simple model on coefficient patterns

### Change the UI

Edit `src/App.jsx` and components. The template uses inline styles — add Tailwind, shadcn, or whatever you prefer.

## Architecture

```
Phone Sensor → number[] → BAGLE API → 128 coefficients → Your App Logic
                              ↑
                    https://bagle-api.fly.dev/api/v1/encode
```

The encoder is signal-agnostic. It doesn't know what sensor produced the data. Every input becomes exactly 128 numbers = 512 bytes. Every app on the network speaks the same language.

## API Endpoints

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/v1/encode` | POST | `{ features: number[] }` | `{ encoding: number[128], dim: 128, latency_ms }` |
| `/api/v1/similarity` | POST | `{ encoding_a: number[], encoding_b: number[] }` | `{ similarity: 0-1, distance }` |
| `/health` | GET | — | `{ status, model_loaded, models }` |

## Offline Encoding

For privacy-sensitive apps, encode on-device without hitting the API:

```bash
npm install @paragon-dao/bagle-sdk
```

```js
import { gleEncodeSignal, cosineSimilarity } from '@paragon-dao/bagle-sdk';

const coefficients = gleEncodeSignal(samples);  // 128 coefficients, no network call
const score = cosineSimilarity(a, b);           // compare locally
```

## Deploy as PWA

This template includes PWA support via `vite-plugin-pwa`. Run `npm run build` and deploy the `dist/` folder to any static host (Cloudflare Pages, Vercel, Netlify, GitHub Pages).

Your app works offline after first load.

## License

MIT — Build freely.
