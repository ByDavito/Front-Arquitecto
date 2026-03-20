import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import FloatingWhatsAppButton from './components/FloatingWhatsApp/FloatingWhatsAppButton'
import HomePage from './pages/HomePage/HomePage'
import WorkDetailPage from './pages/WorkDetail/WorkDetail'
import { MapLoadingProvider, useMapLoadingContext } from './context/MapLoadingContext'

/**
 * AppContent — Contenido de la app que usa el contexto
 */
function AppContent() {
  const { isMapLoading, isMapLoadingEnding } = useMapLoadingContext();
  
  return (
    <>
      <Navbar isMapLoading={isMapLoading} />
      <FloatingWhatsAppButton />
      <Routes>
        <Route path="/" element={<HomePage isMapLoading={isMapLoading} isMapLoadingEnding={isMapLoadingEnding} />} />
        <Route path="/obra/:id" element={<WorkDetailPage />} />
      </Routes>
    </>
  );
}

/**
 * App.jsx — Componente raíz con configuración de rutas.
 * Rutas:
 *   /         → HomePage (Hero + Mapa + Footer)
 *   /obra/:id → WorkDetailPage (Detalle de obra)
 */
function App() {
  return (
    <MapLoadingProvider>
      <AppContent />
    </MapLoadingProvider>
  )
}

export default App
