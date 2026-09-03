import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { compilar } from './laboratorio/mathUtils';

const DURACION_MS = 1600;
const ALTO = 240;

const COLOR_UNICO = '#F4B400';
const COLOR_IZQ = '#3B82F6';
const COLOR_DER = '#EF4444';

/**
 * Gráfica del ejercicio de límites.
 *
 * En modo normal dibuja una sola curva. Con `porLados` dibuja las dos ramas por
 * separado —azul la izquierda, roja la derecha— para que se vea si coinciden en
 * el punto o si hay un salto. La curva se traza progresivamente cuando `estado`
 * pasa a 'animando'.
 */
export default function GraficaLimite({
  expr,
  punto,
  limite,
  limiteIzq,
  limiteDer,
  puntos = [],
  puntosVisibles = 0,
  estado = 'oculta', // 'oculta' | 'animando' | 'completa'
  rango = 1.2,
  porLados = false,
}) {
  const contenedorRef = useRef(null);
  const grupoRef = useRef(null);
  const [ancho, setAncho] = useState(560);

  // Se mide la caja de CONTENIDO, no la del borde. Medir el borde incluía el
  // padding, el <svg> salía más ancho que su hueco y empujaba la rejilla de la
  // página, que volvía a disparar el observer: la página crecía sin parar.
  useLayoutEffect(() => {
    const nodo = contenedorRef.current;
    if (!nodo) return;

    const aplicar = (medida) => {
      const nuevo = Math.max(1, Math.round(medida));
      setAncho((previo) => (Math.abs(previo - nuevo) > 1 ? nuevo : previo));
    };

    aplicar(nodo.clientWidth - 28); // padding horizontal del contenedor
    const observer = new ResizeObserver((entradas) => {
      const caja = entradas[0]?.contentRect;
      if (caja) aplicar(caja.width);
    });
    observer.observe(nodo);
    return () => observer.disconnect();
  }, []);

  const alto = ALTO;
  const pad = { izq: 38, der: 14, arriba: 14, abajo: 26 };

  const trazo = useMemo(() => {
    let evaluar;
    try {
      evaluar = compilar(expr);
    } catch {
      return null;
    }

    const xMin = punto - rango;
    const xMax = punto + rango;
    const muestras = 240;

    const valores = [];
    for (let i = 0; i <= muestras; i++) {
      const x = xMin + ((xMax - xMin) * i) / muestras;
      const y = evaluar(x);
      if (y !== null) valores.push(y);
    }
    if (!valores.length) return null;

    const yMin = Math.min(...valores);
    const yMax = Math.max(...valores);
    const margen = (yMax - yMin) * 0.2 || 1;
    return { evaluar, xMin, xMax, yMin: yMin - margen, yMax: yMax + margen, muestras };
  }, [expr, punto, rango]);

  const escalas = useMemo(() => {
    if (!trazo) return null;
    const { xMin, xMax, yMin, yMax } = trazo;
    const anchoUtil = ancho - pad.izq - pad.der;
    const altoUtil = alto - pad.arriba - pad.abajo;
    return {
      px: (x) => pad.izq + ((x - xMin) / (xMax - xMin)) * anchoUtil,
      py: (y) => alto - pad.abajo - ((y - yMin) / (yMax - yMin)) * altoUtil,
    };
  }, [trazo, ancho, alto, pad.izq, pad.der, pad.arriba, pad.abajo]);

  /** Un camino por rama. El corte deja hueco justo sobre el punto objetivo. */
  const caminos = useMemo(() => {
    if (!trazo || !escalas) return [];
    const { evaluar, xMin, xMax, muestras } = trazo;
    const hueco = (xMax - xMin) / muestras;

    const construir = (desde, hasta, color) => {
      let d = '';
      let anterior = null;
      const pasos = Math.max(2, Math.round(muestras * ((hasta - desde) / (xMax - xMin))));
      for (let i = 0; i <= pasos; i++) {
        const x = desde + ((hasta - desde) * i) / pasos;
        const y = evaluar(x);
        if (y === null) { anterior = null; continue; }
        const cx = escalas.px(x);
        const cy = escalas.py(y);
        d += anterior === null ? `M${cx.toFixed(1)} ${cy.toFixed(1)}` : `L${cx.toFixed(1)} ${cy.toFixed(1)}`;
        anterior = cy;
      }
      return { d, color };
    };

    if (!porLados) return [construir(xMin, xMax, COLOR_UNICO)].filter((c) => c.d);

    return [
      construir(xMin, punto - hueco, COLOR_IZQ),
      construir(punto + hueco, xMax, COLOR_DER),
    ].filter((c) => c.d);
  }, [trazo, escalas, porLados, punto]);

  // Dibujado progresivo: stroke-dashoffset del largo total hasta cero.
  useEffect(() => {
    const grupo = grupoRef.current;
    if (!grupo) return;
    const curvas = [...grupo.querySelectorAll('path')];
    if (!curvas.length) return;

    const reduceMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    for (const curva of curvas) {
      const largo = curva.getTotalLength();

      // Curva completa: sin animación. Es también lo que ve quien pide menos movimiento.
      if (estado === 'completa' || (estado === 'animando' && reduceMovimiento)) {
        curva.style.transition = 'none';
        curva.style.strokeDasharray = 'none';
        curva.style.strokeDashoffset = '0';
        continue;
      }

      // Curva oculta: el trazo entero queda fuera de vista, listo para dibujarse.
      curva.style.transition = 'none';
      curva.style.strokeDasharray = `${largo}`;
      curva.style.strokeDashoffset = `${largo}`;
      if (estado !== 'animando') continue;

      // Reflow para que la transición arranque desde el estado recién fijado.
      void curva.getBoundingClientRect();
      curva.style.transition = `stroke-dashoffset ${DURACION_MS}ms ease-in-out`;
      curva.style.strokeDashoffset = '0';
    }
  }, [estado, caminos]);

  if (!trazo || !escalas) return null;

  const xPunto = escalas.px(punto);
  const ejeY = escalas.py(0);
  const marcasX = [punto - rango, punto - rango / 2, punto, punto + rango / 2, punto + rango];
  const visible = estado !== 'oculta';

  const salto = porLados
    && limiteIzq !== null && limiteIzq !== undefined
    && limiteDer !== null && limiteDer !== undefined
    && Math.abs(limiteIzq - limiteDer) > 1e-6;

  return (
    <div ref={contenedorRef} style={estilos.contenedor}>
      {/* El ancho va en CSS, no en el atributo: así el svg nunca puede empujar
          el ancho de su contenedor. El viewBox conserva el sistema de coordenadas. */}
      <svg
        viewBox={`0 0 ${ancho} ${alto}`}
        height={alto}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', maxWidth: '100%', display: 'block' }}
        role="img"
        aria-label={`Gráfica de la función cerca de x igual a ${punto}`}
      >
        <rect x="0" y="0" width={ancho} height={alto} fill="rgba(11,16,32,0.55)" rx="10" />

        <g stroke="rgba(244,180,0,0.07)" strokeWidth="1">
          {marcasX.map((x) => (
            <line key={x} x1={escalas.px(x)} y1={pad.arriba} x2={escalas.px(x)} y2={alto - pad.abajo} />
          ))}
        </g>

        {ejeY > pad.arriba && ejeY < alto - pad.abajo && (
          <line x1={pad.izq} y1={ejeY} x2={ancho - pad.der} y2={ejeY}
            stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        )}

        <g fill="rgba(255,255,255,0.45)" fontSize="10" fontFamily="'Inter', sans-serif" textAnchor="middle">
          {marcasX.map((x) => (
            <text key={x} x={escalas.px(x)} y={alto - 9}>{Number(x.toFixed(2))}</text>
          ))}
        </g>

        <line x1={xPunto} y1={pad.arriba} x2={xPunto} y2={alto - pad.abajo}
          stroke="#F4B400" strokeWidth="1.5" strokeDasharray="6 5" opacity="0.75" />
        <text x={xPunto + 5} y={pad.arriba + 11} fill="#F4B400" fontSize="10.5" fontWeight="700"
          fontFamily="'Inter', sans-serif">
          x = {punto}
        </text>

        <g ref={grupoRef} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {caminos.map((c) => (
            <path key={c.color} d={c.d} stroke={c.color} strokeWidth="2.4" />
          ))}
        </g>

        {puntos.slice(0, puntosVisibles).map((p, i) => (
          <circle key={`${p.lado}-${i}`} cx={escalas.px(p.x)} cy={escalas.py(p.y)} r="3.6"
            fill={p.lado === 'izq' ? (porLados ? COLOR_IZQ : '#10B981') : COLOR_DER}
            stroke="#0b1020" strokeWidth="1.5" />
        ))}

        {/* Extremos abiertos: el salto entre las dos ramas */}
        {visible && salto && (
          <>
            <circle cx={xPunto} cy={escalas.py(limiteIzq)} r="5" fill="#0b1020" stroke={COLOR_IZQ} strokeWidth="2" />
            <circle cx={xPunto} cy={escalas.py(limiteDer)} r="5" fill="#0b1020" stroke={COLOR_DER} strokeWidth="2" />
            <line x1={xPunto} y1={escalas.py(limiteIzq)} x2={xPunto} y2={escalas.py(limiteDer)}
              stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeDasharray="3 3" />
          </>
        )}

        {/* Agujero: la función no está definida en el punto, pero el límite existe */}
        {visible && !salto && limite !== null && limite !== undefined && (
          <circle cx={xPunto} cy={escalas.py(limite)} r="5" fill="#0b1020" stroke="#fff" strokeWidth="2" />
        )}
      </svg>

      <div style={estilos.leyenda}>
        {porLados ? (
          <>
            <span><i style={{ ...estilos.punto, background: COLOR_IZQ }} /> rama izquierda</span>
            <span><i style={{ ...estilos.punto, background: COLOR_DER }} /> rama derecha</span>
            {salto && <span style={{ color: '#FDE68A' }}>salto en x = {punto}: el límite no existe</span>}
          </>
        ) : (
          <>
            <span><i style={{ ...estilos.punto, background: '#10B981' }} /> por la izquierda</span>
            <span><i style={{ ...estilos.punto, background: COLOR_DER }} /> por la derecha</span>
            <span><i style={{ ...estilos.punto, background: '#0b1020', border: '2px solid #fff' }} /> no definida en x = {punto}</span>
          </>
        )}
      </div>
    </div>
  );
}

const estilos = {
  contenedor: {
    padding: '10px 14px 0',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  leyenda: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '14px',
    padding: '8px 2px 2px',
    fontSize: '11.5px',
    color: 'rgba(255,255,255,0.5)',
  },
  punto: {
    display: 'inline-block',
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    marginRight: '5px',
    verticalAlign: 'middle',
  },
};
