import { useEffect, useState } from 'react';

/**
 * useMediaQuery — Hook que reacciona a cambios de media query (responsive).
 * Reemplaza chequeos de `window.innerWidth` calculados una sola vez.
 * @param {string} query - Media query CSS, p.ej. '(max-width: 768px)'
 * @returns {boolean} true si la query matchea
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}