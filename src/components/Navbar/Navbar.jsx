import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logoImg from '../../assets/img/Logo Cordinales.png'
import styles from './Navbar.module.css'

/**
 * Navbar — Barra de navegación superior.
 * Comportamiento: transparente sobre el hero, oscura al hacer scroll.
 * En desktop: links a la derecha. Mobile: menú hamburguesa.
 * @param {boolean} isMapLoading - Indica si el mapa está cargando
 */
function Navbar({ isMapLoading = false }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  // Ocultar navbar completamente durante la carga
  const isVisible = !isMapLoading

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cerrar menú al cambiar de ruta
  useEffect(() => { setMenuOpen(false) }, [location])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <nav className={`${styles.navbar} ${scrolled || !isHome ? styles.scrolled : ''} ${!isVisible ? styles.hidden : ''}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <img src={logoImg} alt="Depetris Saranz Boschetto" height="38" />
        </Link>

        {/* Links */}
        <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          {isHome && (
            <>
              <li>
                <button onClick={() => scrollTo('hero')}>Inicio</button>
              </li>
              <li>
                <button onClick={() => scrollTo('mapa')}>Obras</button>
              </li>
              <li>
                <button onClick={() => scrollTo('footer')}>Contacto</button>
              </li>
            </>
          )}
          {!isHome && (
            <li><Link to="/">← Volver</Link></li>
          )}
        </ul>

        {/* Hamburguesa mobile */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.active : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}

export default Navbar
