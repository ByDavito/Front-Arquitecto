import { useState, useEffect } from 'react';
import { getWorks, getWorkById } from '../services/api';

/**
 * Hook para obtener todas las obras del arquitecto.
 * @returns {{ works: Array, loading: boolean, error: string|null }}
 */
export function useWorks() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchWorks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getWorks();
        if (!cancelled) {
          setWorks(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setWorks([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchWorks();

    return () => { cancelled = true; };
  }, []);

  return { works, loading, error };
}

/**
 * Hook para obtener una obra por ID.
 * @param {string|number} id - ID de la obra
 * @returns {{ work: Object|null, loading: boolean, error: string|null }}
 */
export function useWorkById(id) {
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const fetchWork = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getWorkById(id);
        if (!cancelled) setWork(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setWork(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchWork();

    return () => { cancelled = true; };
  }, [id]);

  return { work, loading, error };
}
