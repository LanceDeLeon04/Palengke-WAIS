import { useSelector, useDispatch }   from 'react-redux'
import { useMemo, useState }           from 'react'
import { CommodityCard }               from '../components/commodity/CommodityCard.jsx'
import { Pagination, SkeletonCard, EmptyState } from '../components/ui/UI.jsx'
import {
  setSearch, setCategory, setRegion, setSort, setPage, resetFilters,
  PH_COMMODITIES, getRegionalPrice,
} from '../app/store.js'
import { useDebounce }                 from '../hooks/index.js'
import {
  COMMODITY_CATEGORIES, PH_REGIONS, SORT_OPTIONS, PAGE_SIZE,
} from '../utils/helpers.js'
import { Search, SlidersHorizontal, X, MapPin, TrendingDown } from 'lucide-react'

export default function PricesPage() {
  const dispatch  = useDispatch()
  const { search, category, region, sort, page } = useSelector(s => s.commodity)
  const [localSearch, setLocalSearch] = useState(search)
  const debounced = useDebounce(localSearch, 350)

  // Apply regional pricing dynamically
  const regionalItems = useMemo(
    () => PH_COMMODITIES.map(c => getRegionalPrice(c, region)),
    [region]
  )

  // Filter + sort
  const filtered = useMemo(() => {
    let items = [...regionalItems]
    if (debounced) {
      const q = debounced.toLowerCase()
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.searchKey.toLowerCase().includes(q)
      )
    }
    if (category !== 'all') items = items.filter(i => i.category === category)
    switch (sort) {
      case 'name_asc':   items.sort((a,b)=>a.name.localeCompare(b.name)); break
      case 'name_desc':  items.sort((a,b)=>b.name.localeCompare(a.name)); break
      case 'price_asc':  items.sort((a,b)=>a.palengke-b.palengke); break
      case 'price_desc': items.sort((a,b)=>b.palengke-a.palengke); break
      case 'savings':    items.sort((a,b)=>(b.supermarket-b.palengke)-(a.supermarket-a.palengke)); break
      default: break
    }
    return items
  }, [regionalItems, debounced, category, sort])

  // Sync search
  useMemo(() => { dispatch(setSearch(debounced)) }, [debounced])

  const paginated = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)

  // Count items cheaper at SM
  const smCheaperCount = filtered.filter(i => i.supermarket < i.palengke).length

  return (
    <div className="page-in">
      {/* Hero */}
      <div style={{
        background:'linear-gradient(135deg,var(--forest) 0%,var(--forest-2) 100%)',
        padding:'2.5rem 0', position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(46,201,158,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(46,201,158,.05) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }}/>
        <div className="container" style={{ position:'relative', zIndex:1 }}>
          <p className="section-label" style={{ color:'var(--mint)' }}>
            <TrendingDown size={12} style={{ display:'inline', marginRight:4 }}/>
            Real-Time PH Market Prices
          </p>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:900, color:'white', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:'0.5rem' }}>
            Today's Commodity Prices
          </h1>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.95rem', maxWidth:520, marginBottom:'1.25rem' }}>
            {PH_COMMODITIES.length} essential goods · Palengke vs. Supermarket · Prices vary by region · Updated daily
          </p>

          {/* Stats row */}
          <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
            {[
              { val:PH_COMMODITIES.length, label:'Total Items' },
              { val:smCheaperCount, label:'Cheaper at SM' },
              { val:filtered.length - smCheaperCount, label:'Cheaper at Palengke' },
            ].map(s=>(
              <div key={s.label}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:900, color:'var(--gold)', lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.5)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ maxWidth:520 }}>
            <div className="search-box">
              <span className="search-box-icon"><Search size={15}/></span>
              <input className="search-input" placeholder="Search bigas, manok, bangus, kamatis..." value={localSearch}
                onChange={e => setLocalSearch(e.target.value)} autoFocus />
              {localSearch && (
                <button className="search-clear" onClick={()=>{setLocalSearch('');dispatch(setSearch(''))}}>
                  <X size={12}/>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div style={{ borderBottom:'1px solid var(--border)', background:'white', position:'sticky', top:'var(--nav-h)', zIndex:100, boxShadow:'0 2px 8px rgba(10,61,46,.05)' }}>
        <div className="container" style={{ padding:'0.65rem 2rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
            <div className="filter-bar" style={{ flex:1 }}>
              {COMMODITY_CATEGORIES.map(cat => (
                <button key={cat.id}
                  className={`chip ${category===cat.id?'active':''}`}
                  onClick={()=>{ dispatch(setCategory(cat.id)); dispatch(setPage(1)) }}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', gap:'0.4rem', flexShrink:0 }}>
              <select className="filter-select" value={region}
                onChange={e=>{dispatch(setRegion(e.target.value));dispatch(setPage(1))}}>
                {PH_REGIONS.map(r=><option key={r.code} value={r.code}>{r.label}</option>)}
              </select>
              <select className="filter-select" value={sort}
                onChange={e=>dispatch(setSort(e.target.value))}>
                {SORT_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container" style={{ padding:'2rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
          <div>
            <span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:700, color:'var(--ink)' }}>
              {debounced ? `Results for "${debounced}"` : COMMODITY_CATEGORIES.find(c=>c.id===category)?.label ?? 'All Commodities'}
            </span>
            <span style={{ fontSize:'0.82rem', color:'var(--ink-3)', marginLeft:'0.75rem' }}>
              {filtered.length} items · <MapPin size={11} style={{ display:'inline' }}/> {PH_REGIONS.find(r=>r.code===region)?.label}
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', fontSize:'0.75rem', fontWeight:600, color:'var(--forest-3)', background:'rgba(46,201,158,0.1)', border:'1px solid rgba(46,201,158,0.2)', padding:'0.25rem 0.75rem', borderRadius:'99px' }}>
              🟢 Live prices
            </span>
            {(debounced || category!=='all') && (
              <button className="btn btn-ghost btn-sm" onClick={()=>{setLocalSearch('');dispatch(resetFilters())}}>
                <X size={12}/> Clear
              </button>
            )}
          </div>
        </div>

        {filtered.length===0 ? (
          <EmptyState icon={<Search size={32} color="var(--ink-3)"/>} title="No results found"
            desc={`No commodities match "${debounced}". Try searching in Tagalog (e.g. "manok", "isda", "gulay").`}
            action={<button className="btn btn-outline" onClick={()=>{setLocalSearch('');dispatch(resetFilters())}}>Clear search</button>} />
        ) : (
          <div className="cards-grid">
            {paginated.map((item,i) => <CommodityCard key={item.id} item={item} delay={i*40} />)}
          </div>
        )}

        <Pagination total={filtered.length} pageSize={PAGE_SIZE} page={page}
          onPage={p=>{dispatch(setPage(p));window.scrollTo({top:0,behavior:'smooth'})}} />
      </div>
    </div>
  )
}
