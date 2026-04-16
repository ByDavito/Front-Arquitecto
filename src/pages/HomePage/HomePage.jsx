import Hero from '../../components/Hero/Hero';
import ConceptSection from '../../components/ConceptSection/ConceptSection';
import MapSection from '../../components/MapSection/MapSection';
import Footer from '../../components/Footer/Footer';
import { useMapLoadingContext } from '../../context/MapLoadingContext';

/**
 * HomePage — Página principal (Landing).
 * Incluye el carrusel de inicio, el mapa 3x3 y el footer.
 * Maneja el estado de carga del mapa para mostrar efectos en el Hero.
 */
function HomePage({ isMapLoading = false, isMapLoadingEnding = false }) {
  const { setMapReady } = useMapLoadingContext();

  return (
    <main>
      <Hero isMapLoading={isMapLoading} isMapLoadingEnding={isMapLoadingEnding} />
      <ConceptSection />
      <MapSection onMapReady={setMapReady} />
      <Footer />
    </main>
  );
}

export default HomePage;
