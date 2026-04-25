import { useState, useEffect, useRef } from 'react'
import logoImg from '../../assets/img/Logo sin nombre.png'
// Hero images — reemplazar con reales del cliente
import hero1 from '../../assets/img/hero1.png'
import hero2 from '../../assets/img/hero2.png'
import hero3 from '../../assets/img/hero3.jpeg'
import hero4 from '../../assets/img/hero4.jpeg'
import hero5 from '../../assets/img/hero5.png'
import hero6 from '../../assets/img/hero6.jpeg'
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

  const goTo = (index) => {
    setPrev(current)
    setCurrent(index)
  }

  const next = () => {
    const nextIdx = (current + 1) % SLIDES.length
    goTo(nextIdx)
  }

  // Auto-avance — pausa cuando el usuario hace hover
  useEffect(() => {
    if (hovered) {
      clearInterval(timerRef.current)
    } else {
      timerRef.current = setInterval(next, INTERVAL)
    }
    return () => clearInterval(timerRef.current)
  }, [hovered, current])

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
            <img src={slide.src} alt={slide.alt} />
          </div>
        ))}
        {/* Overlay oscuro para legibilidad */}
        <div className={styles.overlay} />
        {/* Gradiente de transición hacia el mapa */}
        <div className={`${styles.transitionGradient} ${scrolled ? styles.visible : ''}`} />



        {/* Dots — visibles solo en hover */}
        <div className={`${styles.dots} ${hovered ? styles.dotsVisible : ''}`}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Ir a imagen ${i + 1}`}
            />
          ))}
        </div>

        {/* Indicador de scroll */}
        <div className={styles.scrollIndicator}>
          <span />
          <p>Explorar</p>
        </div>
      </div>

        {/* Texto arriba a la izquierda */}
        <div className={styles.topLeftText}>
          <p className={`${styles.subtitle} ${isMapLoading && !isMapLoadingEnding ? styles.hidden : ''}`}>Una unidad de</p>
          <h1 className={`${styles.tagline} ${isMapLoading && !isMapLoadingEnding ? styles.hidden : ''}`} style={{ fontSize: '1.5rem', marginBottom: '5rem', marginTop: '0rem' }}>DEPETRIS <b style={{ color: 'var(--color-red)' }}>•</b> SARANZ <b style={{ color: 'var(--color-red)' }}>•</b> BOSCHETTO</h1>
        </div>

        {/* Contenido centrado */}
        <div className={styles.content} >
          <img 
            src={logoImg} 
            alt="Depetris Saranz Boschetto" 
            className={`${styles.logo} ${isMapLoading ? styles.logoBreathing : ''} ${isMapLoadingEnding ? styles.logoBreathingEnding : ''}`} 
          />
          <p className={`${styles.tagline} ${isMapLoading && !isMapLoadingEnding ? styles.hidden : ''}`}>Cordinales</p>
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
