import { Link } from 'react-router-dom';

const saberesPorUnidad = {
  limites: [
    { id: 'sp-3', titulo: 'Funciones y Gráficas', icono: '📈' },
    { id: 'sp-1', titulo: 'Aritmética y Álgebra Básica', icono: '➕' },
    { id: 'sp-2', titulo: 'Ecuaciones e Inecuaciones', icono: '⚖️' },
  ],
  derivadas: [
    { id: 'sp-3', titulo: 'Funciones y Gráficas', icono: '📈' },
    { id: 'sp-2', titulo: 'Ecuaciones e Inecuaciones', icono: '⚖️' },
    { id: 'sp-5', titulo: 'Geometría Analítica', icono: '📐' },
  ],
  aplicaciones: [
    { id: 'sp-3', titulo: 'Funciones y Gráficas', icono: '📈' },
    { id: 'sp-2', titulo: 'Ecuaciones e Inecuaciones', icono: '⚖️' },
    { id: 'sp-5', titulo: 'Geometría Analítica', icono: '📐' },
    { id: 'sp-1', titulo: 'Aritmética y Álgebra Básica', icono: '➕' },
  ],
};

export default function SaberesRelacionados({ unidadId }) {
  const saberes = saberesPorUnidad[unidadId] || saberesPorUnidad.limites;

  return (
    <div style={styles.container} className="saberes-card">
      <div style={styles.glow} />
      <div style={styles.header}>
        <span style={styles.emojiWrap}>
          <span style={styles.emoji}>💡</span>
        </span>
        <span style={styles.title}>¿No te acuerdas?</span>
      </div>
      <p style={styles.text}>
        Antes de continuar, repasa estos conceptos previos que necesitarás para entender este tema.
      </p>
      <div style={styles.chips}>
        {saberes.map((s, idx) => (
          <div
            key={s.id}
            className="saber-chip"
            style={{ ...styles.chip, animationDelay: `${idx * 0.06}s` }}
          >
            <span style={styles.chipIcon}>{s.icono}</span>
            <span style={styles.chipLabel}>{s.titulo}</span>
          </div>
        ))}
      </div>
      <Link to="/saberes-previos" style={styles.link} className="saberes-link">
        Repasar saberes previos <span style={styles.linkArrow}>→</span>
      </Link>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    background: 'linear-gradient(160deg, #FEFCE8 0%, #FEF9C3 100%)',
    borderRadius: '18px',
    border: '1px solid #FDE047',
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px -6px rgba(217,119,6,0.18)',
  },
  glow: {
    position: 'absolute',
    top: '-30%',
    right: '-15%',
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(250,204,21,0.35) 0%, rgba(250,204,21,0) 70%)',
    pointerEvents: 'none',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    position: 'relative',
    zIndex: 1,
  },
  emojiWrap: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    background: 'rgba(250,204,21,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emoji: {
    fontSize: '20px',
    lineHeight: 1,
  },
  title: {
    fontSize: '16px',
    fontWeight: 800,
    color: '#854D0E',
    margin: 0,
    fontFamily: "'Poppins', sans-serif",
  },
  text: {
    fontSize: '14px',
    color: '#713F12',
    lineHeight: 1.55,
    margin: 0,
    position: 'relative',
    zIndex: 1,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    position: 'relative',
    zIndex: 1,
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    background: '#fff',
    border: '1px solid #FDE047',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#854D0E',
    cursor: 'default',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
    animation: 'chipIn 0.35s ease-out both',
  },
  chipIcon: {
    fontSize: '14px',
    lineHeight: 1,
  },
  chipLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#854D0E',
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '11px 20px',
    background: 'linear-gradient(135deg, #FACC15, #F59E0B)',
    color: '#422006',
    fontSize: '14px',
    fontWeight: 700,
    borderRadius: '12px',
    textDecoration: 'none',
    width: 'fit-content',
    boxShadow: '0 6px 16px rgba(245,158,11,0.4)',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    marginTop: '4px',
    position: 'relative',
    zIndex: 1,
  },
  linkArrow: {
    display: 'inline-block',
    transition: 'transform 0.18s ease',
  },
};

if (typeof document !== 'undefined' && !document.getElementById('saberes-styles')) {
  const style = document.createElement('style');
  style.id = 'saberes-styles';
  style.textContent = `
    @keyframes chipIn {
      from { opacity: 0; transform: translateY(6px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .saberes-card {
      transition: box-shadow 0.25s ease, transform 0.25s ease;
    }
    .saberes-card:hover {
      box-shadow: 0 12px 32px -6px rgba(217,119,6,0.28);
    }
    .saber-chip:hover {
      background: #FEF9C3;
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(217,119,6,0.2);
    }
    .saberes-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 22px rgba(245,158,11,0.5);
    }
    .saberes-link:hover span {
      transform: translateX(3px);
    }
  `;
  document.head.appendChild(style);
}