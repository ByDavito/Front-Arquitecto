import { Link } from 'react-router-dom';
import { formatImageUrl } from '../../utils/geo';
import styles from './NearbyWorks.module.css';

/**
 * NearbyWorks — Lista lateral con las obras más cercanas.
 * Usa un array pre-calculado por `getNearbyWorks`.
 */
function NearbyWorks({ nearby = [] }) {
  if (nearby.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No hay obras cercanas a esta ubicación.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Obras Cercanas</h3>
      <div className={styles.list}>
        {nearby.map(({ work, distance }) => {
            const image = work.medios?.[0]?.imageData || formatImageUrl(work.medios?.[0]?.Url);

           return (
             <Link key={work.id} to={`/obra/${work.id}`} className={styles.card}>
               <div className={styles.imageWrapper}>
                 {image ? (
                   <img src={image} alt={work.Nombre} loading="lazy" />
                 ) : (
                   <div className={styles.imagePlaceholder} />
                 )}
              </div>
              
              <div className={styles.content}>
                <div className={styles.header}>
                  <h4 className={styles.title}>{work.Nombre}</h4>
                  <span className={styles.distance}>a {distance.toFixed(1)} km</span>
                </div>
                
                {work.Descripcion && (
                  <p className={styles.description}>{work.Descripcion}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default NearbyWorks;
