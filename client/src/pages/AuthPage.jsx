import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector }     from 'react-redux'
import { loginUser, registerUser, clearError } from '../app/authSlice.js'
import { ShoppingCart, Eye, EyeOff, User, Mail, Lock } from 'lucide-react'

export default function AuthPage() {
  const navigate   = useNavigate()
  const dispatch   = useDispatch()
  const [params]   = useSearchParams()
  const isRegister = params.get('mode') === 'register'

  const { loading, error, user } = useSelector(s => s.auth)
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ username:'', email:'', password:'' })

  useEffect(() => { if (user) navigate('/forum') }, [user, navigate])
  useEffect(() => { dispatch(clearError()) }, [isRegister, dispatch])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (isRegister) dispatch(registerUser(form))
    else            dispatch(loginUser({ email: form.email, password: form.password }))
  }

  return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ width:56, height:56, background:'var(--forest)', borderRadius:'var(--r-lg)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.75rem', boxShadow:'var(--s2)' }}>
            <ShoppingCart size={28} color="#2EC99E"/>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:900, color:'var(--ink)', letterSpacing:'-0.02em' }}>
            {isRegister ? 'Join the Community' : 'Welcome Back'}
          </h1>
          <p style={{ color:'var(--ink-3)', fontSize:'0.9rem', marginTop:'0.3rem' }}>
            {isRegister ? 'Create your Palengke WAIS account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Card */}
        <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'2rem', boxShadow:'var(--s3)' }}>
          {error && (
            <div style={{ background:'var(--red-dim)', border:'1px solid rgba(229,62,62,0.25)', borderRadius:'var(--r-md)', padding:'0.75rem 1rem', fontSize:'0.85rem', color:'var(--red)', fontWeight:600, marginBottom:'1.25rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {isRegister && (
              <div>
                <label style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--ink-2)', display:'block', marginBottom:'0.4rem' }}>Username</label>
                <div style={{ position:'relative' }}>
                  <User size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--ink-3)' }}/>
                  <input type="text" value={form.username} onChange={e=>set('username',e.target.value)}
                    placeholder="e.g. NanayMarket" required autoFocus
                    style={{ width:'100%', height:44, paddingLeft:40, paddingRight:12, borderRadius:'var(--r-md)', border:'1.5px solid var(--border)', fontFamily:'var(--font-body)', fontSize:'0.9rem', color:'var(--ink)', transition:'border var(--fast)' }}
                    onFocus={e=>e.target.style.borderColor='var(--mint)'}
                    onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                </div>
                <p style={{ fontSize:'0.72rem', color:'var(--ink-3)', marginTop:'0.3rem' }}>3–30 chars, letters/numbers/underscore only</p>
              </div>
            )}

            <div>
              <label style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--ink-2)', display:'block', marginBottom:'0.4rem' }}>Email</label>
              <div style={{ position:'relative' }}>
                <Mail size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--ink-3)' }}/>
                <input type="email" value={form.email} onChange={e=>set('email',e.target.value)}
                  placeholder="you@example.com" required autoFocus={!isRegister}
                  style={{ width:'100%', height:44, paddingLeft:40, paddingRight:12, borderRadius:'var(--r-md)', border:'1.5px solid var(--border)', fontFamily:'var(--font-body)', fontSize:'0.9rem', color:'var(--ink)', transition:'border var(--fast)' }}
                  onFocus={e=>e.target.style.borderColor='var(--mint)'}
                  onBlur={e=>e.target.style.borderColor='var(--border)'}/>
              </div>
            </div>

            <div>
              <label style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--ink-2)', display:'block', marginBottom:'0.4rem' }}>Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--ink-3)' }}/>
                <input type={show?'text':'password'} value={form.password} onChange={e=>set('password',e.target.value)}
                  placeholder={isRegister ? 'Min. 6 characters' : 'Enter your password'} required
                  style={{ width:'100%', height:44, paddingLeft:40, paddingRight:44, borderRadius:'var(--r-md)', border:'1.5px solid var(--border)', fontFamily:'var(--font-body)', fontSize:'0.9rem', color:'var(--ink)', transition:'border var(--fast)' }}
                  onFocus={e=>e.target.style.borderColor='var(--mint)'}
                  onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                <button type="button" onClick={()=>setShow(s=>!s)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', border:'none', background:'none', color:'var(--ink-3)', cursor:'pointer', display:'flex' }}>
                  {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ height:46, fontSize:'0.95rem', marginTop:'0.25rem', justifyContent:'center' }}>
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.875rem', color:'var(--ink-3)' }}>
            {isRegister ? (
              <>Already have an account? <button onClick={()=>navigate('/forum/login')} style={{ border:'none', background:'none', color:'var(--forest-3)', fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'0.875rem' }}>Sign In</button></>
            ) : (
              <>New here? <button onClick={()=>navigate('/forum/login?mode=register')} style={{ border:'none', background:'none', color:'var(--forest-3)', fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'0.875rem' }}>Create Account</button></>
            )}
          </div>
        </div>

        {/* Demo credentials */}
        <div style={{ background:'rgba(46,201,158,0.08)', border:'1px solid rgba(46,201,158,0.2)', borderRadius:'var(--r-lg)', padding:'0.85rem 1rem', marginTop:'1rem' }}>
          <p style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--forest-3)', marginBottom:'0.35rem' }}>🧪 Demo Accounts</p>
          <p style={{ fontSize:'0.75rem', color:'var(--ink-3)', lineHeight:1.7 }}>
            Admin: <code style={{ background:'var(--cream-2)', padding:'0 4px', borderRadius:3 }}>admin@palengkewais.ph</code> / <code style={{ background:'var(--cream-2)', padding:'0 4px', borderRadius:3 }}>Admin@123</code><br/>
            User: <code style={{ background:'var(--cream-2)', padding:'0 4px', borderRadius:3 }}>nanay@example.com</code> / <code style={{ background:'var(--cream-2)', padding:'0 4px', borderRadius:3 }}>User@1234</code>
          </p>
        </div>
      </div>
    </div>
  )
}
