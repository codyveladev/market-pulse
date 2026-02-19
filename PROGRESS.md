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
- **Status:** NOT STARTED
- **Files:** `shared/types.ts`, `server/services/yahoo.ts`, `server/services/__tests__/yahoo.test.ts`
- **What:** Add `name?`, `dayHigh?`, `dayLow?` to QuoteData; parse from Yahoo v8 chart `meta` (already fetched, just not extracted)

### Step 2: Market Categories Constant
- **Status:** NOT STARTED
- **Files:** `client/src/constants/marketCategories.ts`
- **What:** Define 12 filterable categories: Indices (SPY, QQQ, DIA, IWM), Mag 7 (AAPL, MSFT, NVDA, GOOGL, AMZN, META, TSLA), plus 10 sector stock groups from existing `SECTORS`

### Step 3: useMarketQuotes Hook
- **Status:** NOT STARTED
- **Files:** `client/src/hooks/useMarketQuotes.ts`, `client/src/hooks/__tests__/useMarketQuotes.test.ts`
- **What:** Parameterized fetch hook — accepts `symbols[]`, calls `/api/quotes?symbols=...`, 60s auto-refresh

### Step 4: MarketCard Component
- **Status:** NOT STARTED
- **Files:** `client/src/components/MarketCard.tsx`, `client/src/components/__tests__/MarketCard.test.tsx`
- **What:** Compact card showing symbol, name, price, $ change, % change, day high/low with green/red color coding

### Step 5: MarketCategoryFilter Component
- **Status:** NOT STARTED
- **Files:** `client/src/components/MarketCategoryFilter.tsx`, `client/src/components/__tests__/MarketCategoryFilter.test.tsx`
- **What:** Horizontal pill buttons for multi-select category filtering (same pattern as SectorSelector)

### Step 6: Rewrite MarketOverview with Live Data
- **Status:** NOT STARTED
- **Files:** `client/src/components/MarketOverview.tsx`, `client/src/components/__tests__/MarketOverview.test.tsx`
- **What:** Composes MarketCategoryFilter + MarketCard grid, defaults to Indices + Mag 7, deduplicates symbols across categories

---

*Last updated: Phase 9 planned — Markets Tab implementation*
