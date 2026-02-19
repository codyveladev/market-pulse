# Market Pulse — TDD Build Progress

> Tracks implementation status across phases. Updated after each phase completes.
> If rate-limited, resume from the first unchecked phase.

---

## Phase Status

### Phase 1: NewsAPI Service Implementation
- **Status:** COMPLETE
- **File:** `server/services/newsapi.ts`
- **Tests:** `server/services/__tests__/newsapi.test.ts` (pre-existing, 9 tests) — ALL PASS
- **What:** Implemented `buildNewsApiQuery()` and `fetchNewsApiArticles()`
- **Test count:** 62 total (35 client + 27 server) — all green

### Phase 2: Wire `/api/news` Route
- **Status:** COMPLETE
- **Files:** `server/routes/news.ts`, `server/routes/__tests__/news.test.ts` (10 tests)
- **What:** Route merges RSS + NewsAPI, deduplicates by URL, sorts newest-first, caches 90s
- **Test count:** 72 total (35 client + 37 server) — all green

### Phase 3: Wire `/api/quotes` Route
- **Status:** COMPLETE
- **Files:** `server/services/yahoo.ts` (7 tests), `server/routes/quotes.ts` (5 tests)
- **What:** Yahoo Finance quote fetcher + route with 60s cache, default ETF symbols
- **Test count:** 84 total (35 client + 49 server) — all green

### Phase 4: SectorSelector Component
- **Status:** COMPLETE
- **Files:** `client/src/components/SectorSelector.tsx`, `client/src/components/__tests__/SectorSelector.test.tsx` (8 tests)
- **What:** 10 toggle buttons with icons, Zustand store integration, active styling
- **Test count:** 92 total (43 client + 49 server) — all green

### Phase 5: NewsCard Component
- **Status:** COMPLETE
- **Files:** `client/src/components/NewsCard.tsx` (6 tests), `client/src/utils/timeAgo.ts` (7 tests)
- **What:** Headline, source, sector tags, time-ago formatting, clickable URL
- **Test count:** 105 total (56 client + 49 server) — all green

### Phase 6: NewsFeed + useNews Hook
- **Status:** COMPLETE
- **Files:** `client/src/hooks/useNews.ts` (6 tests), `client/src/components/NewsFeed.tsx` (7 tests)
- **What:** Fetch hook with loading/error/refresh, NewsFeed with cards, refresh button, empty state
- **Test count:** 118 total (69 client + 49 server) — all green

### Phase 7: TickerTape + useMarketData Hook
- **Status:** COMPLETE
- **Files:** `client/src/hooks/useMarketData.ts` (4 tests), `client/src/components/TickerTape.tsx` (5 tests)
- **What:** Scrolling ticker bar, green/red colors, price formatting, 60s auto-refresh
- **Test count:** 127 total (78 client + 49 server) — all green

### Phase 8: App Layout + Stream Polish
- **Status:** COMPLETE
- **Files:** `client/src/App.tsx` (5 tests), `client/src/index.css` (scroll animation)
- **What:** Full layout: TickerTape → Header → SectorSelector → NewsFeed, dark theme, stream-ready
- **Test count:** 131 total (82 client + 49 server) — all green

---

## Completed Foundation (Pre-existing)
- [x] Scaffold React + Vite + Tailwind + Express
- [x] Sector constants (`client/src/constants/sectors.ts`) — all 10 sectors, tested
- [x] Zustand sector store (`client/src/store/sectorStore.ts`) — localStorage persist, tested
- [x] Cache service (`server/services/cache.ts`) — 90s TTL, tested
- [x] RSS service (`server/services/rss.ts`) — 4 feeds, dedup, tested
- [x] Sector matcher (`server/services/sectorMatcher.ts`) — keyword matching, tested
- [x] Shared types (`shared/types.ts`) — NewsArticle, QuoteData, etc.
- [x] Health endpoint (`/api/health`) — tested
- [x] All API keys in `.env`

---

## Post-Phase Fixes (Requirements Alignment)

### Fix: Sector Filtering, Auto-Refresh, Skeletons, Kiosk Mode
- **Status:** COMPLETE
- **Issues fixed:**
  1. `/api/news` now filters articles by selected sectors (was returning all RSS articles unfiltered)
  2. `useNews` hook auto-refreshes every 90s with countdown timer (`secondsUntilRefresh`)
  3. NewsFeed shows skeleton loading cards instead of plain text
  4. NewsFeed shows "Refresh in Xs" countdown indicator
  5. TickerTape duplicates content for seamless scroll loop
  6. App supports `?kiosk=true` URL param (hides header + sector selector)
- **Test count:** 131 total (82 client + 49 server) — all green

### Sidebar Navigation
- **Status:** COMPLETE
- **Files:** `client/src/store/navigationStore.ts` (3 tests), `client/src/components/Sidebar.tsx` (5 tests), `client/src/components/MarketOverview.tsx` (3 tests stub), `client/src/App.tsx` (8 tests)
- **What:** Vertical sidebar with News/Markets tab switching, MarketOverview stub, conditional SectorSelector visibility
- **Test count:** 146 total (96 client + 50 server) — all green

---

## Phase 9: Markets Tab — Full Implementation

### Step 1: Extend QuoteData + Yahoo Service
- **Status:** COMPLETE
- **Files:** `shared/types.ts`, `server/services/yahoo.ts`, `server/services/__tests__/yahoo.test.ts` (9 tests)
- **What:** Added `name?`, `dayHigh?`, `dayLow?` to QuoteData; parsing `shortName`, `regularMarketDayHigh`, `regularMarketDayLow` from Yahoo v8 chart `meta`

