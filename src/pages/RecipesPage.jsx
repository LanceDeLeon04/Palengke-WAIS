import { useSelector, useDispatch }       from 'react-redux'
import { useState, useMemo }               from 'react'
import { useNavigate }                     from 'react-router-dom'
import {
  addIngredient, removeIngredient, clearPantry,
  useSearchByIngredientQuery, useSearchByNameQuery,
  useGetCategoriesQuery, useGetByCategoryQuery,
  useGetMealByIdQuery,
} from '../app/store.js'
import { Loader, ErrorBox, EmptyState, Pagination } from '../components/ui/UI.jsx'
import { useDebounce }                     from '../hooks/index.js'

// ─── Recipe Card
function RecipeCard({ meal, onClick }) {
  return (
    <article
      className="recipe-card"
      onClick={() => onClick(meal.id)}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(meal.id)}
    >
      <img
        className="recipe-img"
        src={`${meal.imageUrl}/preview`}
        alt={meal.title}
        onError={e => { e.target.src = 'https://placehold.co/400x180/0A3D2E/2EC99E?text=Recipe' }}
      />
      <div className="recipe-body">
        <h3 className="recipe-title">{meal.title}</h3>
        {meal.category && (
          <div className="recipe-meta-row">
            <span className="recipe-meta-item">🍽️ {meal.category}</span>
          </div>
        )}
      </div>
    </article>
  )
}

