const router  = require('express').Router()
const bcrypt  = require('bcryptjs')
const pool    = require('../db/pool')
const { signToken, requireAuth } = require('../middleware/auth')

const AVATARS = ['🛒','👩‍🍳','🧑‍🌾','🐟','🌾','🥬','🍗','🥚','🏪','🌶️','🥭','🫙']

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields are required' })
    if (username.length < 3 || username.length > 30)
      return res.status(400).json({ error: 'Username must be 3-30 characters' })
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return res.status(400).json({ error: 'Username: letters, numbers, underscore only' })

    const hash   = await bcrypt.hash(password, 12)
    const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)]

    const { rows: [user] } = await pool.query(
      `INSERT INTO users (username, email, password, avatar)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, avatar, bio, karma, is_admin, created_at`,
      [username, email, hash, avatar]
    )

    res.status(201).json({ user, token: signToken(user) })
  } catch (err) {
    if (err.code === '23505') {
      const field = err.detail?.includes('email') ? 'Email' : 'Username'
      return res.status(409).json({ error: `${field} already taken` })
    }
    console.error(err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' })

    const { rows: [user] } = await pool.query(
      `SELECT * FROM users WHERE email = $1`, [email]
    )
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok)  return res.status(401).json({ error: 'Invalid email or password' })

    const { password: _, ...safeUser } = user
    res.json({ user: safeUser, token: signToken(user) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows: [user] } = await pool.query(
      `SELECT id, username, email, avatar, bio, karma, is_admin, created_at FROM users WHERE id = $1`,
      [req.user.id]
    )
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch user' })
  }
})

module.exports = router
