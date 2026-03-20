import { useMemo } from 'react';

/**
 * Hook para filtrar obras basado en criterios de filtros aplicados.
 * @param {Array} works - Array de obras sin filtrar
 * @param {Object|null} filters - Objeto con los filtros aplicados (null si no hay filtros)
 * @returns {Array} Array de obras filtradas
 */
export function useFilteredWorks(works, filters) {
  const filteredWorks = useMemo(() => {
    if (!works || !filters) {
      return works || [];
    }

    return works.filter(work => {
      // Filtro por barrio
      if (filters.barrio && work.barrio) {
        if (!work.barrio.toLowerCase().includes(filters.barrio.toLowerCase())) {
          return false;
        }
      }

      // Filtro por tipo de obra
      if (filters.tipoObra && work.tipoNombre) {
        if (work.tipoNombre !== filters.tipoObra) {
          return false;
        }
      }

      // Filtro por patio
      if (filters.tienePatio) {
        if (!work.Patio) {
          return false;
        }
      }

      // Filtro por cochera
      if (filters.tieneCochera) {
        if (!work.Cochera) {
          return false;
        }
      }

      // Filtro por m² cubierta
      if (work.SuperficieCubierta !== null && work.SuperficieCubierta !== undefined) {
        if (work.SuperficieCubierta < filters.m2Cubierta.min || work.SuperficieCubierta > filters.m2Cubierta.max) {
          return false;
        }
      }

      // Filtro por m² total
      if (work.SuperficieTotal !== null && work.SuperficieTotal !== undefined) {
        if (work.SuperficieTotal < filters.m2Total.min || work.SuperficieTotal > filters.m2Total.max) {
          return false;
        }
      }

      // Filtro por habitaciones
      if (filters.habitaciones !== null && filters.habitaciones !== undefined) {
        if (work.Habitaciones !== filters.habitaciones) {
          return false;
        }
      }

      // Filtro por baños
      if (filters.banos !== null && filters.banos !== undefined) {
        if (work.Banos !== filters.banos) {
          return false;
        }
      }

      return true;
    });
  }, [works, filters]);

  return filteredWorks;
}