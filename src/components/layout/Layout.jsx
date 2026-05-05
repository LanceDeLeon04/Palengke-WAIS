import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSelector }                from 'react-redux'
import { useScrolled }                from '../../hooks/index.js'
import { PH_COMMODITIES }             from '../../app/store.js'
import { selectShoppingCount }        from '../../app/store.js'
import { formatPrice }                from '../../utils/helpers.js'
import {
  ShoppingCart, TrendingDown, Home, BarChart2,
  ChefHat, Menu, Zap,
} from 'lucide-react'

export function PriceTicker() {
  const items   = PH_COMMODITIES.slice(0, 12)
  const doubled = [...items, ...items]
  return (
    <div className="ticker-wrap">
      <span className="ticker-label"><Zap size={10} /> LIVE</span>
      <div className="ticker-track">
        {doubled.map((item, i) => {
          const diff = item.supermarket - item.palengke
          const pct  = ((diff/item.supermarket)*100).toFixed(0)
          return (
            <span key={`${item.id}-${i}`} className="ticker-item">
              <span>{item.name}</span>
              <strong>₱{item.palengke}/{item.unit}</strong>
              {diff > 0
                ? <span className="arrow-dn"><TrendingDown size={10} style={{display:'inline'}} /> {pct}% vs SM</span>
                : <span className="arrow-up">≈</span>
              }
            </span>
          )
        })}
      </div>
    </div>
  )
}

export function Navbar() {
  const scrolled      = useScrolled(12)
  const cartCount     = useSelector(selectShoppingCount)

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon"><ShoppingCart size={20} color="#2EC99E" /></div>
            <span className="nav-logo-text">Palengke<span>WAIS</span></span>
          </Link>

          <div className="nav-links">
            <NavLink to="/" end className={({isActive})=>`nav-link ${isActive?'active':''}`}>
              <Home size={15} /> Home
            </NavLink>
            <NavLink to="/prices" className={({isActive})=>`nav-link ${isActive?'active':''}`}>
              <BarChart2 size={15} /> Prices
            </NavLink>
            <NavLink to="/recipes" className={({isActive})=>`nav-link ${isActive?'active':''}`}>
              <ChefHat size={15} /> Recipes
              <span className="nav-badge">NEW</span>
            </NavLink>
          </div>

          <div className="nav-live">
            <span className="live-dot" />
            Live Prices
          </div>

          {/* Shopping cart with badge */}
          <NavLink to="/list" className={({isActive})=>`nav-cart-btn ${isActive?'active':''}`} title="Shopping List">
            <ShoppingCart size={18} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </NavLink>

          <button className="nav-menu-btn btn-ghost btn" aria-label="menu">
            <Menu size={20} />
          </button>
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
            <div className="footer-copy" style={{marginTop:'0.3rem'}}>
              © {new Date().getFullYear()} · Open data for every Filipino
            </div>
          </div>
          <div className="footer-links">
            <span className="footer-link-chip">DA Price Monitoring</span>
            <span className="footer-link-chip">OpenFoodFacts API</span>
            <span className="footer-link-chip">TheMealDB API</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
