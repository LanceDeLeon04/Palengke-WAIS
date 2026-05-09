// ─── Category definitions ─────────────────────────────────────
export const COMMODITY_CATEGORIES = [
  { id:'all',        label:'All',           icon:'LayoutGrid' },
  { id:'rice',       label:'Rice & Grains', icon:'Wheat' },
  { id:'vegetables', label:'Vegetables',    icon:'Leaf' },
  { id:'meat',       label:'Meat',          icon:'Beef' },
  { id:'fish',       label:'Fish & Seafood',icon:'Fish' },
  { id:'fruits',     label:'Fruits',        icon:'Apple' },
  { id:'eggs_dairy', label:'Eggs & Dairy',  icon:'Egg' },
  { id:'cooking',    label:'Cooking',       icon:'FlaskConical' },
  { id:'noodles',    label:'Noodles & Pasta',icon:'ShoppingBasket' },
  { id:'beverages',  label:'Beverages',     icon:'Coffee' },
  { id:'condiments', label:'Condiments',    icon:'Droplets' },
]

export const CATEGORY_ICONS = {
  rice:'Wheat', vegetables:'Leaf', meat:'Beef', fish:'Fish',
  fruits:'Apple', eggs_dairy:'Egg', cooking:'FlaskConical',
  noodles:'ShoppingBasket', beverages:'Coffee', condiments:'Droplets',
  default:'ShoppingBasket',
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
  { value:'savings',    label:'Most Savings at Palengke' },
]

export const PAGE_SIZE = 16

// ─── Filipino → English ingredient translation for APIs ───────
export const FILIPINO_TO_ENGLISH = {
  // Proteins
  manok:'chicken', manok_dressed:'chicken', manok_native:'chicken',
  baboy:'pork', baboy_kasim:'pork', baboy_liempo:'pork belly', baboy_pigue:'pork',
  karne:'beef', baka:'beef', karne_baka:'beef',
  itlog:'egg', itlog_manok:'egg',
  // Fish & Seafood
  bangus:'milkfish', galunggong:'scad fish', tilapia:'tilapia',
  hipon:'shrimp', pusit:'squid', talaba:'oyster', alimango:'crab', alimasag:'crab',
  dalagang_bukid:'fish', maya_maya:'red snapper', lapu_lapu:'grouper fish',
  tulingan:'mackerel tuna', tambakol:'tuna', tanigue:'spanish mackerel',
  isda:'fish', dalag:'mudfish',
  // Rice & Grains
  bigas:'rice', kanin:'rice', mais:'corn',
  // Vegetables
  kamatis:'tomato', sibuyas:'onion', bawang:'garlic',
  ampalaya:'bitter melon', kangkong:'water spinach', sitaw:'string beans',
  talong:'eggplant', pechay:'bok choy', repolyo:'cabbage', patatas:'potato',
  carrot:'carrot', sayote:'chayote', kalabasa:'squash', okra:'okra',
  luya:'ginger', dahon_ng_sili:'chili leaves', sili:'chili pepper',
  pipino:'cucumber', labanos:'radish', monggo:'mung beans',
  // Fruits
  saging:'banana', mangga:'mango', papaya:'papaya', kalamansi:'lime',
  kamias:'bilimbi', sampalok:'tamarind',
  // Condiments & Cooking
  patis:'fish sauce', toyo:'soy sauce', suka:'vinegar',
  bagoong:'shrimp paste', alamang:'shrimp paste',
  asukal:'sugar', asin:'salt', paminta:'pepper',
  mantika:'cooking oil', langis:'oil',
  // Common dish keywords
  adobo:'adobo chicken', sinigang:'sour soup', kare_kare:'oxtail stew',
  tinola:'chicken ginger soup', dinuguan:'pork blood stew',
  bistek:'beef steak', mechado:'beef stew', kaldereta:'goat stew',
  menudo:'pork stew', afritada:'chicken stew', paksiw:'fish vinegar stew',
  nilaga:'boiled soup', bulalo:'beef bone soup',
}

