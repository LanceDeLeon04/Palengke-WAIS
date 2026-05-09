import { useSelector, useDispatch }       from 'react-redux'
import { useState, useMemo }               from 'react'
import {
  addIngredient, removeIngredient, clearPantry,
  useSearchByIngredientQuery, useGetMealByIdQuery,
  useGetFilipinoDishesQuery, useGetCategoriesQuery,
  useGetByCategoryQuery,
} from '../app/store.js'
import { Loader, ErrorBox, EmptyState, Pagination } from '../components/ui/UI.jsx'
import { useDebounce }                     from '../hooks/index.js'
import { getSearchIngredient, INGREDIENT_SEARCH_MAP } from '../utils/helpers.js'
import { ChefHat, X, Search, UtensilsCrossed, BookOpen, Clock, Users } from 'lucide-react'

// Filipino dish keywords to prioritize in results
const FILIPINO_KEYWORDS = [
  'adobo','sinigang','kare','tinola','bistek','mechado','kaldereta',
  'menudo','afritada','paksiw','nilaga','bulalo','dinuguan','lechon',
  'pinakbet','laing','kinilaw','lumpia','pancit','sisig','crispy pata',
  'pochero','estofado','escabeche','ukoy','tortang','ginisang','binagoongan',
  'pinais','kinamatisang','chicken','pork','beef','fish'
]

// Multiple Filipino dish search terms for richer results
const FILIPINO_SEARCH_TERMS = [
  'adobo','sinigang','tinola','bistek','mechado','kaldereta',
  'menudo','afritada','paksiw','nilaga','bulalo','dinuguan',
  'pinakbet','pancit','lumpia','sisig','lechon'
]

function isFilipinoDish(meal) {
  if (meal.area === 'Filipino') return true
  const t = (meal.title||'').toLowerCase()
  return FILIPINO_KEYWORDS.some(k => t.includes(k))
}

// ── Meal Detail Modal ─────────────────────────────────────────
function MealModal({ id, onClose }) {
  const { data, isLoading } = useGetMealByIdQuery(id, { skip: !id })
  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(10,30,20,0.7)', backdropFilter:'blur(6px)', zIndex:2000, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'2rem 1rem', overflowY:'auto', animation:'fadeIn 0.2s ease both' }}
      onClick={e => e.target===e.currentTarget && onClose()}
    >
      <div style={{ background:'white', borderRadius:'var(--r-xl)', width:'100%', maxWidth:740, boxShadow:'var(--s4)', animation:'scaleIn 0.25s var(--spring) both', overflow:'hidden' }}>
        {isLoading ? (
          <div style={{ padding:'3rem' }}><Loader text="Loading recipe..." /></div>
        ) : data ? (
          <>
            <div style={{ position:'relative' }}>
              <img src={data.imageUrl} alt={data.title} style={{ width:'100%', height:260, objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
              <button onClick={onClose} style={{ position:'absolute', top:'1rem', right:'1rem', width:36, height:36, borderRadius:'50%', background:'rgba(0,0,0,0.55)', color:'white', border:'none', cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
              {(data.area==='Filipino' || isFilipinoDish(data)) && (
                <span style={{ position:'absolute', top:'1rem', left:'1rem', background:'var(--forest)', color:'var(--mint)', padding:'0.3rem 0.8rem', borderRadius:'99px', fontSize:'0.75rem', fontWeight:700 }}>
                  🇵🇭 Filipino Dish
                </span>
              )}
            </div>
            <div style={{ padding:'1.75rem' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:'1rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
                <div style={{ flex:1 }}>
                  <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:900, color:'var(--ink)', letterSpacing:'-0.02em', lineHeight:1.15 }}>{data.title}</h2>
                  <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginTop:'0.5rem' }}>
                    {data.category && <span style={{ fontSize:'0.75rem', fontWeight:600, background:'var(--mint-dim)', color:'var(--forest-3)', padding:'0.2rem 0.65rem', borderRadius:'99px', border:'1px solid var(--mint-glow)' }}>{data.category}</span>}
                    {data.area    && <span style={{ fontSize:'0.75rem', fontWeight:600, background:'var(--cream-2)', color:'var(--ink-3)', padding:'0.2rem 0.65rem', borderRadius:'99px', border:'1px solid var(--border)' }}>🌍 {data.area}</span>}
                    {data.tags?.map(t=><span key={t} style={{ fontSize:'0.72rem', fontWeight:600, background:'var(--gold-dim)', color:'#855A0A', padding:'0.2rem 0.65rem', borderRadius:'99px' }}>{t}</span>)}
                  </div>
                </div>
                {data.youtube && (
                  <a href={data.youtube} target="_blank" rel="noopener noreferrer" className="btn btn-dark btn-sm" style={{ flexShrink:0 }}>▶ Watch Video</a>
                )}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:'1.5rem' }}>
                <div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:700, color:'var(--ink)', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                    <BookOpen size={15}/> Ingredients
                  </h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                    {data.ingredients.map((ing,i)=>(
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'0.35rem 0', borderBottom:'1px solid var(--cream-2)', fontSize:'0.84rem' }}>
                        <span style={{ color:'var(--ink-2)', fontWeight:500 }}>{ing.name}</span>
                        <span style={{ color:'var(--ink-3)', fontFamily:'var(--font-mono)', fontSize:'0.78rem' }}>{ing.measure}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:700, color:'var(--ink)', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                    <UtensilsCrossed size={15}/> Instructions
                  </h3>
                  <p style={{ fontSize:'0.855rem', lineHeight:1.75, color:'var(--ink-2)', maxHeight:320, overflowY:'auto', paddingRight:'0.5rem' }}>
                    {data.instructions}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding:'2rem' }}><ErrorBox title="Could not load recipe" /></div>
        )}
      </div>
    </div>
  )
}

