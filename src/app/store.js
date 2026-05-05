import { configureStore, createSlice } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery }    from '@reduxjs/toolkit/query/react'
import { PAGE_SIZE }                    from '../utils/helpers'

export const PH_COMMODITIES = [
  { id:'c1',  name:'Bigas (Well-milled)',   nameLocal:'Bigas',      category:'rice',       unit:'kg',     region:'NCR', palengke:46,  supermarket:58,  srp:49,  dateUpdated:'2025-05-02', searchKey:'bigas rice well milled' },
  { id:'c2',  name:'Bigas (Special)',       nameLocal:'Bigas',      category:'rice',       unit:'kg',     region:'NCR', palengke:54,  supermarket:68,  srp:56,  dateUpdated:'2025-05-02', searchKey:'bigas rice special premium' },
  { id:'c3',  name:'Bigas (Regular Milled)',nameLocal:'Bigas',      category:'rice',       unit:'kg',     region:'NCR', palengke:42,  supermarket:52,  srp:43,  dateUpdated:'2025-05-02', searchKey:'bigas rice regular' },
  { id:'c4',  name:'Itlog (Chicken)',       nameLocal:'Itlog',      category:'eggs_dairy', unit:'piece',  region:'NCR', palengke:8,   supermarket:11,  srp:9,   dateUpdated:'2025-05-02', searchKey:'itlog egg chicken' },
  { id:'c5',  name:'Manok (Dressed)',       nameLocal:'Manok',      category:'meat',       unit:'kg',     region:'NCR', palengke:185, supermarket:220, srp:190, dateUpdated:'2025-05-02', searchKey:'manok chicken dressed' },
  { id:'c6',  name:'Baboy (Kasim)',         nameLocal:'Baboy',      category:'meat',       unit:'kg',     region:'NCR', palengke:280, supermarket:320, srp:290, dateUpdated:'2025-05-02', searchKey:'baboy pork kasim' },
  { id:'c7',  name:'Baboy (Liempo)',        nameLocal:'Baboy',      category:'meat',       unit:'kg',     region:'NCR', palengke:300, supermarket:345, srp:310, dateUpdated:'2025-05-02', searchKey:'baboy pork liempo belly' },
  { id:'c8',  name:'Karne (Baka)',          nameLocal:'Karne',      category:'meat',       unit:'kg',     region:'NCR', palengke:360, supermarket:420, srp:370, dateUpdated:'2025-05-02', searchKey:'karne baka beef' },
  { id:'c9',  name:'Bangus',               nameLocal:'Bangus',     category:'fish',       unit:'kg',     region:'NCR', palengke:175, supermarket:220, srp:180, dateUpdated:'2025-05-02', searchKey:'bangus milkfish' },
  { id:'c10', name:'Galunggong',           nameLocal:'Galunggong', category:'fish',       unit:'kg',     region:'NCR', palengke:165, supermarket:195, srp:170, dateUpdated:'2025-05-02', searchKey:'galunggong round scad fish' },
  { id:'c11', name:'Tilapia',              nameLocal:'Tilapia',    category:'fish',       unit:'kg',     region:'NCR', palengke:120, supermarket:148, srp:125, dateUpdated:'2025-05-02', searchKey:'tilapia fish' },
  { id:'c12', name:'Kamatis',              nameLocal:'Kamatis',    category:'vegetables', unit:'kg',     region:'NCR', palengke:60,  supermarket:85,  srp:65,  dateUpdated:'2025-05-02', searchKey:'kamatis tomato' },
  { id:'c13', name:'Sibuyas (Tagalog)',    nameLocal:'Sibuyas',    category:'vegetables', unit:'kg',     region:'NCR', palengke:80,  supermarket:108, srp:85,  dateUpdated:'2025-05-02', searchKey:'sibuyas onion tagalog' },
  { id:'c14', name:'Bawang (Imported)',    nameLocal:'Bawang',     category:'vegetables', unit:'kg',     region:'NCR', palengke:180, supermarket:225, srp:185, dateUpdated:'2025-05-02', searchKey:'bawang garlic' },
  { id:'c15', name:'Ampalaya',             nameLocal:'Ampalaya',   category:'vegetables', unit:'kg',     region:'NCR', palengke:70,  supermarket:95,  srp:75,  dateUpdated:'2025-05-02', searchKey:'ampalaya bitter gourd melon' },
  { id:'c16', name:'Kangkong',             nameLocal:'Kangkong',   category:'vegetables', unit:'bundle', region:'NCR', palengke:15,  supermarket:28,  srp:18,  dateUpdated:'2025-05-02', searchKey:'kangkong water spinach' },
  { id:'c17', name:'Sitaw',               nameLocal:'Sitaw',      category:'vegetables', unit:'kg',     region:'NCR', palengke:55,  supermarket:78,  srp:60,  dateUpdated:'2025-05-02', searchKey:'sitaw string beans yard long' },
  { id:'c18', name:'Saging na Saba',      nameLocal:'Saging',     category:'fruits',     unit:'piece',  region:'NCR', palengke:8,   supermarket:14,  srp:10,  dateUpdated:'2025-05-02', searchKey:'saging saba banana' },
  { id:'c19', name:'Mangga (Carabao)',    nameLocal:'Mangga',     category:'fruits',     unit:'kg',     region:'NCR', palengke:95,  supermarket:135, srp:100, dateUpdated:'2025-05-02', searchKey:'mangga mango carabao' },
  { id:'c20', name:'Cooking Oil',         nameLocal:'Mantika',    category:'cooking',    unit:'liter',  region:'NCR', palengke:90,  supermarket:105, srp:92,  dateUpdated:'2025-05-02', searchKey:'cooking oil mantika vegetable' },
  { id:'c21', name:'Asukal (Refined)',    nameLocal:'Asukal',     category:'cooking',    unit:'kg',     region:'NCR', palengke:68,  supermarket:82,  srp:70,  dateUpdated:'2025-05-02', searchKey:'asukal sugar refined white' },
  { id:'c22', name:'Patis',              nameLocal:'Patis',      category:'cooking',    unit:'liter',  region:'NCR', palengke:58,  supermarket:75,  srp:60,  dateUpdated:'2025-05-02', searchKey:'patis fish sauce' },
  { id:'c23', name:'Toyo',              nameLocal:'Toyo',       category:'cooking',    unit:'liter',  region:'NCR', palengke:52,  supermarket:68,  srp:55,  dateUpdated:'2025-05-02', searchKey:'toyo soy sauce' },
  { id:'c24', name:'Suka',              nameLocal:'Suka',       category:'cooking',    unit:'liter',  region:'NCR', palengke:40,  supermarket:58,  srp:42,  dateUpdated:'2025-05-02', searchKey:'suka vinegar' },
]

