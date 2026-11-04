import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { entero } from './formato';

const compacto = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `${n}`);

/** Escala limpia para el eje: 0 y cinco marcas como máximo. */
function escala(maximo) {
  const paso = [50, 100, 200, 250, 500, 1000, 2000].find((p) => maximo / p <= 5) ?? 5000;
  const tope = Math.max(Math.ceil(maximo / paso), 1) * paso;
  const marcas = [];
  for (let v = 0; v <= tope; v += paso) marcas.push(v);
  return { tope, marcas };
}

/** Los mismos valores de la gráfica, para quien no pueda leerla. */
function TablaDatos({ columnas, filas }) {
  return (
    <details className="graf-tabla">
      <summary>Ver los datos en tabla</summary>
      <div className="tabla-caja">
        <table className="tabla-panel">
          <thead>
            <tr>{columnas.map((c) => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr key={fila[0]}>{fila.map((celda, i) => <td key={i}>{celda}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/**
 * Barras horizontales ordenadas por quien las llama. Cada fila lleva su valor
 * escrito al final y, si tiene `a`, toda la fila es un enlace.
 */
export function BarrasMagnitud({ filas, columnaValor }) {
  const maximo = Math.max(...filas.map((f) => f.valor), 1);

  return (
    <>
      <ul className="graf-barras">
        {filas.map((f) => {
          const contenido = (
            <>
              <span className="graf-fila-cabeza">
                <span className="graf-etiqueta">
                  {f.etiqueta}
                  {f.insignia && <span className="pastilla pastilla-borrador">{f.insignia}</span>}
                </span>
                <span className="graf-valor">{entero(f.valor)}</span>
              </span>
              <span className="graf-pista">
                <i style={{ width: `${(f.valor / maximo) * 100}%`, background: f.color }} />
              </span>
              {f.detalle && <span className="graf-detalle">{f.detalle}</span>}
            </>
          );

          return (
            <li key={f.clave}>
              {f.a ? <Link className="graf-fila" to={f.a}>{contenido}</Link> : <div className="graf-fila">{contenido}</div>}
            </li>
          );
        })}
      </ul>
      <TablaDatos columnas={['Nombre', columnaValor]} filas={filas.map((f) => [f.etiqueta, entero(f.valor)])} />
    </>
  );
}

const ALTO = 260;
const MARGEN = { arriba: 12, derecha: 12, abajo: 28, izquierda: 44 };

/** Una línea por módulo sobre un solo eje. El cursor o las flechas eligen la semana. */
export function LineaSemanas({ semanas, series }) {
  const caja = useRef(null);
  const [ancho, setAncho] = useState(0);
  const [activa, setActiva] = useState(null);

  useEffect(() => {
    const elemento = caja.current;
    if (!elemento) return undefined;
    const observador = new ResizeObserver(([entrada]) => {
      if (entrada.contentRect.width > 0) setAncho(entrada.contentRect.width);
    });
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  const { tope, marcas } = escala(Math.max(...series.flatMap((s) => s.valores)));
  const ultima = semanas.length - 1;
  const anchoUtil = Math.max(ancho - MARGEN.izquierda - MARGEN.derecha, 1);
  const altoUtil = ALTO - MARGEN.arriba - MARGEN.abajo;
  const x = (i) => MARGEN.izquierda + (i / ultima) * anchoUtil;
  const y = (v) => MARGEN.arriba + (1 - v / tope) * altoUtil;

  const elegir = (evento) => {
    const izquierda = evento.currentTarget.getBoundingClientRect().left;
    const i = Math.round(((evento.clientX - izquierda - MARGEN.izquierda) / anchoUtil) * ultima);
    setActiva(Math.min(Math.max(i, 0), ultima));
  };

  const mover = (evento) => {
    if (evento.key !== 'ArrowLeft' && evento.key !== 'ArrowRight') return;
    evento.preventDefault();
    const paso = evento.key === 'ArrowRight' ? 1 : -1;
    setActiva((i) => Math.min(Math.max((i ?? ultima) + paso, 0), ultima));
  };

  const alLado = activa !== null && x(activa) > ancho / 2 ? 'graf-aviso-izq' : '';

  return (
    <>
      <ul className="graf-leyenda">
        {series.map((s) => (
          <li key={s.clave}><i style={{ background: s.color }} />{s.etiqueta}</li>
        ))}
      </ul>

      <div className="graf-linea" ref={caja} style={{ height: ALTO }}>
        {ancho > 0 && (
          <svg
            width={ancho}
            height={ALTO}
            role="img"
            tabIndex={0}
            aria-label="Visitas por semana de cada módulo. Usa las flechas para recorrer las semanas."
            onPointerMove={elegir}
            onPointerLeave={() => setActiva(null)}
            onKeyDown={mover}
            onFocus={() => setActiva(ultima)}
            onBlur={() => setActiva(null)}
          >
            {marcas.map((m) => (
              <g key={m}>
                <line className="graf-reja" x1={MARGEN.izquierda} x2={ancho - MARGEN.derecha} y1={y(m)} y2={y(m)} />
                <text className="graf-eje" x={MARGEN.izquierda - 8} y={y(m) + 4} textAnchor="end">{compacto(m)}</text>
              </g>
            ))}

            {semanas.map((s, i) => (ancho >= 520 || i % 2 === 0) && (
              <text key={s} className="graf-eje" x={x(i)} y={ALTO - 8} textAnchor={i === 0 ? 'start' : i === ultima ? 'end' : 'middle'}>{s}</text>
            ))}

            {activa !== null && (
              <line className="graf-guia" x1={x(activa)} x2={x(activa)} y1={MARGEN.arriba} y2={ALTO - MARGEN.abajo} />
            )}

            {series.map((s) => (
              <polyline
                key={s.clave}
                className="graf-trazo"
                stroke={s.color}
                points={s.valores.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
              />
            ))}

            {series.map((s) => {
              const i = activa ?? ultima;
              return <circle key={s.clave} className="graf-punto" cx={x(i)} cy={y(s.valores[i])} r={5} fill={s.color} />;
            })}
          </svg>
        )}

        {activa !== null && (
          <div className={`graf-aviso ${alLado}`} style={{ left: x(activa) }}>
            <b>Semana del {semanas[activa]}</b>
            {series.map((s) => (
              <span key={s.clave}>
                <i style={{ background: s.color }} />
                <strong>{entero(s.valores[activa])}</strong>
                {s.etiqueta}
              </span>
            ))}
          </div>
        )}
      </div>

      <TablaDatos
        columnas={['Semana del', ...series.map((s) => s.etiqueta)]}
        filas={semanas.map((semana, i) => [semana, ...series.map((s) => entero(s.valores[i]))])}
      />
    </>
  );
}
