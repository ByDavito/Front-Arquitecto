import Hero from '../../components/Hero/Hero';
import MapSection from '../../components/MapSection/MapSection';
import Footer from '../../components/Footer/Footer';

/**
 * HomePage — Página principal (Landing).
 * Incluye el carrusel de inicio, el mapa 3x3 y el footer.
 */
function HomePage() {
  return (
    <main>
      <Hero />
      <MapSection />
      <Footer />
    </main>
  );
}

export default HomePage;
