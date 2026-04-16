/**
 * geo.js — Utilidades de cálculo geográfico.
 */

/**
 * Calcula la distancia entre dos coordenadas geográficas usando la fórmula de Haversine.
 * @param {number} lat1 - Latitud del punto 1
 * @param {number} lng1 - Longitud del punto 1
 * @param {number} lat2 - Latitud del punto 2
 * @param {number} lng2 - Longitud del punto 2
 * @returns {number} Distancia en kilómetros
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Obtiene las obras más cercanas a una obra dada, ordenadas por distancia.
 * @param {Object} currentWork - Obra de referencia (con Latitud y Longitud)
 * @param {Array} allWorks - Array de todas las obras
 * @param {number} limit - Cantidad máxima de obras cercanas a retornar
 * @returns {Array} Array de {work, distance} ordenado por distancia ascendente
 */
export function getNearbyWorks(currentWork, allWorks, limit = 5) {
  if (!currentWork?.Latitud || !currentWork?.Longitud) return [];

  return allWorks
    .filter((w) => w.id !== currentWork.id && w.Latitud && w.Longitud)
    .map((work) => ({
      work,
      distance: haversineDistance(
        parseFloat(currentWork.Latitud),
        parseFloat(currentWork.Longitud),
        parseFloat(work.Latitud),
        parseFloat(work.Longitud)
      ),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.obrabase.com';

/**
 * Convierte una URL de imagen del API a formato usable por el navegador.
 * Maneja URLs absolutas, relativas o base64.
 * @param {string} imageUrl - URL de imagen del API
 * @returns {string|null} URL de imagen formateada o null
 */
export function formatImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) return imageUrl;
  // Si no es absoluta ni data, podría ser relativa o base64
  // Para base64, detectar si es string largo sin / o :
  if (imageUrl.length > 100 && !imageUrl.includes('/') && !imageUrl.includes(':')) {
    return `data:image/jpeg;base64,${imageUrl}`;
  }
  // Si parece relativa, prepend BASE_URL
  if (imageUrl.startsWith('/')) {
    return `${BASE_URL}${imageUrl}`;
  }
  // Si no es ninguno, devolver como está
  return imageUrl;
}

/**
 * Adapta una obra del API al formato de point que espera @bydavito/map-core.
 * @param {Object} work - Obra del API
 * @returns {Object} Point con id, lat, lng y datos adicionales
 */
export function workToMapPoint(work) {
  return {
    id: work.id,
    lat: parseFloat(work.Latitud),
    lng: parseFloat(work.Longitud),
    title: work.Nombre,
    description: work.Descripcion,
    image: work.medios?.[0]?.imageData || formatImageUrl(work.medios?.[0]?.Url),
    work, // referencia completa para uso en onPointClick
  };
}

/**
 * Adapta los datos de una ciudad del API al formato que espera @bydavito/map-core.
 * @param {Object} apiCity - Ciudad retornada por el API
 * @returns {Object} City compatible con el mapa
 */
export function formatCityData(apiCity) {
  if (!apiCity) return null;

  console.log(apiCity.Zoom);

  // Calcular bounds si el API proporciona información de límites
  let bounds = null;
  // El API retorna: BoundsSWLat, BoundsSWLng, BoundsNELat, BoundsNELng
  if (apiCity.BoundsSWLat && apiCity.BoundsSWLng && apiCity.BoundsNELat && apiCity.BoundsNELng) {
    // Formato: [[minLng, minLat], [maxLng, maxLat]]
    bounds = [
      [parseFloat(apiCity.BoundsSWLng), parseFloat(apiCity.BoundsSWLat)],
      [parseFloat(apiCity.BoundsNELng), parseFloat(apiCity.BoundsNELat)]
    ];
  } else if (apiCity.CenterLat && apiCity.CenterLng && apiCity.Radius) {
    // Crear bounds desde centro y radio (fallback)
    const centerLat = parseFloat(apiCity.CenterLat);
    const centerLng = parseFloat(apiCity.CenterLng);
    const radius = parseFloat(apiCity.Radius);
    // Aproximación: 1 grado ≈ 111km
    const latDelta = radius / 111;
    const lngDelta = radius / (111 * Math.cos(centerLat * Math.PI / 180));
    bounds = [
      [centerLng - lngDelta, centerLat - latDelta],
      [centerLng + lngDelta, centerLat + latDelta]
    ];
  }

  return {
    id: apiCity.id,
    nombre: apiCity.nombre,
    center: [parseFloat(apiCity.CenterLng), parseFloat(apiCity.CenterLat)],
    // El 'zoom' ahora debería aplicar correctamente al quitar los 'bounds'
    zoom: parseFloat(apiCity.Zoom) || 15,
    minZoom: parseFloat(apiCity.MinZoom) || 12,
    maxZoom: 18,
    bounds: bounds
  };
}

/**
 * Calcula la ciudad (bounds, center, zoom) a partir de un array de obras con coordenadas.
 * Útil para configurar el mapa con el área correcta si no hay datos de ciudad en el API.
 * @param {Array} works - Array de obras con Latitud y Longitud
 * @returns {Object} Objeto city compatible con @bydavito/map-core
 */
export function getCityFromWorks(works) {
  const validWorks = works.filter((w) => w.Latitud && w.Longitud);
  if (validWorks.length === 0) {
    // Default: Buenos Aires
    return {
      center: [-58.3816, -34.6037],
      zoom: 13,
      minZoom: 13,
      maxZoom: 18,
    };
  }

  const lats = validWorks.map((w) => parseFloat(w.Latitud));
  const lngs = validWorks.map((w) => parseFloat(w.Longitud));

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  return {
    center: [centerLng, centerLat],
    zoom: 14, // Volvemos a 14 para una vista más cercana
    minZoom: 13,
    maxZoom: 18,
    bounds: [[minLng - 0.05, minLat - 0.05], [maxLng + 0.05, maxLat + 0.05]],
  };
}
