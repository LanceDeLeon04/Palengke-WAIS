// ══════════════════════════════════════════
// PALENGKE WAIS — Utilities & Constants
// ══════════════════════════════════════════

export const COMMODITY_CATEGORIES = [
  { id: 'all',        label: 'All',          emoji: '🛒' },
  { id: 'rice',       label: 'Rice',         emoji: '🌾' },
  { id: 'vegetables', label: 'Vegetables',   emoji: '🥬' },
  { id: 'meat',       label: 'Meat',         emoji: '🥩' },
  { id: 'fish',       label: 'Fish',         emoji: '🐟' },
  { id: 'fruits',     label: 'Fruits',       emoji: '🍊' },
  { id: 'eggs_dairy', label: 'Eggs & Dairy', emoji: '🥚' },
  { id: 'cooking',    label: 'Cooking',      emoji: '🫙' },
]

export const PH_REGIONS = [
  { code: 'NCR',   label: 'Metro Manila' },
  { code: 'R3',    label: 'Central Luzon' },
  { code: 'R4A',   label: 'CALABARZON' },
  { code: 'R6',    label: 'Western Visayas' },
  { code: 'R7',    label: 'Central Visayas' },
  { code: 'R11',   label: 'Davao Region' },
  { code: 'CAR',   label: 'Cordillera (CAR)' },
  { code: 'R1',    label: 'Ilocos Region' },
  { code: 'R2',    label: 'Cagayan Valley' },
  { code: 'R5',    label: 'Bicol Region' },
  { code: 'R8',    label: 'Eastern Visayas' },
  { code: 'R10',   label: 'Northern Mindanao' },
]

export const SORT_OPTIONS = [
  { value: 'name_asc',    label: 'Name A–Z' },
  { value: 'name_desc',   label: 'Name Z–A' },
  { value: 'price_asc',   label: 'Price: Low → High' },
  { value: 'price_desc',  label: 'Price: High → Low' },
  { value: 'savings',     label: 'Most Savings' },
]

export const PAGE_SIZE = 12

export const EMOJI_MAP = {
  'Bigas (Well-milled)':    '🌾',
  'Bigas (Special)':        '🌾',
  'Bigas (Regular)':        '🌾',
  'Itlog':                  '🥚',
  'Manok (Dressed)':        '🍗',
  'Baboy (Kasim)':          '🥩',
  'Baboy (Liempo)':         '🥩',
  'Karne (Baka)':           '🥩',
  'Bangus':                 '🐟',
  'Galunggong':             '🐟',
  'Tilapia':                '🐟',
  'Kamatis':                '🍅',
  'Sibuyas':                '🧅',
  'Bawang':                 '🧄',
  'Ampalaya':               '🥒',
  'Kangkong':               '🥬',
  'Sitaw':                  '🌿',
  'Patatas':                '🥔',
  'Carrot':                 '🥕',
  'Repolyo':                '🥬',
  'Saging na Saba':         '🍌',
  'Mangga':                 '🥭',
  'Cooking Oil':            '🫙',
  'Asukal':                 '🧂',
}

export function getEmoji(name) {
  const found = Object.keys(EMOJI_MAP).find((k) =>
    name?.toLowerCase().includes(k.toLowerCase())
  )
  return found ? EMOJI_MAP[found] : '🛒'
}

export function formatPrice(amount, opts = {}) {
  const { decimals = 2 } = opts
  if (amount == null || isNaN(Number(amount))) return '—'
  return `₱${Number(amount).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

export function calcSavings(palengke, supermarket) {
  if (!palengke || !supermarket) return null
  const diff = supermarket - palengke
  const pct  = ((diff / supermarket) * 100).toFixed(1)
  return { amount: diff, formatted: formatPrice(Math.abs(diff)), percent: Math.abs(pct), isPositive: diff > 0 }
}

export function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}
