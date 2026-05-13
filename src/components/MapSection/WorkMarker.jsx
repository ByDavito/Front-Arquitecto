import { memo } from 'react';
import styles from './WorkMarker.module.css';

/**
 * WorkMarker — Componente custom para el punto en el mapa.
 * Un pin arquitectónico minimalista.
 * Envuelto en React.memo para evitar re-renders innecesarios.
 */
const WorkMarker = memo(function WorkMarker({ point }) {
  return (
    <div className={styles.customMarker}></div>
  );
});

export default WorkMarker;
