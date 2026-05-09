const router = require('express').Router()
const pool   = require('../db/pool')
const { requireAuth, optionalAuth } = require('../middleware/auth')

// ─── CATEGORIES ──────────────────────────────────────────────

// GET /api/forum/categories
router.get('/categories', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM posts p WHERE p.category_id = c.id) AS post_count
      FROM categories c ORDER BY c.id
    `)
    res.json({ categories: rows })
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch categories' })
  }
})

// ─── POSTS ───────────────────────────────────────────────────

// GET /api/forum/posts?category=&sort=hot&page=1&limit=10
router.get('/posts', optionalAuth, async (req, res) => {
  try {
    const { category, sort = 'hot', page = 1, limit = 10 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    let orderBy = 'p.created_at DESC'
    if (sort === 'hot')  orderBy = '(p.upvotes - p.downvotes) DESC, p.created_at DESC'
    if (sort === 'new')  orderBy = 'p.created_at DESC'
    if (sort === 'top')  orderBy = 'p.upvotes DESC'

    const where   = category ? 'AND c.slug = $3' : ''
    const params  = category ? [parseInt(limit), offset, category] : [parseInt(limit), offset]

    const { rows: posts } = await pool.query(`
      SELECT
        p.id, p.title, LEFT(p.body, 200) AS excerpt,
        p.upvotes, p.downvotes, p.view_count,
        p.is_pinned, p.is_locked, p.created_at,
        u.id AS author_id, u.username AS author, u.avatar AS author_avatar,
        c.id AS category_id, c.slug AS category_slug,
        c.name AS category_name, c.color AS category_color,
        (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id) AS comment_count
      FROM posts p
      JOIN users u ON u.id = p.user_id
      JOIN categories c ON c.id = p.category_id
      WHERE 1=1 ${where}
      ORDER BY p.is_pinned DESC, ${orderBy}
      LIMIT $1 OFFSET $2
    `, params)

    const { rows: [{ total }] } = await pool.query(
      `SELECT COUNT(*) AS total FROM posts p
       JOIN categories c ON c.id = p.category_id
       WHERE 1=1 ${category ? 'AND c.slug = $1' : ''}`,
      category ? [category] : []
    )

    res.json({ posts, total: parseInt(total), page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not fetch posts' })
  }
})

// GET /api/forum/posts/:id
router.get('/posts/:id', optionalAuth, async (req, res) => {
  try {
    // Increment view count
    await pool.query(`UPDATE posts SET view_count = view_count + 1 WHERE id = $1`, [req.params.id])

    const { rows: [post] } = await pool.query(`
      SELECT
        p.*,
        u.id AS author_id, u.username AS author,
        u.avatar AS author_avatar, u.karma AS author_karma,
        c.slug AS category_slug, c.name AS category_name, c.color AS category_color,
        (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id) AS comment_count
      FROM posts p
      JOIN users u ON u.id = p.user_id
      JOIN categories c ON c.id = p.category_id
      WHERE p.id = $1
    `, [req.params.id])

    if (!post) return res.status(404).json({ error: 'Post not found' })

    // Fetch user's vote if logged in
    let userVote = 0
    if (req.user) {
      const { rows: [v] } = await pool.query(
        `SELECT value FROM votes WHERE user_id=$1 AND target_id=$2 AND target_type='post'`,
        [req.user.id, post.id]
      )
      userVote = v?.value ?? 0
    }

    res.json({ post: { ...post, userVote } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not fetch post' })
  }
})

// POST /api/forum/posts
router.post('/posts', requireAuth, async (req, res) => {
  try {
    const { title, body, category_id } = req.body
    if (!title?.trim() || !body?.trim() || !category_id)
      return res.status(400).json({ error: 'Title, body, and category are required' })
    if (title.length > 300)
      return res.status(400).json({ error: 'Title too long (max 300 chars)' })
    if (body.length > 10000)
      return res.status(400).json({ error: 'Post too long (max 10000 chars)' })

    const { rows: [post] } = await pool.query(`
      INSERT INTO posts (title, body, user_id, category_id)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [title.trim(), body.trim(), req.user.id, category_id])

    await pool.query(`UPDATE categories SET post_count = post_count + 1 WHERE id = $1`, [category_id])

    res.status(201).json({ post })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not create post' })
  }
})

// DELETE /api/forum/posts/:id
router.delete('/posts/:id', requireAuth, async (req, res) => {
  try {
    const { rows: [post] } = await pool.query(`SELECT * FROM posts WHERE id = $1`, [req.params.id])
    if (!post) return res.status(404).json({ error: 'Post not found' })
    if (post.user_id !== req.user.id && !req.user.is_admin)
      return res.status(403).json({ error: 'Not authorized' })

    await pool.query(`DELETE FROM posts WHERE id = $1`, [req.params.id])
    await pool.query(`UPDATE categories SET post_count = GREATEST(post_count - 1, 0) WHERE id = $1`, [post.category_id])

    res.json({ message: 'Post deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Could not delete post' })
  }
})

