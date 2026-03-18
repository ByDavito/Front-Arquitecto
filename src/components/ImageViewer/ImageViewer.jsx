import { useState, useEffect } from 'react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const zoomLevels = [1.0, 1.25, 1.50, 1.75, 2];
  const [zoomIndex, setZoomIndex] = useState(0);
  const zoom = zoomLevels[zoomIndex];
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
  const mainImage = images[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      setZoomIndex(0);
      setDragOffset({ x: 0, y: 0 });
    }
  }, [isModalOpen]);

  const handlePrev = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  return (
    <>
      <div className={styles.viewerContainer}>
      {/* Imagen Principal */}
      <div className={styles.mainImageContainer}>
        <img
          key={mainImage.id} // Forza re-render para animación
          src={mainImage.imageData || formatImageUrl(mainImage.Url)}
          alt={`Vista de obra`}
          className={`${styles.mainImage} animate-fadeIn`}
          loading="lazy"
          onClick={() => setIsModalOpen(true)}
        />
        {images.length > 1 && (
          <>
            <button
              className={`${styles.navButton} ${styles.navButtonLeft}`}
              onClick={handlePrev}
              aria-label="Imagen anterior"
            >
              ‹
            </button>
            <button
              className={`${styles.navButton} ${styles.navButtonRight}`}
              onClick={handleNext}
              aria-label="Imagen siguiente"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className={styles.thumbnailContainer}>
          {images.map((img, idx) => (
            <button
              key={img.id}
              className={`${styles.thumbnailBtn} ${idx === currentIndex ? styles.thumbnailActive : ''}`}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
              aria-label={`Ver imagen ${idx + 1}`}
            >
              <img src={img.imageData || formatImageUrl(img.Url)} alt="" className={styles.thumbnailImg} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>

    {/* Modal */}
    {isModalOpen && (
      <div className={styles.modal} onClick={() => setIsModalOpen(false)}>
        <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>×</button>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.imageWrapper}>
            <img
              src={mainImage.imageData || formatImageUrl(mainImage.Url)}
              alt=""
              className={styles.modalImage}
              style={{
                transform: `scale(${zoom}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
              }}
              onMouseDown={(e) => {
                if (zoom > 1) {
                  setIsDragging(true);
                  setStartDrag({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
                }
              }}
              onMouseMove={(e) => {
                if (isDragging) {
                  let newX = e.clientX - startDrag.x;
                  let newY = e.clientY - startDrag.y;
                  const maxDrag = 200 * (zoom - 1);
                  newX = Math.max(-maxDrag, Math.min(maxDrag, newX));
                  newY = Math.max(-maxDrag, Math.min(maxDrag, newY));
                  setDragOffset({ x: newX, y: newY });
                }
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onDragStart={(e) => e.preventDefault()}
            />
            <button
              className={styles.zoomBtn}
              onClick={(e) => {
                e.stopPropagation();
                if (zoomIndex > 0) {
                  setZoomIndex(zoomIndex - 1);
                  setDragOffset({ x: 0, y: 0 });
                }
              }}
              disabled={zoomIndex === 0}
              title="Zoom out"
            >
              -
            </button>
            <button
              className={styles.zoomBtn}
              onClick={(e) => {
                e.stopPropagation();
                if (zoomIndex < zoomLevels.length - 1) {
                  setZoomIndex(zoomIndex + 1);
                  setDragOffset({ x: 0, y: 0 });
                }
              }}
              disabled={zoomIndex === zoomLevels.length - 1}
              title="Zoom in"
            >
              +
            </button>
          </div>
          {images.length > 1 && (
            <div
              className={styles.navContainer}
              style={{ opacity: zoom === 1 ? 1 : 0, pointerEvents: zoom === 1 ? 'auto' : 'none' }}
            >
              <button
                className={`${styles.navButton} ${styles.navButtonLeft}`}
                onClick={handlePrev}
                aria-label="Imagen anterior"
              >
                ‹
              </button>
              <button
                className={`${styles.navButton} ${styles.navButtonRight}`}
                onClick={handleNext}
                aria-label="Imagen siguiente"
              >
                ›
              </button>
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div
            className={styles.thumbnailContainer}
            style={{ opacity: zoom === 1 ? 1 : 0, pointerEvents: zoom === 1 ? 'auto' : 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
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
    )}
    </>
  );
}

export default ImageViewer;
