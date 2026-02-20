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

## Phase 11: "Last Updated" Timestamps for News & Markets Tabs

### Step 1: Expose `fetchedAt` from `useNews` Hook
- **Status:** COMPLETE
- **Files:** `client/src/hooks/useNews.ts`, `client/src/hooks/__tests__/useNews.test.ts` (+1 test)
- **What:** Added `fetchedAt` state to hook, stored from API response, returned to consumers

### Step 2: Expose `fetchedAt` from `useMarketQuotes` Hook
- **Status:** COMPLETE
- **Files:** `client/src/hooks/useMarketQuotes.ts`, `client/src/hooks/__tests__/useMarketQuotes.test.ts` (+1 test)
- **What:** Added `fetchedAt` state to hook, stored from API response, returned to consumers

### Step 3: Display "Last Updated" in NewsFeed
- **Status:** COMPLETE
- **Files:** `client/src/components/NewsFeed.tsx`, `client/src/components/__tests__/NewsFeed.test.tsx` (+1 test)
- **What:** Shows "Updated X ago · Refresh in Xs" using existing `timeAgo()` utility

### Step 4: Display "Last Updated" in MarketOverview
- **Status:** COMPLETE
- **Files:** `client/src/components/MarketOverview.tsx`, `client/src/components/__tests__/MarketOverview.test.tsx` (+1 test)
- **What:** Shows "Updated X ago" next to Markets heading using existing `timeAgo()` utility
- **Test count:** 207 total (141 client + 66 server) — all green

---

## Phase 12: Stock Research Tab

### Step 1: Shared Types + Extended Yahoo Service
- **Status:** COMPLETE
- **Files:** `shared/types.ts`, `server/services/yahoo.ts`, `server/services/__tests__/yahoo.test.ts` (+6 tests)
- **What:** Added StockOverview, CompanyProfile, CompanyFinancials, CompanyNewsArticle, ResearchResponse types. Added `fetchYahooStockOverview(symbol)` using `range=1mo&interval=1d` for price stats + chart data

### Step 2: Finnhub Service
- **Status:** COMPLETE
- **Files:** `server/services/finnhub.ts` (new), `server/services/__tests__/finnhub.test.ts` (12 tests)
- **What:** Three functions: `fetchFinnhubProfile()`, `fetchFinnhubFinancials()`, `fetchFinnhubCompanyNews()`. All gracefully return null/[] when FINNHUB_KEY is missing

### Step 3: Research API Route
- **Status:** COMPLETE
- **Files:** `server/routes/research.ts` (new), `server/routes/__tests__/research.test.ts` (10 tests), `server/app.ts`
- **What:** `GET /api/research?symbol=AAPL` — symbol validation, 120s cache, Promise.allSettled for graceful degradation

### Step 4: Navigation + Sidebar
- **Status:** COMPLETE
- **Files:** `client/src/store/navigationStore.ts` (+1 test), `client/src/components/Sidebar.tsx` (+2 tests)
- **What:** Added 'research' to TabId, added Research nav button between Markets and Status

### Step 5: useResearch Hook
- **Status:** COMPLETE
- **Files:** `client/src/hooks/useResearch.ts` (new), `client/src/hooks/__tests__/useResearch.test.ts` (8 tests)
- **What:** Takes symbol string, fetches on change, no auto-refresh, AbortController cleanup

### Step 6: Number Formatting Utility
- **Status:** COMPLETE
- **Files:** `client/src/utils/formatNumber.ts` (new), `client/src/utils/__tests__/formatNumber.test.ts` (6 tests)
- **What:** `formatLargeNumber()` ($2.87T, $150B, $5.2M) and `formatVolume()` with commas

### Step 7: UI Components
- **Status:** COMPLETE
- **Files:** ResearchSearch (5 tests), StockHeader (5 tests), KeyStatsGrid (7 tests), PriceChart (4 tests), CompanyInfo (5 tests), ResearchNewsFeed (5 tests)
- **What:** Search bar, price header with green/red, stats grid, SVG sparkline, company profile card, ticker news list

### Step 8: ResearchPage Composite + App Wiring
- **Status:** COMPLETE
- **Files:** `client/src/components/ResearchPage.tsx` (7 tests), `client/src/App.tsx` (+1 test)
- **What:** Composes all sub-components, manages search state, wires into App layout
- **Test count:** 291 total (197 client + 94 server) — all green

