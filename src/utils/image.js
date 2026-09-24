/**
 * image.js — Utilidades para procesamiento de imágenes en el cliente.
 */

/**
 * createThumbnail — Redimensiona una imagen base64 en canvas para generar
 * una miniatura liviana. Solo procesa data URLs (las URLs externas no se
 * pueden redimensionar sin romper CORS).
 * @param {string} src - data URL de la imagen
 * @param {number} maxSize - Lado máximo (px) de la miniatura
 * @returns {Promise<string>} data URL de la miniatura
 */
export function createThumbnail(src, maxSize = 200) {
  if (!src || !src.startsWith('data:')) {
    return Promise.resolve(src);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      if (scale >= 1) {
        resolve(src);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      let dataUrl = null;
      try {
        dataUrl = canvas.toDataURL('image/webp', 0.75);
      } catch {
        dataUrl = null;
      }
      if (!dataUrl || !dataUrl.startsWith('data:image/webp')) {
        dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      }
      resolve(dataUrl);
    };
    img.onerror = () => {
      // Si no se puede cargar, devolver el original (fallback silencioso)
      resolve(src);
    };
    img.src = src;
  });
}