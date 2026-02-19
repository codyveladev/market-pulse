import type { SectorConfig } from '@shared/types'

export const SECTORS: SectorConfig[] = [
  {
    id: 'technology',
    label: 'Technology',
    icon: '💻',
    keywords: ['AI', 'semiconductor', 'software', 'cloud', 'earnings', 'tech stocks'],
    tickers: ['AAPL', 'MSFT', 'NVDA', 'GOOG', 'META'],
    etfSymbol: 'XLK',
  },
  {
    id: 'oil-gas',
    label: 'Oil & Gas',
    icon: '🛢️',
    keywords: ['crude oil', 'natural gas', 'OPEC', 'refinery', 'energy stocks', 'Brent'],
    tickers: ['XOM', 'CVX', 'OXY', 'BP', 'SLB'],
    etfSymbol: 'XLE',
  },
  {
    id: 'automotive',
    label: 'Automotive',
    icon: '🚗',
    keywords: ['EV', 'electric vehicle', 'auto sales', 'car manufacturer', 'recall'],
    tickers: ['TSLA', 'GM', 'F', 'RIVN', 'TM'],
    etfSymbol: 'CARZ',
  },
  {
    id: 'finance',
    label: 'Finance / Banking',
    icon: '🏦',
    keywords: ['Fed rate', 'interest rate', 'bank earnings', 'mortgage', 'fintech'],
    tickers: ['JPM', 'BAC', 'GS', 'WFC', 'V'],
    etfSymbol: 'XLF',
  },
  {
    id: 'healthcare',
    label: 'Healthcare / Pharma',
    icon: '💊',
    keywords: ['FDA approval', 'drug trial', 'healthcare earnings', 'biotech'],
    tickers: ['JNJ', 'PFE', 'UNH', 'MRNA', 'ABBV'],
    etfSymbol: 'XLV',
  },
  {
    id: 'real-estate',
    label: 'Real Estate',
    icon: '🏘️',
    keywords: ['housing market', 'REIT', 'mortgage rate', 'home sales', 'construction'],
    tickers: ['AMT', 'PLD', 'SPG', 'EQIX'],
    etfSymbol: 'XLRE',
  },
  {
    id: 'crypto',
    label: 'Crypto / Web3',
    icon: '₿',
    keywords: ['bitcoin', 'ethereum', 'crypto regulation', 'DeFi', 'blockchain'],
    tickers: ['BTC', 'ETH', 'BNB', 'SOL'],
    etfSymbol: 'BITO',
  },
  {
    id: 'commodities',
    label: 'Commodities',
    icon: '🌾',
    keywords: ['gold', 'silver', 'wheat', 'corn', 'commodity futures', 'inflation hedge'],
    tickers: ['GLD', 'SLV', 'WEAT', 'USO'],
    etfSymbol: 'GLD',
  },
  {
    id: 'retail',
    label: 'Retail / Consumer',
    icon: '🛍️',
    keywords: ['consumer spending', 'retail earnings', 'e-commerce', 'inflation'],
    tickers: ['AMZN', 'WMT', 'TGT', 'COST'],
    etfSymbol: 'XLY',
  },
  {
    id: 'aerospace',
    label: 'Aerospace / Defense',
    icon: '✈️',
    keywords: ['defense contract', 'military budget', 'satellite', 'aerospace earnings'],
    tickers: ['LMT', 'RTX', 'NOC', 'BA'],
    etfSymbol: 'XAR',
  },
]

export function getSectorById(id: string): SectorConfig | undefined {
  return SECTORS.find((s) => s.id === id)
}

export function getSectorsByIds(ids: string[]): SectorConfig[] {
  return ids
    .map((id) => SECTORS.find((s) => s.id === id))
    .filter((s): s is SectorConfig => s !== undefined)
}