---

## Phase 13: News Filter Panel (Source + Sector Sidebar)

**Goal:** Replace the standalone horizontal SectorSelector with a unified vertical filter panel to the right of the news feed. The panel consolidates sector filtering (moved) and adds new source filtering so users can control which news outlets they see.

**Layout change:**
```
Before:
  ┌─────────────────────────────────────────┐
  │ SectorSelector (horizontal pills)       │
  ├─────────────────────────────────────────┤
  │ NewsFeed (full width)                   │
  └─────────────────────────────────────────┘

After:
  ┌────────────────────────┬────────────────┐
  │ NewsFeed               │ Filter Panel   │
  │                        │                │
  │                        │ SECTORS        │
  │                        │ [Tech][Finance]│
  │                        │ [Energy][Med]  │
  │                        │                │
  │                        │ SOURCES        │
  │                        │ [Reuters]      │
  │                        │ [AP News]      │
  │                        │ [Bloomberg]    │
  └────────────────────────┴────────────────┘
```

**Source filtering strategy:** Client-side. Unique sources are derived from the articles already returned by the API (no server changes needed for filtering). When no sources are selected = show all. Selecting sources narrows the visible articles. This avoids a chicken-and-egg problem and is consistent with the bounded article count (NewsAPI max ~100, RSS limited).

### Step 0: Source Tag on NewsCard
- **Status:** COMPLETE
- **Files:** `client/src/components/NewsCard.tsx`, `client/src/components/__tests__/NewsCard.test.tsx` (+1 test)
- **What:** Replaced plain-text source display with a styled pill badge (`rounded-full bg-surface border border-white/10`) matching the tag pattern established by sector chips. `data-testid="source-tag"` for testability.

### Step 1: Source Store
- **Status:** COMPLETE
- **Files:** `client/src/store/sourceStore.ts` (new), `client/src/store/__tests__/sourceStore.test.ts` (7 tests)
- **What:** Zustand store matching sectorStore pattern — `selectedSources: string[]`, `toggleSource()`, `selectAll()`, `clearAll()`, `isSourceSelected()`. Persists to `market-pulse-sources` in localStorage.

### Step 2: Client-side Source Filtering in useNews
- **Status:** COMPLETE
- **Files:** `client/src/hooks/useNews.ts`, `client/src/hooks/__tests__/useNews.test.ts` (+3 tests)
- **What:** Derives `availableSources` (unique sorted source strings) from fetched articles. Applies source filter client-side: if `selectedSources` is empty show all; otherwise filter to matching sources. Returns `articles`, `allArticles`, and `availableSources` from hook.

### Step 3: SourceFilter Component
- **Status:** COMPLETE
- **Files:** `client/src/components/SourceFilter.tsx` (new), `client/src/components/__tests__/SourceFilter.test.tsx` (7 tests)
- **What:** Toggle buttons — one per available source. Same active-state styling as SectorSelector (`bg-brand/20`, ring). Includes "Clear" button when sources are selected. Reads/writes `sourceStore`. Accepts `sources: string[]` prop driven by available sources from hook.

### Step 4: FilterPanel Component
- **Status:** COMPLETE
- **Files:** `client/src/components/FilterPanel.tsx` (new), `client/src/components/__tests__/FilterPanel.test.tsx` (6 tests)
- **What:** Panel with two labeled sections — "Sectors" (sector buttons with Clear/All toggle) and "Sources" (wraps SourceFilter). Fixed width on desktop (`w-56`). On mobile, hidden behind a floating "Filters" button with slide-out overlay. Each section has Clear/All header action.

### Step 5: Restructure News Layout in App
- **Status:** COMPLETE
- **Files:** `client/src/App.tsx`, `client/src/App.test.tsx`, `client/src/components/NewsFeed.tsx`, `client/src/components/__tests__/NewsFeed.test.tsx`
- **What:** Lifted `useNews` hook from NewsFeed to App. NewsFeed now accepts props instead of calling hook internally. News tab uses 2-column flex layout: `NewsFeed (flex-1) + FilterPanel (w-56 shrink-0)`. Removed standalone SectorSelector. Updated all tests.
- **Test count:** 313 total (227 client + 86 server) — all green

