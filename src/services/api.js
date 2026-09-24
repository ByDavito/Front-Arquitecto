/**
 * api.js — Capa de servicio para consumir la API de obras.
 * El endpoint público filtra por dominio para identificar al arquitecto.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.obrabase.com';
const API_HOST = import.meta.env.VITE_API_HOST || 'localhost:5173';

/** Caché en memoria: evita refetches al navegar entre home y detalle */
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const cache = new Map();

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

function setCached(key, value, ttl = CACHE_TTL) {
  cache.set(key, { value, expiry: Date.now() + ttl });
}

/** Headers base para todas las requests */
const getHeaders = () => ({
  'Content-Type': 'application/json',
  // Usamos x-domain en lugar del header nativo 'Host'
  // El header Host es bloqueado por fetch del navegador, y sobreescribirlo 
  // mediante proxys rompe el SSL/TLS de balanceadores (dando error 502)
  'x-domain': API_HOST,
});

/**
 * Obtiene todas las obras públicas del arquitecto asociado al dominio
 * @returns {Promise<Array>} Array de obras con sus medios
 */
export async function getWorks() {
  const cached = getCached('works');
  if (cached) return cached;

  const response = await fetch(`${BASE_URL}/works/public/works`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Error al cargar obras: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  setCached('works', data);
  return data;
}

/**
 * Obtiene todas las ciudades públicas disponibles.
 * @returns {Promise<Array>} Array de ciudades.
 */
export async function getCities() {
  const cached = getCached('cities');
  if (cached) return cached;

  const response = await fetch(`${BASE_URL}/works/public/cities`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Error al cargar ciudades: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  setCached('cities', data);
  return data;
}

/**
 * Obtiene una obra por su ID
 * @param {string|number} id - ID de la obra
 * @returns {Promise<Object>} Obra con todos sus datos y medios
 */
export async function getWorkById(id) {
  const cached = getCached(`work:${id}`);
  if (cached) return cached;

  const response = await fetch(`${BASE_URL}/works/public/works/${id}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Obra no encontrada');
    }
    throw new Error(`Error al cargar obra: ${response.status}`);
  }

  const data = await response.json();
  setCached(`work:${id}`, data);
  return data;
}
