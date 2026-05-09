import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="page-in" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'float 4s ease-in-out infinite' }}>🛒</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
          404 — Wala!
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--ink-3)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 400, margin: '0 auto 2rem' }}>
          The page you're looking for has left the palengke. Let's get you back.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-dark btn-lg" onClick={() => navigate('/')}>
            🏠 Go Home
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate('/prices')}>
            📊 View Prices
          </button>
        </div>
      </div>
    </div>
  )
}
