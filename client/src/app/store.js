import { configureStore, createSlice } from '@reduxjs/toolkit'
import authReducer from './authSlice.js'
import { createApi, fetchBaseQuery }   from '@reduxjs/toolkit/query/react'
import { PAGE_SIZE }                   from '../utils/helpers'

// ══════════════════════════════════════════════════════════════
// REGIONAL PRICE VARIATION ENGINE
// Prices vary realistically by region. Some SM items are cheaper.
// ══════════════════════════════════════════════════════════════
const REGIONAL_VARIANCE = {
  NCR:  { palengke: 1.00, supermarket: 1.00 },
  R3:   { palengke: 0.95, supermarket: 0.97 },
  R4A:  { palengke: 0.97, supermarket: 0.98 },
  R6:   { palengke: 0.90, supermarket: 0.94 },
  R7:   { palengke: 0.92, supermarket: 0.95 },
  R11:  { palengke: 0.88, supermarket: 0.92 },
  CAR:  { palengke: 0.93, supermarket: 0.96 },
  R1:   { palengke: 0.91, supermarket: 0.95 },
  R2:   { palengke: 0.89, supermarket: 0.93 },
  R5:   { palengke: 0.92, supermarket: 0.96 },
  R8:   { palengke: 0.87, supermarket: 0.91 },
  R10:  { palengke: 0.88, supermarket: 0.92 },
}

// Daily price drift — simulates real market fluctuation (±3%)
function dailyDrift(base, seed) {
  const day = Math.floor(Date.now() / 86400000)
  const rng  = Math.sin(seed * 9301 + day * 49297) * 0.5 + 0.5
  return Math.round(base * (1 + (rng - 0.5) * 0.06))
}

export function getRegionalPrice(baseItem, regionCode) {
  const v = REGIONAL_VARIANCE[regionCode] ?? REGIONAL_VARIANCE.NCR
  return {
    ...baseItem,
    region: regionCode,
    palengke:    dailyDrift(Math.round(baseItem.palengkeBase    * v.palengke),    baseItem._seed),
    supermarket: dailyDrift(Math.round(baseItem.supermarketBase * v.supermarket), baseItem._seed + 1),
  }
}