---

---

## Phase 14: ResearchNewsFeed Visual Consistency

**Goal:** Make the ticker news cards on the Research tab match the main News Feed's card pattern for visual consistency.

### Step 1: Rewrite ResearchNewsFeed Component
- **Status:** COMPLETE
- **Files:** `client/src/components/ResearchNewsFeed.tsx`, `client/src/components/__tests__/ResearchNewsFeed.test.tsx` (13 tests)
- **What:**
  - Replaced single outer card + `border-b` divider layout with individual elevated cards (`bg-surface-raised rounded-lg p-4 border border-white/5`) per article — matching NewsCard
  - Source now renders as styled pill badge (`px-2 py-0.5 rounded-full bg-surface border border-white/10 text-gray-300`) — matching NewsCard
  - Headline upgraded from `text-sm` to `text-lg font-semibold text-gray-100 hover:text-brand leading-snug` — matching NewsCard title style
  - Article summary rendered below headline when non-empty (`text-sm text-gray-400 line-clamp-2`) — matching NewsCard description style
  - Images removed entirely
  - Section header changed from `<span className="text-sm font-medium text-gray-400">` to `<h2 className="text-lg font-semibold text-gray-100">` — matching NewsFeed header style
  - Pagination controls retained, unchanged
- **Test count:** 321 total (234 client + 87 server) — all green

---

## Phase 15: Interactive Price Chart with Recharts

**Goal:** Replace the bare SVG polyline chart on the Research tab with a fully interactive Recharts AreaChart — labeled axes, hover tooltip, 1M/3M range toggle, and 52-week high/low reference lines.

### Step 1: Add chartDates to types and Yahoo service
- **Status:** COMPLETE
- **Files:** `shared/types.ts`, `server/services/yahoo.ts`
- **What:** Added `chartDates: string[]` to `StockOverview`. Updated `fetchYahooStockOverview` to extract `result?.timestamp`, zip-filter with close prices (dropping nulls from both), and return `chartDates` as ISO date strings (YYYY-MM-DD).

### Step 2: Install Recharts and rewrite PriceChart component
- **Status:** COMPLETE
- **Files:** `client/src/components/PriceChart.tsx`, `client/src/components/ResearchPage.tsx`
- **What:**
  - Installed `recharts@^3.7.0` as a client dependency
  - Full rewrite of `PriceChart` using `ResponsiveContainer > AreaChart`
  - Y-axis: formatted price labels (`$NNN.NN`), auto-scaled with 8% padding
  - X-axis: date labels formatted as "MMM D", ~5 evenly-spaced ticks
  - Custom tooltip: date + price + Δ% from period open (green/red colored)
  - Area fill: green/red gradient based on `changePercent`
  - `data-positive` attribute on card div for testability
  - ReferenceLine for 52-week high/low (dashed, labeled, when present)
  - **1M / 3M toggle** buttons in card header (client-side slice, last 21 trading days for 1M)
  - `isAnimationActive={false}` for test-environment compatibility
  - Updated `ResearchPage.tsx` to pass `chartDates`, `fiftyTwoWeekHigh`, `fiftyTwoWeekLow`, `changePercent` to `PriceChart`

### Step 3: Update tests
- **Status:** COMPLETE
- **Files:** `client/src/components/__tests__/PriceChart.test.tsx` (11 tests), `server/routes/__tests__/research.test.ts`, `client/src/components/__tests__/ResearchPage.test.tsx`, `server/services/__tests__/yahoo.test.ts`
- **What:**
  - PriceChart tests: mocked `ResponsiveContainer` to pass children through; added `ResizeObserver` class mock; tests cover null guard, labels, 1M/3M toggle, `data-positive` attribute, 52-week null handling
  - yahoo.test.ts: added `timestamps` param to `chartResponseWithIndicators` helper; updated chartData null-filtering test to include timestamps
  - research.test.ts + ResearchPage.test.tsx: added `chartDates` to mock data
- **Test count:** 334 total (237 client + 97 server) — all green

---

*Last updated: Phase 15 COMPLETE — Interactive Price Chart with Recharts*
