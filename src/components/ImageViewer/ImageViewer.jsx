import { useState, useEffect } from 'react';
import { formatImageUrl } from '../../utils/geo';
import { createThumbnail } from '../../utils/image';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import styles from './ImageViewer.module.css';

/**
 * Convierte una URL de YouTube a URL de embed
 * @param {string} url - URL de YouTube
 * @returns {string} URL de embed
 */
function getYouTubeEmbedUrl(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

/**
 * Obtiene la URL del thumbnail de YouTube
 * @param {string} url - URL de YouTube
 * @returns {string} URL del thumbnail
 */
function getYouTubeThumbnailUrl(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/0.jpg` : '';
}

/** Caché de miniaturas generadas (evita recomputar al alternar modal/galería) */
const thumbnailCache = new Map();

/**
 * useThumbnail — Genera (una vez) una miniatura reducida de una imagen base64.
 * Las URLs externas se devuelven tal cual.
 */
function useThumbnail(src) {
  const [thumb, setThumb] = useState(() => thumbnailCache.get(src) ?? null);

  useEffect(() => {
    if (thumbnailCache.has(src)) return;
    let cancelled = false;
    createThumbnail(src, 200).then((t) => {
      thumbnailCache.set(src, t);
      if (!cancelled) setThumb(t);
    });
    return () => { cancelled = true; };
  }, [src]);

  return thumb;
}

/** Botón de miniatura con imagen reduzida */
function ThumbnailButton({ src, label, active, onClick, isVideo }) {
  const thumb = useThumbnail(src);
  return (
    <button
      className={`${styles.thumbnailBtn} ${active ? styles.thumbnailActive : ''}`}
      onClick={onClick}
      aria-label={label}
    >
      {thumb && (
        <img src={thumb} alt="" className={styles.thumbnailImg} loading="lazy" width="100" height="60" />
      )}
      {isVideo && <div className={styles.videoIcon}>▶</div>}
    </button>
  );
}

/**
 * ImageViewer — Visor de imágenes con galería de miniaturas.
 * Click en miniatura cambia la principal de forma suave.
 */
function ImageViewer({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const minZoom = 1.0;
  const maxZoom = 2.0;
  const [zoom, setZoom] = useState(1.0);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [initialPinchDistance, setInitialPinchDistance] = useState(0);
  const [initialPinchZoom, setInitialPinchZoom] = useState(1.0);

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
      const t = setTimeout(() => {
        setZoom(1.0);
        setDragOffset({ x: 0, y: 0 });
      }, 0);
      return () => clearTimeout(t);
    }
  }, [isModalOpen]);

  if (!images || images.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No hay imágenes disponibles para esta obra.</p>
      </div>
    );
  }

  // undefined para los tokens por defecto; se evita el hook condicional
  const mainMedia = images[currentIndex] ?? {};
  const isVideo = mainMedia.tipo === 'video' || (mainMedia.url || mainMedia.URL) && !mainMedia.imageData;

  const handlePrev = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  return (
    <>
      <div className={styles.viewerContainer}>
      {/* Media Principal */}
      <div className={styles.mainImageContainer}>
        {isVideo ? (
          <iframe
            key={mainMedia.id}
            src={getYouTubeEmbedUrl(mainMedia.url || mainMedia.URL)}
            title="Video de obra"
            className={`${styles.mainImage} animate-fadeIn`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onClick={() => setIsModalOpen(true)}
          />
        ) : (
          <img
            key={mainMedia.id} // Forza re-render para animación
            src={mainMedia.imageData || formatImageUrl(mainMedia.Url)}
            alt={`Vista de obra`}
            className={`${styles.mainImage} animate-fadeIn`}
            loading="lazy"
            onClick={() => setIsModalOpen(true)}
          />
        )}
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
          {images.map((media, idx) => {
            const isVideoThumb = media.tipo === 'video' || (media.url || media.URL) && !media.imageData;
            const src = isVideoThumb
              ? getYouTubeThumbnailUrl(media.url || media.URL)
              : (media.imageData || formatImageUrl(media.Url));
            return (
              <ThumbnailButton
                key={`${media.id}-${idx}`}
                src={src}
                isVideo={isVideoThumb}
                active={idx === currentIndex}
                label={`Ver ${isVideoThumb ? 'video' : 'imagen'} ${idx + 1}`}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
              />
            );
          })}
        </div>
      )}
    </div>

    {/* Modal */}
    {isModalOpen && (
      <div className={styles.modal} onClick={() => setIsModalOpen(false)}>
        <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)} aria-label="Cerrar visor">×</button>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.imageWrapper}>
            {isVideo ? (
              <iframe
                src={getYouTubeEmbedUrl(mainMedia.url || mainMedia.URL)}
                title="Video de obra"
                className={styles.modalVideo}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <img
                  src={mainMedia.imageData || formatImageUrl(mainMedia.Url)}
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
                  onTouchStart={(e) => {
                    if (e.touches.length === 2) {
                      // Start pinch
                      const touch1 = e.touches[0];
                      const touch2 = e.touches[1];
                      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
                      setIsPinching(true);
                      setInitialPinchDistance(distance);
                      setInitialPinchZoom(zoom);
                    } else if (e.touches.length === 1 && zoom > 1) {
                      // Start drag
                      const touch = e.touches[0];
                      setIsDragging(true);
                      setStartDrag({ x: touch.clientX - dragOffset.x, y: touch.clientY - dragOffset.y });
                    }
                  }}
                  onTouchMove={(e) => {
                    if (isPinching && e.touches.length === 2) {
                      e.preventDefault();
                      const touch1 = e.touches[0];
                      const touch2 = e.touches[1];
                      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
                      const scale = distance / initialPinchDistance;
                      setZoom(Math.min(maxZoom, Math.max(minZoom, initialPinchZoom * scale)));
                    } else if (isDragging && e.touches.length === 1) {
                      e.preventDefault(); // Prevent scroll
                      const touch = e.touches[0];
                      let newX = touch.clientX - startDrag.x;
                      let newY = touch.clientY - startDrag.y;
                      const maxDrag = 200 * (zoom - 1);
                      newX = Math.max(-maxDrag, Math.min(maxDrag, newX));
                      newY = Math.max(-maxDrag, Math.min(maxDrag, newY));
                      setDragOffset({ x: newX, y: newY });
                    }
                  }}
                  onTouchEnd={(e) => {
                    if (e.touches.length < 2) {
                      setIsPinching(false);
                    }
                    if (e.touches.length < 1) {
                      setIsDragging(false);
                    }
                  }}
                  onDragStart={(e) => e.preventDefault()}
                />
                {/* Hide zoom buttons on mobile devices */}
                {!isMobile && (
                  <>
                    <button
                      className={styles.zoomBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoom(Math.max(minZoom, zoom - 0.25));
                        setDragOffset({ x: 0, y: 0 });
                      }}
                      disabled={zoom === minZoom}
                      title="Zoom out"
                    >
                      -
                    </button>
                    <button
                      className={styles.zoomBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoom(Math.min(maxZoom, zoom + 0.25));
                        setDragOffset({ x: 0, y: 0 });
                      }}
                      disabled={zoom === maxZoom}
                      title="Zoom in"
                    >
                      +
                    </button>
                  </>
                )}
              </>
            )}
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
            style={{ opacity: isVideo ? 1 : (zoom === 1 ? 1 : 0), pointerEvents: isVideo ? 'auto' : (zoom === 1 ? 'auto' : 'none') }}
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((media, idx) => {
              const isVideoThumb = media.tipo === 'video' || (media.url || media.URL) && !media.imageData;
              const src = isVideoThumb
                ? getYouTubeThumbnailUrl(media.url || media.URL)
                : (media.imageData || formatImageUrl(media.Url));
              return (
                <ThumbnailButton
                  key={`${media.id}-${idx}`}
                  src={src}
                  isVideo={isVideoThumb}
                  active={idx === currentIndex}
                  label={`Ver ${isVideoThumb ? 'video' : 'imagen'} ${idx + 1}`}
                  onClick={() => setCurrentIndex(idx)}
                />
              );
            })}
          </div>
        )}
      </div>
    )}
    </>
  );
}

export default ImageViewer;
