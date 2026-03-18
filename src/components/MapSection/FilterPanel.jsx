import { useState, useEffect, useMemo } from 'react';
import { useWorks } from '../../hooks/useWorks';
import styles from './FilterPanel.module.css';

/**
 * FilterPanel — Panel lateral/superior de filtros para el mapa.
 * Incluye filtros por barrio, tipo de obra, patio, cochera, y rangos de m².
 */
function FilterPanel({ isOpen, onClose, onApplyFilters, isMobile }) {
  const { works } = useWorks();

  // Estados locales para los filtros
  const [barrio, setBarrio] = useState('');
  const [tipoObra, setTipoObra] = useState('');
  const [tienePatio, setTienePatio] = useState(false);
  const [tieneCochera, setTieneCochera] = useState(false);
  const [m2CubiertaMin, setM2CubiertaMin] = useState(0);
  const [m2CubiertaMax, setM2CubiertaMax] = useState(1000);
  const [m2TotalMin, setM2TotalMin] = useState(0);
  const [m2TotalMax, setM2TotalMax] = useState(1000);

  // Calcular opciones para barrio y tipo de obra
  const barrioOptions = useMemo(() => {
    if (!works) return [];
    const unique = [...new Set(works.map(w => w.barrio).filter(Boolean))];
    return unique.sort();
  }, [works]);

  const tipoOptions = useMemo(() => {
    if (!works) return [];
    const unique = [...new Set(works.map(w => w.tipoNombre).filter(Boolean))];
    return unique.sort();
  }, [works]);

  // Calcular rangos máximos para los sliders
  const maxM2Cubierta = useMemo(() => {
    if (!works) return 1000;
    return Math.max(...works.map(w => w.SuperficieCubierta || 0));
  }, [works]);

  const maxM2Total = useMemo(() => {
    if (!works) return 1000;
    return Math.max(...works.map(w => w.SuperficieTotal || 0));
  }, [works]);

  // Filtrar sugerencias de barrio
  const barrioSuggestions = useMemo(() => {
    if (!barrio) return [];
    return barrioOptions.filter(b => b.toLowerCase().includes(barrio.toLowerCase()));
  }, [barrio, barrioOptions]);

  // Aplicar filtros
  const handleApplyFilters = () => {
    const filters = {
      barrio: barrio.trim(),
      tipoObra,
      tienePatio,
      tieneCochera,
      m2Cubierta: { min: m2CubiertaMin, max: m2CubiertaMax },
      m2Total: { min: m2TotalMin, max: m2TotalMax }
    };
    onApplyFilters(filters);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setBarrio('');
    setTipoObra('');
    setTienePatio(false);
    setTieneCochera(false);
    setM2CubiertaMin(0);
    setM2CubiertaMax(maxM2Cubierta);
    setM2TotalMin(0);
    setM2TotalMax(maxM2Total);
    onApplyFilters(null); // null significa sin filtros
  };

  // Actualizar rangos cuando cambian los datos
  useEffect(() => {
    setM2CubiertaMax(maxM2Cubierta);
    setM2TotalMax(maxM2Total);
  }, [maxM2Cubierta, maxM2Total]);

  return (
    <div className={`${styles.filterPanel} ${isOpen ? styles.open : ''} ${isMobile ? styles.mobile : ''}`}>
      <div className={styles.header}>
        <h3>Filtros</h3>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar filtros">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className={styles.content}>
        {/* Barrio */}
        <div className={styles.filterGroup}>
          <label htmlFor="barrio">Barrio</label>
          <div className={styles.inputWrapper}>
            <input
              id="barrio"
              type="text"
              value={barrio}
              onChange={(e) => setBarrio(e.target.value)}
              placeholder="Escribe el barrio..."
              autoComplete="off"
            />
            {barrioSuggestions.length > 0 && (
              <ul className={styles.suggestions}>
                {barrioSuggestions.map((suggestion, index) => (
                  <li key={index} onClick={() => setBarrio(suggestion)}>
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Tipo de obra */}
        <div className={styles.filterGroup}>
          <label htmlFor="tipoObra">Tipo de obra</label>
          <select
            id="tipoObra"
            value={tipoObra}
            onChange={(e) => setTipoObra(e.target.value)}
          >
            <option value="">Todos</option>
            {tipoOptions.map((tipo, index) => (
              <option key={index} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        {/* Checkboxes */}
        <div className={styles.filterGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={tienePatio}
              onChange={(e) => setTienePatio(e.target.checked)}
            />
            Tiene patio
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={tieneCochera}
              onChange={(e) => setTieneCochera(e.target.checked)}
            />
            Tiene cochera
          </label>
        </div>

        {/* M² Cubierta */}
        <div className={styles.filterGroup}>
          <label>M² Cubierta: {m2CubiertaMin} - {m2CubiertaMax}</label>
          <div className={styles.rangeContainer}>
            <input
              type="range"
              min="0"
              max={maxM2Cubierta}
              value={m2CubiertaMin}
              onChange={(e) => setM2CubiertaMin(Number(e.target.value))}
              className={styles.range}
            />
            <input
              type="range"
              min="0"
              max={maxM2Cubierta}
              value={m2CubiertaMax}
              onChange={(e) => setM2CubiertaMax(Number(e.target.value))}
              className={styles.range}
            />
          </div>
        </div>

        {/* M² Total */}
        <div className={styles.filterGroup}>
          <label>M² Total: {m2TotalMin} - {m2TotalMax}</label>
          <div className={styles.rangeContainer}>
            <input
              type="range"
              min="0"
              max={maxM2Total}
              value={m2TotalMin}
              onChange={(e) => setM2TotalMin(Number(e.target.value))}
              className={styles.range}
            />
            <input
              type="range"
              min="0"
              max={maxM2Total}
              value={m2TotalMax}
              onChange={(e) => setM2TotalMax(Number(e.target.value))}
              className={styles.range}
            />
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.clearBtn} onClick={handleClearFilters}>
          Limpiar
        </button>
        <button className={styles.applyBtn} onClick={handleApplyFilters}>
          Aplicar filtros
        </button>
      </div>
    </div>
  );
}

export default FilterPanel;