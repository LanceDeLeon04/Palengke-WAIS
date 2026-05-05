import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar, Footer }               from './components/layout/Layout.jsx'
import LandingPage     from './pages/LandingPage.jsx'
import PricesPage      from './pages/PricesPage.jsx'
import ItemDetailPage  from './pages/ItemDetailPage.jsx'
import RecipesPage     from './pages/RecipesPage.jsx'
import ShoppingListPage from './pages/ShoppingListPage.jsx'
import NotFoundPage    from './pages/NotFoundPage.jsx'
import './styles/main.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="page-shell">
        <Navbar />
        <main className="page-body">
          <Routes>
            <Route path="/"         element={<LandingPage />}     />
            <Route path="/prices"   element={<PricesPage />}      />
            <Route path="/item/:id" element={<ItemDetailPage />}  />
            <Route path="/recipes"  element={<RecipesPage />}     />
            <Route path="/list"     element={<ShoppingListPage />} />
            <Route path="*"         element={<NotFoundPage />}    />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