// ══════════════════════════════════════════════════════════════
// COMMODITY MASTER LIST — 65 items (NCR base prices)
// supermarket < palengke on some packaged goods (realistic)
// ══════════════════════════════════════════════════════════════
const RAW_COMMODITIES = [
  // ── RICE & GRAINS ─────────────────────────────────────────
  { id:'c1',  name:'Bigas (Well-milled)',      category:'rice',       unit:'kg',    palengkeBase:46,  supermarketBase:54,  srp:49,  _seed:1 },
  { id:'c2',  name:'Bigas (Special)',           category:'rice',       unit:'kg',    palengkeBase:55,  supermarketBase:68,  srp:57,  _seed:2 },
  { id:'c3',  name:'Bigas (Regular Milled)',    category:'rice',       unit:'kg',    palengkeBase:42,  supermarketBase:50,  srp:43,  _seed:3 },
  { id:'c4',  name:'Bigas (Dinorado)',          category:'rice',       unit:'kg',    palengkeBase:60,  supermarketBase:72,  srp:62,  _seed:4 },
  { id:'c5',  name:'Bigas (Sinandomeng)',       category:'rice',       unit:'kg',    palengkeBase:58,  supermarketBase:70,  srp:60,  _seed:5 },
  { id:'c6',  name:'Mais (White Corn)',         category:'rice',       unit:'kg',    palengkeBase:35,  supermarketBase:42,  srp:36,  _seed:6 },
  // ── MEAT ──────────────────────────────────────────────────
  { id:'c7',  name:'Manok (Dressed)',           category:'meat',       unit:'kg',    palengkeBase:185, supermarketBase:215, srp:190, _seed:7 },
  { id:'c8',  name:'Manok (Native/Free Range)', category:'meat',       unit:'kg',    palengkeBase:320, supermarketBase:380, srp:330, _seed:8 },
  { id:'c9',  name:'Manok (Broiler)',           category:'meat',       unit:'kg',    palengkeBase:165, supermarketBase:195, srp:170, _seed:9 },
  { id:'c10', name:'Baboy (Kasim)',             category:'meat',       unit:'kg',    palengkeBase:280, supermarketBase:318, srp:290, _seed:10 },
  { id:'c11', name:'Baboy (Liempo)',            category:'meat',       unit:'kg',    palengkeBase:300, supermarketBase:342, srp:310, _seed:11 },
  { id:'c12', name:'Baboy (Pigue)',             category:'meat',       unit:'kg',    palengkeBase:270, supermarketBase:308, srp:280, _seed:12 },
  { id:'c13', name:'Baboy (Pork Chop)',         category:'meat',       unit:'kg',    palengkeBase:295, supermarketBase:285, srp:300, _seed:13 }, // SM cheaper (packaged)
  { id:'c14', name:'Karne (Baka)',              category:'meat',       unit:'kg',    palengkeBase:360, supermarketBase:415, srp:370, _seed:14 },
  { id:'c15', name:'Tadyang ng Baka',           category:'meat',       unit:'kg',    palengkeBase:320, supermarketBase:375, srp:330, _seed:15 },
  { id:'c16', name:'Goto (Beef Tripe)',         category:'meat',       unit:'kg',    palengkeBase:220, supermarketBase:265, srp:230, _seed:16 },
  // ── FISH & SEAFOOD ─────────────────────────────────────────
  { id:'c17', name:'Bangus',                   category:'fish',       unit:'kg',    palengkeBase:175, supermarketBase:218, srp:180, _seed:17 },
  { id:'c18', name:'Galunggong',               category:'fish',       unit:'kg',    palengkeBase:165, supermarketBase:192, srp:170, _seed:18 },
  { id:'c19', name:'Tilapia',                  category:'fish',       unit:'kg',    palengkeBase:120, supermarketBase:145, srp:125, _seed:19 },
  { id:'c20', name:'Alumahan',                 category:'fish',       unit:'kg',    palengkeBase:180, supermarketBase:220, srp:185, _seed:20 },
  { id:'c21', name:'Dalagang Bukid',           category:'fish',       unit:'kg',    palengkeBase:240, supermarketBase:285, srp:250, _seed:21 },
  { id:'c22', name:'Maya-Maya',                category:'fish',       unit:'kg',    palengkeBase:280, supermarketBase:320, srp:290, _seed:22 },
  { id:'c23', name:'Tulingan',                 category:'fish',       unit:'kg',    palengkeBase:155, supermarketBase:185, srp:160, _seed:23 },
  { id:'c24', name:'Tambakol',                 category:'fish',       unit:'kg',    palengkeBase:200, supermarketBase:245, srp:210, _seed:24 },
  { id:'c25', name:'Tanigue',                  category:'fish',       unit:'kg',    palengkeBase:320, supermarketBase:295, srp:330, _seed:25 }, // SM cheaper (packed fillet)
  { id:'c26', name:'Hipon (Suahe)',            category:'fish',       unit:'kg',    palengkeBase:380, supermarketBase:420, srp:390, _seed:26 },
  { id:'c27', name:'Pusit (Squid)',            category:'fish',       unit:'kg',    palengkeBase:280, supermarketBase:320, srp:290, _seed:27 },
  { id:'c28', name:'Talaba (Oyster)',          category:'fish',       unit:'kg',    palengkeBase:120, supermarketBase:160, srp:130, _seed:28 },
  { id:'c29', name:'Alimango',                 category:'fish',       unit:'kg',    palengkeBase:480, supermarketBase:550, srp:500, _seed:29 },
  { id:'c30', name:'Alimasag (Blue Crab)',     category:'fish',       unit:'kg',    palengkeBase:350, supermarketBase:390, srp:360, _seed:30 },
  { id:'c31', name:'Dalag (Mudfish)',          category:'fish',       unit:'kg',    palengkeBase:200, supermarketBase:240, srp:210, _seed:31 },
  { id:'c32', name:'Hito (Catfish)',           category:'fish',       unit:'kg',    palengkeBase:185, supermarketBase:220, srp:190, _seed:32 },
  // ── EGGS & DAIRY ──────────────────────────────────────────
  { id:'c33', name:'Itlog (Chicken)',          category:'eggs_dairy', unit:'piece', palengkeBase:8,   supermarketBase:10,  srp:9,   _seed:33 },
  { id:'c34', name:'Itlog (Native)',           category:'eggs_dairy', unit:'piece', palengkeBase:12,  supermarketBase:14,  srp:13,  _seed:34 },
  { id:'c35', name:'Itlog (Duck/Balut)',       category:'eggs_dairy', unit:'piece', palengkeBase:18,  supermarketBase:22,  srp:19,  _seed:35 },
  { id:'c36', name:'Kesong Puti',              category:'eggs_dairy', unit:'pack',  palengkeBase:55,  supermarketBase:48,  srp:58,  _seed:36 }, // SM cheaper
  { id:'c37', name:'Gata (Coconut Milk)',      category:'eggs_dairy', unit:'pack',  palengkeBase:30,  supermarketBase:28,  srp:32,  _seed:37 }, // SM cheaper
  // ── VEGETABLES ────────────────────────────────────────────
  { id:'c38', name:'Kamatis',                  category:'vegetables', unit:'kg',    palengkeBase:60,  supermarketBase:82,  srp:65,  _seed:38 },
  { id:'c39', name:'Sibuyas (Tagalog)',         category:'vegetables', unit:'kg',    palengkeBase:80,  supermarketBase:105, srp:85,  _seed:39 },
  { id:'c40', name:'Sibuyas (Bombay)',          category:'vegetables', unit:'kg',    palengkeBase:70,  supermarketBase:92,  srp:75,  _seed:40 },
  { id:'c41', name:'Bawang (Imported)',         category:'vegetables', unit:'kg',    palengkeBase:180, supermarketBase:222, srp:185, _seed:41 },
  { id:'c42', name:'Bawang (Native)',           category:'vegetables', unit:'kg',    palengkeBase:220, supermarketBase:265, srp:228, _seed:42 },
  { id:'c43', name:'Ampalaya',                  category:'vegetables', unit:'kg',    palengkeBase:70,  supermarketBase:95,  srp:75,  _seed:43 },
  { id:'c44', name:'Kangkong',                  category:'vegetables', unit:'bundle',palengkeBase:15,  supermarketBase:28,  srp:18,  _seed:44 },
  { id:'c45', name:'Sitaw',                     category:'vegetables', unit:'kg',    palengkeBase:55,  supermarketBase:78,  srp:60,  _seed:45 },
  { id:'c46', name:'Talong',                    category:'vegetables', unit:'kg',    palengkeBase:48,  supermarketBase:68,  srp:52,  _seed:46 },
  { id:'c47', name:'Pechay',                    category:'vegetables', unit:'bundle',palengkeBase:20,  supermarketBase:35,  srp:22,  _seed:47 },
  { id:'c48', name:'Repolyo',                   category:'vegetables', unit:'kg',    palengkeBase:50,  supermarketBase:70,  srp:55,  _seed:48 },
  { id:'c49', name:'Patatas',                   category:'vegetables', unit:'kg',    palengkeBase:60,  supermarketBase:75,  srp:65,  _seed:49 },
  { id:'c50', name:'Carrot',                    category:'vegetables', unit:'kg',    palengkeBase:55,  supermarketBase:70,  srp:60,  _seed:50 },
  { id:'c51', name:'Sayote',                    category:'vegetables', unit:'piece', palengkeBase:18,  supermarketBase:28,  srp:20,  _seed:51 },
  { id:'c52', name:'Kalabasa',                  category:'vegetables', unit:'kg',    palengkeBase:40,  supermarketBase:58,  srp:45,  _seed:52 },
  { id:'c53', name:'Okra',                      category:'vegetables', unit:'kg',    palengkeBase:60,  supermarketBase:85,  srp:65,  _seed:53 },
  { id:'c54', name:'Luya',                      category:'vegetables', unit:'kg',    palengkeBase:80,  supermarketBase:105, srp:85,  _seed:54 },
  { id:'c55', name:'Monggo (Mung Beans)',        category:'vegetables', unit:'kg',    palengkeBase:115, supermarketBase:105, srp:120, _seed:55 }, // SM cheaper (branded pack)
  { id:'c56', name:'Malunggay',                 category:'vegetables', unit:'bundle',palengkeBase:12,  supermarketBase:22,  srp:14,  _seed:56 },
  // ── FRUITS ────────────────────────────────────────────────
  { id:'c57', name:'Saging na Saba',            category:'fruits',     unit:'piece', palengkeBase:8,   supermarketBase:14,  srp:10,  _seed:57 },
  { id:'c58', name:'Saging (Latundan)',          category:'fruits',     unit:'piece', palengkeBase:6,   supermarketBase:10,  srp:7,   _seed:58 },
  { id:'c59', name:'Mangga (Carabao)',           category:'fruits',     unit:'kg',    palengkeBase:95,  supermarketBase:132, srp:100, _seed:59 },
  { id:'c60', name:'Mangga (Green)',             category:'fruits',     unit:'kg',    palengkeBase:60,  supermarketBase:88,  srp:65,  _seed:60 },
  { id:'c61', name:'Papaya (Ripe)',              category:'fruits',     unit:'kg',    palengkeBase:45,  supermarketBase:68,  srp:50,  _seed:61 },
  { id:'c62', name:'Kalamansi',                  category:'fruits',     unit:'kg',    palengkeBase:70,  supermarketBase:95,  srp:75,  _seed:62 },
  { id:'c63', name:'Sampalok',                   category:'fruits',     unit:'kg',    palengkeBase:85,  supermarketBase:110, srp:90,  _seed:63 },
  // ── COOKING ───────────────────────────────────────────────
  { id:'c64', name:'Cooking Oil',                category:'cooking',    unit:'liter', palengkeBase:90,  supermarketBase:98,  srp:92,  _seed:64 },
  { id:'c65', name:'Asukal (Refined)',           category:'cooking',    unit:'kg',    palengkeBase:68,  supermarketBase:78,  srp:70,  _seed:65 },
  { id:'c66', name:'Asukal (Brown)',             category:'cooking',    unit:'kg',    palengkeBase:62,  supermarketBase:72,  srp:64,  _seed:66 },
  { id:'c67', name:'Patis',                      category:'cooking',    unit:'bottle',palengkeBase:58,  supermarketBase:52,  srp:60,  _seed:67 }, // SM cheaper
  { id:'c68', name:'Toyo',                       category:'cooking',    unit:'bottle',palengkeBase:52,  supermarketBase:46,  srp:55,  _seed:68 }, // SM cheaper
  { id:'c69', name:'Suka',                       category:'cooking',    unit:'bottle',palengkeBase:40,  supermarketBase:36,  srp:42,  _seed:69 }, // SM cheaper
  { id:'c70', name:'Asin',                       category:'cooking',    unit:'kg',    palengkeBase:18,  supermarketBase:15,  srp:20,  _seed:70 }, // SM cheaper
  { id:'c71', name:'Bagoong Alamang',            category:'condiments', unit:'jar',   palengkeBase:48,  supermarketBase:44,  srp:50,  _seed:71 }, // SM cheaper
  { id:'c72', name:'Knorr Cubes',                category:'condiments', unit:'pack',  palengkeBase:18,  supermarketBase:15,  srp:20,  _seed:72 }, // SM cheaper
  // ── NOODLES ───────────────────────────────────────────────
  { id:'c73', name:'Pancit Canton',              category:'noodles',    unit:'pack',  palengkeBase:18,  supermarketBase:16,  srp:20,  _seed:73 }, // SM cheaper
  { id:'c74', name:'Sotanghon',                  category:'noodles',    unit:'pack',  palengkeBase:25,  supermarketBase:22,  srp:27,  _seed:74 }, // SM cheaper
  { id:'c75', name:'Bihon',                      category:'noodles',    unit:'pack',  palengkeBase:22,  supermarketBase:19,  srp:24,  _seed:75 }, // SM cheaper
  { id:'c76', name:'Miswa',                      category:'noodles',    unit:'pack',  palengkeBase:20,  supermarketBase:18,  srp:22,  _seed:76 }, // SM cheaper
  // ── BEVERAGES ─────────────────────────────────────────────
  { id:'c77', name:'Nescafe Instant Coffee',     category:'beverages',  unit:'sachet',palengkeBase:8,   supermarketBase:7,   srp:9,   _seed:77 }, // SM cheaper
  { id:'c78', name:'Milo (Chocolate Drink)',     category:'beverages',  unit:'sachet',palengkeBase:10,  supermarketBase:9,   srp:11,  _seed:78 }, // SM cheaper
  // ── CONDIMENTS ────────────────────────────────────────────
  { id:'c79', name:'Tomato Sauce (Del Monte)',   category:'condiments', unit:'can',   palengkeBase:22,  supermarketBase:19,  srp:24,  _seed:79 }, // SM cheaper
  { id:'c80', name:'Banana Catsup',              category:'condiments', unit:'bottle',palengkeBase:30,  supermarketBase:26,  srp:32,  _seed:80 }, // SM cheaper
]

