import { useState, useCallback } from 'react';

/**
 * Hook para manejar el estado de los filtros del mapa.
 * @returns {{ filters: Object|null, isFilterPanelOpen: boolean, setFilters: function, toggleFilterPanel: function, closeFilterPanel: function }}
 */
export function useFilters() {
  const [filters, setFilters] = useState(null); // null significa sin filtros aplicados
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const toggleFilterPanel = useCallback(() => {
    setIsFilterPanelOpen(prev => !prev);
  }, []);

  const closeFilterPanel = useCallback(() => {
    setIsFilterPanelOpen(false);
  }, []);

  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  return {
    filters,
    isFilterPanelOpen,
    setFilters: applyFilters,
    toggleFilterPanel,
    closeFilterPanel
  };
}