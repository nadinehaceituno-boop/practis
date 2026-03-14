import styles from './Header.module.css';

const LogoIcon = () => (
  <svg viewBox="0 0 100 100" className={styles.logoIcon}>
    <circle cx="50" cy="18" r="7" fill="#FF7A00" />
    <path d="M20 30 Q50 5 80 30" stroke="#F2993A" strokeWidth="10" fill="none" strokeLinecap="round" />
    <circle cx="22" cy="58" r="7" fill="#1BA8C9" />
    <path d="M10 40 Q5 60 30 85" stroke="#1BA8C9" strokeWidth="10" fill="none" strokeLinecap="round" />
    <circle cx="78" cy="58" r="7" fill="#0B6FB8" />
    <path d="M70 85 Q95 60 90 40" stroke="#0B6FB8" strokeWidth="10" fill="none" strokeLinecap="round" />
  </svg>
);

export default function Header({ onChatOpen, onScrollToMap, onDashboard }) {
  return (
    <>
      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <span>🇵🇪 &nbsp;Portal Oficial · Atención Ciudadana en Telecomunicaciones</span>
          <div>
            <a href="https://www.osiptel.gob.pe/media/t2adonsc/resol99-2022-cd-tuo-reglamento-reclamos.pdf" target="_blank" rel="noreferrer">
              Normativa OSIPTEL
            </a>
            <a href="#">Libro de Reclamaciones</a>
            <a href="#">Transparencia</a>
          </div>
        </div>
      </div>

      <header className={styles.header}>
        <div className={styles.headerMain}>

          {/* ── LOGO HAZMECASO.PE ── */}
          <a className={styles.logoHazme} href="#">
            <LogoIcon />
            <div className={styles.logoTexts}>
              <div className={styles.logoName}>
                <span className={styles.hazme}>HAZME</span>
                <span className={styles.caso}>CASO</span>
                <span className={styles.pe}>PE</span>
              </div>
              <div className={styles.logoSub}>Sistema Inteligente de Atención al Usuario</div>
            </div>
          </a>

          {/* ── NAV ── */}
          <nav className={styles.nav}>
            <button className={`${styles.navLink} ${styles.active}`}>Inicio</button>
            <button className={styles.navLink} onClick={onDashboard}>
              Estadísticas
            </button>
            <button className={styles.navLink} onClick={onScrollToMap}>Locales</button>
            <button className={styles.navLink} onClick={onChatOpen}>Chat IA Norma </button>
          </nav>

          {/* ── ACTIONS ── */}
          <div className={styles.headerActions}>

            {/* Botón OSIPTEL */}
            <button
              className={styles.btnOsiptel}
              onClick={() => window.open('https://www.osiptel.gob.pe', '_blank')}
            >
              <svg
                viewBox="0 0 420 120"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.logoOsiptel}
              >
                <circle cx="60" cy="25" r="10" fill="#F7941D" />
                <path d="M20 40 Q60 0 100 40" stroke="#F7941D" strokeWidth="16" fill="none" strokeLinecap="round" />
                <circle cx="25" cy="70" r="10" fill="#41B6E6" />
                <path d="M5 50 Q0 80 40 110" stroke="#41B6E6" strokeWidth="16" fill="none" strokeLinecap="round" />
                <circle cx="95" cy="70" r="10" fill="#0B5EA8" />
                <path d="M80 110 Q120 80 115 50" stroke="#0B5EA8" strokeWidth="16" fill="none" strokeLinecap="round" />
                <text x="140" y="80" fontSize="72" fontFamily="Arial, Helvetica, sans-serif" fill="#41B6E6" fontWeight="600">
                  osiptel
                </text>
              </svg>
            </button>

            {/* Botón Fono Ayuda 1844 */}
            <a
              href="tel:1844"
              className={styles.btnFonoAyuda}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.phoneIcon}>
                <path
                  d="M3 1.5C3 1.5 1 1.5 1 3.5C1 9.299 6.701 15 12.5 15C14.5 15 14.5 13 14.5 13L13 9.5L10.5 10.5C10.5 10.5 9 9 8 8C7 7 5.5 5.5 5.5 5.5L6.5 3L3 1.5Z"
                  fill="white"
                />
              </svg>
              <span className={styles.fonoLabel}>
                <span className={styles.fonoTop}>Fono Ayuda</span>
                <span className={styles.fonoNum}>1844</span>
              </span>
            </a>

          </div>
        </div>
      </header>
    </>
  );
}