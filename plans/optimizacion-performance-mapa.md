# Plan de Optimización de Performance - Sección de Mapa

## Problemas Identificados

### 1. **GridOverlay - Efectos visuales costosos en móvil**
- **Archivo:** `src/components/MapSection/GridOverlay.module.css`
- **Problema:** 
  - `backdrop-filter: blur(2px)` en `.cell` - Muy costoso en móviles
  - `font-size: clamp(6rem, 15vw, 12rem)` con `-webkit-text-stroke` - Renderizado intensivo
  - `text-shadow` múltiple en las celdas
- **Impacto:** Cada celda de la grilla tiene efectos de blur y sombras que requieren cálculos GPU intensivos en móviles

### 2. **MapSection - Altura fija y carga de recursos**
- **Archivo:** `src/components/MapSection/MapSection.module.css`
- **Problema:**
  - `height: 80vh` y `min-height: 600px` - Fuerza renderizado de mapa grande
  - `backdrop-filter: blur(2px)` en el contenedor del mapa
- **Impacto:** El mapa WebGL intenta renderizar a resoluciones altas desde el inicio

### 3. **Eventos de mapa excesivos**
- **Archivo:** `src/components/MapSection/MapSection.jsx`
- **Problema:**
  - `enforceBounds()` se ejecuta en `moveend`, `zoomend`, `dragend` - 3 eventos por interacción
  - Cálculos de bounds y correcciones en cada movimiento
- **Impacto:** Bloqueo del hilo principal durante interacciones

### 4. **FilterPanel - Re-renders innecesarios**
- **Archivo:** `src/components/MapSection/FilterPanel.jsx`
- **Problema:**
  - `react-range` con render props complejos
  - `barrioSuggestions` recalcula en cada keystroke
  - `maxM2Cubierta` y `maxM2Total` recalculan con `Math.max` en cada render
- **Impacto:** El panel de filtros no está optimizado para móviles

### 5. **WorkMarker - Componente no optimizado**
- **Archivo:** `src/components/MapSection/WorkMarker.jsx`
- **Problema:**
  - No usa `React.memo` - se re-renderiza en cada cambio de estado del mapa
  - Cada marcador es un nuevo componente sin optimización
- **Impacto:** Si hay muchos marcadores, se crea sobrecarga

### 6. **useFilteredWorks - Filtro no memoizado correctamente**
- **Archivo:** `src/hooks/useFilteredWorks.js`
- **Problema:**
  - El filtro se ejecuta en cada render del componente padre
  - No hay limitación de cantidad de resultados
- **Impacto:** Procesamiento innecesario de arrays grandes

---

## Contexto del Proyecto

- **Cantidad actual de obras:** 3 (estimado futuro: ~10 markers)
- **Imágenes en tooltips:** Cargadas desde base de datos (calidad variable)
- **Objetivo:** Mejorar performance móvil del 48% actual

---

## Plan de Optimización

### Fase 1: Optimizaciones de CSS (Impacto inmediato)

1. **Eliminar backdrop-filter en móviles**
   - Remover `backdrop-filter: blur(2px)` de `.cell` en GridOverlay
   - Remover `backdrop-filter: blur(2px)` de `.mapContainer`
   - Agregar media query para desactivar en mobile

2. **Simplificar efectos de texto**
   - Reducir `text-shadow` a un solo efecto o eliminar
   - Simplificar `-webkit-text-stroke` en móviles

3. **Optimizar altura del mapa**
   - Usar `height: 50vh` en móviles en lugar de 80vh
   - Implementar carga progresiva del mapa

### Fase 2: Optimización de JavaScript

4. **Memoizar WorkMarker**
   - Agregar `React.memo` al componente
   - Usar `useCallback` para eventos

5. **Optimizar eventos del mapa**
   - Debounce en `enforceBounds` (ejecutar cada 100ms máximo)
   - Usar `requestAnimationFrame` para correcciones

6. **Optimizar useFilteredWorks**
   - Agregar `useMemo` con dependencias estables
   - Limitar resultados a los primeros 100 para móviles

### Fase 3: Optimización de FilterPanel

7. **Simplificar react-range**
   - Reemplazar con input type="range" nativo en móviles
   - O usar una librería más ligera

8. **Memoizar cálculos**
   - Usar `useMemo` para `barrioOptions` y `tipoOptions`
   - Implementar debounce en búsqueda de barrios

### Fase 4: Carga diferida

9. **Lazy load del mapa**
   - Solo inicializar el mapa cuando el usuario haga click en la grilla
   - Mostrar un placeholder estático inicialmente

10. **Virtualización de marcadores**
    - Solo renderizar marcadores visibles en el viewport
    - Usar clustering si hay muchos marcadores

---

## Prioridad de Implementación

| Prioridad | Tarea | Impacto Estimado |
|-----------|-------|------------------|
| **Alta** | Eliminar backdrop-filter en móviles | +15-20% performance |
| **Alta** | Simplificar efectos de texto en grilla | +10-15% performance |
| **Media** | Memoizar WorkMarker | +5-10% performance |
| **Media** | Debounce en eventos del mapa | +5-10% performance |
| **Baja** | Optimizar FilterPanel | +5% performance |
| **Baja** | Lazy load del mapa | +10-15% performance |

---

## Notas Adicionales

Con solo 3-10 markers, la virtualización no es crítica. El enfoque debe estar en:
1. **CSS:** Eliminar efectos de blur y sombras intensivas
2. **Altura del mapa:** Reducir en móviles para menos carga inicial
3. **Eventos:** Optimizar los listeners del mapa