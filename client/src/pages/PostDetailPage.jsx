import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  ArrowLeft, ChevronUp, ChevronDown, MessageSquare,
  Eye, Trash2, Send, Reply, Pin, Lock,
} from 'lucide-react'
import * as api from '../api/forum.js'

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (s < 60)    return `${s}s ago`
  if (s < 3600)  return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

// ── Vote Buttons ──────────────────────────────────────────────
function VoteBar({ upvotes=0, downvotes=0, targetId, targetType, userVote=0 }) {
  const user = useSelector(s => s.auth?.user)
  const navigate = useNavigate()
  const [up,  setUp]  = useState(Number(upvotes))
  const [dn,  setDn]  = useState(Number(downvotes))
  const [cur, setCur] = useState(userVote)

  const doVote = async (val) => {
    if (!user) { navigate('/forum/login'); return }
    const prev = cur
    // Optimistic
    if (val === 1)  { val===prev ? (setUp(u=>u-1), setCur(0)) : (setUp(u=>u+1), prev===-1&&setDn(d=>d-1), setCur(1)) }
    if (val === -1) { val===prev ? (setDn(d=>d-1), setCur(0)) : (setDn(d=>d+1), prev===1&&setUp(u=>u-1), setCur(-1)) }
    try { await api.vote({ target_id: targetId, target_type: targetType, value: val }) }
    catch { setUp(Number(upvotes)); setDn(Number(downvotes)); setCur(prev) }
  }

  const net = up - dn
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}>
      <button onClick={() => doVote(1)} title="Upvote"
        style={{ display:'flex', alignItems:'center', gap:'0.2rem', padding:'0.3rem 0.6rem', borderRadius:'var(--r-full)', border:`1.5px solid ${cur===1?'var(--mint)':'var(--border)'}`, background: cur===1?'rgba(46,201,158,0.12)':'white', color:cur===1?'var(--forest-3)':'var(--ink-3)', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'0.8rem', fontWeight:700, transition:'all var(--fast)' }}>
        <ChevronUp size={14}/> {up}
      </button>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.85rem', fontWeight:700, color:net>0?'var(--forest-3)':net<0?'var(--red)':'var(--ink-3)', minWidth:24, textAlign:'center' }}>{net}</span>
      <button onClick={() => doVote(-1)} title="Downvote"
        style={{ display:'flex', alignItems:'center', gap:'0.2rem', padding:'0.3rem 0.6rem', borderRadius:'var(--r-full)', border:`1.5px solid ${cur===-1?'var(--red)':'var(--border)'}`, background: cur===-1?'var(--red-dim)':'white', color:cur===-1?'var(--red)':'var(--ink-3)', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'0.8rem', fontWeight:700, transition:'all var(--fast)' }}>
        <ChevronDown size={14}/> {dn}
      </button>
    </div>
  )
}

