export const COMMODITY_CATEGORIES = [
  { id:'all',        label:'All',          icon:'LayoutGrid' },
  { id:'rice',       label:'Rice',         icon:'Wheat' },
  { id:'vegetables', label:'Vegetables',   icon:'Leaf' },
  { id:'meat',       label:'Meat',         icon:'Beef' },
  { id:'fish',       label:'Fish',         icon:'Fish' },
  { id:'fruits',     label:'Fruits',       icon:'Apple' },
  { id:'eggs_dairy', label:'Eggs & Dairy', icon:'Egg' },
  { id:'cooking',    label:'Cooking',      icon:'FlaskConical' },
]

export const CATEGORY_ICONS = {
  rice:       'Wheat',
  vegetables: 'Leaf',
  meat:       'Beef',
  fish:       'Fish',
  fruits:     'Apple',
  eggs_dairy: 'Egg',
  cooking:    'FlaskConical',
  default:    'ShoppingBasket',
}

export const PH_REGIONS = [
  { code:'NCR',  label:'Metro Manila' },
  { code:'R3',   label:'Central Luzon' },
  { code:'R4A',  label:'CALABARZON' },
  { code:'R6',   label:'Western Visayas' },
  { code:'R7',   label:'Central Visayas' },
  { code:'R11',  label:'Davao Region' },
  { code:'CAR',  label:'Cordillera (CAR)' },
  { code:'R1',   label:'Ilocos Region' },
  { code:'R2',   label:'Cagayan Valley' },
  { code:'R5',   label:'Bicol Region' },
  { code:'R8',   label:'Eastern Visayas' },
  { code:'R10',  label:'Northern Mindanao' },
]

export const SORT_OPTIONS = [
  { value:'name_asc',   label:'Name A–Z' },
  { value:'name_desc',  label:'Name Z–A' },
  { value:'price_asc',  label:'Price: Low → High' },
  { value:'price_desc', label:'Price: High → Low' },
  { value:'savings',    label:'Most Savings' },
]

export const PAGE_SIZE = 12

export function formatPrice(amount, opts={}) {
  const { decimals=2 } = opts
  if (amount==null||isNaN(Number(amount))) return '—'
  return `₱${Number(amount).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g,',')}`
}

export function calcSavings(palengke, supermarket) {
  if (!palengke||!supermarket) return null
  const diff = supermarket-palengke
  const pct  = ((diff/supermarket)*100).toFixed(1)
  return { amount:diff, formatted:formatPrice(Math.abs(diff)), percent:Math.abs(pct), isPositive:diff>0 }
}

export function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})
}

// Keep getEmoji as a stub so old imports don't break
// Returns a category string for icon lookup
export function getEmoji(name) {
  if (!name) return ''
  const n = name.toLowerCase()
  if (n.includes('bigas') || n.includes('rice')) return '🌾'
  if (n.includes('itlog') || n.includes('egg'))  return '🥚'
  if (n.includes('manok') || n.includes('chicken')) return '🍗'
  if (n.includes('baboy') || n.includes('pork') || n.includes('karne') || n.includes('beef')) return '🥩'
  if (n.includes('bangus') || n.includes('galunggong') || n.includes('tilapia') || n.includes('isda')) return '🐟'
  if (n.includes('kamatis') || n.includes('sibuyas') || n.includes('bawang') || n.includes('ampalaya') || n.includes('kangkong') || n.includes('sitaw')) return '🥬'
  if (n.includes('saging') || n.includes('mangga')) return '🍌'
  if (n.includes('oil') || n.includes('asukal') || n.includes('patis') || n.includes('toyo') || n.includes('suka')) return '🫙'
  return '🛒'
}
