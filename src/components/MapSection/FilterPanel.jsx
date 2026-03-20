import { useState, useEffect, useMemo } from 'react';
import { BedDouble, Toilet } from 'lucide-react';
import { Range } from 'react-range';
import { useWorks } from '../../hooks/useWorks';
import styles from './FilterPanel.module.css';

/**
 * FilterPanel — Panel lateral/superior de filtros para el mapa.
 * Incluye filtros por barrio, tipo de obra, patio, cochera, habitaciones, baños y rangos de m².
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
  const [habitaciones, setHabitaciones] = useState('');
  const [banos, setBanos] = useState('');

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
    if (!works || works.length === 0) return 1000;
    const max = Math.max(...works.map(w => w.SuperficieCubierta || 0));
    return max > 0 ? max : 1000;
  }, [works]);

  const maxM2Total = useMemo(() => {
    if (!works || works.length === 0) return 1000;
    const max = Math.max(...works.map(w => w.SuperficieTotal || 0));
    return max > 0 ? max : 1000;
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
      m2Total: { min: m2TotalMin, max: m2TotalMax },
      habitaciones: habitaciones ? Number(habitaciones) : null,
      banos: banos ? Number(banos) : null
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
    setHabitaciones('');
    setBanos('');
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

        {/* Inputs y checkboxes combinados */}
        <div className={styles.filterGroup}>
          <div className={styles.inputsRow}>
            <div className={styles.inputWithIcon}>
              
              <div className={styles.inputContainer}>
                <BedDouble size={16} className={styles.icon} />
                <input
                  id="habitaciones"
                  type="number"
                  value={habitaciones}
                  onChange={(e) => setHabitaciones(e.target.value)}
                  placeholder="0"
                  min="0"
                />
                <div className={styles.numberButtons}>
                  <button
                    type="button"
                    onClick={() => setHabitaciones(Math.max(0, (parseInt(habitaciones) || 0) + 1))}
                    className={styles.incrementBtn}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setHabitaciones(Math.max(0, (parseInt(habitaciones) || 0) - 1))}
                    className={styles.decrementBtn}
                  >
                    −
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.inputWithIcon}>
              
              <div className={styles.inputContainer}>
                <Toilet size={16} className={styles.icon} />
                <input
                  id="banos"
                  type="number"
                  value={banos}
                  onChange={(e) => setBanos(e.target.value)}
                  placeholder="0"
                  min="0"
                />
                <div className={styles.numberButtons}>
                  <button
                    type="button"
                    onClick={() => setBanos(Math.max(0, (parseInt(banos) || 0) + 1))}
                    className={styles.incrementBtn}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setBanos(Math.max(0, (parseInt(banos) || 0) - 1))}
                    className={styles.decrementBtn}
                  >
                    −
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.checkboxesColumn}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={tienePatio}
                  onChange={(e) => setTienePatio(e.target.checked)}
                />
                Patio
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={tieneCochera}
                  onChange={(e) => setTieneCochera(e.target.checked)}
                />
                Cochera
              </label>
            </div>
          </div>
        </div>

        {/* M² */}
        <div className={styles.filterGroup}>
          <div className={styles.rangeRow}>
            <div className={styles.rangeField}>
              <label>Cubierta: {m2CubiertaMin} - {m2CubiertaMax}</label>
              <div className={styles.rangeContainer}>
                <Range
                  step={1}
                  min={0}
                  max={maxM2Cubierta}
                  values={[m2CubiertaMin, m2CubiertaMax]}
                  onChange={(values) => {
                    setM2CubiertaMin(values[0]);
                    setM2CubiertaMax(values[1]);
                  }}
                  renderTrack={({ props, children }) => (
                    <div
                      {...props}
                      style={{
                        ...props.style,
                        height: '6px',
                        width: '100%',
                        borderRadius: '3px',
                        position: 'relative',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: `${(m2CubiertaMin / maxM2Cubierta) * 100}%`,
                          width: `${((m2CubiertaMax - m2CubiertaMin) / maxM2Cubierta) * 100}%`,
                          height: '100%',
                          backgroundColor: 'var(--color-red)',
                          borderRadius: '3px',
                        }}
                      />
                      {children}
                    </div>
                  )}
                  renderThumb={({ props, isDragged }) => (
                    <div
                      {...props}
                      style={{
                        ...props.style,
                        height: '16px',
                        width: '16px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-red)',
                        border: '2px solid #fff',
                        outline: 'none',
                      }}
                    />
                  )}
                />
              </div>
            </div>
            <div className={styles.rangeField}>
              <label>Total: {m2TotalMin} - {m2TotalMax}</label>
              <div className={styles.rangeContainer}>
                <Range
                  step={1}
                  min={0}
                  max={maxM2Total}
                  values={[m2TotalMin, m2TotalMax]}
                  onChange={(values) => {
                    setM2TotalMin(values[0]);
                    setM2TotalMax(values[1]);
                  }}
                  renderTrack={({ props, children }) => (
                    <div
                      {...props}
                      style={{
                        ...props.style,
                        height: '6px',
                        width: '100%',
                        borderRadius: '3px',
                        position: 'relative',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: `${(m2TotalMin / maxM2Total) * 100}%`,
                          width: `${((m2TotalMax - m2TotalMin) / maxM2Total) * 100}%`,
                          height: '100%',
                          backgroundColor: 'var(--color-red)',
                          borderRadius: '3px',
                        }}
                      />
                      {children}
                    </div>
                  )}
                  renderThumb={({ props, isDragged }) => (
                    <div
                      {...props}
                      style={{
                        ...props.style,
                        height: '16px',
                        width: '16px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-red)',
                        border: '2px solid #fff',
                        outline: 'none',
                      }}
                    />
                  )}
                />
              </div>
            </div>
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