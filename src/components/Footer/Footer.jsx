import logoNegro from '../../assets/img/Logo PNG Negro.png';
import logoDebsa from '../../assets/img/DeBSA.png';
import logoCardinales from '../../assets/img/Logo Cordinales 01.png';
import styles from './Footer.module.css';

/**
 * Footer — Pie de página con información de contacto y logos asociados.
 */
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        
        {/* Info Contacto & Logos Principales */}
        <div className={styles.contactInfo}>
          {/* Logos a la izquierda */}
          <div className={styles.logosContainer}>
            <img src={logoNegro} alt="Depetris Saranz Boschetto" className={styles.mediumLogo} />
            <img src={logoDebsa} alt="DeBSA Desarrollistas" className={styles.mediumLogo} />
          </div>
          
          <div className={styles.addressBlock}>
            <p><strong>coordenadas | cardinales</strong></p>
            <p>orientamos tu inversión</p>
          </div>
          
          <div className={styles.socials}>
            <a href="https://www.instagram.com/depetris.saranz.boschetto/" aria-label="Instagram" className={styles.socialLink}>Instagram</a>
            <a href="https://www.facebook.com/DepetrisSaranzBoschetto/" aria-label="Facebook" className={styles.socialLink}>Facebook</a>
            <a href="mailto:arquitectura.nsd@gmail.com" aria-label="E-mail: arquitectura.nsd@gmail.com" className={styles.socialLink}>Email</a>
          </div>
          
          <div className={styles.contactDetails}>
            <p>Morteros Bv. Illia 610</p>
            <p>3562 443899</p>
          </div>
          
        </div>

        {/* Columna derecha vacía o para futuros usos */}
        <div className={styles.rightColumn}>
          {/* Se eliminó la sección de partners antiguos a pedido del cliente */}
        </div>

      </div>

      <div className={styles.bottomBar}>
        <div className={`container ${styles.bottomContent}`}>
          <p>&copy; {currentYear} Depetris Saranz Boschetto. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
