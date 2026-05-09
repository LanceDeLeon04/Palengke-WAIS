require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const rateLimit  = require('express-rate-limit')
const path       = require('path')

const authRoutes  = require('./routes/auth')
const forumRoutes = require('./routes/forum')

const app  = express()
const PORT = process.env.PORT || 4000

// ── Security ─────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // handled by frontend
  crossOriginEmbedderPolicy: false,
}))

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}))

// ── Rate limiting ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
})
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please wait.' },
})

app.use(limiter)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',  authLimiter, authRoutes)
app.use('/api/forum', forumRoutes)

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Serve React frontend in production ────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'client', 'dist')
  app.use(express.static(distPath))
  // SPA fallback — must come AFTER all API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🛒 Palengke WAIS Server`)
  console.log(`   Port:  ${PORT}`)
  console.log(`   Mode:  ${process.env.NODE_ENV || 'development'}`)
  console.log(`   DB:    ${process.env.DATABASE_URL ? 'connected' : '⚠️  DATABASE_URL not set'}`)
})

module.exports = app
