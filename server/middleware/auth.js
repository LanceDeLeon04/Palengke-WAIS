const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'palengke-wais-secret-change-in-prod'

// Required auth — rejects if no token
function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  try {
    const token   = auth.slice(7)
    req.user      = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// Optional auth — sets req.user if token present, continues either way
function optionalAuth(req, res, next) {
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(auth.slice(7), JWT_SECRET)
    } catch { /* ignore */ }
  }
  next()
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, is_admin: user.is_admin },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

module.exports = { requireAuth, optionalAuth, signToken }
