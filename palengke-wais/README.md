# 🛒 Palengke WAIS

> Real-Time Philippine Commodity Price Tracker & Smart Kitchen Companion

## Setup

```bash
npm install
npm run dev
```

## APIs Used (all free, no key needed)
- **OpenFoodFacts** — Nutrition data (world.openfoodfacts.org)
- **TheMealDB** — Recipe finder (themealdb.com/api/json/v1/1)
- **DA Price Data** — Curated from data.gov.ph (May 2025)

## Pages
| Route | Page |
|---|---|
| `/` | Landing page |
| `/prices` | Commodity price browser |
| `/item/:id` | Item detail + nutrition + trend |
| `/recipes` | Pantry-based recipe finder |

## Stack
React 19 · Redux Toolkit (RTK Query) · React Router v6 · Recharts · Vite
