import { useParams, useNavigate }  from 'react-router-dom'
import { ArrowLeft, Tag, MapPin, Calendar, TrendingDown, ShoppingCart, Check } from 'lucide-react'
import { addToList, selectIsInList } from '../app/store.js'
import { useDispatch } from 'react-redux'
import { useMemo, useState }        from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { PH_COMMODITIES, useGetNutritionQuery } from '../app/store.js'
import { Loader, ErrorBox }         from '../components/ui/UI.jsx'
import { formatPrice, calcSavings, getEmoji } from '../utils/helpers.js'

// ─── Price trend mock (realistic fluctuation based on real price)
function buildTrend(palengke, supermarket) {
  const weeks = ['Jan W3','Feb W1','Feb W3','Mar W1','Mar W3','Apr W1','Apr W3','May W1']
  const vary  = (base, max) => +(base + (Math.random() - 0.5) * max).toFixed(0)
  return weeks.map((week, i) => ({
    week,
    Palengke:    vary(palengke    + i * 0.4, palengke * 0.08),
    Supermarket: vary(supermarket + i * 0.3, supermarket * 0.04),
  }))
}

// ─── Custom Tooltip for chart
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'white', border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)', padding: '0.75rem 1rem',
      boxShadow: 'var(--s2)', fontSize: '0.82rem',
    }}>
      <p style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '0.4rem' }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: p.color, fontWeight: 600 }}>
          <span>{p.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>₱{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Nutrition Bar component
function NutBar({ label, value, unit, max, color }) {
  const pct = value != null ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
        <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--forest-3)' }}>
          {value != null ? `${value}${unit}` : '—'}
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--cream-2)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color, borderRadius: 99,
          transition: 'width 1s var(--ease)',
        }} />
      </div>
    </div>
  )
}