// Build commodity list with NCR prices by default
export const PH_COMMODITIES = RAW_COMMODITIES.map(c => ({
  ...c,
  nameLocal: c.name,
  region: 'NCR',
  palengke:    dailyDrift(c.palengkeBase,    c._seed),
  supermarket: dailyDrift(c.supermarketBase, c._seed + 1),
  dateUpdated: new Date().toISOString().slice(0,10),
  searchKey:   c.name.toLowerCase(),
}))


// ══════════════════════════════════════════════════════════════
// RTK QUERY — OpenFoodFacts API (with smart search term)
// ══════════════════════════════════════════════════════════════
export const nutritionApi = createApi({
  reducerPath: 'nutritionApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://world.openfoodfacts.org' }),
  endpoints: (builder) => ({
    getNutrition: builder.query({
      query: (searchTerm) =>
        `/cgi/search.pl?search_terms=${encodeURIComponent(searchTerm)}&search_simple=1&action=process&json=1&page_size=3&fields=product_name,nutriments,image_url,quantity,brands`,
      transformResponse: (res) => {
        // pick best product (prefer one with nutrition data)
        const products = res?.products ?? []
        const p = products.find(p => p.nutriments?.['energy-kcal_100g'] != null) ?? products[0]
        if (!p) return null
        const n = p.nutriments ?? {}
        return {
          name: p.product_name, imageUrl: p.image_url,
          brands: p.brands,     quantity: p.quantity,
          nutrition: {
            calories: n['energy-kcal_100g'] ?? n['energy_100g'] ?? null,
            protein:  n['proteins_100g'] ?? null,
            carbs:    n['carbohydrates_100g'] ?? null,
            fat:      n['fat_100g'] ?? null,
            fiber:    n['fiber_100g'] ?? null,
            sodium:   n['sodium_100g'] ? +(n['sodium_100g']*1000).toFixed(1) : null,
            sugar:    n['sugars_100g'] ?? null,
          },
        }
      },
      transformErrorResponse: () => null,
    }),
  }),
})

