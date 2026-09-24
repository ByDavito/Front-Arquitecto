import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import FloatingWhatsAppButton from './components/FloatingWhatsApp/FloatingWhatsAppButton'
import HomePage from './pages/HomePage/HomePage'
import { MapLoadingProvider } from './context/MapLoadingContext'
import { useMapLoadingContext } from './context/mapContext'

// Code-splitting: el detalle de obra se carga bajo demanda
const WorkDetailPage = lazy(() => import('./pages/WorkDetail/WorkDetail'))

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
        <Route
          path="/obra/:id"
          element={
            <Suspense fallback={<div style={{ minHeight: '100dvh' }} />}>
              <WorkDetailPage />
            </Suspense>
          }
        />
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
