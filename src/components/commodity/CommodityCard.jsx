import { useNavigate }               from 'react-router-dom'
import { formatPrice, calcSavings, getEmoji } from '../../utils/helpers.js'

export function CommodityCard({ item, delay = 0 }) {
  const navigate = useNavigate()
  const savings  = calcSavings(item.palengke, item.supermarket)
  const emoji    = getEmoji(item.name)

  return (
    <article
      className="commodity-card"
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => navigate(`/item/${item.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/item/${item.id}`)}
    >
      {/* Header */}
      <div className="cc-header">
        <span className="cc-emoji">{emoji}</span>
        <span className="cc-cat">{item.category.replace('_', ' & ')}</span>
      </div>

      {/* Body */}
      <div className="cc-body">
        <h3 className="cc-name">{item.name}</h3>
        <span className="cc-region">📍 {item.region} · per {item.unit}</span>

        <div className="price-compare">
          <div className="price-side">
            <span className="price-lbl green">🏪 Palengke</span>
            <span className="price-val green">{formatPrice(item.palengke)}</span>
          </div>
          <div className="price-side">
            <span className="price-lbl">🏬 Supermarket</span>
            <span className="price-val">{formatPrice(item.supermarket)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="cc-footer">
        {savings?.isPositive ? (
          <span className="savings-pill">
            💰 Save {savings.formatted} ({savings.percent}%)
          </span>
        ) : (
          <span className="savings-pill" style={{ background: 'var(--cream-2)', color: 'var(--ink-3)', border: '1px solid var(--border)', boxShadow: 'none' }}>
            ≈ Same price
          </span>
        )}
        <span className="updated-at">
          {new Date(item.dateUpdated).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </article>
  )
}
