import express from 'express'
import cors from 'cors'
import newsRouter from './routes/news.js'
import quotesRouter from './routes/quotes.js'
import statusRouter from './routes/status.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/news', newsRouter)
app.use('/api/quotes', quotesRouter)
app.use('/api/status', statusRouter)

export default app
