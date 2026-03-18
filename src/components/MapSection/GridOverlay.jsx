import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GridOverlay.module.css';

/**
 * GridOverlay — Interfaz 3x3 que divide el mapa.
 * Al hacer click en una celda, hace flyTo a esa zona y activa el mapa.
 */
function GridOverlay({ mapRef, cityBounds, isActive, setIsActive, minZoom, isMobile }) {
  // Las letras para el diseño N O C E S de la imagen de referencia.
  // 1: N, 2: blank, 3: blank
  // 4: O, 5: C, 6: E
  // 7: blank, 8: S, 9: blank
  const gridCells = [
    { id: 'cell-0-0', label: '',  cl: styles.cellEmpty },
    { id: 'cell-0-1', label: 'N',   cl: styles.cellN },
    { id: 'cell-0-2', label: 'N',   cl: styles.cellEmpty },
    { id: 'cell-1-0', label: 'O',  cl: styles.cellO },
    { id: 'cell-1-1', label: 'C',  cl: styles.cellC },
    { id: 'cell-1-2', label: 'E',  cl: styles.cellE },
    { id: 'cell-2-0', label: '',   cl: styles.cellEmpty },
    { id: 'cell-2-1', label: 'S',  cl: styles.cellS },
    { id: 'cell-2-2', label: '',   cl: styles.cellEmpty },
  ];

  const handleCellClick = useCallback((row, col) => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Activar el mapa (zoom a cuadrilla)
    setIsActive(true);

    // Obtener los bounds actuales
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    // Calcular dimensiones totales
    const lngSpan = ne.lng - sw.lng;
    const latSpan = ne.lat - sw.lat;

    // Dimensiones de 1 celda (1/3)
    const cellLngSpan = lngSpan / 3;
    const cellLatSpan = latSpan / 3;

    // El centro Lng (X) de la celda elegida
    // col 0..2 influye en Lng
    const targetLng = sw.lng + (cellLngSpan * col) + (cellLngSpan / 2);

    // El centro Lat (Y) de la celda elegida 
    // row 0 está "arriba" (North), por lo que latitud es mayor. 
    // row 0..2 influye en Lat (invertido respecto a pantalla)
    const targetLat = ne.lat - (cellLatSpan * row) - (cellLatSpan / 2);

    // Obtener el zoom actual y calcular nuevo zoom (respetando minZoom)
    const currentZoom = map.getZoom();
    const minZoomLevel = minZoom || (map.getMinZoom ? map.getMinZoom() : 13);
    const newZoom = Math.max(currentZoom + 1.5, minZoomLevel);

    // FlyTo suave hacia el centro de la celda
    map.flyTo({
      center: [targetLng, targetLat],
      zoom: newZoom,
      essential: true,
      duration: 1500
    });
  }, [mapRef, setIsActive, minZoom]);

  const handleClose = () => {
    setIsActive(false);
    // Volver a posición inicial original
    if (mapRef.current && cityBounds) {
      mapRef.current.flyTo({
        center: cityBounds.center,
        zoom: cityBounds.zoom,
        duration: 1500
      });
    }
  };

  return (
    <>
      <div className={`${styles.gridContainer} ${isActive ? styles.gridHidden : ''}`}>
        {gridCells.map((cell, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          
          return (
            <div 
              key={cell.id} 
              className={`${styles.cell} ${cell.cl}`}
              onClick={() => handleCellClick(row, col)}
            >
              {cell.label && <span>{cell.label}</span>}
              <div className={styles.cellHover} />
            </div>
          );
        })}
        
        {/* Textos decorativos de la imagen original */}
        <div className={styles.cornerText} style={{top: '10px', left: '10px'}}>idea</div>
        <div className={styles.cornerText} style={{top: '10px', right: '10px'}}>info</div>
        <div className={styles.cornerText} style={{bottom: '10px', left: '10px'}}>contacto</div>
      </div>

      {/* Botón cerrar para activación del mapa */}
      <button
        className={`${styles.closeBtn} ${isActive ? styles.closeVisible : ''}`}
        onClick={handleClose}
        aria-label="Cerrar mapa"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Instrucciones de interacción */}
      {isActive && (
        <div className={styles.interactionHint}>
          Arrastra para explorar el mapa, haz click en los marcadores.
        </div>
      )}
    </>
  );
}

export default GridOverlay;
