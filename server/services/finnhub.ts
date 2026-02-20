import type { CompanyProfile, CompanyFinancials, CompanyNewsArticle } from '../../shared/types.js'

const FINNHUB_BASE = 'https://finnhub.io/api/v1'

function getKey(): string | null {
  return process.env.FINNHUB_KEY || null
}

export async function fetchFinnhubProfile(symbol: string): Promise<CompanyProfile | null> {
  const key = getKey()
  if (!key) return null

  try {
    const params = new URLSearchParams({ symbol, token: key })
    const res = await fetch(`${FINNHUB_BASE}/stock/profile2?${params}`)
    if (!res.ok) return null

    const data = await res.json()
    if (!data.name) return null

    return {
      name: data.name,
      logo: data.logo || null,
      industry: data.finnhubIndustry || null,
      country: data.country || null,
      weburl: data.weburl || null,
      marketCapitalization: data.marketCapitalization || null,
    }
  } catch {
    return null
  }
}

export async function fetchFinnhubFinancials(symbol: string): Promise<CompanyFinancials | null> {
  const key = getKey()
  if (!key) return null

  try {
    const params = new URLSearchParams({ symbol, metric: 'all', token: key })
    const res = await fetch(`${FINNHUB_BASE}/stock/metric?${params}`)
    if (!res.ok) return null

    const data = await res.json()
    const m = data?.metric ?? {}

    return {
      peRatio: m.peBasicExclExtraTTM ?? null,
      eps: m.epsBasicExclExtraItemsTTM ?? null,
      beta: m.beta ?? null,
      dividendYield: m.dividendYieldIndicatedAnnual ?? null,
    }
  } catch {
    return null
  }
}

export async function fetchFinnhubCompanyNews(symbol: string): Promise<CompanyNewsArticle[]> {
  const key = getKey()
  if (!key) return []

  try {
    const to = new Date().toISOString().slice(0, 10)
    const from = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
    const params = new URLSearchParams({ symbol, from, to, token: key })
    const res = await fetch(`${FINNHUB_BASE}/company-news?${params}`)
    if (!res.ok) return []

    const data = await res.json()
    if (!Array.isArray(data)) return []

    return data.slice(0, 50).map((item: Record<string, unknown>) => ({
      headline: (item.headline as string) ?? '',
      summary: (item.summary as string) ?? '',
      url: (item.url as string) ?? '',
      source: (item.source as string) ?? 'Unknown',
      datetime: (item.datetime as number) ?? 0,
      image: (item.image as string) || null,
    }))
  } catch {
    return []
  }
}
