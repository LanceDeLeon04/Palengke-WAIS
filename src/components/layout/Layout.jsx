import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useScrolled }                from '../../hooks/index.js'
import { PH_COMMODITIES }            from '../../app/store.js'
import { formatPrice }                from '../../utils/helpers.js'

// ─── TICKER ──────────────────────────────────────────────────
export function PriceTicker() {
  const items = PH_COMMODITIES.slice(0, 12)
  const doubled = [...items, ...items] // duplicate for seamless loop

  return (
    <div className="ticker-wrap">
      <span className="ticker-label">🔴 LIVE</span>
      <div className="ticker-track">
        {doubled.map((item, i) => {
          const diff = item.supermarket - item.palengke
          const pct  = ((diff / item.supermarket) * 100).toFixed(0)
          return (
            <span key={`${item.id}-${i}`} className="ticker-item">
              <span>{item.name}</span>
              <strong>₱{item.palengke}/{item.unit}</strong>
              <span className={diff > 0 ? 'arrow-dn' : 'arrow-up'}>
                {diff > 0 ? `↓${pct}% vs SM` : '≈'}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

// ─── NAVBAR ──────────────────────────────────────────────────
export function Navbar() {
  const scrolled  = useScrolled(12)
  const navigate  = useNavigate()

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">🛒</div>
            <span className="nav-logo-text">
              Palengke<span>WAIS</span>
            </span>
          </Link>

          <div className="nav-links">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              🏠 Home
            </NavLink>
            <NavLink to="/prices" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              📊 Prices
            </NavLink>
            <NavLink to="/recipes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              🍳 Recipes
              <span className="nav-badge">NEW</span>
            </NavLink>
          </div>

          <div className="nav-live">
            <span className="live-dot" />
            Live Prices
          </div>

          <button className="nav-cta btn" onClick={() => navigate('/prices')}>
            Check Prices →
          </button>

          {/* Mobile menu button */}
          <button className="nav-menu-btn btn-ghost btn" aria-label="menu">☰</button>
        </div>
      </nav>
      <PriceTicker />
    </>
  )
}

// ─── FOOTER ──────────────────────────────────────────────────
export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">Palengke<span>WAIS</span></div>
            <div className="footer-copy" style={{ marginTop: '0.3rem' }}>
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
