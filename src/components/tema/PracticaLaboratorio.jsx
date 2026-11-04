import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const SUGERENCIAS = {
  limite: { fn: '(x^2 - 4)/(x - 2)', punto: '2' },
  derivada: { fn: 'x^2', punto: '2' },
  aplicacion: { fn: 'x^3 - 3x', punto: '1' }
};

const detalle = ({ herramienta, punto }) => (herramienta === 'limite'
  ? `Límite en x = ${punto}`
  : `Derivada en x = ${punto}`);

/**
 * Sección del tema que lleva al laboratorio. El estudiante elige un ejercicio y
 * el laboratorio se abre con la función, la herramienta y el punto ya cargados.
 */
export default function PracticaLaboratorio({ titulo, modo, unidadId, temaId, practicas = [] }) {
  const sugerencia = SUGERENCIAS[modo] || SUGERENCIAS.limite;
  const herramienta = modo === 'limite' ? 'limite' : 'derivada';

  const enlace = ({ fn, modo: modoLab, a, ejercicio }) => {
    const query = new URLSearchParams({
      fn,
      modo: modoLab,
      a: String(a),
      tema: titulo,
      volver: `/calculo1/${unidadId}/${temaId}`,
    });

    if (ejercicio) query.set('ejercicio', ejercicio);

    return `/laboratorio?${query.toString()}`;
  };

  const libre = enlace({ fn: sugerencia.fn, modo: herramienta, a: sugerencia.punto });

  return (
    <div className="tema-lanzador" style={styles.lanzador}>
      <div style={styles.lanzadorTexto}>
        <span style={styles.lanzadorTag}>Laboratorio interactivo</span>

        <h2 style={styles.lanzadorTitulo}>Ejercicios de práctica</h2>

        {practicas.length > 0 ? (
          <>
            <p style={styles.lanzadorDesc}>
              Elige un ejercicio: el laboratorio se abre con la función graficada y lista para analizar.
            </p>

            <ol className="practica-lista">
              {practicas.map((p, i) => (
                <li key={p.id}>
                  <Link
                    className="practica-item"
                    to={enlace({ fn: p.funcion, modo: p.herramienta, a: p.punto, ejercicio: p.titulo })}
                  >
                    <span className="practica-num" aria-hidden="true">{i + 1}</span>
                    <span className="practica-txt">
                      <b>{p.titulo}</b>
                      <span><code>f(x) = {p.funcion}</code> · {detalle(p)}</span>
                    </span>
                    <FiArrowRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ol>

            <Link className="practica-libre" to={libre}>Abrir el laboratorio sin ejercicio</Link>
          </>
        ) : (
          <>
            <p style={styles.lanzadorDesc}>
              Abre el plano cartesiano a pantalla completa: escribe funciones
              con el teclado matemático, grafícalas juntas y calcula{' '}
              {herramienta === 'limite' ? 'límites' : 'derivadas y rectas tangentes'}{' '}
              sobre la curva.
            </p>

            <Link to={libre} style={styles.lanzadorBtn}>
              Abrir laboratorio
              <FiArrowRight />
            </Link>

            <p style={styles.lanzadorPista}>
              Se abrirá con{' '}
              <code style={styles.lanzadorCode}>f(x) = {sugerencia.fn}</code>
            </p>
          </>
        )}
      </div>

      <svg
        viewBox="0 0 200 130"
        style={styles.lanzadorPreview}
        aria-hidden="true"
      >
        <rect x="0" y="0" width="200" height="130" rx="12" fill="#FFFFFF" />

        <g stroke="#E6E5F5" strokeWidth="1">
          {[20, 50, 80, 110, 140, 170].map(x => (
            <line key={x} x1={x} y1="10" x2={x} y2="120" />
          ))}

          {[25, 50, 75, 100].map(y => (
            <line key={y} x1="10" y1={y} x2="190" y2={y} />
          ))}
        </g>

        <line
          x1="10"
          y1="75"
          x2="190"
          y2="75"
          stroke="#64628A"
          strokeWidth="1.5"
        />

        <line
          x1="80"
          y1="10"
          x2="80"
          y2="120"
          stroke="#64628A"
          strokeWidth="1.5"
        />

        <path
          d="M 15 110 Q 60 15 105 70 T 190 25"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <path
          d="M 15 95 Q 70 95 190 45"
          fill="none"
          stroke="#4F46E5"
          strokeWidth="2"
          strokeDasharray="6 4"
        />

        <circle
          cx="105"
          cy="70"
          r="5"
          fill="#DC2626"
          stroke="#252350"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

const styles = {
  lanzador: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 220px',
    gap: '24px',
    alignItems: 'center',
    padding: '28px 32px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 50%, #FFFFFF 100%)',
    border: '1px solid rgba(245,158,11,0.35)',
    boxShadow: '0 12px 40px rgba(37,35,80,0.12), inset 0 1px 0 rgba(245,158,11,0.08)'
  },

  lanzadorTexto: {
    minWidth: 0
  },

  lanzadorTag: {
    display: 'inline-flex',
    padding: '4px 10px',
    borderRadius: '999px',
    background: '#FFFBEB',
    color: '#B45309',
    fontSize: '11px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  lanzadorTitulo: {
    margin: '10px 0 8px',
    fontSize: '22px',
    fontWeight: 800,
    color: '#252350',
    fontFamily: "'Poppins', sans-serif"
  },

  lanzadorDesc: {
    margin: '0 0 18px',
    fontSize: '14.5px',
    lineHeight: 1.6,
    color: '#64628A'
  },

  lanzadorBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '13px 24px',
    borderRadius: '12px',
    background: '#F59E0B',
    color: '#252350',
    fontSize: '15px',
    fontWeight: 800,
    textDecoration: 'none',
    boxShadow: '0 8px 20px rgba(245,158,11,0.25)'
  },

  lanzadorPista: {
    margin: '14px 0 0',
    fontSize: '12.5px',
    color: '#64628A'
  },

  lanzadorCode: {
    fontFamily: "'Courier New', monospace",
    color: '#4F46E5'
  },

  lanzadorPreview: {
    width: '100%',
    height: 'auto',
    borderRadius: '12px'
  },
};
