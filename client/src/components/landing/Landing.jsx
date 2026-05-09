import { useNavigate } from 'react-router-dom'
import { PH_COMMODITIES } from '../../app/store.js'
import { formatPrice, calcSavings } from '../../utils/helpers.js'
import { TrendingDown, MapPin, ChefHat, Leaf, BarChart2, ShoppingCart, Zap, Navigation } from 'lucide-react'

const TOP_SAVINGS = PH_COMMODITIES
  .map(c => ({ ...c, savings: c.supermarket - c.palengke }))
  .filter(c => c.savings > 0)
  .sort((a,b) => b.savings - a.savings)
  .slice(0, 3)

const FEATURES = [
  { icon:<BarChart2 size={24}/>, color:'green', title:'Real-Time Price Comparison', desc:'Compare palengke vs. supermarket prices for 80+ essential goods daily. Some items are cheaper at the supermarket — we show you which.' },
  { icon:<TrendingDown size={24}/>, color:'gold', title:'Savings Calculator', desc:'See exactly how much peso you save or lose per item. Includes DA Suggested Retail Price reference for every commodity.' },
  { icon:<ChefHat size={24}/>, color:'purple', title:'Filipino Recipe Finder', desc:'Tell us what\'s in your pantry (manok, kamatis, bawang) and we\'ll find real Filipino dishes you can cook today.' },
  { icon:<Leaf size={24}/>, color:'red', title:'Nutrition at a Glance', desc:'Live nutritional data per commodity from OpenFoodFacts — calories, protein, carbs, and more for informed buying.' },
  { icon:<MapPin size={24}/>, color:'green', title:'Market Locator', desc:'Find the nearest palengke and supermarkets from your current location using real OpenStreetMap data. Get directions instantly.' },
  { icon:<ShoppingCart size={24}/>, color:'gold', title:'Smart Shopping List', desc:'Build your shopping list, set quantities, choose which items to buy at palengke vs. SM, and download as .txt or .csv.' },
]

