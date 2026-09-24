import { memo } from 'react';
import styles from './WorkMarker.module.css';

/**
 * CustomToolTip — Tooltip personalizado para los markers del mapa.
 * Envuelto en React.memo para evitar re-renders innecesarios.
 */
const CustomToolTip = memo(function CustomToolTip({ point, onTooltipClose }) {
  return (
    <div className={styles.tooltip}>
      {typeof onTooltipClose === 'function' && (
        <button
          type="button"
          className={styles.tooltipClose}
          onClick={onTooltipClose}
          aria-label="Cerrar tooltip"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      )}
      <p className={styles.title}>{point.title}</p>
      {point.image && (
        <img src={point.image} alt={point.title} className={styles.tooltipImage} loading="lazy" />
      )}
      <p className={styles.description}>{point.description}</p>
    </div>
  );
});

export default CustomToolTip;