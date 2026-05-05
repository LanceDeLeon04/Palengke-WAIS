import { useNavigate } from 'react-router-dom'
import { PH_COMMODITIES } from '../../app/store.js'
import { formatPrice, calcSavings } from '../../utils/helpers.js'

const FEATURES = [
  {
    icon: '📊', color: 'green',
    title: 'Real-Time Price Comparison',
    desc: 'Compare palengke vs. supermarket prices side-by-side. Know instantly where to buy cheaper — updated daily from DA open data.',
  },
  {
    icon: '💰', color: 'gold',
    title: 'Savings Calculator',
    desc: 'See exactly how much you save buying at the palengke vs. supermarket for every commodity. Make every peso count.',
  },
  {
    icon: '🍳', color: 'purple',
    title: 'Smart Recipe Finder',
    desc: 'Tell us what\'s in your pantry, we\'ll find Filipino recipes you can cook today — no waste, maximum flavor.',
  },
  {
    icon: '🥗', color: 'red',
    title: 'Nutrition at a Glance',
    desc: 'Get real nutritional data for every commodity from OpenFoodFacts — calories, protein, carbs and more.',
  },
  {
    icon: '📍', color: 'green',
    title: 'Regional Price Tracking',
    desc: 'Prices differ across Luzon, Visayas, and Mindanao. See what your region is paying for each essential good.',
  },
  {
    icon: '🌾', color: 'gold',
    title: 'Essential Commodities',
    desc: 'Rice, eggs, meat, fish, vegetables — the 24 goods every Filipino family buys weekly, tracked and compared.',
  },
]

// Top 3 biggest savings from the dataset
const TOP_SAVINGS = PH_COMMODITIES
  .map(c => ({ ...c, savings: c.supermarket - c.palengke }))
  .sort((a, b) => b.savings - a.savings)
  .slice(0, 3)