// ─── COMMENTS ────────────────────────────────────────────────

// GET /api/forum/posts/:id/comments
router.get('/posts/:id/comments', optionalAuth, async (req, res) => {
  try {
    const { rows: comments } = await pool.query(`
      SELECT
        c.id, c.body, c.parent_id, c.upvotes, c.downvotes, c.created_at,
        u.id AS author_id, u.username AS author, u.avatar AS author_avatar
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `, [req.params.id])

    // Nest replies under parents
    const map   = {}
    const roots = []
    comments.forEach(c => { map[c.id] = { ...c, replies: [] } })
    comments.forEach(c => {
      if (c.parent_id && map[c.parent_id]) map[c.parent_id].replies.push(map[c.id])
      else roots.push(map[c.id])
    })

    res.json({ comments: roots })
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch comments' })
  }
})

// POST /api/forum/posts/:id/comments
router.post('/posts/:id/comments', requireAuth, async (req, res) => {
  try {
    const { body, parent_id } = req.body
    if (!body?.trim()) return res.status(400).json({ error: 'Comment body required' })
    if (body.length > 2000) return res.status(400).json({ error: 'Comment too long (max 2000 chars)' })

    const { rows: [comment] } = await pool.query(`
      INSERT INTO comments (body, user_id, post_id, parent_id)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [body.trim(), req.user.id, req.params.id, parent_id || null])

    // Fetch with author
    const { rows: [full] } = await pool.query(`
      SELECT c.*, u.username AS author, u.avatar AS author_avatar
      FROM comments c JOIN users u ON u.id = c.user_id WHERE c.id = $1
    `, [comment.id])

    res.status(201).json({ comment: { ...full, replies: [] } })
  } catch (err) {
    res.status(500).json({ error: 'Could not add comment' })
  }
})

// DELETE /api/forum/comments/:id
router.delete('/comments/:id', requireAuth, async (req, res) => {
  try {
    const { rows: [c] } = await pool.query(`SELECT * FROM comments WHERE id = $1`, [req.params.id])
    if (!c) return res.status(404).json({ error: 'Comment not found' })
    if (c.user_id !== req.user.id && !req.user.is_admin)
      return res.status(403).json({ error: 'Not authorized' })
    await pool.query(`DELETE FROM comments WHERE id = $1`, [req.params.id])
    res.json({ message: 'Comment deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Could not delete comment' })
  }
})

// ─── VOTES ───────────────────────────────────────────────────

// POST /api/forum/vote
router.post('/vote', requireAuth, async (req, res) => {
  try {
    const { target_id, target_type, value } = req.body
    if (!['post','comment'].includes(target_type)) return res.status(400).json({ error: 'Invalid target_type' })
    if (![-1, 1].includes(Number(value))) return res.status(400).json({ error: 'Value must be 1 or -1' })

    const table = target_type === 'post' ? 'posts' : 'comments'

    // Check if already voted
    const { rows: [existing] } = await pool.query(
      `SELECT * FROM votes WHERE user_id=$1 AND target_id=$2 AND target_type=$3`,
      [req.user.id, target_id, target_type]
    )

    if (existing) {
      if (existing.value === Number(value)) {
        // Un-vote
        await pool.query(`DELETE FROM votes WHERE id = $1`, [existing.id])
        await pool.query(
          `UPDATE ${table} SET ${value === 1 ? 'upvotes' : 'downvotes'} = GREATEST(${value === 1 ? 'upvotes' : 'downvotes'} - 1, 0) WHERE id = $1`,
          [target_id]
        )
        return res.json({ removed: true, value: 0 })
      } else {
        // Change vote
        await pool.query(`UPDATE votes SET value=$1 WHERE id=$2`, [value, existing.id])
        if (value === 1) {
          await pool.query(`UPDATE ${table} SET upvotes=upvotes+1, downvotes=GREATEST(downvotes-1,0) WHERE id=$1`, [target_id])
        } else {
          await pool.query(`UPDATE ${table} SET downvotes=downvotes+1, upvotes=GREATEST(upvotes-1,0) WHERE id=$1`, [target_id])
        }
        return res.json({ changed: true, value })
      }
    }

    // New vote
    await pool.query(
      `INSERT INTO votes (user_id, target_id, target_type, value) VALUES ($1,$2,$3,$4)`,
      [req.user.id, target_id, target_type, value]
    )
    await pool.query(
      `UPDATE ${table} SET ${value === 1 ? 'upvotes' : 'downvotes'} = ${value === 1 ? 'upvotes' : 'downvotes'} + 1 WHERE id = $1`,
      [target_id]
    )

    // Update author karma
    await pool.query(
      `UPDATE users SET karma = karma + $1 WHERE id = (SELECT user_id FROM ${table} WHERE id = $2)`,
      [value, target_id]
    )

    res.json({ voted: true, value })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not register vote' })
  }
})

module.exports = router