// ── Pantry Panel ──────────────────────────────────────────────
function PantryPanel({ onSearch }) {
  const dispatch = useDispatch()
  const pantry   = useSelector(s => s.recipe.pantry)
  const [input, setInput] = useState('')

  const handleAdd = (val) => {
    const v = (val || input).trim()
    if (v) { dispatch(addIngredient(v)); if (!val) setInput('') }
  }

  const QUICK = [
    { label:'Manok', eng:'chicken' }, { label:'Baboy', eng:'pork' },
    { label:'Karne', eng:'beef'   }, { label:'Isda',  eng:'salmon' },
    { label:'Itlog', eng:'eggs'   }, { label:'Hipon', eng:'prawns' },
    { label:'Kamatis', eng:'tomatoes' }, { label:'Bawang', eng:'garlic' },
    { label:'Sibuyas', eng:'onion' }, { label:'Bigas', eng:'rice' },
    { label:'Talong', eng:'aubergine' }, { label:'Kangkong', eng:'spinach' },
  ]

  return (
    <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'1.5rem', boxShadow:'var(--s1)' }}>
      <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', fontWeight:700, color:'var(--ink)', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
        <BookOpen size={16} color="var(--forest)"/> What's in your pantry?
      </h3>
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.75rem' }}>
        <div className="search-box" style={{ flex:1 }}>
          <span className="search-box-icon"><Search size={14}/></span>
          <input className="search-input" placeholder="e.g. manok, kamatis, itlog..." value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleAdd()} />
        </div>
        <button className="btn btn-primary" onClick={()=>handleAdd()} disabled={!input.trim()}>Add +</button>
      </div>

      {/* Quick add chips */}
      <p style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.5rem' }}>Quick add:</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginBottom:'1rem' }}>
        {QUICK.filter(q => !pantry.includes(q.label.toLowerCase()) && !pantry.includes(q.eng)).map(q=>(
          <button key={q.label} onClick={()=>handleAdd(q.label)}
            style={{ padding:'0.22rem 0.65rem', borderRadius:'99px', border:'1.5px dashed var(--border-2)', background:'var(--cream)', fontSize:'0.78rem', fontWeight:600, color:'var(--ink-3)', cursor:'pointer', transition:'all var(--fast)', fontFamily:'var(--font-body)' }}
            onMouseEnter={e=>{e.target.style.borderColor='var(--mint)';e.target.style.color='var(--forest-3)'}}
            onMouseLeave={e=>{e.target.style.borderColor='var(--border-2)';e.target.style.color='var(--ink-3)'}}>
            + {q.label}
          </button>
        ))}
      </div>

      {/* Tags */}
      {pantry.length > 0 && (
        <>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginBottom:'0.5rem' }}>
            {pantry.map(ing=>(
              <span key={ing} style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'var(--forest)', color:'#A8EDD7', borderRadius:'99px', padding:'0.35rem 0.85rem', fontSize:'0.82rem', fontWeight:600 }}>
                {ing}
                <button onClick={()=>dispatch(removeIngredient(ing))} style={{ width:16, height:16, borderRadius:'50%', background:'rgba(255,255,255,0.15)', color:'#A8EDD7', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.6rem', fontFamily:'var(--font-body)' }}>✕</button>
              </span>
            ))}
          </div>
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
            <button className="btn btn-primary btn-sm" onClick={onSearch} style={{ flex:1 }}>
              <Search size={13}/> Find Filipino Recipes
            </button>
            <button className="btn btn-ghost btn-sm" onClick={()=>dispatch(clearPantry())} style={{ color:'var(--ink-3)' }}>
              <X size={13}/> Clear
            </button>
          </div>
        </>
      )}
      {pantry.length === 0 && (
        <p style={{ fontSize:'0.82rem', color:'var(--ink-3)', fontStyle:'italic' }}>Add ingredients to find matching Filipino recipes →</p>
      )}
    </div>
  )
}

