import { useState, useEffect } from 'react';
import { getCities } from '../services/api';

/**
 * useCities — Hook personalizado para obtener las ciudades desde el API.
 */
export function useCities() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCities() {
      try {
        setLoading(true);
        const data = await getCities();
        setCities(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCities();
  }, []);

  return { cities, loading, error };
}
