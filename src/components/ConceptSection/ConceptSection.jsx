import { useEffect, useRef, useState } from 'react'
import styles from './ConceptSection.module.css'

/**
 * ConceptSection — Sección explicativa del concepto CORDINALES.
 * Se ubica entre el Hero y el mapa para dar contexto de marca.
 */
function ConceptSection() {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section 
      id="concepto" 
      ref={sectionRef}
      className={`${styles.section} ${isVisible ? styles.visible : ''}`}
    >
      <div className={styles.contentBox}>
        {/* Grid decorativo de fondo - líneas de mapa */}
        <div className={styles.gridPattern}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className={styles.gridLine} style={{ '--delay': i * 0.1 }} />
          ))}
        </div>

        {/* Línea decorativa central */}
        <div className={styles.centerLine} />

        {/* Contenido principal */}
        <div className={styles.content}>
          <div className={styles.titleBlock}>
            <span className={styles.label}>EL CONCEPTO</span>
            <h2 className={styles.title}>
              <span className={styles.highlight}>CORDINALES</span>
            </h2>
            <div className={styles.underline} />
          </div>

          <div className={styles.description}>
            <p className={styles.intro}>
              CORDINALES nace de la integración de dos ideas esenciales relacionadas con la organización del territorio:
            </p>

            <div className={styles.concepts}>
              <div className={styles.conceptCard}>
                <div className={styles.conceptIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                    <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </div>
                <h3 className={styles.conceptTitle}>Coordenadas</h3>
                <p className={styles.conceptText}>
                  Alude al sistema cartesiano que define ubicaciones precisas dentro de un plano.
                </p>
              </div>

              <div className={styles.conceptDivider}>
                <span>+</span>
              </div>

              <div className={styles.conceptCard}>
                <div className={styles.conceptIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L8 8h8L12 2z" />
                    <path d="M12 22L8 16h8l-4 6z" />
                    <path d="M2 12l6-4v8L2 12z" />
                    <path d="M22 12l-6-4v8l6-4z" />
                  </svg>
                </div>
                <h3 className={styles.conceptTitle}>Cardinales</h3>
                <p className={styles.conceptText}>
                  Refiere a los puntos cardinales, elementos fundamentales de orientación.
                </p>
              </div>
            </div>

            <div className={styles.conclusion}>
              <p className={styles.conclusionText}>
                La combinación entre ambas palabras crea un término único que sugiere{' '}
                <strong>dirección, ubicación estratégica, orden urbano y precisión</strong>.
              </p>
              <p className={styles.detailText}>
                CORDINALES es más que un nombre: es un sistema conceptual que nos permite organizar, 
                comunicar y diferenciar nuestros desarrollos urbanos. Cada proyecto CORDINAL se integra a un 
                mapa coherente, donde la ciudad es un eje vivo y la vivienda es un punto de referencia. 
                Esta marca nos permite crecer con orden, identidad y una narrativa sólida que conecta 
                con la forma en que las personas entienden el territorio.
              </p>
            </div>
          </div>
        </div>

        {/* Indicador direccional decorativo */}
        <div className={styles.compassDecor}>
          <svg viewBox="0 0 100 100" className={styles.compassSvg}>
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            <path d="M50 10 L55 45 L50 50 L45 45 Z" fill="currentColor" />
            <path d="M50 90 L55 55 L50 50 L45 55 Z" fill="currentColor" opacity="0.5" />
            <path d="M10 50 L45 45 L50 50 L45 55 Z" fill="currentColor" opacity="0.5" />
            <path d="M90 50 L55 45 L50 50 L55 55 Z" fill="currentColor" opacity="0.5" />
            <circle cx="50" cy="50" r="3" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Flecha indicadora hacia abajo */}
      <div className={styles.scrollHint}>
        <span>Descubre nuestro mapa</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}

export default ConceptSection