// ══════════════════════════════════════════════════════════════
// RTK QUERY — TheMealDB API (Filipino recipes via search)
// ══════════════════════════════════════════════════════════════
export const mealApi = createApi({
  reducerPath: 'mealApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://www.themealdb.com/api/json/v1/1' }),
  endpoints: (builder) => ({
    // Search by ingredient (English) — returns meals with that ingredient
    searchByIngredient: builder.query({
      query: (ing) => `/filter.php?i=${encodeURIComponent(ing)}`,
      transformResponse: (r) => (r?.meals ?? []).map(nm),
      transformErrorResponse: () => [],
    }),
    // Search meals by name
    searchByName: builder.query({
      query: (name) => `/search.php?s=${encodeURIComponent(name)}`,
      transformResponse: (r) => (r?.meals ?? []).map(nm),
      transformErrorResponse: () => [],
    }),
    // Full meal detail
    getMealById: builder.query({
      query: (id) => `/lookup.php?i=${id}`,
      transformResponse: (r) => { const m=r?.meals?.[0]; return m ? nmd(m) : null },
    }),
    // Browse by category
    getByCategory: builder.query({
      query: (c) => `/filter.php?c=${encodeURIComponent(c)}`,
      transformResponse: (r) => (r?.meals ?? []).slice(0,12).map(nm),
    }),
    getCategories: builder.query({
      query: () => '/categories.php',
      transformResponse: (r) => r?.categories ?? [],
    }),
    // Filter area=Filipino
    getFilipinoDishes: builder.query({
      query: (ingredient) => `/filter.php?a=Filipino`,
      transformResponse: (r) => (r?.meals ?? []).map(nm),
      transformErrorResponse: () => [],
    }),
    // Search for Filipino dishes by name keyword
    searchFilipinoByKeyword: builder.query({
      query: (kw) => `/search.php?s=${encodeURIComponent(kw)}`,
      transformResponse: (r) =>
        (r?.meals ?? [])
          .filter(m => isFilipino(m))
          .map(nm),
      transformErrorResponse: () => [],
    }),
  }),
})

