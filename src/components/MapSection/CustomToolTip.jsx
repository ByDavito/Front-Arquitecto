import styles from './WorkMarker.module.css';

/**
 * CustomToolTip — Tooltip personalizado para los markers del mapa.
 */
function CustomToolTip({ point }) {
  return (
    <div className={styles.tooltip}>
      <p className={styles.title}>{point.title}</p>
      {point.image && (
        <img src={point.image} alt={point.title} className={styles.tooltipImage} />
      )}
      <p className={styles.description}>{point.description}</p>
    </div>
  );
}

export default CustomToolTip;