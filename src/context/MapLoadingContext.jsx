import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const MapLoadingContext = createContext(null);

/**
 * MapLoadingProvider — Proveedor de contexto para el estado de carga del mapa.
 * Permite que el Hero y otros componentes sepán cuándo el mapa está listo.
 * Solo se activa en la ruta principal (/).
 */
export function MapLoadingProvider({ children }) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  const [isMapLoading, setIsMapLoading] = useState(isHomePage);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isMapLoadingEnding, setIsMapLoadingEnding] = useState(false);

  // Called when map is ready - inicia la transición de salida
  const setMapReady = useCallback(() => {
    setIsMapLoadingEnding(true);
    // Después de la transición de breathing (0.5s), marcar como listo
    setTimeout(() => {
      setIsMapLoading(false);
      setIsMapLoadingEnding(false);
      setIsMapReady(true);
    }, 500);
  }, []);

  // Memoizar el valor para evitar re-renders innecesarios
  const value = useMemo(() => ({
    isMapLoading: isHomePage && isMapLoading,
    isMapReady,
    isMapLoadingEnding: isHomePage && isMapLoadingEnding,
    setMapReady,
  }), [isHomePage, isMapLoading, isMapReady, isMapLoadingEnding, setMapReady]);

  // Resetear estado cuando se navega a la página de detalle
  useEffect(() => {
    if (!isHomePage) {
      setIsMapLoading(false);
      setIsMapReady(false);
      setIsMapLoadingEnding(false);
      // Restaurar scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    } else if (!isMapReady) {
      setIsMapLoading(true);
    }
  }, [location.pathname]);

  // Bloquear/desbloquear scroll del body según el estado de carga (solo en home)
  useEffect(() => {
    if (!isHomePage) return;
    
    if (isMapLoading || isMapLoadingEnding) {
      // Bloquear scroll
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      return () => {
        // Restaurar scroll
        document.body.style.overflow = originalStyle || '';
        document.body.style.position = '';
        document.body.style.width = '';
      };
    }
  }, [isMapLoading, isMapLoadingEnding, isHomePage]);

  return (
    <MapLoadingContext.Provider value={value}>
      {children}
    </MapLoadingContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de carga del mapa
 */
export function useMapLoadingContext() {
  const context = useContext(MapLoadingContext);
  if (!context) {
    throw new Error('useMapLoadingContext must be used within a MapLoadingProvider');
  }
  return context;
}
