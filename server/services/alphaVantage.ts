import type { FundamentalData } from '../../shared/types.js'
import { cacheService } from './cache.js'

const AV_BASE = 'https://www.alphavantage.co/query'
const AV_CACHE_TTL = 86400 // 24 hours — fundamental data is quarterly

function getKey(): string | null {
  return process.env.ALPHA_VANTAGE_KEY || null
}

function toNum(value: unknown): number | null {
  if (value == null || value === 'None' || value === '-') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export async function fetchAlphaVantageOverview(symbol: string): Promise<FundamentalData | null> {
  const key = getKey()
  if (!key) return null

  return cacheService.getOrFetch(`av-overview:${symbol}`, async () => {
    try {
      const params = new URLSearchParams({ function: 'OVERVIEW', symbol, apikey: key })
      const res = await fetch(`${AV_BASE}?${params}`)
      if (!res.ok) return null

      const data = await res.json()

      // Alpha Vantage returns a "Note" field when rate-limited
      if (data.Note || data['Error Message'] || !data.Symbol) return null

      return {
        pegRatio: toNum(data.PEGRatio),
        forwardPE: toNum(data.ForwardPE),
        priceToBook: toNum(data.PriceToBookRatio),
        priceToSales: toNum(data.PriceToSalesRatioTTM),
        evToRevenue: toNum(data.EVToRevenue),
        evToEbitda: toNum(data.EVToEBITDA),
        profitMargin: toNum(data.ProfitMargin),
        operatingMargin: toNum(data.OperatingMarginTTM),
        returnOnEquity: toNum(data.ReturnOnEquityTTM),
        returnOnAssets: toNum(data.ReturnOnAssetsTTM),
        quarterlyRevenueGrowth: toNum(data.QuarterlyRevenueGrowthYOY),
        quarterlyEarningsGrowth: toNum(data.QuarterlyEarningsGrowthYOY),
        analystTargetPrice: toNum(data.AnalystTargetPrice),
        analystStrongBuy: toNum(data.AnalystRatingStrongBuy),
        analystBuy: toNum(data.AnalystRatingBuy),
        analystHold: toNum(data.AnalystRatingHold),
        analystSell: toNum(data.AnalystRatingSell),
        analystStrongSell: toNum(data.AnalystRatingStrongSell),
      }
    } catch {
      return null
    }
  }, AV_CACHE_TTL)
}
