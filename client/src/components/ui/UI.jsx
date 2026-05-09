import { usePagination } from '../../hooks/index.js'

export function Loader({ text = 'Loading prices...' }) {
  return (
    <div className="loader-wrap">
      <div className="loader-ring" />
      <div className="loader-dots"><span /><span /><span /></div>
      <p className="loader-txt">{text}</p>
    </div>
  )
}

export function ErrorBox({ title = 'Something went wrong', msg, onRetry }) {
  return (
    <div className="err-box">
      <span className="err-box-icon">⚠️</span>
      <div>
        <p className="err-box-title">{title}</p>
        {msg && <p className="err-box-msg">{msg}</p>}
        {onRetry && (
          <button className="btn btn-outline btn-sm" onClick={onRetry} style={{ marginTop: '0.6rem' }}>
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}

export function EmptyState({ icon = '🔍', title, desc, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      {desc && <p className="empty-desc">{desc}</p>}
      {action}
    </div>
  )
}

export function Pagination({ total, pageSize, page, onPage }) {
  const { totalPages, hasPrev, hasNext, start, end, pages } = usePagination({ total, pageSize, page })
  if (totalPages <= 1) return null

  return (
    <div className="pagination">
      <button className="page-btn" disabled={!hasPrev} onClick={() => onPage(page - 1)}>←</button>

      {pages.map((p, i) =>
        p === '…'
          ? <span key={`e${i}`} className="page-info">…</span>
          : <button
              key={p}
              className={`page-btn ${p === page ? 'active' : ''}`}
              onClick={() => onPage(p)}
            >{p}</button>
      )}

      <button className="page-btn" disabled={!hasNext} onClick={() => onPage(page + 1)}>→</button>
      <span className="page-info">{start}–{end} of {total}</span>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card-skeleton">
      <div className="card-skeleton-header" />
      <div className="card-skeleton-body">
        <div className="skeleton" style={{ height: 20, width: '60%' }} />
        <div className="skeleton" style={{ height: 14, width: '40%' }} />
        <div className="skeleton" style={{ height: 60 }} />
        <div className="skeleton" style={{ height: 28, width: '80%' }} />
      </div>
    </div>
  )
}

export function SectionLabel({ children }) {
  return <p className="section-label">{children}</p>
}