// ── Recipe Card ───────────────────────────────────────────────
function RecipeCard({ meal, onClick, delay=0 }) {
  return (
    <article className="recipe-card" style={{ cursor:'pointer', animationDelay:`${delay}ms` }} onClick={()=>onClick(meal.id)} role="button" tabIndex={0} onKeyDown={e=>e.key==='Enter'&&onClick(meal.id)}>
      <div style={{ position:'relative', overflow:'hidden' }}>
        <img className="recipe-img" src={`${meal.imageUrl}/preview`} alt={meal.title}
          onError={e=>{e.target.src='https://placehold.co/400x180/0A3D2E/2EC99E?text=Recipe'}} />
        {(meal.area==='Filipino' || isFilipinoDish(meal)) && (
          <span style={{ position:'absolute', top:'0.5rem', left:'0.5rem', background:'var(--forest)', color:'var(--mint)', padding:'0.18rem 0.55rem', borderRadius:'99px', fontSize:'0.68rem', fontWeight:700 }}>🇵🇭 Filipino</span>
        )}
      </div>
      <div className="recipe-body">
        <h3 className="recipe-title">{meal.title}</h3>
        {meal.category && (
          <div className="recipe-meta-row">
            <span className="recipe-meta-item"><UtensilsCrossed size={11}/> {meal.category}</span>
            {meal.area && <span className="recipe-meta-item">🌍 {meal.area}</span>}
          </div>
        )}
      </div>
    </article>
  )
}

// ── Multi-ingredient search: search each ingredient, merge results ──
function useMultiIngredientSearch(pantry, enabled) {
  // We search the first 3 ingredients to get overlapping Filipino recipes
  const i0 = pantry[0] ? getSearchIngredient(pantry[0]) : ''
  const i1 = pantry[1] ? getSearchIngredient(pantry[1]) : ''
  const i2 = pantry[2] ? getSearchIngredient(pantry[2]) : ''

  const q0 = useSearchByIngredientQuery(i0, { skip: !enabled || !i0 })
  const q1 = useSearchByIngredientQuery(i1, { skip: !enabled || !i1 || i1===i0 })
  const q2 = useSearchByIngredientQuery(i2, { skip: !enabled || !i2 || i2===i0 || i2===i1 })

  const isLoading = q0.isLoading || q1.isLoading || q2.isLoading
  const isError   = q0.isError && q1.isError && q2.isError

  const data = useMemo(() => {
    if (!enabled) return []
    const all  = [...(q0.data||[]), ...(q1.data||[]), ...(q2.data||[])]
    // Deduplicate by id
    const seen = new Set()
    const deduped = all.filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true })
    // Sort: Filipino dishes first, then by how many pantry ingredients match title
    return deduped.sort((a,b) => {
      const aFil = isFilipinoDish(a) ? 1 : 0
      const bFil = isFilipinoDish(b) ? 1 : 0
      return bFil - aFil
    })
  }, [q0.data, q1.data, q2.data, enabled])

  return { data, isLoading, isError }
}

