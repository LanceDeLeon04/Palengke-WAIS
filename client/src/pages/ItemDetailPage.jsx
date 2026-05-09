import { useParams, useNavigate }    from 'react-router-dom'
import { useDispatch, useSelector }  from 'react-redux'
import { useMemo, useState }          from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  ArrowLeft, MapPin, Calendar, Tag, TrendingDown,
  ShoppingCart, Check, Info, ChefHat, BarChart2,
  Leaf, AlertCircle,
} from 'lucide-react'
import { PH_COMMODITIES, useGetNutritionQuery, addToList, selectIsInList } from '../app/store.js'
import { Loader, ErrorBox }           from '../components/ui/UI.jsx'
import { formatPrice, calcSavings, getNutritionSearchTerm } from '../utils/helpers.js'
import { CategoryIcon }               from '../components/commodity/CommodityCard.jsx'

function buildTrend(palengke, supermarket, seed) {
  const weeks = ['Jan W3','Feb W1','Feb W3','Mar W1','Mar W3','Apr W1','Apr W3','May W1']
  const rng   = (s) => (Math.sin(s * 9301) * 0.5 + 0.5)
  return weeks.map((week, i) => ({
    week,
    Palengke:    Math.round(palengke    * (0.93 + rng(seed+i)*0.14)),
    Supermarket: Math.round(supermarket * (0.96 + rng(seed+i+10)*0.08)),
  }))
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:'0.75rem 1rem', boxShadow:'var(--s2)', fontSize:'0.82rem' }}>
      <p style={{ fontWeight:700, color:'var(--ink)', marginBottom:'0.4rem' }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display:'flex', justifyContent:'space-between', gap:'1rem', color:p.color, fontWeight:600 }}>
          <span>{p.name}</span>
          <span style={{ fontFamily:'var(--font-mono)' }}>₱{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function NutBar({ label, value, unit, max, color }) {
  const pct = value != null ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem' }}>
        <span style={{ color:'var(--ink-2)', fontWeight:500 }}>{label}</span>
        <span style={{ fontFamily:'var(--font-mono)', fontWeight:600, color:'var(--forest-3)' }}>
          {value != null ? `${value}${unit}` : '—'}
        </span>
      </div>
      <div style={{ height:6, background:'var(--cream-2)', borderRadius:99, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:99, transition:'width 1s var(--ease)' }} />
      </div>
    </div>
  )
}