function isFilipino(m) {
  return m.strArea === 'Filipino' ||
    FILIPINO_KEYWORDS.some(k => m.strMeal?.toLowerCase().includes(k))
}
const FILIPINO_KEYWORDS = [
  'adobo','sinigang','kare','tinola','bistek','mechado','kaldereta',
  'menudo','afritada','paksiw','nilaga','bulalo','dinuguan','lechon',
  'pinakbet','laing','kinilaw','binagoongan','fried rice','pancit',
  'lumpia','sisig','crispy','pork belly','pochero','estofado',
]

function nm(m){ return { id:m.idMeal, title:m.strMeal, imageUrl:m.strMealThumb, category:m.strCategory??'', area:m.strArea??'' } }
function nmd(m){
  const ings=[]
  for(let i=1;i<=20;i++){
    const g=m[`strIngredient${i}`]?.trim(), ms=m[`strMeasure${i}`]?.trim()
    if(g) ings.push({name:g, measure:ms??''})
  }
  return { id:m.idMeal, title:m.strMeal, imageUrl:m.strMealThumb,
    category:m.strCategory, area:m.strArea,
    instructions:m.strInstructions, youtube:m.strYoutube, ingredients:ings,
    tags:m.strTags?m.strTags.split(',').map(t=>t.trim()):[] }
}

