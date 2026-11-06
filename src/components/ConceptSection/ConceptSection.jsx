import { useEffect, useRef, useState } from 'react'
import styles from './ConceptSection.module.css'

/**
 * ConceptSection — Sección de visión integral entre el Hero y el mapa.
 * Comunica el vínculo entre Estudio DSB y DeBSA Desarrollistas.
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
            <span className={styles.label}>Nuestra visión</span>
            <h2 className={styles.title}>
              De la visión arquitectónica al{' '}
              <span className={styles.highlight}>desarrollo concreto</span>
            </h2>
            <div className={styles.underline} />
          </div>

          <div className={styles.description}>
            <p className={styles.intro}>
              Entendemos cada desarrollo como un proceso integral que articula{' '}
              <strong>arquitectura, planificación, inversión y construcción</strong>{' '}
              bajo una misma visión.
            </p>

            <div className={styles.bodyText}>
              <p>
                Desde <strong>Estudio DSB</strong>, concebimos proyectos que integran
                diseño, funcionalidad y contexto. A través de <strong>DeBSA</strong>, esa
                visión se materializa en desarrollos concretos, respaldados por la
                capacidad técnica y constructiva de nuestro equipo.
              </p>
              <p>
                Integramos cada etapa, desde la concepción inicial hasta la ejecución,
                con el compromiso de crear espacios de calidad y generar valor a largo
                plazo.
              </p>
            </div>

            {/* Dos marcas, una misma visión */}
            <div className={styles.brands}>
              <article className={styles.brandCard}>
                <h3 className={styles.brandName}>Estudio DSB</h3>
                <span className={styles.brandRule} aria-hidden="true" />
                <p className={styles.brandDisciplines}>
                  <span>Concepto</span>
                  <span>Arquitectura</span>
                  <span>Proyecto</span>
                </p>
              </article>

              <div className={styles.brandDivider} aria-hidden="true" />

              <article className={styles.brandCard}>
                <h3 className={styles.brandName}>
                  DeBSA
                  <span className={styles.brandNameMuted}>Desarrollistas</span>
                </h3>
                <span className={styles.brandRule} aria-hidden="true" />
                <p className={styles.brandDisciplines}>
                  <span>Desarrollo</span>
                  <span>Gestión</span>
                  <span>Construcción</span>
                </p>
              </article>
            </div>

            <div className={styles.conclusion}>
              <p className={styles.conclusionLabel}>
                Una visión integral, un único objetivo
              </p>
              <p className={styles.conclusionText}>
                Proyectar <span className={styles.highlight}>Valor</span>
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