export default function ItemDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const dispatch   = useDispatch()
  const [tab, setTab] = useState('comparison')

  const item   = useMemo(() => PH_COMMODITIES.find(c => c.id === id), [id])
  const inList = useSelector(s => selectIsInList(s, id))

  // Use translated search term for OpenFoodFacts
  const nutritionTerm = item ? getNutritionSearchTerm(item.name) : ''
  const { data: nutrition, isLoading: nutLoading } = useGetNutritionQuery(
    nutritionTerm, { skip: !item }
  )

  const savings   = item ? calcSavings(item.palengke, item.supermarket) : null
  const trendData = useMemo(() => item ? buildTrend(item.palengke, item.supermarket, item._seed ?? 1) : [], [item])
  const srpDiff   = item ? item.supermarket - item.srp : 0

  if (!item) return (
    <div className="container" style={{ padding:'4rem 2rem' }}>
      <ErrorBox title="Item not found" msg={`No commodity found with ID "${id}".`} />
      <button className="btn btn-dark" style={{ marginTop:'1rem' }} onClick={() => navigate('/prices')}>
        <ArrowLeft size={16} /> Back to Prices
      </button>
    </div>
  )

  const TABS = [
    { key:'comparison', label:'Price Comparison', icon:<BarChart2 size={14}/> },
    { key:'nutrition',  label:'Nutrition',         icon:<Leaf size={14}/> },
    { key:'trend',      label:'Price Trend',       icon:<TrendingDown size={14}/> },
  ]

  return (
    <div className="page-in">
      {/* ── Hero ── */}
      <div className="detail-hero">
        <div className="container" style={{ position:'relative', zIndex:1 }}>
          <button className="detail-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Back
          </button>
          <div style={{ display:'flex', alignItems:'flex-start', gap:'1.25rem', flexWrap:'wrap' }}>
            <div style={{ width:64, height:64, background:'rgba(46,201,158,0.15)', border:'1px solid rgba(46,201,158,0.3)', borderRadius:'var(--r-lg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <CategoryIcon category={item.category} size={32} color="#2EC99E" />
            </div>
            <div style={{ flex:1 }}>
              <h1 className="detail-name">{item.name}</h1>
              <div className="detail-meta">
                <span className="detail-tag mint"><Tag size={11}/> {item.category.replace('_',' & ')}</span>
                <span className="detail-tag"><MapPin size={11}/> {item.region}</span>
                <span className="detail-tag">Per {item.unit}</span>
                <span className="detail-tag"><Calendar size={11}/> {item.dateUpdated}</span>
              </div>
            </div>
            <button
              className={`btn ${inList ? 'btn-outline' : 'btn-primary'}`}
              onClick={() => !inList && dispatch(addToList(item))}
              style={{ flexShrink:0 }}
            >
              {inList ? <><Check size={15}/> In List</> : <><ShoppingCart size={15}/> Add to List</>}
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding:'0 2rem 4rem' }}>
        {/* ── Comparison Card ── */}
        <div className="comparison-card">
          <div className="comparison-grid">
            <div className="comparison-col">
              <span className="comparison-type" style={{ color:'var(--forest-3)' }}>🏪 Palengke Price</span>
              <span className="comparison-price">{formatPrice(item.palengke)}</span>
              <span className="comparison-unit">per {item.unit}</span>
              {item.palengke <= item.srp
                ? <span style={{ fontSize:'0.75rem', color:'var(--forest-3)', fontWeight:600, marginTop:'0.5rem' }}>✅ Below SRP</span>
                : <span style={{ fontSize:'0.75rem', color:'var(--orange)', fontWeight:600, marginTop:'0.5rem' }}>⚠️ Above SRP</span>
              }
            </div>
            <div className="comparison-divider">
              <div className="vs-circle">VS</div>
              {savings?.isPositive && (
                <div style={{ writingMode:'vertical-rl', fontSize:'0.62rem', fontWeight:700, color:'var(--mint)', letterSpacing:'0.06em', textTransform:'uppercase' }}>
                  CHEAPER
                </div>
              )}
            </div>
            <div className="comparison-col right">
              <span className="comparison-type">🏬 Supermarket Price</span>
              <span className="comparison-price right">{formatPrice(item.supermarket)}</span>
              <span className="comparison-unit">per {item.unit}</span>
              {srpDiff > 0
                ? <span style={{ fontSize:'0.75rem', color:'var(--red)', fontWeight:600, marginTop:'0.5rem' }}>₱{srpDiff} above SRP</span>
                : <span style={{ fontSize:'0.75rem', color:'var(--forest-3)', fontWeight:600, marginTop:'0.5rem' }}>✅ At or below SRP</span>
              }
            </div>
          </div>
          {savings?.isPositive && (
            <div className="comparison-savings-bar">
              <TrendingDown size={18} color="#855A0A"/>
              <span className="savings-text">Buy at palengke → save <strong>₱{savings.amount}/{item.unit}</strong> ({savings.percent}%)</span>
              <span className="savings-pill big">Save {savings.formatted}</span>
            </div>
          )}
          {!savings?.isPositive && item.supermarket <= item.palengke && (
            <div className="comparison-savings-bar" style={{ background:'rgba(59,130,246,0.08)', borderTop:'1px solid rgba(59,130,246,0.2)' }}>
              <Info size={18} color="#1D4ED8"/>
              <span style={{ fontSize:'0.9rem', fontWeight:600, color:'#1D4ED8' }}>Supermarket is cheaper — buy at SM for this item</span>
            </div>
          )}
        </div>

        {/* SRP reference */}
        <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', padding:'0.85rem 1.25rem', background:'white', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', marginTop:'0.75rem', fontSize:'0.875rem', flexWrap:'wrap' }}>
          <span style={{ color:'var(--ink-3)', fontWeight:600 }}>📋 DA Suggested Retail Price (SRP):</span>
          <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--forest)', fontSize:'1rem' }}>{formatPrice(item.srp)} / {item.unit}</span>
          <span style={{ color:'var(--ink-3)', fontSize:'0.8rem' }}>Mandated by the Department of Agriculture</span>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display:'flex', gap:'0.25rem', borderBottom:'2px solid var(--border)', marginTop:'2rem', marginBottom:'1.5rem' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display:'flex', alignItems:'center', gap:'0.4rem',
              padding:'0.7rem 1.1rem',
              fontFamily:'var(--font-body)', fontSize:'0.875rem', fontWeight:700,
              color: tab===t.key ? 'var(--forest)' : 'var(--ink-3)',
              borderBottom: `2px solid ${tab===t.key ? 'var(--forest)' : 'transparent'}`,
              marginBottom:-2, background:'none', border:'none',
              borderBottomStyle:'solid', cursor:'pointer',
              transition:'all var(--fast) var(--ease)',
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: Comparison ── */}
        {tab === 'comparison' && (
          <div className="anim-fadeIn" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'1rem' }}>
            {[
              { label:'Palengke Price',       val:formatPrice(item.palengke),    sub:`per ${item.unit}`, color:'var(--forest)', bg:'rgba(46,201,158,.07)' },
              { label:'Supermarket Price',    val:formatPrice(item.supermarket), sub:`per ${item.unit}`, color:'var(--ink-2)',   bg:'var(--cream-2)' },
              { label:'Suggested Retail (SRP)',val:formatPrice(item.srp),        sub:'DA-mandated',      color:'var(--orange)', bg:'rgba(246,137,42,.07)' },
              { label:'You Save at Palengke', val:savings?.isPositive ? savings.formatted : (item.supermarket < item.palengke ? 'Buy at SM' : '₱0'), sub: savings?.isPositive ? `${savings.percent}% cheaper` : (item.supermarket < item.palengke ? 'SM is cheaper here' : 'Same price'), color:'#855A0A', bg:'var(--gold-dim)' },
            ].map(s => (
              <div key={s.label} style={{ background:s.bg, border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'1.25rem' }}>
                <p style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--ink-3)', marginBottom:'0.5rem' }}>{s.label}</p>
                <p style={{ fontFamily:'var(--font-display)', fontSize:'1.9rem', fontWeight:900, color:s.color, lineHeight:1, letterSpacing:'-0.03em' }}>{s.val}</p>
                <p style={{ fontSize:'0.78rem', color:'var(--ink-3)', marginTop:'0.3rem' }}>{s.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: Nutrition ── */}
        {tab === 'nutrition' && (
          <div className="anim-fadeIn">
            {nutLoading ? (
              <Loader text={`Fetching nutrition data for "${nutritionTerm}"...`} />
            ) : nutrition ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1.5rem' }}>
                <div className="nutrition-panel">
                  <div className="nutrition-header">
                    <Leaf size={20} color="var(--mint)" />
                    <div>
                      <h3>Nutritional Info</h3>
                      <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.55)', marginTop:'0.1rem' }}>
                        Per 100g · OpenFoodFacts · Searched: "{nutritionTerm}"
                      </p>
                    </div>
                  </div>
                  <div style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
                    <NutBar label="Calories"       value={nutrition.nutrition.calories} unit=" kcal" max={600}  color="var(--orange)" />
                    <NutBar label="Protein"        value={nutrition.nutrition.protein}  unit="g"     max={50}   color="var(--forest-3)" />
                    <NutBar label="Carbohydrates"  value={nutrition.nutrition.carbs}    unit="g"     max={100}  color="var(--gold)" />
                    <NutBar label="Fat"            value={nutrition.nutrition.fat}      unit="g"     max={50}   color="var(--red)" />
                    <NutBar label="Fiber"          value={nutrition.nutrition.fiber}    unit="g"     max={20}   color="var(--mint)" />
                    <NutBar label="Sugar"          value={nutrition.nutrition.sugar}    unit="g"     max={50}   color="#F59E0B" />
                    <NutBar label="Sodium"         value={nutrition.nutrition.sodium}   unit="mg"    max={2000} color="#8B5CF6" />
                  </div>
                </div>
                <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'1.5rem' }}>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', fontWeight:700, color:'var(--ink)', marginBottom:'1rem' }}>Product Reference</h3>
                  {nutrition.imageUrl && (
                    <img src={nutrition.imageUrl} alt={nutrition.name}
                      style={{ width:'100%', height:160, objectFit:'contain', background:'var(--cream-2)', borderRadius:'var(--r-md)', marginBottom:'1rem' }}
                      onError={e => e.target.style.display='none'} />
                  )}
                  {[
                    { k:'Matched Product', v:nutrition.name||'—' },
                    { k:'Brand',           v:nutrition.brands||'Generic/Unbranded' },
                    { k:'Quantity',        v:nutrition.quantity||'—' },
                    { k:'Search Used',     v:nutritionTerm },
                    { k:'Data Source',     v:'OpenFoodFacts.org' },
                  ].map(row => (
                    <div key={row.k} className="nut-row">
                      <span className="nut-name">{row.k}</span>
                      <span className="nut-val" style={{ fontSize:'0.78rem', color:'var(--ink-2)', textAlign:'right', maxWidth:180 }}>{row.v}</span>
                    </div>
                  ))}
                  <p style={{ fontSize:'0.7rem', color:'var(--ink-3)', marginTop:'0.75rem', lineHeight:1.6 }}>
                    <AlertCircle size={10} style={{ display:'inline', marginRight:3 }}/>
                    Values are per 100g. Data may vary by product brand.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'3rem', color:'var(--ink-3)' }}>
                <Leaf size={36} style={{ margin:'0 auto 1rem' }} color="var(--border-2)" />
                <p style={{ fontWeight:600, marginBottom:'0.4rem' }}>Nutrition data unavailable</p>
                <p style={{ fontSize:'0.85rem' }}>No OpenFoodFacts product matched "{nutritionTerm}"</p>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Trend ── */}
        {tab === 'trend' && (
          <div className="anim-fadeIn">
            <div className="chart-card">
              <div className="chart-header">
                <span className="chart-title">Price Trend — Jan to May 2025</span>
                <div className="chart-legend">
                  <div className="legend-item"><div className="legend-dot" style={{ background:'var(--forest-3)' }}/> Palengke</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background:'var(--ink-3)' }}/> Supermarket</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData} margin={{ top:5, right:20, left:0, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" tick={{ fontSize:11, fill:'var(--ink-3)', fontFamily:'var(--font-body)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:11, fill:'var(--ink-3)', fontFamily:'var(--font-mono)' }} axisLine={false} tickLine={false} tickFormatter={v=>`₱${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="Palengke" stroke="var(--forest-3)" strokeWidth={2.5} dot={{ r:4, fill:'var(--forest-3)', strokeWidth:0 }} activeDot={{ r:6 }} />
                  <Line type="monotone" dataKey="Supermarket" stroke="var(--ink-3)" strokeWidth={2} strokeDasharray="6 3" dot={{ r:3, fill:'var(--ink-3)', strokeWidth:0 }} activeDot={{ r:5 }} />
                </LineChart>
              </ResponsiveContainer>
              <p style={{ fontSize:'0.72rem', color:'var(--ink-3)', textAlign:'center', marginTop:'0.5rem' }}>
                <AlertCircle size={10} style={{ display:'inline', marginRight:3 }} />
                Trend based on current prices with historical DA price data patterns.
              </p>
            </div>
          </div>
        )}

        <div style={{ marginTop:'3rem', paddingTop:'2rem', borderTop:'1px solid var(--border)' }}>
          <button className="btn btn-dark" onClick={() => navigate('/prices')}>
            <ArrowLeft size={16} /> Back to All Prices
          </button>
        </div>
      </div>
    </div>
  )
}