export const { useGetNutritionQuery } = nutritionApi
export const {
  useSearchByIngredientQuery, useSearchByNameQuery, useGetMealByIdQuery,
  useGetByCategoryQuery, useGetCategoriesQuery,
  useGetFilipinoDishesQuery, useSearchFilipinoByKeywordQuery,
} = mealApi

// ══════════════════════════════════════════════════════════════
// SLICES
// ══════════════════════════════════════════════════════════════
const commoditySlice = createSlice({
  name:'commodity',
  initialState:{ search:'', category:'all', region:'NCR', sort:'name_asc', page:1 },
  reducers:{
    setSearch:    (s,a) => { s.search=a.payload;   s.page=1 },
    setCategory:  (s,a) => { s.category=a.payload; s.page=1 },
    setRegion:    (s,a) => { s.region=a.payload;   s.page=1 },
    setSort:      (s,a) => { s.sort=a.payload },
    setPage:      (s,a) => { s.page=a.payload },
    resetFilters: (s)   => { s.search=''; s.category='all'; s.page=1 },
  },
})
export const { setSearch,setCategory,setRegion,setSort,setPage,resetFilters } = commoditySlice.actions

const recipeSlice = createSlice({
  name:'recipe',
  initialState:{ pantry:[], query:'', page:1 },
  reducers:{
    addIngredient:    (s,a) => { const v=a.payload.trim().toLowerCase(); if(v&&!s.pantry.includes(v)) s.pantry.push(v) },
    removeIngredient: (s,a) => { s.pantry=s.pantry.filter(i=>i!==a.payload) },
    clearPantry:      (s)   => { s.pantry=[] },
    setRecipeQuery:   (s,a) => { s.query=a.payload; s.page=1 },
    setRecipePage:    (s,a) => { s.page=a.payload },
  },
})
export const { addIngredient,removeIngredient,clearPantry,setRecipeQuery,setRecipePage } = recipeSlice.actions