export const nutritionApi = createApi({
  reducerPath: 'nutritionApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://world.openfoodfacts.org' }),
  endpoints: (builder) => ({
    getNutrition: builder.query({
      query: (t) => `/cgi/search.pl?search_terms=${encodeURIComponent(t)}&search_simple=1&action=process&json=1&page_size=1&fields=product_name,nutriments,image_url,quantity,brands`,
      transformResponse: (res) => {
        const p = res?.products?.[0]; if (!p) return null
        const n = p.nutriments ?? {}
        return { name:p.product_name, imageUrl:p.image_url, brands:p.brands, quantity:p.quantity,
          nutrition:{ calories:n['energy-kcal_100g']??n['energy_100g']??null, protein:n['proteins_100g']??null,
            carbs:n['carbohydrates_100g']??null, fat:n['fat_100g']??null, fiber:n['fiber_100g']??null,
            sodium:n['sodium_100g']?+(n['sodium_100g']*1000).toFixed(1):null, sugar:n['sugars_100g']??null }}
      },
      transformErrorResponse: () => null,
    }),
  }),
})

export const mealApi = createApi({
  reducerPath: 'mealApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://www.themealdb.com/api/json/v1/1' }),
  endpoints: (builder) => ({
    searchByIngredient: builder.query({ query:(i)=>`/filter.php?i=${encodeURIComponent(i)}`, transformResponse:(r)=>(r?.meals??[]).slice(0,8).map(nm), transformErrorResponse:()=>[] }),
    searchByName:       builder.query({ query:(n)=>`/search.php?s=${encodeURIComponent(n)}`, transformResponse:(r)=>(r?.meals??[]).map(nm), transformErrorResponse:()=>[] }),
    getMealById:        builder.query({ query:(id)=>`/lookup.php?i=${id}`, transformResponse:(r)=>{ const m=r?.meals?.[0]; return m?nmd(m):null } }),
    getByCategory:      builder.query({ query:(c)=>`/filter.php?c=${encodeURIComponent(c)}`, transformResponse:(r)=>(r?.meals??[]).slice(0,9).map(nm) }),
    getCategories:      builder.query({ query:()=>'/categories.php', transformResponse:(r)=>r?.categories??[] }),
  }),
})
function nm(m){ return { id:m.idMeal, title:m.strMeal, imageUrl:m.strMealThumb, category:m.strCategory??'' } }
function nmd(m){
  const ings=[]
  for(let i=1;i<=20;i++){ const g=m[`strIngredient${i}`]?.trim(),ms=m[`strMeasure${i}`]?.trim(); if(g) ings.push({name:g,measure:ms??''}) }
  return { id:m.idMeal,title:m.strMeal,imageUrl:m.strMealThumb,category:m.strCategory,area:m.strArea,
    instructions:m.strInstructions,youtube:m.strYoutube,ingredients:ings,
    tags:m.strTags?m.strTags.split(',').map(t=>t.trim()):[] }
}