export function HeroSection() {
  const navigate = useNavigate()
  return (
    <section className="hero">
      <div className="hero-bg-grid"/>
      <div className="hero-bg-orb hero-bg-orb-1"/>
      <div className="hero-bg-orb hero-bg-orb-2"/>
      <div className="container">
        <div className="hero-inner">
          <div>
            <span className="hero-eyebrow"><Zap size={11}/> 🇵🇭 Para sa Bawat Pilipino</span>
            <h1 className="hero-title">
              Alam mo ba ang<br/>
              tunay na <span className="accent">presyo</span> sa<br/>
              <span className="accent-gold">palengke?</span>
            </h1>
            <p className="hero-desc">
              Compare commodity prices across <strong style={{ color:'rgba(255,255,255,0.9)' }}>palengke and supermarket</strong> — rice, fish, meat, vegetables — across all Philippine regions. Find Filipino recipes with what you have. Shop smarter.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={()=>navigate('/prices')}>
                <BarChart2 size={16}/> Check Prices Now
              </button>
              <button className="btn btn-outline-inv btn-lg" onClick={()=>navigate('/map')}>
                <Navigation size={16}/> Find Nearest Market
              </button>
            </div>
            <div className="hero-stats-row">
              {[
                { val:`${PH_COMMODITIES.length}+`, lbl:'Commodities' },
                { val:'12',    lbl:'Regions' },
                { val:'Daily', lbl:'Updates' },
                { val:'Free',  lbl:'Always' },
              ].map(s=>(
                <div key={s.lbl} className="hero-stat">
                  <span className="hero-stat-value">{s.val}</span>
                  <span className="hero-stat-label">{s.lbl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating cards */}
          <div className="hero-card-stack">
            <div className="hero-price-card main">
              <p className="hpc-label">Price Comparison</p>
              <p className="hpc-title">🍗 Manok (Dressed)</p>
              <div className="hpc-price-row">
                <div className="hpc-price">
                  <span className="hpc-price-lbl mint">🏪 Palengke</span>
                  <span className="hpc-price-val">₱185</span>
                </div>
                <div style={{ flex:1 }}><div style={{ height:2, background:'#E8EDE9', margin:'0 1rem 0.5rem' }}/></div>
                <div className="hpc-price">
                  <span className="hpc-price-lbl">🏬 Supermarket</span>
                  <span className="hpc-price-val" style={{ color:'#2D4A38', opacity:0.55 }}>₱220</span>
                </div>
              </div>
              <div className="hpc-savings"><TrendingDown size={12}/> Save ₱35 (15.9%) at palengke</div>
            </div>
            <div className="hero-price-card sub-1">
              <p className="hpc-mini-label">📈 Today's Top Savings</p>
              {TOP_SAVINGS.map(c=>(
                <div key={c.id} className="hpc-mini-item">
                  <span>{c.name}</span>
                  <span className="hpc-mini-price">Save ₱{c.savings}</span>
                </div>
              ))}
            </div>
            <div className="hero-price-card sub-2">
              <p className="hpc-label">🌾 Well-milled Rice</p>
              <div className="hpc-price-row" style={{ flexDirection:'column', gap:'0.3rem' }}>
                <div className="hpc-price">
                  <span className="hpc-price-lbl mint">Palengke</span>
                  <span className="hpc-price-val">₱46/kg</span>
                </div>
                <div className="hpc-price">
                  <span className="hpc-price-lbl">Supermarket</span>
                  <span className="hpc-price-val" style={{ fontSize:'1rem', opacity:0.6 }}>₱54/kg</span>
                </div>
              </div>
              <div className="hpc-savings">Save ₱8/kg</div>
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
          <p className="section-sub center" style={{ marginTop:'0.5rem' }}>Powered by open government and public APIs — free forever.</p>
        </div>
        <div className="feature-grid">
          {FEATURES.map((f,i)=>(
            <div key={f.title} className="feature-card" style={{ animationDelay:`${i*80}ms` }}>
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
      <div className="container" style={{ textAlign:'center' }}>
        <p className="section-label" style={{ justifyContent:'center' }}>Powered By</p>
        <h2 className="section-title inv" style={{ marginBottom:'0.5rem' }}>Built on Real, Open APIs</h2>
        <p className="section-sub inv center" style={{ marginBottom:'1.5rem' }}>No fake data. Every price, recipe, nutrition fact, and market location is live.</p>
        <div className="api-strip">
          {[
            { label:'DA Price Monitoring', sub:'data.gov.ph' },
            { label:'OpenFoodFacts',       sub:'world.openfoodfacts.org' },
            { label:'TheMealDB',           sub:'themealdb.com' },
            { label:'OpenStreetMap',       sub:'overpass-api.de' },
            { label:'Redux Toolkit',       sub:'RTK Query' },
            { label:'React Router v6',     sub:'SPA Routing' },
            { label:'Recharts',            sub:'Price Trends' },
          ].map(a=>(
            <div key={a.label} className="api-badge">
              <span className="api-badge-dot"/>
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
      <div className="container" style={{ textAlign:'center' }}>
        <p className="section-label" style={{ justifyContent:'center' }}>Ready?</p>
        <h2 className="section-title" style={{ marginBottom:'0.75rem' }}>Start shopping smarter today</h2>
        <p className="section-sub center" style={{ marginBottom:'2rem' }}>Know the real price before you head to the palengke or supermarket.</p>
        <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
          <button className="btn btn-dark btn-lg" onClick={()=>navigate('/prices')}><BarChart2 size={16}/> See All Prices</button>
          <button className="btn btn-outline btn-lg" onClick={()=>navigate('/recipes')}><ChefHat size={16}/> Find Recipes</button>
          <button className="btn btn-outline btn-lg" onClick={()=>navigate('/map')}><MapPin size={16}/> Find Markets</button>
        </div>
      </div>
    </section>
  )
}
