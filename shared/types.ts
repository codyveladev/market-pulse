// --- Sector Definitions ---

export interface SectorConfig {
  id: string;
  label: string;
  icon: string;
  keywords: string[];
  tickers: string[];
  etfSymbol: string;
}

// --- News ---

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  sectorIds: string[];
  imageUrl?: string;
}

// --- Market Data ---

export interface QuoteData {
  symbol: string;
  price: number;
  changePercent: number;
  change: number;
  name?: string;
  dayHigh?: number;
  dayLow?: number;
}

// --- System Status ---

export interface ServiceStatus {
  name: string;
  status: 'ok' | 'down' | 'unconfigured' | 'unused';
  message: string;
}

export interface StatusResponse {
  services: ServiceStatus[];
  checkedAt: string;
}

// --- Research ---

export interface StockOverview {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number | null;
  dayLow: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  marketCap: number | null;
  volume: number | null;
  chartData: number[];
}

export interface CompanyProfile {
  name: string;
  logo: string | null;
  industry: string | null;
  country: string | null;
  weburl: string | null;
  marketCapitalization: number | null;
}

export interface CompanyFinancials {
  peRatio: number | null;
  eps: number | null;
  beta: number | null;
  dividendYield: number | null;
}

export interface CompanyNewsArticle {
  headline: string;
  summary: string;
  url: string;
  source: string;
  datetime: number;
  image: string | null;
}

export interface ResearchResponse {
  overview: StockOverview | null;
  profile: CompanyProfile | null;
  financials: CompanyFinancials | null;
  news: CompanyNewsArticle[];
  fetchedAt: string;
}

// --- API Responses ---

export interface NewsResponse {
  articles: NewsArticle[];
  fetchedAt: string;
}

export interface QuotesResponse {
  quotes: QuoteData[];
  fetchedAt: string;
}
