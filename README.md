# Market Pulse

Real-time financial news dashboard filterable by industry sector. Designed for browser tabs and OBS Browser Source on stream.

## Features

- **10 Industry Sectors** — Technology, Oil & Gas, Automotive, Finance, Healthcare, Real Estate, Crypto, Commodities, Retail, Aerospace/Defense
- **Multi-select sector filtering** — toggle sectors to filter the news feed, persisted to localStorage
- **Scrolling ticker tape** — live ETF prices with green/red change indicators (Yahoo Finance v8 API)
- **Aggregated news feed** — merges RSS feeds + NewsAPI.org, deduplicated by URL, sorted newest-first
- **Auto-refresh** — news every 90s, quotes every 60s, with countdown indicator
- **Stream-ready** — dark mode, high contrast, 14px+ fonts, OBS-compatible at 1920x1080
- **Kiosk mode** — append `?kiosk=true` to hide header and sector selector

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS v4 (dark-first) |
| State | Zustand (persisted to localStorage) |
| Backend | Node.js + Express |
| Caching | node-cache (90s news, 60s quotes) |
| Testing | Vitest + Testing Library + Supertest |

## Getting Started

```bash
# Install all dependencies
npm run install:all

# Copy env template and add your API keys
cp .env.example .env

# Start dev servers (client on :3000, server on :3001)
npm run dev
```

## API Keys

All APIs are free-tier, no credit card required. Add keys to `.env`:

| Service | Free Tier | Required for MVP |
|---------|----------|-----------------|
| [NewsAPI.org](https://newsapi.org) | 100 req/day | Yes |
| Yahoo Finance (unofficial) | No key needed | Built-in |
| RSS Feeds | Unlimited | Built-in |
| [GNews](https://gnews.io) | 100 req/day | No (post-MVP) |
| [Finnhub](https://finnhub.io) | 60 req/min | No (post-MVP) |
| [Alpha Vantage](https://alphavantage.co) | 25 req/day | No (post-MVP) |
| [FRED](https://fred.stlouisfed.org) | Unlimited | No (post-MVP) |

## Scripts

```bash
npm run dev          # Start client + server concurrently
npm run test         # Run all tests (client + server)
npm run test:client  # Client tests only
npm run test:server  # Server tests only
npm run build        # Production build
```

## Project Structure

```
market-pulse/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/     # TickerTape, SectorSelector, NewsFeed, NewsCard
│       ├── hooks/          # useNews, useMarketData
│       ├── constants/      # Sector definitions
│       ├── store/          # Zustand sector store
│       └── utils/          # timeAgo formatter
├── server/                 # Express API proxy
│   ├── routes/             # /api/news, /api/quotes, /api/health
│   └── services/           # RSS, NewsAPI, Yahoo Finance, cache, sector matcher
└── shared/                 # TypeScript types shared between client & server
```
