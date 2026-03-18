import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import HomePage from './pages/HomePage/HomePage'
import WorkDetailPage from './pages/WorkDetail/WorkDetail'

/**
 * App.jsx — Componente raíz con configuración de rutas.
 * Rutas:
 *   /         → HomePage (Hero + Mapa + Footer)
 *   /obra/:id → WorkDetailPage (Detalle de obra)
 */
function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/obra/:id" element={<WorkDetailPage />} />
      </Routes>
    </>
  )
}

export default App
