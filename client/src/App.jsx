import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect }                     from 'react'
import { useDispatch }                   from 'react-redux'
import { fetchMe }                       from './app/authSlice.js'
import { Navbar, Footer }                from './components/layout/Layout.jsx'
import LandingPage        from './pages/LandingPage.jsx'
import PricesPage         from './pages/PricesPage.jsx'
import ItemDetailPage     from './pages/ItemDetailPage.jsx'
import RecipesPage        from './pages/RecipesPage.jsx'
import ShoppingListPage   from './pages/ShoppingListPage.jsx'
import MarketLocatorPage  from './pages/MarketLocatorPage.jsx'
import ForumPage          from './pages/ForumPage.jsx'
import PostDetailPage     from './pages/PostDetailPage.jsx'
import AuthPage           from './pages/AuthPage.jsx'
import NotFoundPage       from './pages/NotFoundPage.jsx'
import './styles/main.css'

export default function App() {
  const dispatch = useDispatch()
  useEffect(() => { dispatch(fetchMe()) }, [dispatch])

  return (
    <BrowserRouter>
      <div className="page-shell">
        <Navbar />
        <main className="page-body">
          <Routes>
            <Route path="/"                element={<LandingPage />} />
            <Route path="/prices"          element={<PricesPage />} />
            <Route path="/item/:id"        element={<ItemDetailPage />} />
            <Route path="/recipes"         element={<RecipesPage />} />
            <Route path="/list"            element={<ShoppingListPage />} />
            <Route path="/map"             element={<MarketLocatorPage />} />
            <Route path="/forum"           element={<ForumPage />} />
            <Route path="/forum/post/:id"  element={<PostDetailPage />} />
            <Route path="/forum/login"     element={<AuthPage />} />
            <Route path="*"               element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
