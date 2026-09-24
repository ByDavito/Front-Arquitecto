import { createContext, useContext } from 'react';

/**
 * Contexto de carga del mapa, separado en su propio módulo para
 * poder exportar el hook sin romper fast-refresh (react-refresh).
 */
export const MapLoadingContext = createContext(null);

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