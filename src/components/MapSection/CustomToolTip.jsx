import { memo } from 'react';
import styles from './WorkMarker.module.css';

/**
 * CustomToolTip — Tooltip personalizado para los markers del mapa.
 * Envuelto en React.memo para evitar re-renders innecesarios.
 */
const CustomToolTip = memo(function CustomToolTip({ point }) {
  return (
    <div className={styles.tooltip}>
      <p className={styles.title}>{point.title}</p>
      {point.image && (
        <img src={point.image} alt={point.title} className={styles.tooltipImage} loading="lazy" />
      )}
      <p className={styles.description}>{point.description}</p>
    </div>
  );
});

export default CustomToolTip;