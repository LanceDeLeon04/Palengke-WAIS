import { useNavigate }        from 'react-router-dom'
import { useDispatch }        from 'react-redux'
import {
  Wheat, Fish, Beef, Leaf, Apple, Egg,
  FlaskConical, ShoppingBasket, MapPin,
  ShoppingCart, Check, TrendingDown,
} from 'lucide-react'
import { formatPrice, calcSavings, CATEGORY_ICONS } from '../../utils/helpers.js'
import { addToList, selectIsInList }                from '../../app/store.js'
import { useSelector }                              from 'react-redux'

const ICON_MAP = { Wheat, Fish, Beef, Leaf, Apple, Egg, FlaskConical, ShoppingBasket }

export function CategoryIcon({ category, size=18, color='currentColor' }) {
  const name  = CATEGORY_ICONS[category] ?? CATEGORY_ICONS.default
  const Comp  = ICON_MAP[name] ?? ShoppingBasket
  return <Comp size={size} color={color} />
}

export function CommodityCard({ item, delay=0 }) {
  const navigate  = useNavigate()
  const dispatch  = useDispatch()
  const inList    = useSelector(s => selectIsInList(s, item.id))
  const savings   = calcSavings(item.palengke, item.supermarket)

  const handleAdd = (e) => {
    e.stopPropagation()
    if (!inList) dispatch(addToList(item))
  }

  return (
    <article
      className="commodity-card"
      style={{ animationDelay:`${delay}ms` }}
      onClick={() => navigate(`/item/${item.id}`)}
      role="button" tabIndex={0}
      onKeyDown={(e) => e.key==='Enter' && navigate(`/item/${item.id}`)}
    >
      {/* Header */}
      <div className="cc-header">
        <div className="cc-icon-wrap">
          <CategoryIcon category={item.category} size={26} color="#2EC99E" />
        </div>
        <span className="cc-cat">{item.category.replace('_',' & ')}</span>
      </div>

      {/* Body */}
      <div className="cc-body">
        <h3 className="cc-name">{item.name}</h3>
        <span className="cc-region">
          <MapPin size={11} style={{display:'inline',marginRight:3}} />
          {item.region} · per {item.unit}
        </span>

        <div className="price-compare">
          <div className="price-side">
            <span className="price-lbl green">Palengke</span>
            <span className="price-val green">{formatPrice(item.palengke)}</span>
          </div>
          <div className="price-side">
            <span className="price-lbl">Supermarket</span>
            <span className="price-val">{formatPrice(item.supermarket)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="cc-footer">
        {savings?.isPositive ? (
          <span className="savings-pill">
            <TrendingDown size={11} />
            Save {savings.formatted} ({savings.percent}%)
          </span>
        ) : (
          <span className="savings-pill" style={{background:'var(--cream-2)',color:'var(--ink-3)',border:'1px solid var(--border)',boxShadow:'none'}}>
            Same price
          </span>
        )}

        <button
          className={`add-to-list-btn ${inList ? 'added' : ''}`}
          onClick={handleAdd}
          title={inList ? 'Already in list' : 'Add to Shopping List'}
        >
          {inList
            ? <><Check size={13} /> Added</>
            : <><ShoppingCart size={13} /> Add to List</>
          }
        </button>
      </div>
    </article>
  )
}