// ── Single Comment ────────────────────────────────────────────
function Comment({ comment, postId, onReply, onDelete, userId, depth=0 }) {
  return (
    <div style={{ marginLeft: depth > 0 ? '1.5rem' : 0, borderLeft: depth > 0 ? '2px solid var(--border)' : 'none', paddingLeft: depth > 0 ? '1rem' : 0 }}>
      <div style={{ background: depth===0?'white':'var(--cream)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'0.9rem 1rem', marginBottom:'0.5rem' }}>
        {/* Author row */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem', flexWrap:'wrap' }}>
          <span style={{ fontSize:'1.1rem' }}>{comment.author_avatar}</span>
          <span style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--ink)' }}>{comment.author}</span>
          <span style={{ fontSize:'0.75rem', color:'var(--ink-3)' }}>{timeAgo(comment.created_at)}</span>
          <div style={{ marginLeft:'auto', display:'flex', gap:'0.5rem', alignItems:'center' }}>
            <VoteBar upvotes={comment.upvotes} downvotes={comment.downvotes} targetId={comment.id} targetType="comment" />
            {!comment.deleted && (
              <button onClick={() => onReply(comment)} title="Reply"
                style={{ display:'flex', alignItems:'center', gap:'0.25rem', padding:'0.25rem 0.6rem', borderRadius:'var(--r-full)', border:'1px solid var(--border)', background:'white', color:'var(--ink-3)', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'0.75rem', fontWeight:600 }}>
                <Reply size={12}/> Reply
              </button>
            )}
            {(comment.author_id === userId) && (
              <button onClick={() => onDelete(comment.id)} title="Delete"
                style={{ width:28, height:28, borderRadius:'50%', border:'none', background:'transparent', color:'var(--ink-3)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all var(--fast)' }}
                onMouseEnter={e=>{e.currentTarget.style.background='var(--red-dim)';e.currentTarget.style.color='var(--red)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--ink-3)'}}>
                <Trash2 size={13}/>
              </button>
            )}
          </div>
        </div>
        <p style={{ fontSize:'0.9rem', color:'var(--ink-2)', lineHeight:1.75, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
          {comment.body}
        </p>
      </div>
      {/* Replies */}
      {comment.replies?.map(r => (
        <Comment key={r.id} comment={r} postId={postId} onReply={onReply} onDelete={onDelete} userId={userId} depth={depth+1} />
      ))}
    </div>
  )
}

// ── Comment Input ─────────────────────────────────────────────
function CommentInput({ postId, replyTo, onCancel, onSuccess }) {
  const user     = useSelector(s => s.auth?.user)
  const navigate = useNavigate()
  const [body, setBody]   = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr]     = useState('')

  if (!user) return (
    <div style={{ background:'var(--cream-2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'1.25rem', textAlign:'center' }}>
      <p style={{ fontSize:'0.875rem', color:'var(--ink-3)', marginBottom:'0.75rem' }}>Sign in to join the conversation</p>
      <button className="btn btn-primary btn-sm" onClick={() => navigate('/forum/login')}>Sign In</button>
    </div>
  )

  const submit = async () => {
    if (!body.trim()) { setErr('Comment cannot be empty'); return }
    setLoading(true); setErr('')
    try {
      const { comment } = await api.createComment(postId, { body: body.trim(), parent_id: replyTo?.id })
      onSuccess(comment)
      setBody('')
    } catch(e) {
      setErr(e.response?.data?.error || 'Failed to post comment')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'1rem', boxShadow:'var(--s1)' }}>
      {replyTo && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.6rem', padding:'0.35rem 0.6rem', background:'var(--mint-dim)', borderRadius:'var(--r-sm)', fontSize:'0.78rem', color:'var(--forest-3)', fontWeight:600 }}>
          <span><Reply size={12} style={{ display:'inline', marginRight:4 }}/>Replying to {replyTo.author}</span>
          <button onClick={onCancel} style={{ border:'none', background:'none', cursor:'pointer', color:'var(--ink-3)', fontSize:'0.85rem' }}>✕</button>
        </div>
      )}
      {err && <p style={{ color:'var(--red)', fontSize:'0.8rem', marginBottom:'0.5rem' }}>{err}</p>}
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder={replyTo ? `Reply to ${replyTo.author}...` : 'Share your thoughts or tips...'}
        rows={4} maxLength={2000}
        style={{ width:'100%', padding:'0.75rem', borderRadius:'var(--r-md)', border:'1.5px solid var(--border)', fontFamily:'var(--font-body)', fontSize:'0.875rem', color:'var(--ink)', lineHeight:1.7, resize:'vertical', marginBottom:'0.75rem' }}/>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:'0.72rem', color:'var(--ink-3)' }}>{body.length}/2000</span>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          {replyTo && <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>}
          <button className="btn btn-primary btn-sm" onClick={submit} disabled={loading || !body.trim()}>
            <Send size={13}/> {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── POST DETAIL PAGE ──────────────────────────────────────────
export default function PostDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const user     = useSelector(s => s.auth?.user)

  const [post,     setPost]     = useState(null)
  const [comments, setComments] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [replyTo,  setReplyTo]  = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([api.getPost(id), api.getComments(id)])
      .then(([pd, cd]) => { setPost(pd.post); setComments(cd.comments) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleNewComment = (comment) => {
    if (comment.parent_id) {
      setComments(prev => addReplyToTree(prev, comment))
    } else {
      setComments(prev => [...prev, { ...comment, replies: [] }])
    }
    setReplyTo(null)
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return
    await api.deleteComment(commentId)
    setComments(prev => removeFromTree(prev, commentId))
  }

  const handleDeletePost = async () => {
    if (!confirm('Delete this post?')) return
    await api.deletePost(id)
    navigate('/forum')
  }

  if (loading) return <div className="loader-wrap" style={{ paddingTop:'5rem' }}><div className="loader-ring"/><p className="loader-txt">Loading post...</p></div>
  if (!post)   return (
    <div className="container" style={{ padding:'4rem 2rem', textAlign:'center' }}>
      <p style={{ color:'var(--ink-3)' }}>Post not found.</p>
      <button className="btn btn-dark" style={{ marginTop:'1rem' }} onClick={() => navigate('/forum')}><ArrowLeft size={15}/> Back to Forum</button>
    </div>
  )

  return (
    <div className="page-in">
      <div className="container" style={{ padding:'2rem', maxWidth:860 }}>
        {/* Back */}
        <button className="detail-back" style={{ color:'var(--ink-3)', marginBottom:'1.25rem', display:'inline-flex', alignItems:'center', gap:'0.35rem', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'0.875rem', fontWeight:600 }}
          onClick={() => navigate('/forum')}>
          <ArrowLeft size={15}/> Back to Forum
        </button>

        {/* Post */}
        <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', overflow:'hidden', boxShadow:'var(--s2)', marginBottom:'2rem' }}>
          {/* Category bar */}
          <div style={{ padding:'0.6rem 1.5rem', background:`${post.category_color}12`, borderBottom:`2px solid ${post.category_color}30`, display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <span style={{ fontSize:'0.75rem', fontWeight:700, color:post.category_color }}>{post.category_name}</span>
            {post.is_pinned && <span style={{ fontSize:'0.7rem', color:'var(--gold)', display:'flex', alignItems:'center', gap:'0.2rem' }}><Pin size={11}/>Pinned</span>}
            {post.is_locked && <span style={{ fontSize:'0.7rem', color:'var(--ink-3)', display:'flex', alignItems:'center', gap:'0.2rem' }}><Lock size={11}/>Locked</span>}
          </div>

          <div style={{ padding:'1.75rem' }}>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.3rem,3vw,1.9rem)', fontWeight:900, color:'var(--ink)', letterSpacing:'-0.02em', lineHeight:1.2, marginBottom:'0.75rem' }}>
              {post.title}
            </h1>

            {/* Author + meta */}
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap', marginBottom:'1.5rem', paddingBottom:'1.25rem', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:'1.4rem' }}>{post.author_avatar}</span>
              <div>
                <span style={{ fontWeight:700, color:'var(--ink)', fontSize:'0.9rem' }}>{post.author}</span>
                <span style={{ fontSize:'0.75rem', color:'var(--ink-3)', marginLeft:'0.5rem' }}>·</span>
                <span style={{ fontSize:'0.75rem', color:'var(--ink-3)', marginLeft:'0.5rem' }}>{timeAgo(post.created_at)}</span>
              </div>
              <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
                <span style={{ fontSize:'0.78rem', color:'var(--ink-3)', display:'flex', alignItems:'center', gap:'0.3rem' }}>
                  <Eye size={13}/> {Number(post.view_count).toLocaleString()} views
                </span>
                <span style={{ fontSize:'0.78rem', color:'var(--ink-3)', display:'flex', alignItems:'center', gap:'0.3rem' }}>
                  <MessageSquare size={13}/> {Number(post.comment_count)} comments
                </span>
                {(post.author_id === user?.id || user?.is_admin) && (
                  <button onClick={handleDeletePost} title="Delete post"
                    style={{ display:'flex', alignItems:'center', gap:'0.3rem', padding:'0.3rem 0.65rem', borderRadius:'var(--r-full)', border:'1px solid rgba(229,62,62,0.25)', background:'var(--red-dim)', color:'var(--red)', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'0.75rem', fontWeight:600 }}>
                    <Trash2 size={12}/> Delete
                  </button>
                )}
              </div>
            </div>

            {/* Body */}
            <div style={{ fontSize:'0.95rem', color:'var(--ink-2)', lineHeight:1.85, whiteSpace:'pre-wrap', wordBreak:'break-word', marginBottom:'1.5rem' }}>
              {post.body}
            </div>

            {/* Vote bar */}
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', paddingTop:'1rem', borderTop:'1px solid var(--border)' }}>
              <VoteBar upvotes={post.upvotes} downvotes={post.downvotes} targetId={post.id} targetType="post" userVote={post.userVote} />
              <button onClick={() => document.getElementById('comment-input')?.scrollIntoView({behavior:'smooth'})}
                style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.35rem 0.85rem', borderRadius:'var(--r-full)', border:'1.5px solid var(--border)', background:'white', color:'var(--ink-3)', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'0.8rem', fontWeight:600 }}>
                <MessageSquare size={13}/> Comment
              </button>
            </div>
          </div>
        </div>

        {/* Comments */}
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', fontWeight:700, color:'var(--ink)', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <MessageSquare size={18} color="var(--forest)"/>
          {comments.length} Comment{comments.length!==1?'s':''}
        </h2>

        {/* Comment input */}
        {!post.is_locked && (
          <div id="comment-input" style={{ marginBottom:'1.5rem' }}>
            <CommentInput postId={id} replyTo={replyTo} onCancel={() => setReplyTo(null)} onSuccess={handleNewComment} />
          </div>
        )}
        {post.is_locked && (
          <div style={{ background:'var(--cream-2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'0.85rem 1.1rem', marginBottom:'1.25rem', fontSize:'0.85rem', color:'var(--ink-3)', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <Lock size={14}/> This post is locked. No new comments allowed.
          </div>
        )}

        {/* Comments list */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
          {comments.length === 0 && (
            <div style={{ textAlign:'center', padding:'2.5rem', color:'var(--ink-3)' }}>
              <MessageSquare size={28} style={{ margin:'0 auto 0.75rem' }} color="var(--border-2)"/>
              <p style={{ fontWeight:600 }}>No comments yet</p>
              <p style={{ fontSize:'0.85rem', marginTop:'0.25rem' }}>Be the first to share your thoughts!</p>
            </div>
          )}
          {comments.map(c => (
            <Comment key={c.id} comment={c} postId={id} onReply={setReplyTo} onDelete={handleDeleteComment} userId={user?.id} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Helpers for comment tree manipulation
function addReplyToTree(comments, newComment) {
  return comments.map(c => {
    if (c.id === newComment.parent_id) return { ...c, replies: [...(c.replies||[]), { ...newComment, replies:[] }] }
    if (c.replies?.length) return { ...c, replies: addReplyToTree(c.replies, newComment) }
    return c
  })
}
function removeFromTree(comments, id) {
  return comments.filter(c => c.id !== id).map(c => ({ ...c, replies: c.replies ? removeFromTree(c.replies, id) : [] }))
}
