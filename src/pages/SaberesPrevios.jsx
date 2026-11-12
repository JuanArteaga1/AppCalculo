import { useCallback, useEffect, useState } from 'react';
import { HiOutlineLightBulb } from 'react-icons/hi';
import ContenidoTema from '../components/tema/ContenidoTema';
import { api } from '../services/api';

export default function SaberesPrevios() {
  const [temas, setTemas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [recarga, setRecarga] = useState(0);
  const [active, setActive] = useState(null);

  const reintentar = useCallback(() => {
    setCargando(true);
    setError('');
    setRecarga((valor) => valor + 1);
  }, []);

  useEffect(() => {
    let vigente = true;

    api('/conceptos-previos')
      .then((datos) => {
        if (vigente) setTemas(datos.temas ?? []);
      })
      .catch((fallo) => {
        if (vigente) setError(fallo.mensaje);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [recarga]);

  return (
    <div style={styles.page}>
      <div className="container">
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.tag}>Preparación</span>
          <h1 style={styles.title}>Conceptos Previos</h1>
          <p style={styles.desc}>
            Antes de adentrarte en el mundo del Cálculo, es importante que revises estos conceptos
            fundamentales. Dominarlos te permitirá avanzar con confianza y reducir la frustración
            al estudiar temas nuevos.
          </p>
        </div>

        {cargando && (
          <div className="sesion-espera" role="status">Cargando los conceptos previos…</div>
        )}

        {!cargando && error && (
          <div style={styles.error}>
            <p style={styles.errorText}>{error}</p>
            <button style={styles.retry} onClick={reintentar}>Reintentar</button>
          </div>
        )}

        {!cargando && !error && temas.length === 0 && (
          <div style={styles.empty}>
            <p style={styles.emptyText}>
              Todavía no hay material de repaso publicado. Vuelve más tarde.
            </p>
          </div>
        )}

        {/* Accordion */}
        {!cargando && !error && temas.length > 0 && (
          <div className="saberes-grid" style={styles.grid}>
            {temas.map((tema, indice) => {
              const isOpen = active === tema.id;
              return (
                <div
                  key={tema.id}
                  style={{
                    ...styles.card,
                    ...(isOpen ? styles.cardOpen : {}),
                  }}
                >
                  <button
                    style={styles.cardHeader}
                    onClick={() => setActive(isOpen ? null : tema.id)}
                  >
                    <div style={styles.cardTitleWrap}>
                      <span style={styles.cardIcon}>{indice + 1}</span>
                      <span style={styles.cardTitle}>{tema.titulo}</span>
                    </div>
                    <span style={styles.cardArrow}>{isOpen ? '−' : '+'}</span>
                  </button>

                  {isOpen && (
                    <div style={styles.cardBody}>
                      {tema.descripcion && <p style={styles.cardDesc}>{tema.descripcion}</p>}
                      <ContenidoTema bloques={tema.bloques} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Callout */}
        <div style={styles.callout}>
          <div style={styles.calloutEmoji}><HiOutlineLightBulb /></div>
          <div>
            <h3 style={styles.calloutTitle}>¿No recuerdas alguno de estos temas?</h3>
            <p style={styles.calloutText}>
              No te preocupes. Repasa aquí cada concepto antes de continuar y complementa con
              los videos de la videoteca.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '32px 0 80px',
  },
  header: {
    textAlign: 'center',
    maxWidth: '720px',
    margin: '0 auto 48px',
  },
  tag: {
    display: 'inline-block',
    padding: '6px 14px',
    background: '#FFFBEB',
    color: '#B45309',
    fontSize: '13px',
    fontWeight: 700,
    borderRadius: '999px',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  title: {
    fontSize: '36px',
    fontWeight: 800,
    color: '#252350',
    margin: '0 0 12px',
    fontFamily: "'Poppins', sans-serif",
  },
  desc: {
    fontSize: '17px',
    color: '#64628A',
    lineHeight: 1.6,
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(480px, 100%), 1fr))',
    gap: '20px',
    width: '100%',
    margin: '0 auto',
  },
  card: {
    background: 'linear-gradient(145deg, #FFFFFF, #FFFFFF)',
    borderRadius: '16px',
    border: '1px solid #E6E5F5',
    boxShadow: '0 1px 3px rgba(37,35,80,0.04)',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s ease',
    alignSelf: 'start',
  },
  cardOpen: {
    boxShadow: '0 10px 25px rgba(37,35,80,0.08)',
    borderColor: 'rgba(245,158,11,0.35)',
  },
  cardHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  cardTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cardIcon: {
    fontSize: '14px',
    fontWeight: 800,
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FFFBEB',
    color: '#B45309',
    borderRadius: '10px',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#252350',
    fontFamily: "'Poppins', sans-serif",
  },
  cardArrow: {
    fontSize: '20px',
    color: '#64628A',
    fontWeight: 300,
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: {
    padding: '0 24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardDesc: {
    fontSize: '14px',
    color: '#64628A',
    margin: 0,
  },
  error: {
    maxWidth: '520px',
    margin: '0 auto',
    padding: '24px',
    borderRadius: '16px',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.25)',
    textAlign: 'center',
  },
  errorText: {
    margin: '0 0 14px',
    fontSize: '15px',
    color: '#B91C1C',
    fontWeight: 600,
  },
  retry: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    background: '#B91C1C',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  empty: {
    maxWidth: '520px',
    margin: '0 auto',
    padding: '24px',
    borderRadius: '16px',
    background: '#FFFBEB',
    border: '1px solid rgba(245,158,11,0.35)',
    textAlign: 'center',
  },
  emptyText: {
    margin: 0,
    fontSize: '15px',
    color: '#64628A',
  },
  callout: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
    maxWidth: '720px',
    margin: '40px auto 0',
    padding: '24px',
    background: '#FFFBEB',
    borderRadius: '16px',
    border: '1px solid rgba(245,158,11,0.35)',
  },
  calloutEmoji: {
    fontSize: '28px',
    lineHeight: 1,
    color: '#B45309',
  },
  calloutTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#B45309',
    margin: '0 0 6px',
    fontFamily: "'Poppins', sans-serif",
  },
  calloutText: {
    fontSize: '14px',
    color: '#64628A',
    lineHeight: 1.55,
    margin: 0,
  },
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      .saberes-grid { grid-template-columns: 1fr !important; }
    }
  `;
  document.head.appendChild(style);
}