// ─── Meal Detail Modal
function MealModal({ id, onClose }) {
  const { data, isLoading } = useGetMealByIdQuery(id, { skip: !id })

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10,30,20,0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 2000,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '2rem 1rem', overflowY: 'auto',
        animation: 'fadeIn 0.2s ease both',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'white', borderRadius: 'var(--r-xl)',
        width: '100%', maxWidth: 720,
        boxShadow: 'var(--s4)',
        animation: 'scaleIn 0.25s var(--spring) both',
        overflow: 'hidden',
      }}>
        {isLoading ? (
          <div style={{ padding: '3rem' }}><Loader text="Loading recipe..." /></div>
        ) : data ? (
          <>
            {/* Header image */}
            <div style={{ position: 'relative' }}>
              <img
                src={data.imageUrl}
                alt={data.title}
                style={{ width: '100%', height: 260, objectFit: 'cover' }}
                onError={e => e.target.style.display = 'none'}
              />
              <button
                onClick={onClose}
                style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)', color: 'white',
                  border: 'none', cursor: 'pointer', fontSize: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>

            <div style={{ padding: '1.75rem' }}>
              {/* Title + meta */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                    {data.title}
                  </h2>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {data.category && <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--mint-dim)', color: 'var(--forest-3)', padding: '0.2rem 0.6rem', borderRadius: '99px', border: '1px solid var(--mint-glow)' }}>{data.category}</span>}
                    {data.area    && <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--cream-2)', color: 'var(--ink-3)', padding: '0.2rem 0.6rem', borderRadius: '99px', border: '1px solid var(--border)' }}>🌍 {data.area}</span>}
                    {data.tags?.map(t => <span key={t} style={{ fontSize: '0.72rem', fontWeight: 600, background: 'var(--gold-dim)', color: '#855A0A', padding: '0.2rem 0.6rem', borderRadius: '99px' }}>{t}</span>)}
                  </div>
                </div>
                {data.youtube && (
                  <a
                    href={data.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-dark btn-sm"
                    style={{ flexShrink: 0 }}
                  >
                    ▶ Watch Video
                  </a>
                )}
              </div>

              {/* Two column: ingredients + instructions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem' }}>
                {/* Ingredients */}
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>
                    🧺 Ingredients
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {data.ingredients.map((ing, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between',
                        padding: '0.4rem 0', borderBottom: '1px solid var(--cream-2)',
                        fontSize: '0.845rem',
                      }}>
                        <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{ing.name}</span>
                        <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{ing.measure}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>
                    📋 Instructions
                  </h3>
                  <p style={{
                    fontSize: '0.855rem', lineHeight: 1.75, color: 'var(--ink-2)',
                    maxHeight: 320, overflowY: 'auto',
                    paddingRight: '0.5rem',
                  }}>
                    {data.instructions}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: '2rem' }}>
            <ErrorBox title="Could not load recipe" />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── INGREDIENT INPUT PANEL
function PantryPanel() {
  const dispatch     = useDispatch()
  const pantry       = useSelector(s => s.recipe.pantry)
  const [input, setInput] = useState('')

  const handleAdd = () => {
    const v = input.trim()
    if (v) { dispatch(addIngredient(v)); setInput('') }
  }

  const QUICK_ADDS = ['manok','bigas','itlog','kamatis','sibuyas','bawang','isda','kangkong','patatas','saging']

  return (
    <div style={{
      background: 'white', border: '1px solid var(--border)',
      borderRadius: 'var(--r-xl)', padding: '1.5rem',
      boxShadow: 'var(--s1)',
    }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
        🧺 What's in your pantry?
      </h3>

      {/* Input */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div className="search-box" style={{ flex: 1 }}>
          <span className="search-box-icon">🥦</span>
          <input
            className="search-input"
            placeholder="Add ingredient (e.g. manok, kamatis...)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <button className="btn btn-primary" onClick={handleAdd} disabled={!input.trim()}>
          Add +
        </button>
      </div>

      {/* Quick add chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
        {QUICK_ADDS.filter(q => !pantry.includes(q)).slice(0, 8).map(q => (
          <button
            key={q}
            onClick={() => dispatch(addIngredient(q))}
            style={{
              padding: '0.2rem 0.7rem', borderRadius: '99px',
              border: '1.5px dashed var(--border-2)',
              background: 'var(--cream)',
              fontSize: '0.78rem', fontWeight: 600,
              color: 'var(--ink-3)', cursor: 'pointer',
              transition: 'all var(--fast)',
            }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--mint)'; e.target.style.color = 'var(--forest-3)' }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border-2)'; e.target.style.color = 'var(--ink-3)' }}
          >
            + {q}
          </button>
        ))}
      </div>

      {/* Current pantry tags */}
      {pantry.length > 0 && (
        <>
          <div className="ingredient-tags">
            {pantry.map(ing => (
              <span key={ing} className="ingredient-tag">
                {ing}
                <button
                  className="ingredient-remove"
                  onClick={() => dispatch(removeIngredient(ing))}
                >✕</button>
              </span>
            ))}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => dispatch(clearPantry())}
            style={{ marginTop: '0.5rem', color: 'var(--ink-3)' }}
          >
            Clear all ✕
          </button>
        </>
      )}

      {pantry.length === 0 && (
        <p style={{ fontSize: '0.82rem', color: 'var(--ink-3)', fontStyle: 'italic', marginTop: '0.5rem' }}>
          Add ingredients above to find matching recipes →
        </p>
      )}
    </div>
  )
}

// ─── RECIPE FINDER PAGE
export default function RecipesPage() {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const pantry     = useSelector(s => s.recipe.pantry)
  const [nameQuery, setNameQuery] = useState('')
  const [activeMode, setActiveMode] = useState('pantry') // 'pantry' | 'search' | 'browse'
  const [selectedMealId, setSelectedMealId] = useState(null)
  const [browseCat, setBrowseCat] = useState('Seafood')
  const [page, setPage] = useState(1)
  const debouncedName = useDebounce(nameQuery, 380)
  const RECS_PER_PAGE = 9

  // First pantry ingredient (MealDB supports single-ingredient filter)
  const mainIngredient = pantry[0] ?? ''

  const pantrySearch = useSearchByIngredientQuery(mainIngredient, { skip: !mainIngredient || activeMode !== 'pantry' })
  const nameSearch   = useSearchByNameQuery(debouncedName,       { skip: !debouncedName    || activeMode !== 'search' })
  const { data: categories } = useGetCategoriesQuery()
  const browseSearch = useGetByCategoryQuery(browseCat,          { skip: activeMode !== 'browse' })

  const results = useMemo(() => {
    if (activeMode === 'pantry') return pantrySearch.data ?? []
    if (activeMode === 'search') return nameSearch.data ?? []
    if (activeMode === 'browse') return browseSearch.data ?? []
    return []
  }, [activeMode, pantrySearch.data, nameSearch.data, browseSearch.data])

  const isLoading = (activeMode === 'pantry' && pantrySearch.isLoading) ||
                    (activeMode === 'search' && nameSearch.isLoading) ||
                    (activeMode === 'browse' && browseSearch.isLoading)
  const isError   = (activeMode === 'pantry' && pantrySearch.isError) ||
                    (activeMode === 'search' && nameSearch.isError) ||
                    (activeMode === 'browse' && browseSearch.isError)

  const paginated = results.slice((page - 1) * RECS_PER_PAGE, page * RECS_PER_PAGE)

  return (
    <div className="page-in">
      {/* ── Recipe Hero ── */}
      <div className="recipe-hero">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <p className="section-label" style={{ color: '#C4B5FD', justifyContent: 'flex-start' }}>🍳 Smart Pantry</p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 900, color: 'white',
            letterSpacing: '-0.03em', lineHeight: 1.1,
            marginBottom: '0.6rem',
          }}>
            What can you cook<br />
            <span style={{ color: '#A78BFA' }}>with what you have?</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', maxWidth: 500 }}>
            Add the ingredients in your pantry and discover real recipes you can cook today.
            Powered by <strong style={{ color: '#C4B5FD' }}>TheMealDB</strong> — 100% free.
          </p>
        </div>
      </div>

      {/* ── Mode switcher ── */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', position: 'sticky', top: 'var(--nav-h)', zIndex: 100 }}>
        <div className="container" style={{ padding: '0.6rem 2rem' }}>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {[
              { key: 'pantry', label: '🧺 By Pantry' },
              { key: 'search', label: '🔍 By Name' },
              { key: 'browse', label: '🍽️ Browse Category' },
            ].map(m => (
              <button
                key={m.key}
                onClick={() => { setActiveMode(m.key); setPage(1) }}
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: 'var(--r-full)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem', fontWeight: 700,
                  border: 'none', cursor: 'pointer',
                  background: activeMode === m.key ? '#6D28D9' : 'transparent',
                  color:      activeMode === m.key ? 'white' : 'var(--ink-3)',
                  transition: 'all var(--fast) var(--ease)',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container" style={{ padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>

          {/* ── LEFT PANEL ── */}
          <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 3.5rem)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeMode === 'pantry' && <PantryPanel />}

            {activeMode === 'search' && (
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
                  🔍 Search Recipes
                </h3>
                <div className="search-box">
                  <span className="search-box-icon">🍲</span>
                  <input
                    className="search-input"
                    placeholder="Try 'chicken', 'beef'..."
                    value={nameQuery}
                    onChange={e => { setNameQuery(e.target.value); setPage(1) }}
                    autoFocus
                  />
                  {nameQuery && <button className="search-clear" onClick={() => setNameQuery('')}>✕</button>}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--ink-3)', marginTop: '0.75rem', lineHeight: 1.6 }}>
                  🌐 Results from TheMealDB — 300+ recipes from cuisines worldwide.
                </p>
              </div>
            )}

            {activeMode === 'browse' && (
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
                  🍽️ Browse by Category
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: 380, overflowY: 'auto' }}>
                  {(categories ?? []).map(cat => (
                    <button
                      key={cat.idCategory}
                      onClick={() => { setBrowseCat(cat.strCategory); setPage(1) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--r-md)',
                        border: 'none', cursor: 'pointer',
                        background: browseCat === cat.strCategory ? 'rgba(109,40,217,0.1)' : 'transparent',
                        color:      browseCat === cat.strCategory ? '#6D28D9' : 'var(--ink-2)',
                        fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 600,
                        transition: 'all var(--fast)',
                        textAlign: 'left',
                      }}
                    >
                      <img
                        src={cat.strCategoryThumb}
                        alt={cat.strCategory}
                        style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6 }}
                        onError={e => e.target.style.display = 'none'}
                      />
                      {cat.strCategory}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: RESULTS ── */}
          <div>
            {/* Result header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)' }}>
                  {activeMode === 'pantry' && mainIngredient
                    ? `Recipes with "${mainIngredient}"`
                    : activeMode === 'search' && debouncedName
                    ? `Results for "${debouncedName}"`
                    : activeMode === 'browse'
                    ? `${browseCat} Recipes`
                    : 'Add ingredients to find recipes'}
                </span>
                {results.length > 0 && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--ink-3)', marginLeft: '0.75rem' }}>
                    {results.length} recipe{results.length !== 1 ? 's' : ''} found
                  </span>
                )}
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                fontSize: '0.72rem', fontWeight: 600, color: '#6D28D9',
                background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.15)',
                padding: '0.25rem 0.7rem', borderRadius: '99px',
              }}>
                🌐 Powered by TheMealDB
              </span>
            </div>

            {/* States */}
            {isLoading && <Loader text="Finding recipes..." />}
            {isError   && <ErrorBox title="Could not load recipes" msg="TheMealDB may be temporarily unavailable." />}

            {!isLoading && !isError && activeMode === 'pantry' && !mainIngredient && (
              <EmptyState
                icon="🧺"
                title="Your pantry is empty"
                desc="Add ingredients on the left panel to discover recipes you can cook right now."
              />
            )}

            {!isLoading && !isError && results.length === 0 && (mainIngredient || debouncedName || activeMode === 'browse') && (
              <EmptyState
                icon="🍳"
                title="No recipes found"
                desc="Try a different ingredient or recipe name."
              />
            )}

            {!isLoading && paginated.length > 0 && (
              <>
                <div className="cards-grid">
                  {paginated.map((meal, i) => (
                    <RecipeCard
                      key={meal.id}
                      meal={meal}
                      onClick={(id) => setSelectedMealId(id)}
                    />
                  ))}
                </div>
                <Pagination
                  total={results.length}
                  pageSize={RECS_PER_PAGE}
                  page={page}
                  onPage={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Meal Detail Modal ── */}
      {selectedMealId && (
        <MealModal id={selectedMealId} onClose={() => setSelectedMealId(null)} />
      )}
    </div>
  )
}
