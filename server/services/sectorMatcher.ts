import type { SectorConfig } from '../../shared/types.js'

// Duplicated from client constants to keep server independent of the client bundle.
// If these drift, extract to a shared package.
const SECTORS: SectorConfig[] = [
  { id: 'technology', label: 'Technology', icon: '💻', keywords: ['AI', 'semiconductor', 'software', 'cloud', 'tech stocks'], tickers: ['AAPL', 'MSFT', 'NVDA', 'GOOG', 'META'], etfSymbol: 'XLK' },
  { id: 'oil-gas', label: 'Oil & Gas', icon: '🛢️', keywords: ['crude oil', 'natural gas', 'OPEC', 'refinery', 'energy stocks', 'Brent'], tickers: ['XOM', 'CVX', 'OXY', 'BP', 'SLB'], etfSymbol: 'XLE' },
  { id: 'automotive', label: 'Automotive', icon: '🚗', keywords: ['EV', 'electric vehicle', 'auto sales', 'car manufacturer', 'recall'], tickers: ['TSLA', 'GM', 'F', 'RIVN', 'TM'], etfSymbol: 'CARZ' },
  { id: 'finance', label: 'Finance / Banking', icon: '🏦', keywords: ['Fed rate', 'interest rate', 'bank earnings', 'mortgage', 'fintech'], tickers: ['JPM', 'BAC', 'GS', 'WFC', 'V'], etfSymbol: 'XLF' },
  { id: 'healthcare', label: 'Healthcare / Pharma', icon: '💊', keywords: ['FDA approval', 'drug trial', 'healthcare earnings', 'biotech'], tickers: ['JNJ', 'PFE', 'UNH', 'MRNA', 'ABBV'], etfSymbol: 'XLV' },
  { id: 'real-estate', label: 'Real Estate', icon: '🏘️', keywords: ['housing market', 'REIT', 'mortgage rate', 'home sales', 'construction'], tickers: ['AMT', 'PLD', 'SPG', 'EQIX'], etfSymbol: 'XLRE' },
  { id: 'crypto', label: 'Crypto / Web3', icon: '₿', keywords: ['bitcoin', 'ethereum', 'crypto regulation', 'DeFi', 'blockchain'], tickers: ['BTC', 'ETH', 'BNB', 'SOL'], etfSymbol: 'BITO' },
  { id: 'commodities', label: 'Commodities', icon: '🌾', keywords: ['gold', 'silver', 'wheat', 'corn', 'commodity futures', 'inflation hedge'], tickers: ['GLD', 'SLV', 'WEAT', 'USO'], etfSymbol: 'GLD' },
  { id: 'retail', label: 'Retail / Consumer', icon: '🛍️', keywords: ['consumer spending', 'retail earnings', 'e-commerce', 'inflation'], tickers: ['AMZN', 'WMT', 'TGT', 'COST'], etfSymbol: 'XLY' },
  { id: 'aerospace', label: 'Aerospace / Defense', icon: '✈️', keywords: ['defense contract', 'military budget', 'satellite', 'aerospace earnings'], tickers: ['LMT', 'RTX', 'NOC', 'BA'], etfSymbol: 'XAR' },
]

export function matchSectors(text: string): string[] {
  const lower = text.toLowerCase()
  const matched: string[] = []

  for (const sector of SECTORS) {
    const found = sector.keywords.some((kw) => lower.includes(kw.toLowerCase()))
    if (found) {
      matched.push(sector.id)
    }
  }

  return matched
}

export function getKeywordsForSectors(sectorIds: string[]): string[] {
  return SECTORS
    .filter((s) => sectorIds.includes(s.id))
    .flatMap((s) => s.keywords)
}

export { SECTORS as SERVER_SECTORS }
