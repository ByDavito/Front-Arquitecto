import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWorkById, useWorks } from '../../hooks/useWorks';
import { getNearbyWorks } from '../../utils/geo';
import ImageViewer from '../../components/ImageViewer/ImageViewer';
import NearbyWorks from '../../components/NearbyWorks/NearbyWorks';
import Footer from '../../components/Footer/Footer';
import styles from './WorkDetail.module.css';

/**
 * WorkDetailPage — Vista de Detalle de Obra.
 * Muestra galería de imágenes, info de la obra, y calcula las obras más cercanas.
 */
function WorkDetailPage() {
  const { id } = useParams();
  const { work, loading: loadingWork, error: errorWork } = useWorkById(id);
  const { works, loading: loadingAll } = useWorks();

  // Calcular las obras cercanas excluyendo la actual
  const nearbyWorks = useMemo(() => {
    if (!work || !works || works.length === 0) return [];
    return getNearbyWorks(work, works, 5); // top 5 más cercanas
  }, [work, works]);

  // Pantallas de estado global
  if (loadingWork) return <div className={styles.stateScreen}><div className="skeleton" style={{width: '200px', height: '40px'}}/></div>;
  if (errorWork) return <div className={styles.stateScreen}><p className="errorText">Error: {errorWork}</p><Link to="/">← Volver al inicio</Link></div>;
  if (!work) return <div className={styles.stateScreen}><p>Obra no encontrada.</p><Link to="/">← Volver al inicio</Link></div>;

  return (
    <>
      <main className={styles.detailPage}>
        <div className={`container ${styles.gridContainer}`}>
          
          {/* Columna Principal: Galería e Información */}
          <section className={styles.mainColumn}>
            {/* Nav & Breadcrumb */}
            <nav className={styles.breadcrumb}>
              <Link to="/">Inicio</Link> 
              <span className={styles.separator}>/</span>
              <span className={styles.current}>{work.Nombre}</span>
            </nav>

            {/* Cabecera */}
            <header className={styles.header}>
              <h1 className={styles.title}>{work.Nombre}</h1>
              {work.ciudadNombre && <p className={styles.location}>{work.ciudadNombre}</p>}
            </header>

            {/* Galería (usa los medios del API) */}
            <div className={styles.gallerySection}>
              <ImageViewer images={work.medios || []} />
            </div>

            {/* Info Completa */}
            <article className={styles.infoSection}>
              <h2 className={styles.sectionTitle}>Descripción del proyecto</h2>
              <div className={styles.description}>
                {work.Descripcion ? (
                  <p>{work.Descripcion}</p>
                ) : (
                  <p className={styles.emptyText}>No hay descripción disponible para esta obra.</p>
                )}
              </div>

              {/* Grid de Specs/Datos Técnicos */}
              <div className={styles.specsGrid}>
                {work.tipoNombre && <SpecItem label="Tipo" value={work.tipoNombre} />}
                {work.Estado && <SpecItem label="Estado" value={work.Estado} />}
                {work.SuperficieTotal > 0 && <SpecItem label="Sup. Total" value={`${work.SuperficieTotal} m²`} />}
                {work.SuperficieCubierta > 0 && <SpecItem label="Sup. Cubierta" value={`${work.SuperficieCubierta} m²`} />}
                {work.Habitaciones > 0 && <SpecItem label="Habitaciones" value={work.Habitaciones} />}
                {work.Baños > 0 && <SpecItem label="Baños" value={work.Baños} />}
                {work.Cochera > 0 && <SpecItem label="Cochera" value={work.Cochera ? 'Sí' : 'No'} />}
                {work.Patio > 0 && <SpecItem label="Patio" value={work.Patio ? 'Sí' : 'No'} />}
              </div>
            </article>
          </section>

          {/* Columna Lateral: Obras Cercanas */}
          <aside className={styles.sideColumn}>
            {loadingAll ? (
              <div className="skeleton" style={{width: '100%', height: '400px'}} />
            ) : (
              <NearbyWorks nearby={nearbyWorks} />
            )}
          </aside>

        </div>
      </main>
      <Footer />
    </>
  );
}

// Subcomponente simple para el Grid de datos
function SpecItem({ label, value }) {
  return (
    <div className={styles.specItem}>
      <span className={styles.specLabel}>{label}</span>
      <span className={styles.specValue}>{value}</span>
    </div>
  );
}

export default WorkDetailPage;
