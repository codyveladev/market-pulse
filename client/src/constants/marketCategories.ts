import { SECTORS } from './sectors'

export interface MarketCategory {
  id: string
  label: string
  icon: string
  symbols: string[]
}

export const MARKET_CATEGORIES: MarketCategory[] = [
  {
    id: 'indices',
    label: 'Major Indices',
    icon: '📊',
    symbols: ['^GSPC', '^IXIC', '^DJI', '^RUT'],
  },
  {
    id: 'mag7',
    label: 'Magnificent 7',
    icon: '🌟',
    symbols: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA'],
  },
  ...SECTORS.map((sector) => ({
    id: sector.id,
    label: sector.label,
    icon: sector.icon,
    // Yahoo Finance uses -USD suffix for crypto
    symbols: sector.id === 'crypto'
      ? sector.tickers.map((t) => `${t}-USD`)
      : sector.tickers,
  })),
]

export function getCategoryById(id: string): MarketCategory | undefined {
  return MARKET_CATEGORIES.find((c) => c.id === id)
}

export function getSymbolsForCategories(categoryIds: string[]): string[] {
  const symbolSet = new Set<string>()
  for (const id of categoryIds) {
    const category = getCategoryById(id)
    if (category) {
      for (const symbol of category.symbols) {
        symbolSet.add(symbol)
      }
    }
  }
  return Array.from(symbolSet)
}
