import { useSelector, useDispatch }   from 'react-redux'
import { SlidersHorizontal } from 'lucide-react'
import { useMemo, useState }           from 'react'
import { CommodityCard }               from '../components/commodity/CommodityCard.jsx'
import { Pagination, SkeletonCard, EmptyState } from '../components/ui/UI.jsx'
import {
  setSearch, setCategory, setRegion, setSort, setPage, resetFilters
} from '../app/store.js'
import { PH_COMMODITIES }              from '../app/store.js'
import { useDebounce }                 from '../hooks/index.js'
import { COMMODITY_CATEGORIES, PH_REGIONS, SORT_OPTIONS, PAGE_SIZE } from '../utils/helpers.js'

const ITEMS_PER_PAGE = PAGE_SIZE

export default function PricesPage() {
  const dispatch  = useDispatch()
  const { search, category, region, sort, page } = useSelector(s => s.commodity)
  const [localSearch, setLocalSearch] = useState(search)
  const debounced = useDebounce(localSearch, 350)

  // Sync debounced search into store
  useMemo(() => { dispatch(setSearch(debounced)) }, [debounced])

  const filtered = useMemo(() => {
    let items = [...PH_COMMODITIES]
    if (debounced) {
      const q = debounced.toLowerCase()
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.searchKey.toLowerCase().includes(q) ||
        i.nameLocal.toLowerCase().includes(q)
      )
    }
    if (category !== 'all') items = items.filter(i => i.category === category)
    switch (sort) {
      case 'name_asc':   items.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'name_desc':  items.sort((a, b) => b.name.localeCompare(a.name)); break
      case 'price_asc':  items.sort((a, b) => a.palengke - b.palengke); break
      case 'price_desc': items.sort((a, b) => b.palengke - a.palengke); break
      case 'savings':    items.sort((a, b) => (b.supermarket - b.palengke) - (a.supermarket - a.palengke)); break
      default: break
    }
    return items
  }, [debounced, category, region, sort])

  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="page-in">
      {/* Page Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--forest) 0%, var(--forest-2) 100%)',
        padding: '2.5rem 0',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(46,201,158,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(46,201,158,.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px', pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <p className="section-label" style={{ color: 'var(--mint)' }}>📊 Philippine Market Prices</p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 900, color: 'white', letterSpacing: '-0.03em',
            lineHeight: 1.1, marginBottom: '0.5rem',
          }}>
            Today's Commodity Prices
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', maxWidth: 520 }}>
            Real-time palengke vs. supermarket price comparison for {PH_COMMODITIES.length} essential goods.
            Data sourced from DA Price Monitoring (data.gov.ph).
          </p>

          {/* Big Search */}
          <div style={{ marginTop: '1.5rem', maxWidth: 520 }}>
            <div className="search-box">
              <span className="search-box-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Search bigas, manok, isda, kamatis..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                autoFocus
              />
              {localSearch && (
                <button className="search-clear" onClick={() => { setLocalSearch(''); dispatch(setSearch('')) }}>✕</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        background: 'white',
        position: 'sticky', top: 'var(--nav-h)', zIndex: 100,
        boxShadow: '0 2px 8px rgba(10,61,46,.05)',
      }}>
        <div className="container" style={{ padding: '0.75rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Category filter */}
            <div className="filter-bar" style={{ flex: 1 }}>
              {COMMODITY_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`chip ${category === cat.id ? 'active' : ''}`}
                  onClick={() => dispatch(setCategory(cat.id))}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            {/* Region + Sort */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                className="filter-select"
                value={region}
                onChange={e => dispatch(setRegion(e.target.value))}
              >
                {PH_REGIONS.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
              </select>
              <select
                className="filter-select"
                value={sort}
                onChange={e => dispatch(setSort(e.target.value))}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container" style={{ padding: '2rem' }}>
        {/* Result count + active filter badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)' }}>
              {debounced
                ? `Results for "${debounced}"`
                : COMMODITY_CATEGORIES.find(c => c.id === category)?.label ?? 'All Commodities'}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--ink-3)', marginLeft: '0.75rem' }}>
              {filtered.length} items found
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--forest-3)',
              background: 'rgba(46,201,158,0.1)', border: '1px solid rgba(46,201,158,0.2)',
              padding: '0.25rem 0.75rem', borderRadius: '99px',
            }}>
              🟢 Updated May 2, 2025
            </span>
            {(debounced || category !== 'all') && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setLocalSearch(''); dispatch(resetFilters()) }}>
                Clear filters ✕
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No results found"
            desc={`No commodities match "${debounced}". Try searching by Filipino name (e.g. "manok", "isda").`}
            action={
              <button className="btn btn-outline" onClick={() => { setLocalSearch(''); dispatch(resetFilters()) }}>
                Clear search
              </button>
            }
          />
        ) : (
          <div className="cards-grid">
            {paginated.map((item, i) => (
              <CommodityCard key={item.id} item={item} delay={i * 50} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          total={filtered.length}
          pageSize={ITEMS_PER_PAGE}
          page={page}
          onPage={(p) => { dispatch(setPage(p)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        />
      </div>
    </div>
  )
}
