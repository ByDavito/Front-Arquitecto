import { useState, useCallback } from 'react';

/**
 * useMapLoading — Hook para manejar el estado de carga del mapa.
 * Permite que el Hero sepa cuándo el mapa está listo para navegar.
 */
function useMapLoading() {
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);

  // Called when map starts loading (when MapSection mounts)
  const startMapLoading = useCallback(() => {
    setIsMapLoading(true);
    setIsMapReady(false);
  }, []);

  // Called when map is ready (after cityBounds are loaded)
  const setMapReady = useCallback(() => {
    setIsMapLoading(false);
    setIsMapReady(true);
  }, []);

  return {
    isMapLoading,
    isMapReady,
    startMapLoading,
    setMapReady,
  };
}

export { useMapLoading };
