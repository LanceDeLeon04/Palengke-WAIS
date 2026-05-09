import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams }     from 'react-router-dom'
import { useSelector }                       from 'react-redux'
import {
  MessageSquare, TrendingUp, Clock, Flame,
  Plus, ChevronUp, ChevronDown, Eye,
  Pin, Lock, Tag, Users, BarChart2,
} from 'lucide-react'
import * as api from '../api/forum.js'

// ── Helpers ───────────────────────────────────────────────────
function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (s < 60)   return `${s}s ago`
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400)return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

function formatNum(n) {
  n = Number(n)
  if (n >= 1000) return `${(n/1000).toFixed(1)}k`
  return String(n)
}

const SORT_OPTS = [
  { key:'hot', label:'Hot',  Icon: Flame },
  { key:'new', label:'New',  Icon: Clock },
  { key:'top', label:'Top',  Icon: TrendingUp },
]

// ── Category Sidebar ──────────────────────────────────────────
function CategorySidebar({ categories, activeSlug, onSelect }) {
  return (
    <aside style={{ position:'sticky', top:'calc(var(--chrome-h) + 1.5rem)' }}>
      <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', overflow:'hidden', boxShadow:'var(--s1)' }}>
        <div style={{ padding:'1rem 1.25rem', background:'linear-gradient(135deg,var(--forest),var(--forest-2))', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <MessageSquare size={16} color="#2EC99E"/>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', fontWeight:700, color:'white' }}>Categories</span>
        </div>
        <div style={{ padding:'0.5rem' }}>
          <button
            onClick={() => onSelect(null)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.6rem 0.75rem', borderRadius:'var(--r-md)', border:'none', cursor:'pointer', background: !activeSlug ? 'rgba(46,201,158,0.1)' : 'transparent', color: !activeSlug ? 'var(--forest-3)' : 'var(--ink-2)', fontFamily:'var(--font-body)', fontSize:'0.875rem', fontWeight: !activeSlug ? 700 : 500, transition:'all var(--fast)', textAlign:'left' }}>
            <span style={{ fontSize:'1rem' }}>🏠</span>
            <span style={{ flex:1 }}>All Posts</span>
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => onSelect(cat.slug)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.6rem 0.75rem', borderRadius:'var(--r-md)', border:'none', cursor:'pointer', background: activeSlug===cat.slug ? `${cat.color}15` : 'transparent', color: activeSlug===cat.slug ? cat.color : 'var(--ink-2)', fontFamily:'var(--font-body)', fontSize:'0.875rem', fontWeight: activeSlug===cat.slug ? 700 : 500, transition:'all var(--fast)', textAlign:'left' }}>
              <span style={{ fontSize:'1rem' }}>{cat.icon}</span>
              <span style={{ flex:1 }}>{cat.name}</span>
              <span style={{ fontSize:'0.72rem', background:'var(--cream-2)', color:'var(--ink-3)', padding:'0.1rem 0.45rem', borderRadius:'99px', fontWeight:600 }}>{formatNum(cat.post_count)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Community stats */}
      <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'1.1rem 1.25rem', marginTop:'1rem', boxShadow:'var(--s1)' }}>
        <p style={{ fontFamily:'var(--font-display)', fontSize:'0.875rem', fontWeight:700, color:'var(--ink)', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
          <Users size={14}/> Community
        </p>
        {[
          { label:'Discussion forum for everyday Filipinos' },
          { label:'Share tips, recipes & market insights' },
          { label:'Help each other shop smarter' },
        ].map((t,i) => (
          <p key={i} style={{ fontSize:'0.8rem', color:'var(--ink-3)', lineHeight:1.6, marginBottom:'0.35rem' }}>• {t.label}</p>
        ))}
      </div>
    </aside>
  )
}

// ── Post Card ─────────────────────────────────────────────────
function PostCard({ post, onOpen }) {
  const net = (post.upvotes||0) - (post.downvotes||0)
  return (
    <article
      onClick={() => onOpen(post.id)}
      style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'1rem 1.25rem', cursor:'pointer', transition:'all var(--fast) var(--ease)', display:'flex', gap:'1rem', alignItems:'flex-start' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--mint)'; e.currentTarget.style.boxShadow='var(--s2)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none' }}
    >
      {/* Vote column */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.2rem', minWidth:36, flexShrink:0 }}>
        <ChevronUp size={18} color="var(--ink-3)"/>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.9rem', fontWeight:700, color: net>0?'var(--forest-3)':net<0?'var(--red)':'var(--ink-3)' }}>{formatNum(net)}</span>
        <ChevronDown size={18} color="var(--ink-3)"/>
      </div>

      {/* Content */}
      <div style={{ flex:1, minWidth:0 }}>
        {/* Category + badges */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', flexWrap:'wrap', marginBottom:'0.35rem' }}>
          <span style={{ fontSize:'0.72rem', fontWeight:700, padding:'0.15rem 0.55rem', borderRadius:'99px', background:`${post.category_color}18`, color:post.category_color, border:`1px solid ${post.category_color}30` }}>
            {post.category_name}
          </span>
          {post.is_pinned && <span style={{ fontSize:'0.68rem', fontWeight:700, color:'var(--gold)', display:'flex', alignItems:'center', gap:'0.2rem' }}><Pin size={10}/>Pinned</span>}
          {post.is_locked && <span style={{ fontSize:'0.68rem', fontWeight:700, color:'var(--ink-3)', display:'flex', alignItems:'center', gap:'0.2rem' }}><Lock size={10}/>Locked</span>}
        </div>

        {/* Title */}
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:700, color:'var(--ink)', lineHeight:1.3, marginBottom:'0.35rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p style={{ fontSize:'0.83rem', color:'var(--ink-3)', lineHeight:1.6, marginBottom:'0.5rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {post.excerpt}
          </p>
        )}

        {/* Meta row */}
        <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap', fontSize:'0.76rem', color:'var(--ink-3)', fontWeight:500 }}>
          <span style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
            <span style={{ fontSize:'0.9rem' }}>{post.author_avatar}</span> {post.author}
          </span>
          <span>{timeAgo(post.created_at)}</span>
          <span style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}>
            <MessageSquare size={12}/> {formatNum(post.comment_count)} comments
          </span>
          <span style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}>
            <Eye size={12}/> {formatNum(post.view_count)}
          </span>
        </div>
      </div>
    </article>
  )
}