export const { useGetNutritionQuery } = nutritionApi
export const { useSearchByIngredientQuery,useSearchByNameQuery,useGetMealByIdQuery,useGetByCategoryQuery,useGetCategoriesQuery } = mealApi

const commoditySlice = createSlice({
  name:'commodity',
  initialState:{ search:'',category:'all',region:'NCR',sort:'name_asc',page:1 },
  reducers:{
    setSearch:(s,a)=>{ s.search=a.payload; s.page=1 },
    setCategory:(s,a)=>{ s.category=a.payload; s.page=1 },
    setRegion:(s,a)=>{ s.region=a.payload; s.page=1 },
    setSort:(s,a)=>{ s.sort=a.payload },
    setPage:(s,a)=>{ s.page=a.payload },
    resetFilters:(s)=>{ s.search=''; s.category='all'; s.page=1 },
  },
})
export const { setSearch,setCategory,setRegion,setSort,setPage,resetFilters } = commoditySlice.actions

const recipeSlice = createSlice({
  name:'recipe',
  initialState:{ pantry:[],query:'',page:1 },
  reducers:{
    addIngredient:(s,a)=>{ const v=a.payload.trim().toLowerCase(); if(v&&!s.pantry.includes(v)) s.pantry.push(v) },
    removeIngredient:(s,a)=>{ s.pantry=s.pantry.filter(i=>i!==a.payload) },
    clearPantry:(s)=>{ s.pantry=[] },
    setRecipeQuery:(s,a)=>{ s.query=a.payload; s.page=1 },
    setRecipePage:(s,a)=>{ s.page=a.payload },
  },
})
export const { addIngredient,removeIngredient,clearPantry,setRecipeQuery,setRecipePage } = recipeSlice.actions

// ── Shopping List Slice ───────────────────────────────────────
const shoppingSlice = createSlice({
  name:'shopping',
  initialState:{ items:[], checkedIds:[] },
  reducers:{
    addToList(state, { payload: item }){
      if(!state.items.find(i=>i.id===item.id)){
        state.items.push({
          id:item.id, name:item.name, category:item.category,
          unit:item.unit, qty:1,
          store: item.palengke <= item.supermarket ? 'palengke' : 'supermarket',
          palengke:item.palengke, supermarket:item.supermarket, srp:item.srp,
        })
      }
    },
    removeFromList(state,{payload:id}){
      state.items=state.items.filter(i=>i.id!==id)
      state.checkedIds=state.checkedIds.filter(x=>x!==id)
    },
    updateQty(state,{payload:{id,qty}}){
      const item=state.items.find(i=>i.id===id); if(item) item.qty=Math.max(1,qty)
    },
    setItemStore(state,{payload:{id,store}}){
      const item=state.items.find(i=>i.id===id); if(item) item.store=store
    },
    toggleChecked(state,{payload:id}){
      state.checkedIds.includes(id)
        ? (state.checkedIds=state.checkedIds.filter(x=>x!==id))
        : state.checkedIds.push(id)
    },
    clearChecked(state){
      state.items=state.items.filter(i=>!state.checkedIds.includes(i.id))
      state.checkedIds=[]
    },
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
  reducer:{
    commodity:commoditySlice.reducer,
    recipe:recipeSlice.reducer,
    shopping:shoppingSlice.reducer,
    [nutritionApi.reducerPath]:nutritionApi.reducer,
    [mealApi.reducerPath]:mealApi.reducer,
  },
  middleware:(get)=>get().concat(nutritionApi.middleware,mealApi.middleware),
})
