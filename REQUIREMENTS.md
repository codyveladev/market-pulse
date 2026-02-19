# MARKET PULSE 📈
### Financial News Stream Dashboard — Requirements v1.0

> **Goal:** Live financial news dashboard filterable by industry sector, stream-ready, built entirely on free-tier APIs.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Industry Sectors](#2-industry-sectors)
3. [Free-Tier API Integrations](#3-free-tier-api-integrations)
4. [Architecture](#4-architecture)
5. [Feature Specifications](#5-feature-specifications-mvp)
6. [Build Roadmap](#6-build-roadmap)
7. [Rate Limit Strategy](#7-rate-limit-strategy)
8. [Claude Code Prompts to Get Started](#8-claude-code-prompts-to-get-started)

---

## 1. Project Overview

Market Pulse is a real-time financial news dashboard designed to run as a browser tab or OBS Browser Source on stream. Users select one or more industry sectors and the dashboard surfaces relevant financial news, headlines, and market data for those sectors — powered entirely by free-tier APIs and open data sources.

**Core Goals:**
- Display live/recent financial news grouped by industry sector
- Let viewers/users select which sectors to follow (multi-select)
- Show basic market data (index prices, % change) as a scrolling ticker tape
- 100% free-tier APIs — no credit card required for MVP
- Stream-friendly: readable from a distance, auto-refreshing, dark mode

---

## 2. Industry Sectors

Each sector maps to a set of keywords/tickers used when querying news APIs.

| Sector | Icon | Key Search Terms | Sample Tickers |
|--------|------|-----------------|----------------|
| Technology | 💻 | AI, semiconductor, software, cloud, earnings, tech stocks | AAPL, MSFT, NVDA, GOOG, META |
| Oil & Gas | 🛢️ | crude oil, natural gas, OPEC, refinery, energy stocks, Brent | XOM, CVX, OXY, BP, SLB |
| Automotive | 🚗 | EV, electric vehicle, auto sales, car manufacturer, recall | TSLA, GM, F, RIVN, TM |
| Finance / Banking | 🏦 | Fed rate, interest rate, bank earnings, mortgage, fintech | JPM, BAC, GS, WFC, V |
| Healthcare / Pharma | 💊 | FDA approval, drug trial, healthcare earnings, biotech | JNJ, PFE, UNH, MRNA, ABBV |
| Real Estate | 🏘️ | housing market, REIT, mortgage rate, home sales, construction | AMT, PLD, SPG, EQIX |
| Crypto / Web3 | ₿ | bitcoin, ethereum, crypto regulation, DeFi, blockchain | BTC, ETH, BNB, SOL |
| Commodities | 🌾 | gold, silver, wheat, corn, commodity futures, inflation hedge | GLD, SLV, WEAT, USO |
| Retail / Consumer | 🛍️ | consumer spending, retail earnings, e-commerce, inflation | AMZN, WMT, TGT, COST |
| Aerospace / Defense | ✈️ | defense contract, military budget, satellite, aerospace earnings | LMT, RTX, NOC, BA |

---

## 3. Free-Tier API Integrations

> All APIs below are free with no credit card required unless noted. Designed for polling every 90 seconds.

---

### 3.1 News APIs

#### 🟢 RSS Feeds — *The MVP Hero (No Key, Unlimited)*
- **Cost:** Free, unlimited, no signup required
- **Why:** Major financial outlets publish free RSS feeds. Zero rate limits, zero API keys.
- **Converter:** Use [rss2json.com](https://rss2json.com) (free, 10k req/mo) to convert RSS → JSON in the browser
- **Best Sources:**
  - `https://feeds.finance.yahoo.com/rss/2.0/headline`
  - `https://feeds.reuters.com/reuters/businessNews`
  - `https://feeds.marketwatch.com/marketwatch/topstories`
  - `https://www.investing.com/rss/news.rss`
- **Notes:** Use as the primary source — supplement with keyed APIs for precision filtering

---

#### 🟢 NewsAPI.org — *Best Developer Experience*
- **Cost:** Free — 100 req/day (dev tier, no credit card)
- **Signup:** [newsapi.org](https://newsapi.org)
- **Endpoint:** `GET https://newsapi.org/v2/everything?q={keywords}&language=en&sortBy=publishedAt&apiKey={key}`
- **Strategy:** Combine all selected sectors into ONE query using OR logic to preserve daily quota
  ```
  q=NVIDIA+OR+semiconductor+OR+AI+OR+tech+stocks
  ```
- **Returns:** title, description, source, publishedAt, url
- **Notes:** Cache responses for 90s minimum. 100 req/day is enough if you batch smartly.

---

#### 🟢 GNews API — *Good Supplemental Source*
- **Cost:** Free — 100 req/day
- **Signup:** [gnews.io](https://gnews.io)
- **Endpoint:** `GET https://gnews.io/api/v4/search?q={keywords}&topic=business&lang=en&token={key}`
- **Notes:** 10 articles per request. Good for sourcing different outlets than NewsAPI.

---

#### 🟢 Finnhub — *Best Overall Free Tier*
- **Cost:** Free — 60 req/min + free WebSocket
- **Signup:** [finnhub.io](https://finnhub.io)
- **News Endpoint:** `GET https://finnhub.io/api/v1/company-news?symbol={ticker}&from={YYYY-MM-DD}&to={YYYY-MM-DD}&token={key}`
- **Quote WebSocket:** `wss://ws.finnhub.io?token={key}` — subscribe to tickers for real-time prices
- **Why it's great:** Company news endpoint maps directly to ticker symbols — perfect for sector filtering. WebSocket replaces polling for quotes entirely (zero per-request cost).
- **Notes:** Use WebSocket for the ticker tape to avoid burning REST quota on price polling.

---

### 3.2 Market Data APIs

#### 🟡 Yahoo Finance (Unofficial) — *No Key Needed*
- **Cost:** Free, no signup, no key
- **Endpoint:** `GET https://query1.finance.yahoo.com/v8/finance/chart/{ticker}`
- **Also useful:** `GET https://query1.finance.yahoo.com/v7/finance/quote?symbols=XLK,XLE,XLY,XLF`
- **Notes:** Undocumented but widely used. Cache aggressively (60s). Great for the ticker tape.
- **Sector ETFs to track:** `XLK` (Tech), `XLE` (Energy), `XLY` (Consumer), `XLF` (Finance), `XLV` (Health), `XLRE` (Real Estate), `GLD` (Gold), `XAR` (Aerospace)

---

#### 🟡 Alpha Vantage — *Official Free Quotes*
- **Cost:** Free — 25 req/day
- **Signup:** [alphavantage.co](https://www.alphavantage.co)
- **Endpoint:** `GET https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey={key}`
- **Notes:** 25 req/day is tight — use Yahoo Finance unofficial API for real-time, use Alpha Vantage only for daily open/close summary data.

---

#### 🟢 CoinGecko — *Crypto Sector (No Key Needed)*
- **Cost:** Free — 30 req/min, no key needed for public endpoints
- **Endpoint:** `GET https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true`
- **Notes:** Best free crypto API. Use exclusively for the Crypto/Web3 sector tab.

---

### 3.3 Macro / Supplemental

#### 🟢 FRED API (Federal Reserve) — *Macro Context*
- **Cost:** Free, unlimited
- **Signup:** [fred.stlouisfed.org](https://fred.stlouisfed.org/docs/api/api_key.html)
- **Endpoint:** `GET https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key={key}&file_type=json`
- **Useful series:** `FEDFUNDS` (Fed rate), `CPIAUCSL` (CPI/inflation), `GS10` (10Y Treasury yield)
- **Notes:** Great for a macro context panel under Finance/Banking sector.

---

### 3.4 Post-MVP: X / Twitter

#### 🔴 X API Basic Tier — *Post-MVP Only*
- **Cost:** Free basic tier — heavily rate-limited since 2023
- **Endpoint:** `GET https://api.twitter.com/2/tweets/search/recent?query={cashtag}&expansions=author_id`
- **Use case:** Cashtag sentiment tracking (e.g. `$TSLA`, `$NVDA`)
- **Notes:** Skip for MVP. Free tier allows ~500k tweet reads/mo but rate limits are painful. Add in V1.2 once core dashboard is solid. Requires OAuth 2.0 app at [developer.x.com](https://developer.x.com).

---

## 4. Architecture

| Layer | Recommendation |
|-------|---------------|
| Frontend Framework | React (Vite) — fast dev, easy state for sector selection |
| Styling | Tailwind CSS — dark theme, stream-readable, utility-first |
| State Management | `useState` / `useContext` or Zustand (tiny) for selected sectors |
| Backend / Proxy | Node.js + Express — keeps API keys server-side, handles CORS, caches responses |
| Caching | `node-cache` (npm) for simple in-memory 90s cache |
| RSS Parsing | `rss-parser` (npm) server-side OR `rss2json.com` client-side |
| Hosting (Frontend) | Vercel free tier |
| Hosting (Backend) | Railway.app or Render.com free tier |
| Stream Source | OBS Browser Source → point to `localhost:3000` or hosted URL |

### Folder Structure (Suggested)
```
market-pulse/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── SectorSelector.jsx
│   │   │   ├── NewsFeed.jsx
│   │   │   ├── NewsCard.jsx
│   │   │   ├── TickerTape.jsx
│   │   │   └── MacroPanel.jsx
│   │   ├── hooks/
│   │   │   ├── useNews.js
│   │   │   └── useMarketData.js
│   │   ├── constants/
│   │   │   └── sectors.js      # Sector definitions, keywords, tickers
│   │   └── App.jsx
├── server/                  # Node.js + Express proxy
│   ├── routes/
│   │   ├── news.js
│   │   └── quotes.js
│   ├── services/
│   │   ├── newsapi.js
│   │   ├── finnhub.js
│   │   ├── rss.js
│   │   └── cache.js
│   └── index.js
├── REQUIREMENTS.md          # ← this file
└── .env.example
```

---

## 5. Feature Specifications (MVP)

### 5.1 Sector Selector
- Row of toggle buttons, one per sector (icon + label)
- Multi-select — user can follow multiple sectors simultaneously
- Selected state persisted to `localStorage` (survives page refresh)
- Visual active state: highlighted border, accent background color

### 5.2 News Feed
- Cards showing: **Headline**, Source, Sector tag, Time ago (e.g. "12 min ago"), clickable URL
- Feed filtered to only show articles matching selected sectors
- Auto-refreshes every **90 seconds**
- Manual "Refresh" button
- Loading skeleton state while fetching
- Deduplicate articles by URL across multiple API sources

### 5.3 Ticker Tape
- Scrolling horizontal bar at the top of the dashboard
- Shows: `SYMBOL  $price  +/-X.XX%` in green/red
- One representative ETF per sector: `XLK XLE XLY XLF XLV XLRE GLD BTC`
- Powered by Finnhub WebSocket (real-time, no polling cost) or Yahoo Finance unofficial API

### 5.4 Stream-Readiness
- Dark mode by default
- Large readable fonts (min 14px body, 18px headlines)
- High contrast sector badges and price colors
- OBS Browser Source compatible (Chromium, 1920×1080)
- Optional: `?kiosk=true` URL param hides browser chrome

---

## 6. Build Roadmap

### MVP — Core Dashboard
- [ ] Scaffold React + Vite + Tailwind app
- [ ] Build `SectorSelector` component with localStorage persistence
- [ ] Integrate RSS feeds via `rss2json.com` (zero-key, primary source)
- [ ] Integrate NewsAPI.org with batched keyword queries
- [ ] Build `NewsCard` and `NewsFeed` components with sector filtering
- [ ] Add scrolling `TickerTape` with Yahoo Finance unofficial API
- [ ] Dark theme, stream-ready layout
- [ ] Node.js proxy server with 90s in-memory cache

### V1.1 — Enrich Data
- [ ] Add Finnhub company news (ticker-level precision per sector)
- [ ] Replace ticker polling with Finnhub WebSocket
- [ ] Add CoinGecko for Crypto tab
- [ ] Add FRED API macro panel (Fed rate, CPI, 10Y yield)
- [ ] Sentiment coloring on cards (positive / negative / neutral)
- [ ] Multiple layout modes: Grid, List, Focus

### V1.2 — Stream Features
- [ ] OBS overlay mode (transparent background, minimal chrome)
- [ ] Breaking news pop-up alerts for major moves
- [ ] Sound notification for big market moves
- [ ] Shareable URL state (`?sectors=tech,oil`)
- [ ] Stream chat command integration (`!sector crypto`)

### Post-MVP — X Integration
- [ ] X API Basic tier — cashtag sentiment tracking
- [ ] Display top `$TICKER` posts alongside news cards
- [ ] Trending financial cashtags panel

---

## 7. Rate Limit Strategy

The biggest engineering constraint is staying within free-tier limits. Key rules:

1. **Cache everything server-side for 90 seconds minimum** — serve from cache first, only hit the API if stale
2. **Batch sector queries into one API call** — combine all selected sectors with OR logic:
   ```
   "tech OR AI OR semiconductor OR NVIDIA OR cloud"
   ```
3. **RSS first, keyed APIs second** — RSS feeds are unlimited; use NewsAPI/GNews only to fill gaps
4. **Finnhub WebSocket for quotes** — one persistent connection replaces all price polling (zero req/call cost)
5. **Log daily API usage** — build a simple counter so you know when you're approaching limits
6. **Stagger refresh intervals** — don't hit all APIs simultaneously; offset by 15–30 seconds

### Daily Request Budget (MVP)
| API | Daily Limit | Expected Usage | Headroom |
|-----|-------------|----------------|----------|
| NewsAPI.org | 100 req/day | ~32 req/day (1 per 45 min) | ✅ Comfortable |
| GNews | 100 req/day | ~16 req/day (supplemental) | ✅ Comfortable |
| Alpha Vantage | 25 req/day | ~10 req/day (daily summaries only) | ✅ Fine |
| Finnhub REST | 60 req/min | WebSocket replaces most calls | ✅ Fine |
| Yahoo Finance | Unofficial / no hard limit | Cached 60s | ✅ Fine |
| RSS | Unlimited | Primary source | ✅ No concern |
| CoinGecko | 30 req/min | ~20 req/day for Crypto tab | ✅ Fine |

---

## 8. Claude Code Prompts to Get Started

Copy-paste these into Claude Code in order when you're ready to build:

**Step 1 — Scaffold**
```
Create a Vite React app with Tailwind CSS configured for dark mode. 
Set up a Node.js Express server in a /server folder. 
Use the folder structure in REQUIREMENTS.md.
```

**Step 2 — Sector Selector**
```
Build a SectorSelector component using the sectors table in REQUIREMENTS.md. 
Each sector gets a toggle button with its icon and label. 
Multi-select, active state styled, persisted to localStorage.
```

**Step 3 — News Feed**
```
Build a NewsFeed component that fetches from NewsAPI.org using sector keywords from REQUIREMENTS.md.
Combine all selected sectors into one OR query. Cache responses for 90 seconds server-side with node-cache.
Display results as NewsCard components showing headline, source, sector tag, and time ago.
```

**Step 4 — RSS Fallback**
```
Add RSS feed fetching to the server using rss-parser. 
Pull from Yahoo Finance RSS and Reuters business RSS. 
Merge and deduplicate with NewsAPI results by URL before returning to the client.
```

**Step 5 — Ticker Tape**
```
Add a scrolling TickerTape component at the top of the dashboard.
Fetch prices for XLK, XLE, XLY, XLF, XLV, XLRE, GLD from the Yahoo Finance unofficial API:
https://query1.finance.yahoo.com/v7/finance/quote?symbols=XLK,XLE,XLY,XLF,XLV,XLRE,GLD
Show symbol, price, and % change colored green/red. Refresh every 60 seconds.
```

**Step 6 — Stream Polish**
```
Make the dashboard stream-ready:
- Minimum 14px body font, 18px headlines, high contrast colors
- Auto-refresh news feed every 90 seconds with a countdown indicator
- Add a manual refresh button
- Make it work as an OBS Browser Source at 1920x1080
```

---

*Market Pulse • REQUIREMENTS.md • MVP v1.0 • All integrations free-tier*