### Step 2: Market Categories Constant
- **Status:** COMPLETE
- **Files:** `client/src/constants/marketCategories.ts`
- **What:** 12 filterable categories: Indices (SPY, QQQ, DIA, IWM), Mag 7 (AAPL, MSFT, NVDA, GOOGL, AMZN, META, TSLA), plus 10 sector groups. Crypto symbols fixed to Yahoo `-USD` format. Deduplication helper.

### Step 3: useMarketQuotes Hook
- **Status:** COMPLETE
- **Files:** `client/src/hooks/useMarketQuotes.ts`, `client/src/hooks/__tests__/useMarketQuotes.test.ts` (6 tests)
- **What:** Parameterized fetch hook — accepts `symbols[]`, calls `/api/quotes?symbols=...`, 60s auto-refresh, refetches on symbol change

### Step 4: MarketCard Component
- **Status:** COMPLETE
- **Files:** `client/src/components/MarketCard.tsx`, `client/src/components/__tests__/MarketCard.test.tsx` (8 tests)
- **What:** Compact card: symbol, name, price, $ change, % change with green/red coloring, day high/low range bar

### Step 5: MarketCategoryFilter Component
- **Status:** COMPLETE
- **Files:** `client/src/components/MarketCategoryFilter.tsx`, `client/src/components/__tests__/MarketCategoryFilter.test.tsx` (6 tests)
- **What:** Horizontal pill buttons for multi-select category filtering with brand highlight styling

### Step 6: Rewrite MarketOverview with Live Data
- **Status:** COMPLETE
- **Files:** `client/src/components/MarketOverview.tsx`, `client/src/components/__tests__/MarketOverview.test.tsx` (7 tests)
- **What:** Composes MarketCategoryFilter + MarketCard grid, defaults to Indices + Mag 7, skeleton loading, deduplicates symbols
- **Test count:** 171 total (120 client + 51 server) — all green

---

### Fix: Major Indices — Use Real Index Symbols Instead of ETFs
- **Status:** COMPLETE
- **Files:** `client/src/constants/marketCategories.ts`, `client/src/components/__tests__/MarketOverview.test.tsx`
- **What:** Replaced ETF proxies (SPY, QQQ, DIA, IWM) with actual Yahoo Finance index symbols (`^GSPC`, `^IXIC`, `^DJI`, `^RUT`) so the Markets tab shows real index levels (e.g. S&P 500 at ~5,200) instead of ETF share prices
- **Test count:** 171 total (120 client + 51 server) — all green

---

## Phase 10: Partner System Status

### Step 0: Update REQUIREMENTS.md + PROGRESS.md
- **Status:** COMPLETE
- **Files:** `REQUIREMENTS.md` (section 5.5), `PROGRESS.md` (this section)
- **What:** Added feature spec and phase tracking

### Step 1: Add `GET /api/status` Server Endpoint
- **Status:** COMPLETE
- **Files:** `server/routes/status.ts` (new), `server/routes/__tests__/status.test.ts` (10 tests), `server/app.ts`, `shared/types.ts`
- **What:** Health check endpoint that pings Yahoo Finance, NewsAPI, RSS feeds; checks env vars for unused integrations (Finnhub, Alpha Vantage, FRED, GNews)

### Step 2: Add Status Tab to Navigation Store + Sidebar
- **Status:** COMPLETE
- **Files:** `client/src/store/navigationStore.ts` (4 tests), `client/src/components/Sidebar.tsx` (7 tests)
- **What:** Extended TabId with 'status', added secondary bottom section to sidebar with `mt-auto` push

### Step 3: Create `useSystemStatus` Hook
- **Status:** COMPLETE
- **Files:** `client/src/hooks/useSystemStatus.ts` (new), `client/src/hooks/__tests__/useSystemStatus.test.ts` (4 tests)
- **What:** Fetch hook for `/api/status`, 30s auto-refresh, AbortController cleanup

### Step 4: Create `SystemStatus` Component
- **Status:** COMPLETE
- **Files:** `client/src/components/SystemStatus.tsx` (new), `client/src/components/__tests__/SystemStatus.test.tsx` (9 tests)
- **What:** Status page with colored dots (green/red/yellow/gray), service names, status labels, skeleton loading

### Step 5: Wire into App Layout
- **Status:** COMPLETE
- **Files:** `client/src/App.tsx`, `client/src/App.test.tsx` (9 tests)
- **What:** Added status tab routing in App, mocked useSystemStatus in App tests
- **Test count:** 198 total (137 client + 61 server) — all green

---

### Fix: SSRF Vulnerability in Yahoo Finance Symbol Handling
- **Status:** COMPLETE
- **Files:** `server/routes/quotes.ts`, `server/routes/__tests__/quotes.test.ts` (+4 tests), `server/services/yahoo.ts`, `server/services/__tests__/yahoo.test.ts` (+1 test)
- **What:** CodeQL flagged critical SSRF — user-supplied `symbols` query param was interpolated into fetch URL without validation. Fixed with two layers: (1) strict regex validation at route level rejecting anything that doesn't match stock ticker format, (2) `encodeURIComponent` on symbol in fetch URL as defense in depth
- **Test count:** 203 total (137 client + 66 server) — all green

---

*Last updated: SSRF fix complete — symbol validation + URL encoding*