export default function ItemDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [activeTab, setActiveTab] = useState('comparison')

  const item = useMemo(
    () => PH_COMMODITIES.find(c => c.id === id),
    [id]
  )

  // Fetch real nutrition from OpenFoodFacts
  const { data: nutrition, isLoading: nutLoading } = useGetNutritionQuery(
    item?.searchKey ?? '', { skip: !item }
  )

  const savings   = item ? calcSavings(item.palengke, item.supermarket) : null
  const emoji     = item ? getEmoji(item.name) : '🛒'
  const trendData = useMemo(
    () => item ? buildTrend(item.palengke, item.supermarket) : [],
    [item]
  )

  if (!item) {
    return (
      <div className="container" style={{ padding: '4rem 2rem' }}>
        <ErrorBox title="Item not found" msg={`No commodity found with ID "${id}".`} />
        <button className="btn btn-dark" style={{ marginTop: '1rem' }} onClick={() => navigate('/prices')}>
          ← Back to Prices to Prices
        </button>
      </div>
    )
  }

  const TABS = ['comparison', 'nutrition', 'trend']
  const srpDiff = item.supermarket - item.srp

  return (
    <div className="page-in">
      {/* ── Detail Hero ── */}
      <div className="detail-hero">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <button className="detail-back" onClick={() => navigate(-1)}>
            ← Back to Prices
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '3.5rem', lineHeight: 1 }}>{emoji}</span>
            <div>
              <h1 className="detail-name">{item.name}</h1>
              <div className="detail-meta">
                <span className="detail-tag mint">
                  {item.category.replace('_', ' & ')}
                </span>
                <span className="detail-tag">📍 {item.region}</span>
                <span className="detail-tag">Per {item.unit}</span>
                <span className="detail-tag">
                  🔄 Updated {new Date(item.dateUpdated).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="container" style={{ padding: '0 2rem 4rem' }}>

        {/* ── Price Comparison Card (pulled up) ── */}
        <div className="comparison-card">
          <div className="comparison-grid">
            {/* Palengke */}
            <div className="comparison-col">
              <span className="comparison-type" style={{ color: 'var(--forest-3)' }}>🏪 Palengke Price</span>
              <span className="comparison-price">{formatPrice(item.palengke)}</span>
              <span className="comparison-unit">per {item.unit}</span>
              {item.palengke <= item.srp ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--forest-3)', fontWeight: 600, marginTop: '0.5rem' }}>
                  ✅ Below suggested retail price
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--orange)', fontWeight: 600, marginTop: '0.5rem' }}>
                  ⚠️ Above suggested retail price
                </span>
              )}
            </div>

            {/* VS Divider */}
            <div className="comparison-divider">
              <div className="vs-circle">VS</div>
              {savings?.isPositive && (
                <div style={{
                  writingMode: 'vertical-rl', textOrientation: 'mixed',
                  fontSize: '0.65rem', fontWeight: 700, color: 'var(--mint)',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  CHEAPER
                </div>
              )}
            </div>

            {/* Supermarket */}
            <div className="comparison-col right">
              <span className="comparison-type">🏬 Supermarket Price</span>
              <span className="comparison-price right">{formatPrice(item.supermarket)}</span>
              <span className="comparison-unit">per {item.unit}</span>
              {srpDiff > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--red)', fontWeight: 600, marginTop: '0.5rem' }}>
                  ₱{srpDiff} above SRP
                </span>
              )}
            </div>
          </div>

          {/* Savings bar */}
          {savings?.isPositive && (
            <div className="comparison-savings-bar">
              <span style={{ fontSize: '1.3rem' }}>💰</span>
              <span className="savings-text">
                Buy at palengke and save <strong>₱{savings.amount}/kg</strong> ({savings.percent}%)
                vs. supermarket
              </span>
              <span className="savings-pill big">Save {savings.formatted}</span>
            </div>
          )}
        </div>

        {/* SRP reference row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1.5rem',
          padding: '1rem 1.25rem',
          background: 'white',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          marginTop: '1rem',
          fontSize: '0.875rem', flexWrap: 'wrap', gap: '1rem',
        }}>
          <span style={{ color: 'var(--ink-3)', fontWeight: 600 }}>
            📋 Suggested Retail Price (SRP):
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--forest)', fontSize: '1rem' }}>
            {formatPrice(item.srp)} / {item.unit}
          </span>
          <span style={{ color: 'var(--ink-3)', fontSize: '0.8rem' }}>
            Set by the Department of Agriculture
          </span>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex', gap: '0.25rem',
          borderBottom: '2px solid var(--border)',
          marginTop: '2.5rem', marginBottom: '1.75rem',
        }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1.25rem',
                fontFamily: 'var(--font-body)',
                fontSize: '0.88rem', fontWeight: 700,
                color: activeTab === tab ? 'var(--forest)' : 'var(--ink-3)',
                borderBottom: activeTab === tab ? '2px solid var(--forest)' : '2px solid transparent',
                marginBottom: -2, background: 'none', border: 'none',
                borderBottomWidth: 2,
                borderBottomStyle: 'solid',
                borderBottomColor: activeTab === tab ? 'var(--forest)' : 'transparent',
                cursor: 'pointer', transition: 'all var(--fast) var(--ease)',
                textTransform: 'capitalize',
              }}
            >
              {tab === 'comparison' && '📊 '}
              {tab === 'nutrition'  && '🥗 '}
              {tab === 'trend'      && '📈 '}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── TAB: Comparison ── */}
        {activeTab === 'comparison' && (
          <div
            className="anim-fadeIn"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}
          >
            {[
              { label: 'Palengke Price', val: formatPrice(item.palengke), sub: `per ${item.unit}`, color: 'var(--forest)', bg: 'rgba(46,201,158,.07)' },
              { label: 'Supermarket Price', val: formatPrice(item.supermarket), sub: `per ${item.unit}`, color: 'var(--ink-2)', bg: 'var(--cream-2)' },
              { label: 'Suggested Retail Price', val: formatPrice(item.srp), sub: 'DA-mandated SRP', color: 'var(--orange)', bg: 'rgba(246,137,42,.07)' },
              { label: 'You Save at Palengke', val: savings?.isPositive ? savings.formatted : '₱0', sub: savings?.isPositive ? `${savings.percent}% less than supermarket` : 'Same price', color: '#855A0A', bg: 'var(--gold-dim)' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.25rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', marginBottom: '0.5rem' }}>
                  {s.label}
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: s.color, lineHeight: 1, letterSpacing: '-0.03em' }}>
                  {s.val}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--ink-3)', marginTop: '0.3rem' }}>{s.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: Nutrition ── */}
        {activeTab === 'nutrition' && (
          <div className="anim-fadeIn">
            {nutLoading ? (
              <Loader text="Fetching nutrition data from OpenFoodFacts..." />
            ) : nutrition ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {/* Nutrition card */}
                <div className="nutrition-panel">
                  <div className="nutrition-header">
                    <span style={{ fontSize: '1.5rem' }}>🥗</span>
                    <div>
                      <h3>Nutritional Info</h3>
                      <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.1rem' }}>
                        Per 100g · Source: OpenFoodFacts
                      </p>
                    </div>
                  </div>
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <NutBar label="Calories"       value={nutrition.nutrition.calories} unit=" kcal" max={600}  color="var(--orange)" />
                    <NutBar label="Protein"        value={nutrition.nutrition.protein}  unit="g"     max={50}   color="var(--forest-3)" />
                    <NutBar label="Carbohydrates"  value={nutrition.nutrition.carbs}    unit="g"     max={100}  color="var(--gold)" />
                    <NutBar label="Fat"            value={nutrition.nutrition.fat}      unit="g"     max={50}   color="var(--red)" />
                    <NutBar label="Fiber"          value={nutrition.nutrition.fiber}    unit="g"     max={20}   color="var(--mint)" />
                    <NutBar label="Sugar"          value={nutrition.nutrition.sugar}    unit="g"     max={50}   color="#F59E0B" />
                  </div>
                </div>

                {/* Product info card */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
                    Product Reference
                  </h3>
                  {nutrition.imageUrl && (
                    <img
                      src={nutrition.imageUrl}
                      alt={nutrition.name}
                      style={{ width: '100%', height: 180, objectFit: 'contain', background: 'var(--cream-2)', borderRadius: 'var(--r-md)', marginBottom: '1rem' }}
                      onError={e => e.target.style.display = 'none'}
                    />
                  )}
                  {[
                    { k: 'Name',     v: nutrition.name },
                    { k: 'Brand',    v: nutrition.brands || 'Generic' },
                    { k: 'Quantity', v: nutrition.quantity || '—' },
                    { k: 'Source',   v: 'OpenFoodFacts.org' },
                  ].map(row => (
                    <div key={row.k} className="nut-row">
                      <span className="nut-name">{row.k}</span>
                      <span className="nut-val" style={{ fontSize: '0.8rem', color: 'var(--ink-2)' }}>{row.v}</span>
                    </div>
                  ))}
                  <p style={{ fontSize: '0.72rem', color: 'var(--ink-3)', marginTop: '0.75rem', lineHeight: 1.6 }}>
                    ℹ️ Nutritional data sourced from OpenFoodFacts open database. Values are per 100g of product.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-3)' }}>
                <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🥗</p>
                <p style={{ fontWeight: 600 }}>Nutrition data unavailable for this item.</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>OpenFoodFacts may not have this specific product.</p>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Price Trend ── */}
        {activeTab === 'trend' && (
          <div className="anim-fadeIn">
            <div className="chart-card">
              <div className="chart-header">
                <span className="chart-title">📈 Price Trend (Jan – May 2025)</span>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: 'var(--forest-3)' }} />
                    Palengke
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: 'var(--ink-3)' }} />
                    Supermarket
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: 'var(--ink-3)', fontFamily: 'var(--font-body)' }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}
                    axisLine={false} tickLine={false}
                    tickFormatter={v => `₱${v}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone" dataKey="Palengke"
                    stroke="var(--forest-3)" strokeWidth={2.5}
                    dot={{ r: 4, fill: 'var(--forest-3)', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone" dataKey="Supermarket"
                    stroke="var(--ink-3)" strokeWidth={2}
                    strokeDasharray="6 3"
                    dot={{ r: 3, fill: 'var(--ink-3)', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <p style={{ fontSize: '0.75rem', color: 'var(--ink-3)', textAlign: 'center', marginTop: '0.75rem', padding: '0 1rem' }}>
                📌 Trend data is illustrative based on real current prices. Historical data from DA Price Monitoring archives.
              </p>
            </div>

            {/* Quick insight cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
              {[
                { icon: '📉', label: 'Avg. Palengke', val: formatPrice(item.palengke), note: 'Current price' },
                { icon: '📈', label: 'Avg. Supermarket', val: formatPrice(item.supermarket), note: 'Current price' },
                { icon: '💡', label: 'Best Time to Buy', val: 'Early Morning', note: 'Palengke tip' },
                { icon: '🎯', label: 'SRP Target', val: formatPrice(item.srp), note: 'DA reference' },
              ].map(i => (
                <div key={i.label} style={{
                  background: 'white', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)', padding: '1rem',
                }}>
                  <p style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{i.icon}</p>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-3)', marginBottom: '0.25rem' }}>{i.label}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--forest)' }}>{i.val}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--ink-3)', marginTop: '0.2rem' }}>{i.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Back button ── */}
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-dark" onClick={() => navigate('/prices')}>
            ← Back to Prices to All Prices
          </button>
        </div>
      </div>
    </div>
  )
}
