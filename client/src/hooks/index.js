import { useState, useEffect, useMemo } from 'react'

export function useDebounce(value, delay = 380) {
  const [dv, setDv] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return dv
}

export function usePagination({ total, pageSize, page }) {
  return useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const hasPrev    = page > 1
    const hasNext    = page < totalPages
    const start      = Math.min((page - 1) * pageSize + 1, total)
    const end        = Math.min(page * pageSize, total)

    // Build page list with ellipsis
    const set = new Set([1, totalPages, page, page - 1, page + 1].filter(p => p >= 1 && p <= totalPages))
    const sorted = Array.from(set).sort((a, b) => a - b)
    const pages = []
    let prev = null
    for (const p of sorted) {
      if (prev !== null && p - prev > 1) pages.push('…')
      pages.push(p)
      prev = p
    }
    return { totalPages, hasPrev, hasNext, start, end, pages }
  }, [total, pageSize, page])
}

export function useScrolled(threshold = 10) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [threshold])
  return scrolled
}
