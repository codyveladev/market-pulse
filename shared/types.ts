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

// --- API Responses ---

export interface NewsResponse {
  articles: NewsArticle[];
  fetchedAt: string;
}

export interface QuotesResponse {
  quotes: QuoteData[];
  fetchedAt: string;
}
