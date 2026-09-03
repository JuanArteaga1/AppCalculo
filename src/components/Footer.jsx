export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div className="container">
        <div className="footer-grid" style={styles.grid}>
          <div style={styles.brandCol}>
            <div style={styles.brand}>
              <img src="/LogoUniversidad.png" alt="Logo" style={styles.logoImg} />
              <div>
                <strong style={styles.brandTitle}>EDUCALC XE</strong>
                <p style={styles.brandTag}>Plataforma Educativa de Cálculo</p>
              </div>
            </div>
            <p style={styles.brandDesc}>
              Reduciendo la mortalidad académica en matemáticas universitarias mediante un ecosistema digital de aprendizaje interactivo.
            </p>
      <div style={styles.container}>
        
        {/* Identidad de la Marca */}
        <div style={styles.brandHeader}>
          <img 
            src="/LogoUniversidad.png" 
            alt="Logo Universidad" 
            style={styles.logoImg} 
          />
          <div style={styles.brandInfo}>
            <h3 style={styles.brandTitle}>LimitsHub</h3>
            <span style={styles.brandBadge}>Plataforma Educativa</span>
          </div>
        </div>

        {/* Descripción Principal */}
        <p style={styles.brandDesc}>
          Reduciendo la mortalidad académica en matemáticas universitarias a través de un ecosistema digital de aprendizaje interactivo.
        </p>

        {/* Separador Sutil */}
        <div style={styles.divider} />

        {/* Derechos de Autor */}
        <p style={styles.copy}>
          © {currentYear} LimitsHub — Proyecto de la Universidad Autónoma. Todos los derechos reservados.
        </p>

        <div style={styles.bottom}>
          <p style={styles.copy}>
            © {new Date().getFullYear()} EDUCALC XE — Proyecto de la Universidad Autónoma. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#090d16',
    padding: '72px 24px 40px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    marginTop: 'auto',
  },
  container: {
    maxWidth: '680px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  brandHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '20px',
  },
  logoImg: {
    height: '48px',
    width: 'auto',
    objectFit: 'contain',
    filter: 'brightness(0) invert(1)',
  },
  brandInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: '26px',
    fontWeight: '700',
    margin: 0,
    lineHeight: '1.2',
    letterSpacing: '-0.5px',
  },
  brandBadge: {
    color: '#38BDF8',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: '2px',
  },
  brandDesc: {
    color: '#94A3B8',
    fontSize: '16px',
    lineHeight: '1.6',
    marginTop: 0,
    marginBottom: '36px',
    maxWidth: '560px',
  },
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: '28px',
  },
  copy: {
    color: '#64748B',
    fontSize: '13px',
    margin: 0,
  },
};