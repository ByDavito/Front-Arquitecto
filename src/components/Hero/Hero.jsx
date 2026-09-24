import { useState, useEffect, useRef, useCallback } from 'react'
import logoImg from '../../assets/img/Logo Cordinales.png'
// Hero images — reemplazar con reales del cliente
import hero1 from '../../assets/img/webp/hero1.webp'
import hero2 from '../../assets/img/webp/hero2.webp'
import hero3 from '../../assets/img/webp/hero3.webp'
import hero4 from '../../assets/img/webp/hero4.webp'
import hero5 from '../../assets/img/webp/hero5.webp'
import hero6 from '../../assets/img/webp/hero6.webp'
import { MapPin } from 'lucide-react'
import styles from './Hero.module.css'

const SLIDES = [
  { src: hero1, alt: 'Obra arquitectónica 1' },
  { src: hero2, alt: 'Obra arquitectónica 2' },
  { src: hero3, alt: 'Obra arquitectónica 3' },
  { src: hero4, alt: 'Obra arquitectónica 4' },
  { src: hero5, alt: 'Obra arquitectónica 5' },
  { src: hero6, alt: 'Obra arquitectónica 6' },
]

const INTERVAL = 5000

/**
 * Hero — Sección hero de la landing.
 * Carrusel con transición fade, logo centrado y navegación.
 * Los dots solo aparecen cuando el usuario hace hover sobre el hero.
 * @param {boolean} isMapLoading - Indica si el mapa está cargando
 */
function Hero({ isMapLoading = false, isMapLoadingEnding = false }) {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState(null)
  const [hovered, setHovered] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const timerRef = useRef(null)

  const next = useCallback(() => {
    setCurrent((c) => {
      const nextIdx = (c + 1) % SLIDES.length
      setPrev(c)
      return nextIdx
    })
  }, [])

  // Auto-avance — pausa cuando el usuario hace hover
  useEffect(() => {
    if (hovered) {
      clearInterval(timerRef.current)
    } else {
      timerRef.current = setInterval(next, INTERVAL)
    }
    return () => clearInterval(timerRef.current)
  }, [hovered, next])

  // Limpiar "prev" tras la transición para no anidar infinitamente
  useEffect(() => {
    if (prev === null) return
    const t = setTimeout(() => setPrev(null), 700)
    return () => clearTimeout(t)
  }, [prev])

  // Trackear scroll para ocultar el logo y mostrar gradiente de transición
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    // Inicializar estado por si carga ya scrolleado
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      id="hero"
      className={`${styles.hero} ${isMapLoading ? styles.heroBlurred : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Contenedor sticky para las imágenes del carrusel */}
      <div className={styles.slidesContainer}>
        {/* Imágenes del carrusel */}
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`
              ${styles.slide}
              ${i === current ? styles.active : ''}
              ${i === prev   ? styles.prev   : ''}
            `}
            aria-hidden={i !== current}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              loading={i === current ? 'eager' : 'lazy'}
              decoding="async"
              width="1920"
              height="1080"
              fetchPriority={i === 0 ? 'high' : 'auto'}
              style={{ aspectRatio: '16/9' }}
            />
          </div>
        ))}
        {/* Overlay oscuro para legibilidad */}
        <div className={styles.overlay} />
        {/* Gradiente de transición hacia el mapa */}
        <div className={`${styles.transitionGradient} ${scrolled ? styles.visible : ''}`} />



        {/* Indicador de scroll */}
        <button
          type="button"
          className={styles.scrollIndicator}
          onClick={() => document.getElementById('mapa')?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Ir al mapa de obras"
        >
          <span />
          <p>Explorar</p>
        </button>
      </div>

        {/* Texto arriba a la izquierda */}
        <div className={styles.topLeftText}>
          <p className={`${styles.subtitle} ${isMapLoading && !isMapLoadingEnding ? styles.hidden : ''}`}>Una unidad de</p>
          <h1 className={`${styles.tagline} ${isMapLoading && !isMapLoadingEnding ? styles.hidden : ''}`}>DEPETRIS <b>•</b> SARANZ <b>•</b> BOSCHETTO</h1>
        </div>

        {/* Contenido centrado */}
        <div className={styles.content} >
          <img 
            src={logoImg} 
            alt="Depetris Saranz Boschetto" 
            loading="lazy"
            decoding="async"
            className={`${styles.logo} ${isMapLoading ? styles.logoBreathing : ''} ${isMapLoadingEnding ? styles.logoBreathingEnding : ''}`} 
          />
          <p className={`${styles.tagline} ${isMapLoading && !isMapLoadingEnding ? styles.hidden : ''}`}>Coordenadas | Cardinales</p>
          <p className={`${styles.subtitle} ${isMapLoading && !isMapLoadingEnding ? styles.hidden : ''}`}>desarrollos inmobiliarios</p>
        </div>

        {/* Coordenadas abajo a la derecha */}
        <div className={`${styles.bottomRightCoords} ${isMapLoading && !isMapLoadingEnding ? styles.hidden : ''}`}>
          <div className={styles.coordHeader}>
            <MapPin style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-red)' }} />
            <p className={styles.subtitle}>Coordenadas</p>
          </div>
          <p className={styles.coordValue}>-30.7121°  -62.0052°</p>
          <p className={styles.coordLocation}>Morteros, Córdoba</p>
        </div>
       {/* Espaciador para permitir scroll */}
       <div className={styles.heroContent} />
    </section>
  )
}

export default Hero
