import styles from './WorkMarker.module.css';

/**
 * WorkMarker — Componente custom para el punto en el mapa.
 * Un pin arquitectónico minimalista.
 */
function WorkMarker({ point }) {
  return (
    <div className={styles.customMarker}></div>
  );
}

export default WorkMarker;
