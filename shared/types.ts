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
  chartDates: string[];
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

export interface FundamentalData {
  // Valuation
  pegRatio: number | null;
  forwardPE: number | null;
  priceToBook: number | null;
  priceToSales: number | null;
  evToRevenue: number | null;
  evToEbitda: number | null;
  // Profitability
  profitMargin: number | null;
  operatingMargin: number | null;
  returnOnEquity: number | null;
  returnOnAssets: number | null;
  // Growth
  quarterlyRevenueGrowth: number | null;
  quarterlyEarningsGrowth: number | null;
  // Analyst
  analystTargetPrice: number | null;
  analystStrongBuy: number | null;
  analystBuy: number | null;
  analystHold: number | null;
  analystSell: number | null;
  analystStrongSell: number | null;
}

export interface ResearchResponse {
  overview: StockOverview | null;
  profile: CompanyProfile | null;
  financials: CompanyFinancials | null;
  fundamentals: FundamentalData | null;
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
