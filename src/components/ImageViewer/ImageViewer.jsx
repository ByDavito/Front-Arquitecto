import { useState } from 'react';
import { formatImageUrl } from '../../utils/geo';
import styles from './ImageViewer.module.css';

/**
 * ImageViewer — Visor de imágenes con galería de miniaturas.
 * Click en miniatura cambia la principal de forma suave.
 */
function ImageViewer({ images }) {
  if (!images || images.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No hay imágenes disponibles para esta obra.</p>
      </div>
    );
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const mainImage = images[currentIndex];

  return (
    <div className={styles.viewerContainer}>
      {/* Imagen Principal */}
      <div className={styles.mainImageContainer}>
        <img
          key={mainImage.id} // Forza re-render para animación
          src={mainImage.imageData || formatImageUrl(mainImage.Url)}
          alt={`Vista de obra`}
          className={`${styles.mainImage} animate-fadeIn`}
          loading="lazy"
        />
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className={styles.thumbnailContainer}>
          {images.map((img, idx) => (
            <button
              key={img.id}
              className={`${styles.thumbnailBtn} ${idx === currentIndex ? styles.thumbnailActive : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ver imagen ${idx + 1}`}
            >
              <img src={img.imageData || formatImageUrl(img.Url)} alt="" className={styles.thumbnailImg} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageViewer;
