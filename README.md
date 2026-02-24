# Market Pulse

Real-time financial news dashboard filterable by industry sector. Designed for browser tabs and OBS Browser Source on stream.

## Features

- **News Feed** — Aggregated RSS + NewsAPI.org articles, deduplicated by URL, sorted newest-first, auto-refreshes every 90s with countdown timer and "last updated" indicator
- **News Filter Panel** — Unified right-panel with sector and source filtering; source buttons derived from live article data, selections persist to localStorage; stale selections gracefully fall back to showing all articles
- **Markets Tab** — Live prices for major indices (S&P 500, NASDAQ, Dow Jones, Russell 2000), Magnificent 7 stocks, and 10 sector ETFs with day high/low range bars
- **Stock Research Tab** — Search any ticker symbol for comprehensive analysis:
  - Price header with real-time quote, change, and change %
  - Key stats grid (P/E, EPS, Beta, dividend yield, market cap, volume, day/52-week ranges)
  - Interactive Recharts area chart with 1M/3M toggle, hover tooltip, and 52-week high/low reference lines
  - Company profile (logo, industry, country, website)
  - Fundamentals panel — valuation ratios (PEG, Forward P/E, P/B, P/S, EV/Revenue, EV/EBITDA), profitability (margins, ROE, ROA), growth (revenue/earnings YoY), and analyst consensus bar with target price
  - Recent ticker news feed with pagination
  - Powered by Yahoo Finance + Finnhub + Alpha Vantage
- **10 Industry Sectors** — Technology, Oil & Gas, Automotive, Finance, Healthcare, Real Estate, Crypto, Commodities, Retail, Aerospace/Defense
- **Multi-select filtering** — toggle sectors and sources on the News tab, market categories on the Markets tab; all selections persist to localStorage
- **Scrolling ticker tape** — live ETF prices with green/red change indicators (Yahoo Finance v8 API)
- **Partner System Status** — live health check page for all data sources (Yahoo Finance, NewsAPI, RSS feeds, Finnhub, Alpha Vantage) with colored status indicators
- **Auto-refresh** — news every 90s, quotes every 60s; "Updated X ago" timestamps on both tabs
- **Stream-ready** — dark mode, high contrast, 14px+ fonts, OBS-compatible at 1920x1080
- **Kiosk mode** — append `?kiosk=true` to hide the sidebar for clean stream overlays

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS v4 (dark-first) |
| Charts | Recharts (interactive area chart with tooltips) |
| State | Zustand (persisted to localStorage) |
| Backend | Node.js + Express |
| Caching | node-cache (90s news, 60s quotes, 24h fundamentals) |
| Testing | Vitest + Testing Library + Supertest (360+ tests) |

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

| Service | Free Tier | Required |
|---------|----------|---------|
| [NewsAPI.org](https://newsapi.org) | 100 req/day | Yes |
| Yahoo Finance (unofficial) | No key needed | Built-in |
| RSS Feeds | Unlimited | Built-in |
| [Finnhub](https://finnhub.io) | 60 req/min | No (Research tab) |
| [Alpha Vantage](https://alphavantage.co) | 25 req/day | No (Research tab fundamentals) |
| [GNews](https://gnews.io) | 100 req/day | No (future) |
| [FRED](https://fred.stlouisfed.org) | Unlimited | No (future) |

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
│       ├── components/     # TickerTape, NewsFeed, NewsCard, FilterPanel,
│       │                   # SourceFilter, MarketOverview, MarketCard,
│       │                   # MarketCategoryFilter, SystemStatus, Sidebar,
│       │                   # ResearchPage, ResearchSearch, StockHeader,
│       │                   # KeyStatsGrid, PriceChart, CompanyInfo,
│       │                   # ResearchNewsFeed, FundamentalsPanel,
│       │                   # SectorSelector
│       ├── hooks/          # useNews, useMarketData, useMarketQuotes,
│       │                   # useSystemStatus, useResearch
│       ├── constants/      # Sector + market category definitions
│       ├── store/          # Zustand stores (sector, source, navigation)
│       └── utils/          # timeAgo, formatNumber
├── server/                 # Express API proxy
│   ├── routes/             # /api/news, /api/quotes, /api/research,
│   │                       # /api/health, /api/status
│   └── services/           # RSS, NewsAPI, Yahoo Finance, Finnhub,
│                           # Alpha Vantage, cache, sector matcher
└── shared/                 # TypeScript types shared between client & server
```

## Navigation

The app has a vertical sidebar with four tabs:

| Tab | Description |
|-----|-------------|
| **News** | Sector + source filtered news feed with refresh controls and right-panel filter drawer |
| **Markets** | Live market data with category filter (indices, Mag 7, sectors) |
| **Research** | Stock symbol lookup with price, key stats, interactive chart, fundamentals, company profile, and ticker news |
| **Status** | Partner system health checks (refreshes every 30s) |