export function toEnglish(filipinoWord) {
  if (!filipinoWord) return filipinoWord
  const key = filipinoWord.toLowerCase().replace(/\s+/g,'_').replace(/[()]/g,'')
  return FILIPINO_TO_ENGLISH[key] ?? filipinoWord
}

// ─── Filipino dish keywords for filtering MealDB results ─────
export const FILIPINO_DISHES = [
  'adobo','sinigang','kare-kare','kare kare','tinola','bistek','mechado',
  'kaldereta','menudo','afritada','paksiw','nilaga','bulalo','dinuguan',
  'lechon','crispy pata','pork belly','fried rice','chicken rice',
  'chicken','pork','beef','fish','shrimp','squid','egg','eggplant',
  'bitter melon','ampalaya','pinakbet','laing','kinilaw','fried chicken',
  'sweet sour','mongo','mung bean','banana blossom','jackfruit',
]

// MealDB ingredient search keywords for common Filipino ingredients
export const INGREDIENT_SEARCH_MAP = {
  manok:'chicken', baboy:'pork', karne:'beef', baka:'beef',
  isda:'salmon', bangus:'salmon', galunggong:'mackerel',
  hipon:'prawns', pusit:'squid',
  itlog:'eggs', kamatis:'tomatoes', sibuyas:'onion', bawang:'garlic',
  ampalaya:'bitter gourd', kangkong:'spinach', talong:'aubergine',
  patatas:'potatoes', sayote:'chayote', kalabasa:'butternut squash',
  luya:'ginger', sili:'chilli', pechay:'bok choy',
  repolyo:'cabbage', carrot:'carrots', okra:'okra',
  saging:'bananas', mangga:'mango', papaya:'papaya',
  patis:'fish sauce', toyo:'soy sauce', suka:'vinegar',
  bigas:'rice',
}

export function getSearchIngredient(pantryItem) {
  const key = pantryItem.toLowerCase().replace(/\s+/g,'_').replace(/[()]/g,'')
  return INGREDIENT_SEARCH_MAP[key] ?? toEnglish(pantryItem)
}