const shoppingSlice = createSlice({
  name:'shopping',
  initialState:{ items:[], checkedIds:[] },
  reducers:{
    addToList(state,{payload:item}){
      if(!state.items.find(i=>i.id===item.id)){
        state.items.push({ id:item.id, name:item.name, category:item.category,
          unit:item.unit, qty:1,
          store: item.palengke <= item.supermarket ? 'palengke' : 'supermarket',
          palengke:item.palengke, supermarket:item.supermarket, srp:item.srp })
      }
    },
    removeFromList(state,{payload:id}){ state.items=state.items.filter(i=>i.id!==id); state.checkedIds=state.checkedIds.filter(x=>x!==id) },
    updateQty(state,{payload:{id,qty}}){ const item=state.items.find(i=>i.id===id); if(item) item.qty=Math.max(1,qty) },
    setItemStore(state,{payload:{id,store}}){ const item=state.items.find(i=>i.id===id); if(item) item.store=store },
    toggleChecked(state,{payload:id}){ state.checkedIds.includes(id)?(state.checkedIds=state.checkedIds.filter(x=>x!==id)):state.checkedIds.push(id) },
    clearChecked(state){ state.items=state.items.filter(i=>!state.checkedIds.includes(i.id)); state.checkedIds=[] },
    clearList(state){ state.items=[]; state.checkedIds=[] },
  },
})
export const { addToList,removeFromList,updateQty,setItemStore,toggleChecked,clearChecked,clearList } = shoppingSlice.actions
export const selectShoppingItems  = s=>s.shopping.items
export const selectCheckedIds     = s=>s.shopping.checkedIds
export const selectIsInList       = (s,id)=>s.shopping.items.some(i=>i.id===id)
export const selectShoppingCount  = s=>s.shopping.items.length
export const selectShoppingTotals = s=>{
  const items=s.shopping.items
  const palengkeTotal    = items.reduce((sum,i)=>sum+i.palengke*i.qty,0)
  const supermarketTotal = items.reduce((sum,i)=>sum+i.supermarket*i.qty,0)
  const chosenTotal      = items.reduce((sum,i)=>sum+(i.store==='palengke'?i.palengke:i.supermarket)*i.qty,0)
  return { palengkeTotal, supermarketTotal, chosenTotal, savings:supermarketTotal-chosenTotal }
}

export const store = configureStore({
  reducer:{ auth:authReducer, commodity:commoditySlice.reducer, recipe:recipeSlice.reducer,
    shopping:shoppingSlice.reducer,
    [nutritionApi.reducerPath]:nutritionApi.reducer, [mealApi.reducerPath]:mealApi.reducer },
  middleware:(get)=>get().concat(nutritionApi.middleware,mealApi.middleware),
})