export function HeroSection() {
  const navigate = useNavigate()
  const featured = PH_COMMODITIES.find(c => c.id === 'c5') // Manok
  const savings  = calcSavings(featured?.palengke, featured?.supermarket)

  return (
    <section className="hero">
      <div className="hero-bg-grid" />
      <div className="hero-bg-orb hero-bg-orb-1" />
      <div className="hero-bg-orb hero-bg-orb-2" />

      <div className="container">
        <div className="hero-inner">
          {/* LEFT */}
          <div>
            <span className="hero-eyebrow">🇵🇭 Para sa Bawat Pilipino</span>

            <h1 className="hero-title">
              Alam mo ba ang<br />
              tunay na <span className="accent">presyo</span> sa<br />
              <span className="accent-gold">palengke?</span>
            </h1>

            <p className="hero-desc">
              Compare commodity prices across <strong style={{ color: 'rgba(255,255,255,0.9)' }}>palengke and supermarket</strong> — rice, fish, meat, vegetables — across all Philippine regions.
              Find recipes using ingredients you already have. Shop smarter. Eat better.
            </p>

            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/prices')}>
                Check Prices Now →
              </button>
              <button className="btn btn-outline-inv btn-lg" onClick={() => navigate('/recipes')}>
                🍳 Find Recipes
              </button>
            </div>

            <div className="hero-stats-row">
              {[
                { val: '24+',   lbl: 'Commodities' },
                { val: '12',    lbl: 'Regions' },
                { val: 'Daily', lbl: 'Updates' },
                { val: '100%',  lbl: 'Free' },
              ].map(s => (
                <div key={s.lbl} className="hero-stat">
                  <span className="hero-stat-value">{s.val}</span>
                  <span className="hero-stat-label">{s.lbl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Floating cards */}
          <div className="hero-card-stack">
            {/* Main card */}
            <div className="hero-price-card main">
              <p className="hpc-label">Commodity Comparison</p>
              <p className="hpc-title">🍗 Manok (Dressed)</p>
              <div className="hpc-price-row">
                <div className="hpc-price">
                  <span className="hpc-price-lbl mint">🏪 Palengke</span>
                  <span className="hpc-price-val">₱185</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 2, background: '#E8EDE9', margin: '0 1rem 0.5rem' }} />
                </div>
                <div className="hpc-price">
                  <span className="hpc-price-lbl">🏬 Supermarket</span>
                  <span className="hpc-price-val" style={{ color: '#2D4A38', opacity: 0.55 }}>₱220</span>
                </div>
              </div>
              <div className="hpc-savings">💰 Save ₱35 (15.9%) at palengke</div>
            </div>

            {/* Sub card 1 — dark top savings */}
            <div className="hero-price-card sub-1">
              <p className="hpc-mini-label">📈 Today's Top Savings</p>
              {TOP_SAVINGS.map(c => (
                <div key={c.id} className="hpc-mini-item">
                  <span>{c.name}</span>
                  <span className="hpc-mini-price">Save ₱{c.savings}</span>
                </div>
              ))}
            </div>

            {/* Sub card 2 — light, rice */}
            <div className="hero-price-card sub-2">
              <p className="hpc-label">🌾 Well-milled Rice</p>
              <div className="hpc-price-row" style={{ flexDirection: 'column', gap: '0.3rem' }}>
                <div className="hpc-price">
                  <span className="hpc-price-lbl mint">Palengke</span>
                  <span className="hpc-price-val">₱46/kg</span>
                </div>
                <div className="hpc-price">
                  <span className="hpc-price-lbl">Supermarket</span>
                  <span className="hpc-price-val" style={{ fontSize: '1rem', opacity: 0.6 }}>₱58/kg</span>
                </div>
              </div>
              <div className="hpc-savings">Save ₱12/kg</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function FeaturesSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-header center">
          <p className="section-label">Why Palengke WAIS?</p>
          <h2 className="section-title">Everything you need to shop smart</h2>
          <p className="section-sub center" style={{ marginTop: '0.5rem' }}>
            Powered by open government data and real APIs — free forever.
          </p>
        </div>

        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="feature-card" style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`feature-icon ${f.color}`}>{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ApiSection() {
  return (
    <section className="section section-dark">
      <div className="container" style={{ textAlign: 'center' }}>
        <p className="section-label" style={{ justifyContent: 'center' }}>Powered By</p>
        <h2 className="section-title inv" style={{ marginBottom: '0.5rem' }}>Built on Real, Open APIs</h2>
        <p className="section-sub inv center" style={{ marginBottom: '1.5rem' }}>
          No fake data. Every price, recipe, and nutrition fact comes from live public APIs.
        </p>
        <div className="api-strip">
          {[
            { label: 'DA Price Monitoring', sub: 'data.gov.ph' },
            { label: 'OpenFoodFacts',       sub: 'world.openfoodfacts.org' },
            { label: 'TheMealDB',           sub: 'themealdb.com' },
            { label: 'Redux Toolkit',       sub: 'RTK Query' },
            { label: 'React Router v6',     sub: 'SPA Routing' },
            { label: 'Recharts',            sub: 'Price Trends' },
          ].map(a => (
            <div key={a.label} className="api-badge">
              <span className="api-badge-dot" />
              <span><strong>{a.label}</strong> · {a.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CtaSection() {
  const navigate = useNavigate()
  return (
    <section className="section section-muted">
      <div className="container" style={{ textAlign: 'center' }}>
        <p className="section-label" style={{ justifyContent: 'center' }}>Ready?</p>
        <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>
          Start shopping smarter today
        </h2>
        <p className="section-sub center" style={{ marginBottom: '2rem' }}>
          Know the real price before you go to the palengke or supermarket.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-dark btn-lg" onClick={() => navigate('/prices')}>
            📊 See All Prices
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate('/recipes')}>
            🍳 Find Recipes
          </button>
        </div>
      </div>
    </section>
  )
}
