import { GoogleGenAI } from '@google/genai'
import type { ResearchResponse } from '../../shared/types.js'

const MODEL = 'gemini-2.5-flash'

function getKey(): string | null {
  return process.env.GEMINI_KEY || null
}

export function isConfigured(): boolean {
  return getKey() != null
}

const SYSTEM_INSTRUCTION = `You are Scout, a sharp and concise AI research assistant for Market Pulse. Given the stock data below, write a brief research briefing (3-4 short paragraphs, no more than 200 words total).

Structure your response as:
1. **Current Position**: Price action and where it sits relative to 52-week range
2. **Fundamentals**: Key valuation and profitability observations
3. **Sentiment & Outlook**: What recent news suggests about near-term direction

Use plain language. Be specific with numbers. Do not hedge excessively. Do not use markdown headers — just bold labels for each paragraph. Do not add any disclaimers.`

export function buildPrompt(data: ResearchResponse): string {
  const { overview, financials, fundamentals, news } = data
  const sections: string[] = []

  if (overview) {
    sections.push(`## Stock Overview
- Symbol: ${overview.symbol} | Name: ${overview.name}
- Price: $${overview.price.toFixed(2)} | Change: ${overview.change >= 0 ? '+' : ''}${overview.changePercent.toFixed(2)}%
- Market Cap: ${overview.marketCap != null ? `$${(overview.marketCap / 1e9).toFixed(1)}B` : 'N/A'}
- Day Range: $${overview.dayLow ?? 'N/A'} – $${overview.dayHigh ?? 'N/A'}
- 52-Week Range: $${overview.fiftyTwoWeekLow ?? 'N/A'} – $${overview.fiftyTwoWeekHigh ?? 'N/A'}`)
  }

  if (financials) {
    sections.push(`## Key Financials
- P/E Ratio: ${financials.peRatio ?? 'N/A'} | EPS: ${financials.eps ?? 'N/A'}
- Beta: ${financials.beta ?? 'N/A'} | Dividend Yield: ${financials.dividendYield != null ? financials.dividendYield.toFixed(2) + '%' : 'N/A'}`)
  }

  if (fundamentals) {
    sections.push(`## Fundamentals
- PEG: ${fundamentals.pegRatio ?? 'N/A'} | Forward P/E: ${fundamentals.forwardPE ?? 'N/A'}
- Profit Margin: ${fundamentals.profitMargin != null ? (fundamentals.profitMargin * 100).toFixed(1) + '%' : 'N/A'}
- ROE: ${fundamentals.returnOnEquity != null ? (fundamentals.returnOnEquity * 100).toFixed(1) + '%' : 'N/A'}
- Revenue Growth (QoQ): ${fundamentals.quarterlyRevenueGrowth != null ? (fundamentals.quarterlyRevenueGrowth * 100).toFixed(1) + '%' : 'N/A'}
- Analyst Target: $${fundamentals.analystTargetPrice ?? 'N/A'}`)
  }

  if (news.length > 0) {
    const headlines = news.slice(0, 10).map((n) => `- ${n.headline}`).join('\n')
    sections.push(`## Recent Headlines\n${headlines}`)
  }

  return sections.join('\n\n')
}

export async function* streamAnalysis(data: ResearchResponse): AsyncGenerator<string> {
  const key = getKey()
  if (!key) throw new Error('GEMINI_KEY not configured')

  const ai = new GoogleGenAI({ apiKey: key })
  const stream = await ai.models.generateContentStream({
    model: MODEL,
    contents: buildPrompt(data),
    config: {
      maxOutputTokens: 2048,
      temperature: 0.7,
      systemInstruction: SYSTEM_INSTRUCTION,
      // gemini-2.5-flash is a thinking model — cap the thinking budget
      // so most tokens go to the visible text output
      thinkingConfig: { thinkingBudget: 256 },
    },
  })

  for await (const chunk of stream) {
    if (chunk.text) {
      yield chunk.text
    }
  }
}
