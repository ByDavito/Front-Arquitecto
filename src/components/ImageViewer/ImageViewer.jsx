import { useState, useEffect, useRef, useCallback } from 'react';
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

  // Refs de gestos: evitan depender del re-render entre pointerdown/pointermove.
  const imageRef = useRef(null);
  const wrapperRef = useRef(null);
  const draggingRef = useRef(false);
  const activePointerRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });
  const touchPointsRef = useRef(new Map());
  const pinchRef = useRef({ active: false, distance: 0, zoom: 1 });
  const zoomRef = useRef(1);

  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { offsetRef.current = dragOffset; }, [dragOffset]);

  /** Limita el desplazamiento para que la imagen no se salga del visor. */
  const clampOffset = useCallback((x, y, z = zoomRef.current) => {
    const img = imageRef.current;
    const wrap = wrapperRef.current;
    if (!img || !wrap) return { x, y };

    const maxX = Math.max(0, (img.offsetWidth * z - wrap.clientWidth) / 2);
    const maxY = Math.max(0, (img.offsetHeight * z - wrap.clientHeight) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  // Al cambiar el zoom, reajustamos el offset a los nuevos límites.
  useEffect(() => {
    if (!isModalOpen) return;
    const next = clampOffset(offsetRef.current.x, offsetRef.current.y, zoom);
    if (next.x !== offsetRef.current.x || next.y !== offsetRef.current.y) {
      offsetRef.current = next;
      setDragOffset(next);
    }
  }, [zoom, isModalOpen, clampOffset]);

  const handlePointerDown = (e) => {
    if (e.pointerType === 'touch') {
      touchPointsRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (touchPointsRef.current.size === 2) {
        const [a, b] = [...touchPointsRef.current.values()];
        pinchRef.current = {
          active: true,
          distance: Math.hypot(a.x - b.x, a.y - b.y),
          zoom: zoomRef.current,
        };
        draggingRef.current = false;
        setIsDragging(false);
        return;
      }

      if (touchPointsRef.current.size > 2) return;
    }

    if (zoomRef.current <= minZoom) return;

    draggingRef.current = true;
    activePointerRef.current = e.pointerId;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: offsetRef.current.x,
      offsetY: offsetRef.current.y,
    };
    setIsDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (e.pointerType === 'touch' && touchPointsRef.current.has(e.pointerId)) {
      touchPointsRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pinchRef.current.active) {
        const [a, b] = [...touchPointsRef.current.values()];
        if (a && b) {
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          const nextZoom = Math.min(
            maxZoom,
            Math.max(minZoom, pinchRef.current.zoom * (distance / pinchRef.current.distance))
          );
          setZoom(nextZoom);
          if (nextZoom <= minZoom) {
            offsetRef.current = { x: 0, y: 0 };
            setDragOffset({ x: 0, y: 0 });
          }
        }
        return;
      }
    }

    if (!draggingRef.current || activePointerRef.current !== e.pointerId) return;

    const next = clampOffset(
      dragStartRef.current.offsetX + (e.clientX - dragStartRef.current.x),
      dragStartRef.current.offsetY + (e.clientY - dragStartRef.current.y)
    );
    offsetRef.current = next;
    setDragOffset(next);
  };

  const handlePointerEnd = (e) => {
    if (e.pointerType === 'touch') {
      touchPointsRef.current.delete(e.pointerId);

      if (touchPointsRef.current.size < 2) {
        pinchRef.current.active = false;
      }

      // Si queda un dedo apoyado, continuamos el paneo sin saltos.
      if (touchPointsRef.current.size === 1 && zoomRef.current > minZoom) {
        const [remainingId, remaining] = [...touchPointsRef.current.entries()][0];
        activePointerRef.current = remainingId;
        dragStartRef.current = {
          x: remaining.x,
          y: remaining.y,
          offsetX: offsetRef.current.x,
          offsetY: offsetRef.current.y,
        };
        draggingRef.current = true;
        setIsDragging(true);
        return;
      }
    }

    if (activePointerRef.current === e.pointerId) {
      draggingRef.current = false;
      activePointerRef.current = null;
      setIsDragging(false);
    }
  };

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
        offsetRef.current = { x: 0, y: 0 };
        setDragOffset({ x: 0, y: 0 });
      }, 0);
      return () => clearTimeout(t);
    }
  }, [isModalOpen]);

  // Al cambiar de imagen, volvemos al encuadre original.
  useEffect(() => {
    setZoom(1.0);
    offsetRef.current = { x: 0, y: 0 };
    setDragOffset({ x: 0, y: 0 });
    draggingRef.current = false;
    setIsDragging(false);
  }, [currentIndex]);

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
          <div className={styles.imageWrapper} ref={wrapperRef}>
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
                  ref={imageRef}
                  src={mainMedia.imageData || formatImageUrl(mainMedia.Url)}
                  alt=""
                  className={`${styles.modalImage} ${isDragging ? styles.modalImageDragging : ''}`}
                  style={{
                    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${zoom})`,
                    cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerEnd}
                  onPointerCancel={handlePointerEnd}
                  onDragStart={(e) => e.preventDefault()}
                />
                {/* Hide zoom buttons on mobile devices */}
                {!isMobile && (
                  <>
                    <button
                      className={styles.zoomBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        offsetRef.current = { x: 0, y: 0 };
                        setDragOffset({ x: 0, y: 0 });
                        setZoom(Math.max(minZoom, zoom - 0.25));
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
                        offsetRef.current = { x: 0, y: 0 };
                        setDragOffset({ x: 0, y: 0 });
                        setZoom(Math.min(maxZoom, zoom + 0.25));
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
