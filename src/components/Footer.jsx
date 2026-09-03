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
          </div>
        </div>

        <div style={styles.bottom}>
          <p style={styles.copy}>
            © {currentYear} EDUCALC XE — Proyecto de la Universidad Autónoma. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#0b1020',
    padding: '64px 0 32px',
    marginTop: 'auto',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '48px',
    marginBottom: '48px',
  },
  brandCol: {
    maxWidth: '320px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  logoImg: {
    height: '40px',
    width: 'auto',
    objectFit: 'contain',
    filter: 'brightness(0) invert(1)',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: "'Poppins', sans-serif",
  },
  brandTag: {
    color: '#94A3B8',
    fontSize: '13px',
    margin: 0,
  },
  brandDesc: {
    color: '#94A3B8',
    fontSize: '14px',
    lineHeight: 1.6,
    margin: 0,
  },
  bottom: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: '24px',
    textAlign: 'center',
  },
  copy: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0,
  },
};
