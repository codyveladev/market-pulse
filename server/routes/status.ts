import { Router } from 'express'
import type { StatusResponse, ServiceStatus } from '../../shared/types.js'
import { fetchYahooQuotes } from '../services/yahoo.js'
import { fetchRssArticles } from '../services/rss.js'
import { fetchNewsApiArticles } from '../services/newsapi.js'

const router = Router()

async function checkYahoo(): Promise<ServiceStatus> {
  try {
    const quotes = await fetchYahooQuotes(['^GSPC'])
    if (quotes.length > 0) {
      return { name: 'Yahoo Finance', status: 'ok', message: 'Connected' }
    }
    return { name: 'Yahoo Finance', status: 'down', message: 'Down' }
  } catch {
    return { name: 'Yahoo Finance', status: 'down', message: 'Down' }
  }
}

async function checkRss(): Promise<ServiceStatus> {
  try {
    const articles = await fetchRssArticles()
    if (articles.length > 0) {
      return { name: 'RSS Feeds', status: 'ok', message: 'Connected' }
    }
    return { name: 'RSS Feeds', status: 'down', message: 'Down' }
  } catch {
    return { name: 'RSS Feeds', status: 'down', message: 'Down' }
  }
}

async function checkNewsApi(): Promise<ServiceStatus> {
  const apiKey = process.env.NEWSAPI_KEY
  if (!apiKey) {
    return { name: 'NewsAPI', status: 'unconfigured', message: 'No API Key' }
  }
  try {
    const articles = await fetchNewsApiArticles(['technology'])
    if (articles.length > 0) {
      return { name: 'NewsAPI', status: 'ok', message: 'Connected' }
    }
    return { name: 'NewsAPI', status: 'down', message: 'Down' }
  } catch {
    return { name: 'NewsAPI', status: 'down', message: 'Down' }
  }
}

function checkEnvKey(name: string, envVar: string): ServiceStatus {
  if (process.env[envVar]) {
    return { name, status: 'unused', message: 'Not Implemented' }
  }
  return { name, status: 'unconfigured', message: 'No API Key' }
}

router.get('/', async (_req, res) => {
  const [yahoo, rss, newsapi] = await Promise.allSettled([
    checkYahoo(),
    checkRss(),
    checkNewsApi(),
  ])

  const services: ServiceStatus[] = [
    yahoo.status === 'fulfilled' ? yahoo.value : { name: 'Yahoo Finance', status: 'down', message: 'Down' },
    rss.status === 'fulfilled' ? rss.value : { name: 'RSS Feeds', status: 'down', message: 'Down' },
    newsapi.status === 'fulfilled' ? newsapi.value : { name: 'NewsAPI', status: 'down', message: 'Down' },
    checkEnvKey('Finnhub', 'FINNHUB_KEY'),
    checkEnvKey('Alpha Vantage', 'ALPHA_VANTAGE_KEY'),
    checkEnvKey('FRED', 'FRED_KEY'),
    checkEnvKey('GNews', 'GNEWS_KEY'),
  ]

  const response: StatusResponse = {
    services,
    checkedAt: new Date().toISOString(),
  }

  res.json(response)
})

export default router
