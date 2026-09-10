import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { aTex, compilar, normalizarExpresion } from './laboratorio/mathUtils';
import { analizarAsintotas } from './laboratorio/asintotas';
import Tex from './laboratorio/Tex';

const DURACION_CURVA_MS = 1500;
const INTERVALO_PASO_MS = 1000;
const ALTO = 300;

const COLOR_CURVA = '#F4B400';
const COLOR_VERTICAL = '#EF4444';
const COLOR_HORIZONTAL = '#10B981';
const COLOR_OBLICUA = '#3B82F6';

/**
 * Ejercicio de asíntotas: la función, su gráfica y la resolución paso a paso.
 *
 * Al pulsar "Resolver" se dibuja la curva y luego van apareciendo, una por
 * segundo, las tres partes del procedimiento: horizontales, verticales y
 * oblicua, cada una con su recta sobre la gráfica.
 */
export default function AsintotasInteractivas({ expr, titulo }) {
  const [paso, setPaso] = useState(0); // 0 = sin resolver; 1..3 = pasos revelados
  const [corriendo, setCorriendo] = useState(false);
  const temporizador = useRef(null);

  const contenedorRef = useRef(null);
  const curvaRef = useRef(null);
  const [ancho, setAncho] = useState(560);

  useLayoutEffect(() => {
    const nodo = contenedorRef.current;
    if (!nodo) return;
    const aplicar = (medida) => {
      const nuevo = Math.max(1, Math.round(medida));
      setAncho((previo) => (Math.abs(previo - nuevo) > 1 ? nuevo : previo));
    };
    aplicar(nodo.clientWidth - 28);
    const observer = new ResizeObserver((entradas) => {
      const caja = entradas[0]?.contentRect;
      if (caja) aplicar(caja.width);
    });
    observer.observe(nodo);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => clearInterval(temporizador.current), []);

  const analisis = useMemo(() => analizarAsintotas(expr), [expr]);

  const alto = ALTO;
  const pad = { izq: 42, der: 16, arriba: 16, abajo: 28 };

  /** Ventana de la gráfica: encuadra los polos y recorta las explosiones. */
  const vista = useMemo(() => {
    if (!analisis.ok) return null;
    let f;
    try {
      f = compilar(normalizarExpresion(expr));
    } catch {
      return null;
    }

    const polos = analisis.verticales.map((v) => v.x);
    const xMin = polos.length ? Math.min(...polos) - 3.5 : -8;
    const xMax = polos.length ? Math.max(...polos) + 3.5 : 8;

    // Se muestrea evitando el entorno de los polos para que el rango vertical
    // lo marque la parte "normal" de la función y no el pico junto a la asíntota.
    const valores = [];
    const muestras = 600;
    for (let i = 0; i <= muestras; i++) {
      const x = xMin + ((xMax - xMin) * i) / muestras;
      if (polos.some((p) => Math.abs(x - p) < 0.35)) continue;
      const y = f(x);
      if (y !== null) valores.push(y);
    }
    if (!valores.length) return null;

    valores.sort((a, b) => a - b);
    const percentil = (p) => valores[Math.min(valores.length - 1, Math.floor(valores.length * p))];
    let yMin = percentil(0.08);
    let yMax = percentil(0.92);

    // La gráfica tiene que contener sus propias asíntotas.
    for (const h of analisis.horizontales) {
      yMin = Math.min(yMin, h.y);
      yMax = Math.max(yMax, h.y);
    }

    const margen = (yMax - yMin) * 0.28 || 2;
    return { f, xMin, xMax, yMin: yMin - margen, yMax: yMax + margen, polos };
  }, [analisis, expr]);

  const escalas = useMemo(() => {
    if (!vista) return null;
    const anchoUtil = ancho - pad.izq - pad.der;
    const altoUtil = alto - pad.arriba - pad.abajo;
    return {
      px: (x) => pad.izq + ((x - vista.xMin) / (vista.xMax - vista.xMin)) * anchoUtil,
      py: (y) => alto - pad.abajo - ((y - vista.yMin) / (vista.yMax - vista.yMin)) * altoUtil,
    };
  }, [vista, ancho, alto, pad.izq, pad.der, pad.arriba, pad.abajo]);

  /** Camino de la curva, cortado en cada polo. */
  const camino = useMemo(() => {
    if (!vista || !escalas) return '';
    const { f, xMin, xMax } = vista;
    const muestras = 900;
    const banda = alto * 4;
    let d = '';
    let anterior = null;

    for (let i = 0; i <= muestras; i++) {
      const x = xMin + ((xMax - xMin) * i) / muestras;
      const y = f(x);
      if (y === null) { anterior = null; continue; }

      let cy = escalas.py(y);
      if (cy < -banda) cy = -banda;
      else if (cy > alto + banda) cy = alto + banda;

      // Corte al cruzar un polo: no se une una rama con la otra.
      if (anterior !== null && Math.abs(cy - anterior) > alto * 1.5) anterior = null;

      const cx = escalas.px(x);
      d += anterior === null ? `M${cx.toFixed(1)} ${cy.toFixed(1)}` : `L${cx.toFixed(1)} ${cy.toFixed(1)}`;
      anterior = cy;
    }
    return d;
  }, [vista, escalas, alto]);

  // Dibujado progresivo de la curva al empezar a resolver.
  useEffect(() => {
    const curva = curvaRef.current;
    if (!curva || !camino) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const largo = curva.getTotalLength();

    if (paso === 0) {
      curva.style.transition = 'none';
      curva.style.strokeDasharray = `${largo}`;
      curva.style.strokeDashoffset = `${largo}`;
      return;
    }
    if (reduce) {
      curva.style.transition = 'none';
      curva.style.strokeDasharray = 'none';
      curva.style.strokeDashoffset = '0';
      return;
    }
    curva.style.transition = 'none';
    curva.style.strokeDasharray = `${largo}`;
    curva.style.strokeDashoffset = `${largo}`;
    void curva.getBoundingClientRect();
    curva.style.transition = `stroke-dashoffset ${DURACION_CURVA_MS}ms ease-in-out`;
    curva.style.strokeDashoffset = '0';
  }, [paso === 0, camino]); // eslint-disable-line react-hooks/exhaustive-deps

  const resolver = () => {
    clearInterval(temporizador.current);
    setPaso(1);
    setCorriendo(true);
    let actual = 1;
    temporizador.current = setInterval(() => {
      actual += 1;
      setPaso(actual);
      if (actual >= 3) {
        clearInterval(temporizador.current);
        setCorriendo(false);
      }
    }, INTERVALO_PASO_MS);
  };

  const reiniciar = () => {
    clearInterval(temporizador.current);
    setPaso(0);
    setCorriendo(false);
  };

  if (!analisis.ok) {
    return <div style={estilos.error}>No se pudo analizar la función: {analisis.error}</div>;
  }

  const terminado = paso >= 3;
  const pasos = analisis.pasos;

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.cabecera}>
        <span style={estilos.titulo}>
          {titulo || 'Calcular las asíntotas de'} <Tex tex={`f(x) = ${texDe(expr)}`} />
        </span>
        {terminado ? (
          <button type="button" style={estilos.btnSecundario} onClick={reiniciar}>↺ Repetir</button>
        ) : (
          <button type="button" style={estilos.btn} onClick={resolver} disabled={corriendo}>
            {corriendo ? 'Resolviendo…' : '▶ Resolver'}
          </button>
        )}
      </div>

      <div ref={contenedorRef} style={estilos.zonaGrafica}>
        {escalas && vista && (
          <svg
            viewBox={`0 0 ${ancho} ${alto}`}
            height={alto}
            style={{ width: '100%', maxWidth: '100%', display: 'block' }}
            role="img"
            aria-label={`Gráfica de f(x) = ${expr} con sus asíntotas`}
          >
            <rect x="0" y="0" width={ancho} height={alto} fill="rgba(11,16,32,0.55)" rx="10" />

            {/* ejes */}
            <g stroke="rgba(255,255,255,0.22)" strokeWidth="1">
              {vista.yMin < 0 && vista.yMax > 0 && (
                <line x1={pad.izq} y1={escalas.py(0)} x2={ancho - pad.der} y2={escalas.py(0)} />
              )}
              {vista.xMin < 0 && vista.xMax > 0 && (
                <line x1={escalas.px(0)} y1={pad.arriba} x2={escalas.px(0)} y2={alto - pad.abajo} />
              )}
            </g>

            {/* asíntotas horizontales: paso a */}
            {paso >= 1 && analisis.horizontales.map((h) => (
              <g key={`h-${h.y}`}>
                <line
                  x1={pad.izq} y1={escalas.py(h.y)} x2={ancho - pad.der} y2={escalas.py(h.y)}
                  stroke={COLOR_HORIZONTAL} strokeWidth="2" strokeDasharray="7 5"
                />
                <text x={pad.izq + 6} y={escalas.py(h.y) - 6} fill={COLOR_HORIZONTAL}
                  fontSize="11" fontWeight="700" fontFamily="'Inter', sans-serif">
                  y = {h.y}
                </text>
              </g>
            ))}

            {/* asíntotas verticales: paso b */}
            {paso >= 2 && analisis.verticales.map((v) => (
              <g key={`v-${v.x}`}>
                <line
                  x1={escalas.px(v.x)} y1={pad.arriba} x2={escalas.px(v.x)} y2={alto - pad.abajo}
                  stroke={COLOR_VERTICAL} strokeWidth="2" strokeDasharray="7 5"
                />
                <text x={escalas.px(v.x) + 5} y={pad.arriba + 12} fill={COLOR_VERTICAL}
                  fontSize="11" fontWeight="700" fontFamily="'Inter', sans-serif">
                  x = {v.x}
                </text>
              </g>
            ))}

            {/* asíntota oblicua: paso c */}
            {paso >= 3 && analisis.oblicua && (
              <line
                x1={escalas.px(vista.xMin)} y1={escalas.py(analisis.oblicua.m * vista.xMin + analisis.oblicua.b)}
                x2={escalas.px(vista.xMax)} y2={escalas.py(analisis.oblicua.m * vista.xMax + analisis.oblicua.b)}
                stroke={COLOR_OBLICUA} strokeWidth="2" strokeDasharray="7 5"
              />
            )}

            {/* la curva */}
            <path ref={curvaRef} d={camino} fill="none" stroke={COLOR_CURVA} strokeWidth="2.4"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <div style={estilos.pasos} aria-live="polite">
        {paso === 0 ? (
          <p style={estilos.pista}>
            Pulsa <strong>Resolver</strong> para ver el procedimiento y las asíntotas sobre la gráfica.
          </p>
        ) : (
          pasos.slice(0, paso).map((p) => {
            const color = colorDeTipo[p.tipo] || COLOR_NEUTRO;
            const hayRecta = p.tipo !== 'ninguna';
            return (
              <div
                key={p.etiqueta}
                style={{
                  ...estilos.paso,
                  borderLeftColor: color,
                  background: hayRecta ? `${color}14` : 'rgba(255,255,255,0.04)',
                }}
              >
                <div style={estilos.pasoTitulo}>
                  <span style={{ ...estilos.pasoLetra, background: `${color}2E`, color }}>
                    {p.etiqueta}
                  </span>
                  <span style={{ color }}>{p.titulo}</span>
                  {hayRecta && (
                    // Misma línea discontinua que se dibuja en la gráfica, para que
                    // el paso y su recta se reconozcan como lo mismo.
                    <svg width="34" height="10" aria-hidden="true" style={estilos.muestraRecta}>
                      <line
                        x1="1" y1="5" x2="33" y2="5"
                        stroke={color} strokeWidth="2.5" strokeDasharray="7 5"
                      />
                    </svg>
                  )}
                </div>
                {p.tex.map((t) => (
                  <div key={t} style={estilos.pasoTex}><Tex tex={t} /></div>
                ))}
                <p style={estilos.pasoConclusion}>{p.conclusion}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/** LaTeX de la expresión, para que el encabezado muestre una fracción de verdad. */
function texDe(expr) {
  return aTex(normalizarExpresion(expr)) ?? expr;
}

/**
 * Cada tipo de asíntota lleva el mismo color aquí abajo que la recta que le
 * corresponde en la gráfica: así se ve de un vistazo qué línea es cada paso.
 */
const COLOR_NEUTRO = 'rgba(255,255,255,0.35)';

const colorDeTipo = {
  horizontal: COLOR_HORIZONTAL,
  vertical: COLOR_VERTICAL,
  oblicua: COLOR_OBLICUA,
  ninguna: COLOR_NEUTRO,
};

const estilos = {
  contenedor: {
    margin: '14px 0',
    minWidth: 0,
    maxWidth: '100%',
    border: '1px solid rgba(244,180,0,0.15)',
    borderRadius: '14px',
    background: 'rgba(15,26,53,0.5)',
    overflow: 'hidden',
  },
  cabecera: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
    padding: '10px 14px',
    borderBottom: '1px solid rgba(244,180,0,0.12)',
    background: 'rgba(244,180,0,0.05)',
  },
  titulo: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '13.5px',
    fontWeight: 700,
    color: '#F4B400',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    flexWrap: 'wrap',
  },
  btn: {
    padding: '7px 16px',
    borderRadius: '9px',
    border: 'none',
    background: '#F4B400',
    color: '#0b1020',
    fontSize: '13px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  btnSecundario: {
    padding: '7px 14px',
    borderRadius: '9px',
    border: '1px solid rgba(244,180,0,0.35)',
    background: 'transparent',
    color: '#F4B400',
    fontSize: '12.5px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  zonaGrafica: {
    padding: '12px 14px 0',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  pasos: {
    padding: '12px 14px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  paso: {
    padding: '10px 12px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.04)',
    borderLeft: '3px solid rgba(255,255,255,0.2)',
  },
  pasoTitulo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '13px',
    fontWeight: 700,
    marginBottom: '6px',
  },
  pasoLetra: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    fontSize: '11px',
    fontWeight: 800,
    flexShrink: 0,
  },
  muestraRecta: {
    marginLeft: 'auto',
    flexShrink: 0,
  },
  pasoTex: {
    padding: '4px 0',
    color: '#fff',
    overflowX: 'auto',
  },
  pasoConclusion: {
    margin: '6px 0 0',
    fontSize: '13.5px',
    lineHeight: 1.5,
    color: 'rgba(255,255,255,0.72)',
  },
  pista: {
    margin: 0,
    fontSize: '13.5px',
    color: 'rgba(255,255,255,0.45)',
  },
  error: {
    margin: '14px 0',
    padding: '12px 14px',
    borderRadius: '12px',
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.35)',
    color: '#FCA5A5',
    fontSize: '13.5px',
  },
};
