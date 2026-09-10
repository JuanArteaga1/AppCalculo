import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      {/* Línea superior con gradiente brillante */}
      <div style={styles.topGradient} />

      <div style={styles.container}>
        <div style={styles.content}>
          
          {/* Bloque 1: Identidad de marca */}
          <div style={styles.brandBlock}>
            <div style={styles.logoBox}>
              <img src="/LogoUniversidad.png" alt="Logo" style={styles.logoImg} />
            </div>
            <div>
              <div style={styles.titleRow}>
                <span style={styles.brandTitle}>EDUCALC</span>
                <span style={styles.tagXe}>XE</span>
              </div>
              <p style={styles.brandTag}>Plataforma Educativa de Cálculo</p>
            </div>
          </div>

          {/* Divisor vertical (se oculta en móviles si se ajusta la pantalla) */}
          <div style={styles.divider} />

          {/* Bloque 2: Propósito y Descripción */}
          <div style={styles.descBlock}>
            <p style={styles.brandDesc}>
              Reduciendo la mortalidad académica en matemáticas universitarias mediante un ecosistema digital de aprendizaje interactivo.
            </p>
          </div>

        </div>

        {/* Bloque 3: Copyright y créditos */}
        <div style={styles.bottomBar}>
          <p style={styles.copyText}>
            © {currentYear} <strong style={styles.brandHighlight}>EDUCALC XE</strong>. Proyecto de la <span style={styles.univText}>Universidad Autónoma</span>.
          </p>
          <span style={styles.rightsText}>Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#030712', // Fondo ultra oscuro estilo Slate 950
    position: 'relative',
    marginTop: 'auto',
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: '#9CA3AF',
  },
  topGradient: {
    height: '1px',
    width: '100%',
    background: 'linear-gradient(90deg, rgba(59,130,246,0) 0%, rgba(59,130,246,0.6) 50%, rgba(59,130,246,0) 100%)',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '48px 24px 28px',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '32px',
    flexWrap: 'wrap',
    paddingBottom: '36px',
  },
  brandBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    minWidth: '280px',
  },
  logoBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
  },
  logoImg: {
    height: '28px',
    width: 'auto',
    objectFit: 'contain',
    filter: 'brightness(0) invert(1)',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  brandTitle: {
    color: '#F9FAFB',
    fontSize: '20px',
    fontWeight: '800',
    letterSpacing: '-0.02em',
  },
  tagXe: {
    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
    letterSpacing: '0.05em',
  },
  brandTag: {
    color: '#6B7280',
    fontSize: '12px',
    margin: '2px 0 0 0',
    fontWeight: '500',
  },
  divider: {
    width: '1px',
    height: '48px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  descBlock: {
    flex: '1',
    minWidth: '280px',
    maxWidth: '540px',
  },
  brandDesc: {
    color: '#9CA3AF',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0,
    fontWeight: '400',
  },
  bottomBar: {
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  copyText: {
    fontSize: '13px',
    color: '#6B7280',
    margin: 0,
  },
  brandHighlight: {
    color: '#E5E7EB',
    fontWeight: '600',
  },
  univText: {
    color: '#9CA3AF',
  },
  rightsText: {
    fontSize: '12px',
    color: '#4B5563',
  },
};