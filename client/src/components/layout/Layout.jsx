import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch }   from 'react-redux'
import { useScrolled }                from '../../hooks/index.js'
import { PH_COMMODITIES, selectShoppingCount } from '../../app/store.js'
import { logout }                     from '../../app/authSlice.js'
import {
  ShoppingCart, Home, BarChart2, ChefHat,
  MapPin, Menu, Zap, TrendingDown, MessageSquare,
  LogOut, LogIn, UserCircle,
} from 'lucide-react'

export function PriceTicker() {
  const items   = PH_COMMODITIES.slice(0, 14)
  const doubled = [...items, ...items]
  return (
    <div className="ticker-wrap"
      style={{ position:'fixed', top:'var(--nav-h)', left:0, right:0, zIndex:999, height:34 }}>
      <span className="ticker-label"><Zap size={10}/> LIVE</span>
      <div className="ticker-track">
        {doubled.map((item, i) => {
          const diff = item.supermarket - item.palengke
          const pct  = Math.abs(((diff/Math.max(item.supermarket,1))*100)).toFixed(0)
          return (
            <span key={`${item.id}-${i}`} className="ticker-item">
              <span>{item.name}</span>
              <strong>₱{item.palengke}/{item.unit}</strong>
              {diff > 0 ? <span className="arrow-dn"><TrendingDown size={10} style={{display:'inline'}}/> {pct}% vs SM</span>
               : diff < 0 ? <span className="arrow-up">SM cheaper</span>
               : <span style={{color:'rgba(255,255,255,0.5)'}}>≈</span>}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export function Navbar() {
  const scrolled  = useScrolled(12)
  const cartCount = useSelector(selectShoppingCount)
  const user      = useSelector(s => s.auth?.user)
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon"><ShoppingCart size={20} color="#2EC99E"/></div>
            <span className="nav-logo-text">Palengke<span>WAIS</span></span>
          </Link>

          <div className="nav-links">
            <NavLink to="/" end className={({isActive})=>`nav-link ${isActive?'active':''}`}><Home size={14}/> Home</NavLink>
            <NavLink to="/prices" className={({isActive})=>`nav-link ${isActive?'active':''}`}><BarChart2 size={14}/> Prices</NavLink>
            <NavLink to="/recipes" className={({isActive})=>`nav-link ${isActive?'active':''}`}><ChefHat size={14}/> Recipes <span className="nav-badge">NEW</span></NavLink>
            <NavLink to="/map" className={({isActive})=>`nav-link ${isActive?'active':''}`}><MapPin size={14}/> Markets</NavLink>
            <NavLink to="/forum" className={({isActive})=>`nav-link ${isActive?'active':''}`}><MessageSquare size={14}/> Forum</NavLink>
          </div>

          <div className="nav-live"><span className="live-dot"/>Live</div>

          {/* Cart */}
          <NavLink to="/list" className={({isActive})=>`nav-cart-btn ${isActive?'active':''}`} title="Shopping List">
            <ShoppingCart size={18}/>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </NavLink>

          {/* Auth */}
          {user ? (
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
              <span style={{fontSize:'1.1rem',lineHeight:1}} title={user.username}>{user.avatar}</span>
              <span style={{fontSize:'0.82rem',fontWeight:700,color:'var(--ink-2)',maxWidth:80,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.username}</span>
              <button className="btn btn-ghost btn-sm" onClick={()=>dispatch(logout())} title="Sign out">
                <LogOut size={15}/>
              </button>
            </div>
          ) : (
            <button className="btn btn-outline btn-sm" onClick={()=>navigate('/forum/login')}>
              <LogIn size={14}/> Sign In
            </button>
          )}

          <button className="nav-menu-btn btn-ghost btn" aria-label="menu"><Menu size={20}/></button>
        </div>
      </nav>
      <PriceTicker />
    </>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">Palengke<span>WAIS</span></div>
            <div className="footer-copy" style={{marginTop:'0.3rem'}}>© {new Date().getFullYear()} · Open data for every Filipino</div>
          </div>
          <div className="footer-links">
            <span className="footer-link-chip">DA Price Monitoring</span>
            <span className="footer-link-chip">OpenFoodFacts API</span>
            <span className="footer-link-chip">TheMealDB API</span>
            <span className="footer-link-chip">OpenStreetMap</span>
            <span className="footer-link-chip">PostgreSQL</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
