import { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map } from '@bydavito/map-core';
import WorkMarker from './WorkMarker';
import CustomToolTip from './CustomToolTip';
import GridOverlay from './GridOverlay';
import { useWorks } from '../../hooks/useWorks';
import { useCities } from '../../hooks/useCities';
import { getCityFromWorks, workToMapPoint, formatCityData } from '../../utils/geo';
import styles from './MapSection.module.css';

/**
 * MapSection — Sección principal del mapa interactivo.
 * Incorpora la grilla 3x3 encimada y la activación del mapa.
 */
function MapSection() {
  const { works, loading: loadingWorks, error: errorWorks } = useWorks();
  const { cities, loading: loadingCities } = useCities();
  const mapRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  // Detectar si es móvil basado en ancho de ventana
  const isMobile = useMemo(() => window.innerWidth < 768, []);

  const loading = loadingWorks || loadingCities;
  const error = errorWorks;

  // Convertimos las obras a puntos del mapa y calculamos el centro ideal
  const { points, cityBounds } = useMemo(() => {
    const mapPoints = (works || [])
      .filter((w) => w.Latitud && w.Longitud)
      .map(workToMapPoint);

    let bounds = null;

    // Prioridad 1: Usar datos de la primera ciudad del API
    if (cities && cities.length > 0) {
      bounds = formatCityData(cities[0]);
      console.log('City data from API:', cities[0], 'Formatted bounds:', bounds);
    }

    // Prioridad 2: Calcular a partir de las obras (si no hay ciudad en el API)
    if (!bounds && works && works.length > 0) {
      bounds = getCityFromWorks(works);
      console.log('Bounds calculated from works:', bounds);
    }

    console.log('Final cityBounds:', bounds);

    return { points: mapPoints, cityBounds: bounds };
  }, [works, cities]);

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
      // Convertir array a formato LatLngBounds si es necesario
      const bounds = cityBounds.bounds;
      // bounds formato: [[lng, lat], [lng, lat]]
      const sw = bounds[0]; // [lng, lat]
      const ne = bounds[1];
      
      // Crear el objeto de bounds en formato leaflet
      if (map.L && map.L.latLngBounds) {
        map.setMaxBounds(map.L.latLngBounds([
          [sw[1], sw[0]], // [lat, lng] para Leaflet
          [ne[1], ne[0]]
        ]));
      } else {
        // Intentar directamente
        map.setMaxBounds(bounds);
      }
    }

    // Aplicar restricciones de zoom (minZoom y maxZoom)
    if (cityBounds.minZoom && map.setMinZoom) {
      map.setMinZoom(cityBounds.minZoom);
    }
    if (cityBounds.maxZoom && map.setMaxZoom) {
      map.setMaxZoom(cityBounds.maxZoom);
    }

    // Escuchar eventos de movimiento para mantener las restricciones
    const enforceBounds = () => {
      if (!map || !cityBounds.bounds) return;
      
      // Verificar y corregir el zoom
      if (cityBounds.minZoom && map.getZoom() < cityBounds.minZoom) {
        map.setZoom(cityBounds.minZoom);
      }
      if (cityBounds.maxZoom && map.getZoom() > cityBounds.maxZoom) {
        map.setZoom(cityBounds.maxZoom);
      }

      // Verificar y corregir la posición si está fuera de los bounds
      const bounds = cityBounds.bounds;
      const southWest = bounds[0]; // [lng, lat]
      const northEast = bounds[1];
      
      let needsCorrection = false;
      let newCenter = map.getCenter();
      
      // Verificar latitud
      if (newCenter.lat < southWest[1]) {
        newCenter.lat = southWest[1];
        needsCorrection = true;
      }
      if (newCenter.lat > northEast[1]) {
        newCenter.lat = northEast[1];
        needsCorrection = true;
      }
      
      // Verificar longitud
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
    };

    // Agregar listeners para verificar restricciones en cada movimiento
    if (map.on) {
      map.on('moveend', enforceBounds);
      map.on('zoomend', enforceBounds);
      map.on('dragend', enforceBounds);
    }

    return () => {
      if (map.off) {
        map.off('moveend', enforceBounds);
        map.off('zoomend', enforceBounds);
        map.off('dragend', enforceBounds);
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
      className={`${styles.mapSection}`}
    >
    <div id="mapa"
      className={`${styles.mapContainer} ${isActive && isMobile ? styles.fullscreen : ''}`}>
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
