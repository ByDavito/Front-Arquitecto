import { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map } from '@bydavito/map-core';
import WorkMarker from './WorkMarker';
import CustomToolTip from './CustomToolTip';
import GridOverlay from './GridOverlay';
import FilterPanel from './FilterPanel';
import { useWorks } from '../../hooks/useWorks';
import { useCities } from '../../hooks/useCities';
import { useFilters } from '../../hooks/useFilters';
import { useFilteredWorks } from '../../hooks/useFilteredWorks';
import { getCityFromWorks, workToMapPoint, formatCityData } from '../../utils/geo';
import styles from './MapSection.module.css';

/**
 * MapSection — Sección principal del mapa interactivo.
 * Incorpora la grilla 3x3 encimada y la activación del mapa.
 * @param {function} onMapReady - Callback cuando el mapa está listo para navegar
 */
function MapSection({ onMapReady }) {
  const { works, loading: loadingWorks, error: errorWorks } = useWorks();
  const { cities, loading: loadingCities } = useCities();
  const { filters, isFilterPanelOpen, setFilters, toggleFilterPanel, closeFilterPanel } = useFilters();
  const mapRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  // Detectar si es móvil basado en ancho de ventana
  const isMobile = useMemo(() => window.innerWidth < 768, []);

  const loading = loadingWorks || loadingCities;
  const error = errorWorks;

  // Filtrar obras según filtros aplicados
  const filteredWorks = useFilteredWorks(works, filters);

  // Los bounds del mapa dependen de TODAS las obras (no filtradas) y de las ciudades.
  // NO deben cambiar al aplicar filtros — solo los marcadores aparecen/desaparecen.
  const cityBounds = useMemo(() => {
    let bounds = null;

    // Prioridad 1: Usar datos de la primera ciudad del API
    if (cities && cities.length > 0) {
      bounds = formatCityData(cities[0]);
    }

    // Prioridad 2: Calcular a partir de las obras (si no hay ciudad en el API)
    if (!bounds && works && works.length > 0) {
      bounds = getCityFromWorks(works);
    }

    return bounds;
  }, [cities, works]);

  // Puntos del mapa sí dependen de los filtros
  const points = useMemo(() => {
    return (filteredWorks || [])
      .filter((w) => w.Latitud && w.Longitud)
      .map(workToMapPoint);
  }, [filteredWorks]);

  // Preservar posición de scroll al aplicar filtros en móvil
  const mapSectionRef = useRef(null);
  const prevFiltersRef = useRef(null);
  useEffect(() => {
    if (prevFiltersRef.current !== null && isMobile && mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    prevFiltersRef.current = filters;
  }, [filters, isMobile]);
  useEffect(() => {
    if (!loading && cityBounds && onMapReady) {
      // Pequeño delay para que la transición sea visible
      const timer = setTimeout(() => {
        onMapReady();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, cityBounds, onMapReady]);

  useEffect(() => {
    // Si isActive cambia, forzamos un resize del mapa para que ajuste el canvas
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.resize();
      }, 350); // Tiempo alineado a la transición CSS
    }

    // Toggle de clase global para prevenir el scroll en el body (solo en móvil)
    if (isActive && isMobile) {
      document.body.classList.add('map-fullscreen');
    } else {
      document.body.classList.remove('map-fullscreen');
    }

    return () => {
      document.body.classList.remove('map-fullscreen');
    };
  }, [isActive, isMobile]);

  // Aplicar restricciones de bounds y zoom cuando el mapa esté listo o cuando cityBounds cambie
  useEffect(() => {
    if (!mapRef.current || !cityBounds) return;
    const map = mapRef.current;

    // Aplicar maxBounds para restringir movimiento
    if (cityBounds.bounds && map.setMaxBounds) {
      const bounds = cityBounds.bounds;
      const sw = bounds[0];
      const ne = bounds[1];

      if (map.L && map.L.latLngBounds) {
        map.setMaxBounds(map.L.latLngBounds([
          [sw[1], sw[0]],
          [ne[1], ne[0]]
        ]));
      } else {
        map.setMaxBounds(bounds);
      }
    }

    if (cityBounds.minZoom && map.setMinZoom) {
      map.setMinZoom(cityBounds.minZoom);
    }
    if (cityBounds.maxZoom && map.setMaxZoom) {
      map.setMaxZoom(cityBounds.maxZoom);
    }

    // Un solo listener en moveend (cubre drag + zoom + pan) con debounce
    let rafId = null;
    const enforceBounds = () => {
      if (!map || !cityBounds.bounds) return;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;

        if (cityBounds.minZoom && map.getZoom() < cityBounds.minZoom) {
          map.setZoom(cityBounds.minZoom);
        }
        if (cityBounds.maxZoom && map.getZoom() > cityBounds.maxZoom) {
          map.setZoom(cityBounds.maxZoom);
        }

        const bounds = cityBounds.bounds;
        const southWest = bounds[0];
        const northEast = bounds[1];

        let needsCorrection = false;
        let newCenter = map.getCenter();

        if (newCenter.lat < southWest[1]) {
          newCenter.lat = southWest[1];
          needsCorrection = true;
        }
        if (newCenter.lat > northEast[1]) {
          newCenter.lat = northEast[1];
          needsCorrection = true;
        }
        if (newCenter.lng < southWest[0]) {
          newCenter.lng = southWest[0];
          needsCorrection = true;
        }
        if (newCenter.lng > northEast[0]) {
          newCenter.lng = northEast[0];
          needsCorrection = true;
        }

        if (needsCorrection) {
          map.setCenter(newCenter);
        }
      });
    };

    if (map.on) {
      map.on('moveend', enforceBounds);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (map.off) {
        map.off('moveend', enforceBounds);
      }
    };
  }, [cityBounds]);

  const handleMapReady = (map) => {
    mapRef.current = map;
  };

  const handlePointClick = (point) => {
    if (point && point.id) {
      // Limpiar activación del mapa al navegar
      setIsActive(false);
      navigate(`/obra/${point.id}`);
    }
  };

  return (
    <section
      ref={mapSectionRef}
      className={`${styles.mapSection}`}
    >
      {/* Panel de filtros */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={closeFilterPanel}
        onApplyFilters={setFilters}
        isMobile={isMobile}
        works={works}
      />

    <div id="mapa"
      className={`${styles.mapContainer} ${isActive && isMobile ? styles.fullscreen : ''} ${isFilterPanelOpen && !isMobile ? styles.mapShifted : ''}`}>
      {/* Botón de filtros */}
      <button
        className={`${styles.filterBtn} ${isActive ? styles.filterVisible : ''} ${isFilterPanelOpen ? styles.filterBtnActive : ''}`}
        onClick={toggleFilterPanel}
        aria-label="Abrir filtros"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6H21M6 12H18M9 18H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <div className={styles.mapWrapper}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className="skeleton" style={{width: '100%', height: '100%'}} />
          </div>
        )}

        {error && (
          <div className={styles.errorOverlay}>
            <p>No se pudieron cargar las obras en el mapa.</p>
          </div>
        )}

        {!loading && cityBounds && (
          <Map
            points={points}
            city={cityBounds}
            bounds={cityBounds.bounds}
            minZoom={cityBounds.minZoom}
            maxZoom={cityBounds.maxZoom}
            mode='edit'
            markerComponent={WorkMarker}
            tooltipComponent={CustomToolTip}
            onPointClick={handlePointClick}
            onMapReady={handleMapReady}
            width="100%"
            height="100%"
          />
        )}
      </div>

      <GridOverlay
        mapRef={mapRef}
        cityBounds={cityBounds}
        isActive={isActive}
        setIsActive={setIsActive}
        minZoom={cityBounds?.minZoom}
        isMobile={isMobile}
      />
      </div>
    </section>
  );
}

export default MapSection;
