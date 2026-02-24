import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(),
}))

import { GoogleGenAI } from '@google/genai'
import { buildPrompt, isConfigured, streamAnalysis } from '../gemini.js'
import type { ResearchResponse } from '../../../shared/types.js'

const MockGoogleGenAI = vi.mocked(GoogleGenAI)

const mockResearchData: ResearchResponse = {
  overview: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 189.84,
    change: 2.34,
    changePercent: 1.25,
    dayHigh: 191.2,
    dayLow: 187.5,
    fiftyTwoWeekHigh: 199.62,
    fiftyTwoWeekLow: 164.08,
    marketCap: 2870000000000,
    volume: 52000000,
    chartData: [185, 187, 189],
    chartDates: ['2024-11-01', '2024-11-02', '2024-11-03'],
  },
  profile: { name: 'Apple Inc.', logo: null, industry: 'Technology', country: 'US', weburl: 'https://apple.com', marketCapitalization: 2870000 },
  financials: { peRatio: 31.2, eps: 6.13, beta: 1.29, dividendYield: 0.55 },
  fundamentals: {
    pegRatio: 2.24, forwardPE: 21.01, priceToBook: 7.5, priceToSales: 3.5,
    evToRevenue: 4.3, evToEbitda: 17.1, profitMargin: 0.157, operatingMargin: 0.23,
    returnOnEquity: 0.352, returnOnAssets: 0.05, quarterlyRevenueGrowth: 0.122,
    quarterlyEarningsGrowth: 0.9, analystTargetPrice: 324.95,
    analystStrongBuy: 1, analystBuy: 9, analystHold: 8, analystSell: 2, analystStrongSell: 1,
  },
  news: [
    { headline: 'Apple Q4 beats estimates', summary: '', url: '', source: 'Reuters', datetime: 0, image: null },
    { headline: 'iPhone 16 demand strong', summary: '', url: '', source: 'CNBC', datetime: 0, image: null },
  ],
  fetchedAt: '2024-11-15T12:00:00Z',
}

describe('gemini service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isConfigured', () => {
    it('returns true when GEMINI_KEY is set', () => {
      process.env.GEMINI_KEY = 'test-key'
      expect(isConfigured()).toBe(true)
    })

    it('returns false when GEMINI_KEY is missing', () => {
      delete process.env.GEMINI_KEY
      expect(isConfigured()).toBe(false)
    })
  })

  describe('buildPrompt', () => {
    it('includes stock overview data', () => {
      const prompt = buildPrompt(mockResearchData)
      expect(prompt).toContain('AAPL')
      expect(prompt).toContain('Apple Inc.')
      expect(prompt).toContain('$189.84')
      expect(prompt).toContain('+1.25%')
      expect(prompt).toContain('$2870.0B')
    })

    it('includes financials data', () => {
      const prompt = buildPrompt(mockResearchData)
      expect(prompt).toContain('P/E Ratio: 31.2')
      expect(prompt).toContain('EPS: 6.13')
      expect(prompt).toContain('Beta: 1.29')
      expect(prompt).toContain('0.55%')
    })

    it('includes fundamentals data with percentages', () => {
      const prompt = buildPrompt(mockResearchData)
      expect(prompt).toContain('PEG: 2.24')
      expect(prompt).toContain('Forward P/E: 21.01')
      expect(prompt).toContain('15.7%')
      expect(prompt).toContain('35.2%')
      expect(prompt).toContain('$324.95')
    })

    it('includes news headlines up to 10', () => {
      const prompt = buildPrompt(mockResearchData)
      expect(prompt).toContain('Apple Q4 beats estimates')
      expect(prompt).toContain('iPhone 16 demand strong')
    })

    it('handles null overview gracefully', () => {
      const data = { ...mockResearchData, overview: null }
      const prompt = buildPrompt(data)
      expect(prompt).not.toContain('Stock Overview')
      expect(prompt).toContain('P/E Ratio')
    })

    it('handles null financials and fundamentals', () => {
      const data = { ...mockResearchData, financials: null, fundamentals: null }
      const prompt = buildPrompt(data)
      expect(prompt).not.toContain('Key Financials')
      expect(prompt).not.toContain('Fundamentals')
      expect(prompt).toContain('AAPL')
    })

    it('handles empty news array', () => {
      const data = { ...mockResearchData, news: [] }
      const prompt = buildPrompt(data)
      expect(prompt).not.toContain('Recent Headlines')
    })
  })

  describe('streamAnalysis', () => {
    it('throws when GEMINI_KEY is not set', async () => {
      delete process.env.GEMINI_KEY
      const gen = streamAnalysis(mockResearchData)
      await expect(gen.next()).rejects.toThrow('GEMINI_KEY not configured')
    })

    it('yields text chunks from Gemini', async () => {
      process.env.GEMINI_KEY = 'test-key'

      const mockStream = (async function* () {
        yield { text: 'Hello ' }
        yield { text: 'world' }
      })()

      MockGoogleGenAI.mockImplementation(() => ({
        models: {
          generateContentStream: vi.fn().mockResolvedValue(mockStream),
        },
      }) as unknown as InstanceType<typeof GoogleGenAI>)

      const chunks: string[] = []
      for await (const chunk of streamAnalysis(mockResearchData)) {
        chunks.push(chunk)
      }

      expect(chunks).toEqual(['Hello ', 'world'])
    })

    it('skips chunks with no text', async () => {
      process.env.GEMINI_KEY = 'test-key'

      const mockStream = (async function* () {
        yield { text: 'Hello' }
        yield { text: undefined }
        yield { text: '' }
        yield { text: 'World' }
      })()

      MockGoogleGenAI.mockImplementation(() => ({
        models: {
          generateContentStream: vi.fn().mockResolvedValue(mockStream),
        },
      }) as unknown as InstanceType<typeof GoogleGenAI>)

      const chunks: string[] = []
      for await (const chunk of streamAnalysis(mockResearchData)) {
        chunks.push(chunk)
      }

      expect(chunks).toEqual(['Hello', 'World'])
    })
  })
})
