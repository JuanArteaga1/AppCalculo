import { useEffect, useMemo, useRef, useState } from 'react';
import { analizarLimite, compilar, formatearValor } from './laboratorio/mathUtils';
import Tex from './laboratorio/Tex';
import GraficaLimite from './GraficaLimite';

/** Un segundo entre fila y fila, como pide el criterio de aceptación. */
const INTERVALO_MS = 1000;
const PASOS = [0.1, 0.01, 0.001, 0.0001];

/**
 * Tabla de aproximación que el estudiante resuelve.
 * Muestra los dos lados del punto en una sola tabla compacta y, al pulsar
 * "Resolver", va rellenando una fila por segundo hasta llegar a la conclusión.
 */
export default function TablaLimiteInteractiva({ expr, punto, modo = 'limite', pasos = PASOS }) {
  const porLados = modo === 'laterales';
  const [reveladas, setReveladas] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const temporizador = useRef(null);

  const filas = useMemo(() => {
    let evaluar;
    try {
      evaluar = compilar(expr);
    } catch {
      return [];
    }
    return pasos.map((h) => ({
      h,
      izqX: punto - h,
      izqY: evaluar(punto - h),
      derX: punto + h,
      derY: evaluar(punto + h),
    }));
  }, [expr, punto, pasos]);

  // El límite no es el valor de la última fila (8.0001), sino aquel al que ambos
  // lados se acercan: se calcula con la misma rutina que usa el laboratorio.
  const limite = useMemo(() => {
    try {
      return analizarLimite(compilar(expr), punto).valor ?? null;
    } catch {
      return null;
    }
  }, [expr, punto]);

  // Cada fila aporta dos puntos a la gráfica: el de la izquierda y el de la derecha.
  const puntosGrafica = useMemo(
    () => filas.flatMap((f) => [
      { x: f.izqX, y: f.izqY, lado: 'izq' },
      { x: f.derX, y: f.derY, lado: 'der' },
    ]).filter((p) => p.y !== null),
    [filas],
  );

  const laterales = useMemo(() => {
    try {
      const evaluar = compilar(expr);
      const h = 1e-6;
      return { izq: evaluar(punto - h), der: evaluar(punto + h) };
    } catch {
      return { izq: null, der: null };
    }
  }, [expr, punto]);

  const coinciden = laterales.izq !== null && laterales.der !== null
    && Math.abs(laterales.izq - laterales.der) < 1e-4;

  useEffect(() => () => clearInterval(temporizador.current), []);

  const resolver = () => {
    clearInterval(temporizador.current);
    setReveladas(0);
    setCorriendo(true);

    let fila = 0;
    temporizador.current = setInterval(() => {
      fila += 1;
      setReveladas(fila);
      if (fila >= filas.length) {
        clearInterval(temporizador.current);
        setCorriendo(false);
      }
    }, INTERVALO_MS);
  };

  const reiniciar = () => {
    clearInterval(temporizador.current);
    setReveladas(0);
    setCorriendo(false);
  };

  const terminada = reveladas >= filas.length && filas.length > 0;

  if (!filas.length) return null;

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.cabecera}>
        <span style={estilos.titulo}>
          Aproximación a <Tex tex={`x = ${punto}`} />
        </span>
        {terminada ? (
          <button type="button" style={estilos.btnSecundario} onClick={reiniciar}>
            ↺ Repetir
          </button>
        ) : (
          <button type="button" style={estilos.btn} onClick={resolver} disabled={corriendo}>
            {corriendo ? 'Resolviendo…' : '▶ Resolver'}
          </button>
        )}
      </div>

      <GraficaLimite
        expr={expr}
        punto={punto}
        limite={limite}
        puntos={puntosGrafica}
        puntosVisibles={reveladas * 2}
        estado={terminada ? 'completa' : corriendo ? 'animando' : 'oculta'}
        porLados={porLados}
        limiteIzq={laterales.izq}
        limiteDer={laterales.der}
      />

      <div style={estilos.envoltura}>
        <table style={estilos.tabla}>
          <thead>
            <tr>
              <th style={estilos.th} scope="col"><Tex tex={`x \\to ${punto}^{-}`} /></th>
              <th style={estilos.th} scope="col"><Tex tex="f(x)" /></th>
              <th style={{ ...estilos.th, ...estilos.thSeparador }} scope="col"><Tex tex={`x \\to ${punto}^{+}`} /></th>
              <th style={estilos.th} scope="col"><Tex tex="f(x)" /></th>
              {porLados && <th style={{ ...estilos.th, ...estilos.thSeparador }} scope="col">diferencia</th>}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, i) => {
              const visible = i < reveladas;
              const recienRevelada = i === reveladas - 1 && !terminada;
              return (
                <tr
                  key={fila.h}
                  style={{
                    ...estilos.tr,
                    ...(recienRevelada ? estilos.trActiva : {}),
                    opacity: visible ? 1 : 0.25,
                  }}
                >
                  <td style={estilos.td}>{formatearValor(fila.izqX, 4)}</td>
                  <td style={estilos.tdValor}>{visible ? formatearValor(fila.izqY, 4) : '—'}</td>
                  <td style={{ ...estilos.td, ...estilos.tdSeparador }}>{formatearValor(fila.derX, 4)}</td>
                  <td style={estilos.tdValor}>{visible ? formatearValor(fila.derY, 4) : '—'}</td>
                  {porLados && (
                    <td style={{ ...estilos.td, ...estilos.tdSeparador }}>
                      {visible && fila.izqY !== null && fila.derY !== null
                        ? formatearValor(Math.abs(fila.derY - fila.izqY), 4)
                        : '—'}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={estilos.pie} aria-live="polite">
        {terminada ? (
          porLados && !coinciden ? (
            <span style={estilos.conclusionAviso}>
              <Tex tex={`\\lim_{x \\to ${punto}^{-}} f(x) = ${formatearValor(laterales.izq, 4)}`} />
              {' y '}
              <Tex tex={`\\lim_{x \\to ${punto}^{+}} f(x) = ${formatearValor(laterales.der, 4)}`} />
              {': los laterales no coinciden, así que el límite no existe.'}
            </span>
          ) : (
            <span style={estilos.conclusion}>
              <Tex tex={`f(x) \\to ${formatearValor(porLados ? laterales.izq : limite, 4)}`} /> cuando <Tex tex={`x \\to ${punto}`} />
              {' '}por ambos lados
            </span>
          )
        ) : (
          <span style={estilos.pista}>
            Pulsa <strong>Resolver</strong> para ver a qué valor se acerca la función.
          </span>
        )}
      </div>
    </div>
  );
}

const estilos = {
  contenedor: {
    margin: '12px 0',
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
    fontSize: '13px',
    fontWeight: 700,
    color: '#F4B400',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
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
  // minWidth 0 para que la envoltura no herede el ancho minimo de la tabla:
  // sin esto, una tabla ancha empuja al contenedor en vez de scrollear dentro.
  envoltura: { overflowX: 'auto', minWidth: 0, maxWidth: '100%' },
  tabla: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13.5px',
  },
  th: {
    padding: '8px 12px',
    textAlign: 'right',
    color: 'rgba(244,180,0,0.85)',
    fontWeight: 700,
    fontSize: '12.5px',
    borderBottom: '1px solid rgba(244,180,0,0.15)',
    whiteSpace: 'nowrap',
  },
  thSeparador: { borderLeft: '1px solid rgba(244,180,0,0.15)' },
  tr: {
    transition: 'opacity 0.35s ease, background 0.35s ease',
  },
  trActiva: { background: 'rgba(244,180,0,0.12)' },
  td: {
    padding: '7px 12px',
    textAlign: 'right',
    color: 'rgba(255,255,255,0.6)',
    fontFamily: "'Courier New', monospace",
    fontVariantNumeric: 'tabular-nums',
    borderBottom: '1px solid rgba(244,180,0,0.06)',
    whiteSpace: 'nowrap',
  },
  tdValor: {
    padding: '7px 12px',
    textAlign: 'right',
    color: '#fff',
    fontWeight: 700,
    fontFamily: "'Courier New', monospace",
    fontVariantNumeric: 'tabular-nums',
    borderBottom: '1px solid rgba(244,180,0,0.06)',
    whiteSpace: 'nowrap',
  },
  tdSeparador: { borderLeft: '1px solid rgba(244,180,0,0.12)' },
  pie: {
    padding: '10px 14px',
    borderTop: '1px solid rgba(244,180,0,0.1)',
    fontSize: '13.5px',
  },
  conclusion: {
    color: '#10B981',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    flexWrap: 'wrap',
  },
  conclusionAviso: {
    color: '#FDE68A',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    flexWrap: 'wrap',
  },
  pista: { color: 'rgba(255,255,255,0.45)' },
};