// ── MAIN PAGE ────────────────────────────────────────────────
export default function RecipesPage() {
  const dispatch      = useDispatch()
  const pantry        = useSelector(s => s.recipe.pantry)
  const [activeMode, setActiveMode] = useState('pantry')
  const [selectedMealId, setSelectedMealId] = useState(null)
  const [browseCat, setBrowseCat]   = useState('Chicken')
  const [page, setPage]             = useState(1)
  const [searchTriggered, setSearchTriggered] = useState(false)
  const PER_PAGE = 9

  const { data: categories } = useGetCategoriesQuery()
  const { data: filipinoDishes, isLoading: filipinoLoading } = useGetFilipinoDishesQuery()
  const browseQ = useGetByCategoryQuery(browseCat, { skip: activeMode !== 'browse' })
  const { data: multiData, isLoading: multiLoading, isError: multiError } =
    useMultiIngredientSearch(pantry, activeMode==='pantry' && searchTriggered && pantry.length > 0)

  const results = useMemo(() => {
    if (activeMode === 'pantry') {
      if (!searchTriggered || pantry.length === 0) return []
      return multiData ?? []
    }
    if (activeMode === 'filipino') return filipinoDishes ?? []
    if (activeMode === 'browse')   return browseQ.data ?? []
    return []
  }, [activeMode, multiData, filipinoDishes, browseQ.data, searchTriggered, pantry.length])

  const isLoading = (activeMode==='pantry' && multiLoading) ||
                    (activeMode==='filipino' && filipinoLoading) ||
                    (activeMode==='browse' && browseQ.isLoading)
  const isError   = activeMode==='pantry' && multiError

  const paginated = results.slice((page-1)*PER_PAGE, page*PER_PAGE)

  const handleSearch = () => { setSearchTriggered(true); setPage(1) }

  return (
    <div className="page-in">
      {/* ── Hero ── */}
      <div className="recipe-hero">
        <div className="container" style={{ position:'relative', zIndex:1 }}>
          <p className="section-label" style={{ color:'#C4B5FD', justifyContent:'flex-start' }}>
            <ChefHat size={13} style={{ display:'inline', marginRight:4 }}/> Smart Pantry
          </p>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:900, color:'white', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:'0.6rem' }}>
            Anong ulam ngayon?<br/>
            <span style={{ color:'#A78BFA' }}>We'll find a recipe.</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.95rem', maxWidth:500 }}>
            Add ingredients from your pantry and discover real <strong style={{ color:'#C4B5FD' }}>Filipino recipes</strong> you can cook today. Powered by TheMealDB.
          </p>
        </div>
      </div>

      {/* ── Mode tabs ── */}
      <div style={{ background:'white', borderBottom:'1px solid var(--border)', position:'sticky', top:'var(--nav-h)', zIndex:100 }}>
        <div className="container" style={{ padding:'0.6rem 2rem' }}>
          <div style={{ display:'flex', gap:'0.25rem' }}>
            {[
              { key:'pantry',  label:'🧺 By Pantry' },
              { key:'filipino',label:'🇵🇭 Filipino Dishes' },
              { key:'browse',  label:'🍽️ Browse Category' },
            ].map(m=>(
              <button key={m.key} onClick={()=>{setActiveMode(m.key);setPage(1)}} style={{
                padding:'0.55rem 1rem', borderRadius:'var(--r-full)', fontFamily:'var(--font-body)',
                fontSize:'0.875rem', fontWeight:700, border:'none', cursor:'pointer',
                background: activeMode===m.key ? '#6D28D9' : 'transparent',
                color:      activeMode===m.key ? 'white'   : 'var(--ink-3)',
                transition:'all var(--fast) var(--ease)',
              }}>{m.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container" style={{ padding:'2rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:'2rem', alignItems:'start' }}>

          {/* ── Left Panel ── */}
          <div style={{ position:'sticky', top:'calc(var(--nav-h) + 3.5rem)', display:'flex', flexDirection:'column', gap:'1rem' }}>
            {activeMode==='pantry' && <PantryPanel onSearch={handleSearch}/>}

            {activeMode==='filipino' && (
              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'1.5rem' }}>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', fontWeight:700, color:'var(--ink)', marginBottom:'0.75rem' }}>🇵🇭 Filipino Dishes</h3>
                <p style={{ fontSize:'0.85rem', color:'var(--ink-3)', lineHeight:1.7 }}>
                  Showing all Filipino dishes from TheMealDB. Click any recipe card to view the full recipe with ingredients and instructions.
                </p>
                <div style={{ marginTop:'1rem', padding:'0.75rem', background:'rgba(109,40,217,0.07)', borderRadius:'var(--r-md)', fontSize:'0.8rem', color:'#6D28D9', fontWeight:600 }}>
                  {filipinoDishes?.length ?? 0} Filipino recipes found
                </div>
              </div>
            )}

            {activeMode==='browse' && (
              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'1.5rem' }}>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', fontWeight:700, color:'var(--ink)', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <UtensilsCrossed size={15}/> Browse Category
                </h3>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem', maxHeight:380, overflowY:'auto' }}>
                  {(categories??[]).map(cat=>(
                    <button key={cat.idCategory} onClick={()=>{setBrowseCat(cat.strCategory);setPage(1)}}
                      style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.5rem 0.7rem', borderRadius:'var(--r-md)', border:'none', cursor:'pointer', background: browseCat===cat.strCategory ? 'rgba(109,40,217,0.1)' : 'transparent', color: browseCat===cat.strCategory ? '#6D28D9' : 'var(--ink-2)', fontFamily:'var(--font-body)', fontSize:'0.875rem', fontWeight:600, transition:'all var(--fast)', textAlign:'left' }}>
                      <img src={cat.strCategoryThumb} alt={cat.strCategory} style={{ width:32, height:32, objectFit:'cover', borderRadius:6 }} onError={e=>e.target.style.display='none'} />
                      {cat.strCategory}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Results ── */}
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
              <div>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:700, color:'var(--ink)' }}>
                  {activeMode==='pantry' && !searchTriggered && 'Add ingredients and tap "Find Filipino Recipes"'}
                  {activeMode==='pantry' && searchTriggered && pantry.length>0 && `Recipes using: ${pantry.slice(0,3).join(', ')}${pantry.length>3?'…':''}`}
                  {activeMode==='filipino' && '🇵🇭 Filipino Dishes'}
                  {activeMode==='browse'   && `${browseCat} Recipes`}
                </span>
                {results.length > 0 && <span style={{ fontSize:'0.82rem', color:'var(--ink-3)', marginLeft:'0.75rem' }}>{results.length} found</span>}
              </div>
              <span style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', fontSize:'0.72rem', fontWeight:600, color:'#6D28D9', background:'rgba(109,40,217,0.08)', border:'1px solid rgba(109,40,217,0.15)', padding:'0.25rem 0.7rem', borderRadius:'99px' }}>
                🌐 TheMealDB
              </span>
            </div>

            {isLoading && <Loader text="Finding Filipino recipes..." />}
            {isError   && <ErrorBox title="Could not load recipes" msg="TheMealDB may be temporarily unavailable." />}

            {!isLoading && !isError && activeMode==='pantry' && !searchTriggered && (
              <EmptyState icon={<ChefHat size={32} color="var(--ink-3)"/>} title="Ready to cook?" desc="Add ingredients on the left then tap 'Find Filipino Recipes' to see what you can cook today." />
            )}
            {!isLoading && !isError && activeMode==='pantry' && searchTriggered && pantry.length===0 && (
              <EmptyState icon={<BookOpen size={32} color="var(--ink-3)"/>} title="Pantry is empty" desc="Add at least one ingredient to find matching recipes." />
            )}
            {!isLoading && !isError && results.length===0 && (searchTriggered || activeMode!=='pantry') && (
              <EmptyState icon={<UtensilsCrossed size={32} color="var(--ink-3)"/>} title="No recipes found" desc="Try different ingredients or browse Filipino dishes." />
            )}

            {!isLoading && paginated.length>0 && (
              <>
                <div className="cards-grid">
                  {paginated.map((meal,i)=>(
                    <RecipeCard key={meal.id} meal={meal} onClick={id=>setSelectedMealId(id)} delay={i*40} />
                  ))}
                </div>
                <Pagination total={results.length} pageSize={PER_PAGE} page={page} onPage={p=>{setPage(p);window.scrollTo({top:0,behavior:'smooth'})}} />
              </>
            )}
          </div>
        </div>
      </div>

      {selectedMealId && <MealModal id={selectedMealId} onClose={()=>setSelectedMealId(null)} />}
    </div>
  )
}