// ── New Post Modal ────────────────────────────────────────────
function NewPostModal({ categories, onClose, onCreated }) {
  const [form, setForm]   = useState({ title:'', body:'', category_id:'' })
  const [err, setErr]     = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!form.title.trim() || !form.body.trim() || !form.category_id) {
      setErr('All fields are required'); return
    }
    setLoading(true); setErr('')
    try {
      const { post } = await api.createPost(form)
      onCreated(post)
      onClose()
    } catch(e) {
      setErr(e.response?.data?.error || 'Failed to create post')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(10,30,20,0.7)', backdropFilter:'blur(6px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', animation:'fadeIn 0.2s ease both' }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:'white', borderRadius:'var(--r-xl)', width:'100%', maxWidth:640, boxShadow:'var(--s4)', animation:'scaleIn 0.2s var(--spring) both', overflow:'hidden' }}>
        <div style={{ padding:'1.25rem 1.5rem', background:'linear-gradient(135deg,var(--forest),var(--forest-2))', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:700, color:'white', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <Plus size={18}/> Create New Post
          </span>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'white', width:30, height:30, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>✕</button>
        </div>
        <div style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
          {err && <div style={{ background:'var(--red-dim)', border:'1px solid rgba(229,62,62,0.25)', borderRadius:'var(--r-md)', padding:'0.75rem 1rem', fontSize:'0.85rem', color:'var(--red)', fontWeight:600 }}>{err}</div>}

          <div>
            <label style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--ink-2)', display:'block', marginBottom:'0.4rem' }}>Category</label>
            <select value={form.category_id} onChange={e => setForm(f => ({...f, category_id: e.target.value}))}
              style={{ width:'100%', height:40, padding:'0 0.85rem', borderRadius:'var(--r-md)', border:'1.5px solid var(--border)', background:'white', fontFamily:'var(--font-body)', fontSize:'0.875rem', color:'var(--ink)', cursor:'pointer' }}>
              <option value="">Select a category...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--ink-2)', display:'block', marginBottom:'0.4rem' }}>Title</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))}
              placeholder="What's on your mind about prices or palengke tips?"
              maxLength={300}
              style={{ width:'100%', height:44, padding:'0 0.875rem', borderRadius:'var(--r-md)', border:'1.5px solid var(--border)', fontFamily:'var(--font-body)', fontSize:'0.925rem', color:'var(--ink)' }}/>
            <p style={{ fontSize:'0.72rem', color:'var(--ink-3)', marginTop:'0.25rem', textAlign:'right' }}>{form.title.length}/300</p>
          </div>

          <div>
            <label style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--ink-2)', display:'block', marginBottom:'0.4rem' }}>Post Body</label>
            <textarea value={form.body} onChange={e => setForm(f => ({...f, body:e.target.value}))}
              placeholder="Share your thoughts, tips, recipes, or market observations..."
              rows={8} maxLength={10000}
              style={{ width:'100%', padding:'0.75rem 0.875rem', borderRadius:'var(--r-md)', border:'1.5px solid var(--border)', fontFamily:'var(--font-body)', fontSize:'0.875rem', color:'var(--ink)', lineHeight:1.7, resize:'vertical' }}/>
            <p style={{ fontSize:'0.72rem', color:'var(--ink-3)', marginTop:'0.25rem', textAlign:'right' }}>{form.body.length}/10000</p>
          </div>

          <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={loading}>
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── MAIN FORUM PAGE ───────────────────────────────────────────
export default function ForumPage() {
  const navigate     = useNavigate()
  const [params]     = useSearchParams()
  const user         = useSelector(s => s.auth?.user)

  const [categories, setCategories] = useState([])
  const [posts,      setPosts]      = useState([])
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(1)
  const [sort,       setSort]       = useState('hot')
  const [category,   setCategory]   = useState(params.get('cat') || null)
  const [loading,    setLoading]    = useState(true)
  const [showNew,    setShowNew]    = useState(false)

  const PER_PAGE = 15

  useEffect(() => {
    api.getCategories().then(d => setCategories(d.categories)).catch(() => {})
  }, [])

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const d = await api.getPosts({ category, sort, page, limit: PER_PAGE })
      setPosts(d.posts)
      setTotal(d.total)
    } catch { setPosts([]) }
    finally  { setLoading(false) }
  }, [category, sort, page])

  useEffect(() => { loadPosts() }, [loadPosts])

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="page-in">
      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,var(--forest) 0%,var(--forest-2) 100%)', padding:'2.5rem 0', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(46,201,158,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(46,201,158,.05) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }}/>
        <div className="container" style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <div>
              <p className="section-label" style={{ color:'var(--mint)' }}>
                <MessageSquare size={12} style={{ display:'inline', marginRight:4 }}/>
                Community Forum
              </p>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:900, color:'white', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:'0.5rem' }}>
                Palengke WAIS Forum
              </h1>
              <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.95rem', maxWidth:520 }}>
                Discuss prices, share palengke tips, exchange recipes, and help fellow Filipinos shop smarter.
              </p>
            </div>
            {user ? (
              <button className="btn btn-primary btn-lg" onClick={() => setShowNew(true)}>
                <Plus size={16}/> New Post
              </button>
            ) : (
              <button className="btn btn-outline-inv" onClick={() => navigate('/forum/login')}>
                Sign in to post
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding:'2rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:'2rem', alignItems:'start' }}>

          {/* Sidebar */}
          <CategorySidebar categories={categories} activeSlug={category} onSelect={slug => { setCategory(slug); setPage(1) }} />

          {/* Main */}
          <div>
            {/* Sort tabs */}
            <div style={{ display:'flex', alignItems:'center', gap:'0.25rem', marginBottom:'1.25rem', borderBottom:'2px solid var(--border)', paddingBottom:'0.5rem' }}>
              {SORT_OPTS.map(({ key, label, Icon }) => (
                <button key={key} onClick={() => { setSort(key); setPage(1) }}
                  style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.5rem 0.9rem', borderRadius:'var(--r-full)', fontFamily:'var(--font-body)', fontSize:'0.875rem', fontWeight: sort===key ? 700 : 500, border:'none', cursor:'pointer', background: sort===key ? 'var(--forest)' : 'transparent', color: sort===key ? 'white' : 'var(--ink-3)', transition:'all var(--fast)' }}>
                  <Icon size={14}/> {label}
                </button>
              ))}
              <span style={{ marginLeft:'auto', fontSize:'0.8rem', color:'var(--ink-3)', fontWeight:500 }}>
                {total} post{total !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Posts */}
            {loading ? (
              <div className="loader-wrap"><div className="loader-ring"/><p className="loader-txt">Loading posts...</p></div>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><MessageSquare size={32} color="var(--ink-3)"/></div>
                <h3 className="empty-title">No posts yet</h3>
                <p className="empty-desc">Be the first to start a conversation in this category.</p>
                {user && <button className="btn btn-primary" onClick={() => setShowNew(true)} style={{ marginTop:'0.5rem' }}><Plus size={14}/> Create First Post</button>}
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                {posts.map(post => (
                  <PostCard key={post.id} post={post} onOpen={id => navigate(`/forum/post/${id}`)} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination" style={{ marginTop:'1.5rem' }}>
                <button className="page-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>←</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_,i) => i+1).map(p => (
                  <button key={p} className={`page-btn ${p===page?'active':''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="page-btn" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>→</button>
                <span className="page-info">{page}/{totalPages}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNew && (
        <NewPostModal
          categories={categories}
          onClose={() => setShowNew(false)}
          onCreated={() => loadPosts()}
        />
      )}
    </div>
  )
}