// ─── Nutrition search term for OpenFoodFacts ──────────────────
export const NUTRITION_SEARCH_MAP = {
  // Rice
  'bigas (well-milled)':'white rice', 'bigas (special)':'jasmine rice',
  'bigas (regular milled)':'rice grain', 'bigas (dinorado)':'rice grain',
  'bigas (sinandomeng)':'white rice', 'mais (white corn)':'white corn',
  // Meat
  'manok (dressed)':'chicken whole', 'manok (native/free range)':'chicken meat',
  'manok (broiler)':'broiler chicken',
  'baboy (kasim)':'pork shoulder', 'baboy (liempo)':'pork belly',
  'baboy (pigue)':'pork leg', 'baboy (pork chop)':'pork chop',
  'karne (baka)':'beef', 'tadyang ng baka':'beef ribs',
  'goto (beef tripe)':'beef tripe',
  // Fish
  'bangus':'milkfish', 'galunggong':'scad fish mackerel',
  'tilapia':'tilapia fish', 'alumahan':'mackerel',
  'dalagang bukid':'snapper fish', 'maya-maya':'red snapper',
  'tulingan':'mackerel tuna', 'tambakol':'yellowfin tuna',
  'tanigue':'spanish mackerel', 'hipon (suahe)':'shrimp',
  'pusit (squid)':'squid', 'talaba (oyster)':'oyster',
  'alimango':'crab', 'alimasag (blue crab)':'blue crab',
  'dalag (mudfish)':'mudfish', 'hito (catfish)':'catfish',
  // Eggs & Dairy
  'itlog (chicken)':'chicken egg', 'itlog (native)':'free range egg',
  'itlog (duck/balut)':'duck egg', 'kesong puti':'white cheese fresh',
  'gata (coconut milk)':'coconut milk',
  // Vegetables
  'kamatis':'tomato', 'sibuyas (tagalog)':'onion', 'sibuyas (bombay)':'red onion',
  'bawang (imported)':'garlic', 'bawang (native)':'garlic',
  'ampalaya':'bitter melon', 'kangkong':'water spinach',
  'sitaw':'yard long beans', 'talong':'eggplant', 'pechay':'bok choy',
  'repolyo':'cabbage', 'patatas':'potato', 'carrot':'carrot',
  'sayote':'chayote', 'kalabasa':'squash pumpkin',
  'okra':'okra', 'luya':'ginger', 'sili (green)':'green chili',
  'pipino':'cucumber', 'labanos':'white radish', 'upo':'bottle gourd',
  'monggo (mung beans)':'mung beans', 'kadyos':'pigeon peas',
  'dahon ng sili':'chili leaves', 'malunggay':'moringa leaves',
  // Fruits
  'saging na saba':'plantain banana', 'saging (latundan)':'banana',
  'mangga (carabao)':'carabao mango', 'mangga (green)':'green mango',
  'papaya (ripe)':'papaya ripe', 'papaya (green)':'green papaya',
  'kalamansi':'calamansi lime', 'sampalok':'tamarind',
  'lansones':'lanzones fruit', 'mangosteen':'mangosteen',
  'rambutan':'rambutan', 'atis':'custard apple', 'guava':'guava',
  // Cooking staples
  'cooking oil':'vegetable cooking oil', 'asukal (refined)':'white sugar',
  'asukal (brown)':'brown sugar', 'patis':'fish sauce',
  'toyo':'soy sauce', 'suka':'white vinegar', 'asin':'salt',
  'paminta':'black pepper', 'knorr cubes':'bouillon cube',
  'bawang powder':'garlic powder', 'vetsin (msg)':'monosodium glutamate',
  // Noodles & Grains
  'pancit canton':'egg noodles', 'sotanghon':'glass noodles',
  'bihon':'rice noodles', 'miswa':'thin noodles',
  'lucky me instant noodles':'instant noodles',
  'white bread':'white bread', 'pandesal':'bread roll',
  // Condiments
  'tomato sauce (del monte)':'tomato sauce', 'banana catsup':'banana ketchup',
  'oyster sauce':'oyster sauce', 'hoisin sauce':'hoisin sauce',
  // Beverages
  'nescafe instant coffee':'instant coffee',
  'milo (chocolate drink)':'milo chocolate',
  'lipton tea':'black tea', 'c2 green tea':'green tea',
}

export function getNutritionSearchTerm(commodityName) {
  const lower = commodityName.toLowerCase()
  // Direct map lookup
  if (NUTRITION_SEARCH_MAP[lower]) return NUTRITION_SEARCH_MAP[lower]
  // Partial match
  const key = Object.keys(NUTRITION_SEARCH_MAP).find(k => lower.includes(k) || k.includes(lower))
  if (key) return NUTRITION_SEARCH_MAP[key]
  // Fallback: translate known Filipino words
  return toEnglish(lower)
}

// ─── Price formatting ─────────────────────────────────────────
export function formatPrice(amount, opts={}) {
  const { decimals=2 } = opts
  if (amount==null||isNaN(Number(amount))) return '—'
  return `₱${Number(amount).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g,',')}`
}

export function calcSavings(palengke, supermarket) {
  if (!palengke||!supermarket) return null
  const diff = supermarket - palengke
  const pct  = ((diff/supermarket)*100).toFixed(1)
  return { amount:diff, formatted:formatPrice(Math.abs(diff)), percent:Math.abs(pct), isPositive:diff>0 }
}

export function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})
}

// Kept for backward compat
export function getEmoji(name) { return '' }
