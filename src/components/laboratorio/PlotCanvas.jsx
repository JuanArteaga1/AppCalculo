import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  pasoAgradable,
  generarTicks,
  formatearTick,
  formatearValor,
  vistaInicial,
} from './mathUtils';
import Tex from './Tex';

const UPP_MIN = 1e-7;   // acercamiento máximo
const UPP_MAX = 1e5;    // alejamiento máximo

/**
 * Plano cartesiano interactivo.
 * Dibuja varias funciones a la vez manteniendo la misma escala en ambos ejes
 * (como GeoGebra), con desplazamiento, zoom sobre el cursor y lectura de puntos.
 */
export default function PlotCanvas({
  funciones = [],
  vista,
  onVista,
  marcadores = {},
  funcionActiva = null,
  onClickPunto,
}) {
  const contenedorRef = useRef(null);
  const svgRef = useRef(null);
  const [medida, setMedida] = useState({ w: 900, h: 520 });
  const [cursor, setCursor] = useState(null);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);

  const punterosRef = useRef(new Map());
  const arrastreRef = useRef(null);
  const pellizcoRef = useRef(null);

  const { w, h } = medida;
  const { cx, cy, upp } = vista;

  /* ---------- escalas ---------- */
  const pxDe = useCallback((x) => w / 2 + (x - cx) / upp, [w, cx, upp]);
  const pyDe = useCallback((y) => h / 2 - (y - cy) / upp, [h, cy, upp]);
  const xEn = useCallback((px) => cx + (px - w / 2) * upp, [w, cx, upp]);

  const xMin = xEn(0);
  const xMax = xEn(w);
  const yMax = cy + (h / 2) * upp;
  const yMin = cy - (h / 2) * upp;

  /* ---------- tamaño real del lienzo ---------- */
  useLayoutEffect(() => {
    const nodo = contenedorRef.current;
    if (!nodo) return;
    const medir = () => {
      const r = nodo.getBoundingClientRect();
      setMedida({ w: Math.max(200, Math.round(r.width)), h: Math.max(200, Math.round(r.height)) });
    };
    medir();
    const observer = new ResizeObserver(medir);
    observer.observe(nodo);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const alCambiar = () => setPantallaCompleta(document.fullscreenElement === contenedorRef.current);
    document.addEventListener('fullscreenchange', alCambiar);
    return () => document.removeEventListener('fullscreenchange', alCambiar);
  }, []);

  /** Zoom manteniendo fijo el punto matemático bajo (px, py). */
  const aplicarZoom = useCallback((factor, px, py) => {
    const nuevoUpp = Math.min(UPP_MAX, Math.max(UPP_MIN, vista.upp * factor));
    if (nuevoUpp === vista.upp) return;
    const anclaX = px ?? w / 2;
    const anclaY = py ?? h / 2;
    const xMate = vista.cx + (anclaX - w / 2) * vista.upp;
    const yMate = vista.cy - (anclaY - h / 2) * vista.upp;
    onVista({
      upp: nuevoUpp,
      cx: xMate - (anclaX - w / 2) * nuevoUpp,
      cy: yMate + (anclaY - h / 2) * nuevoUpp,
    });
  }, [vista, w, h, onVista]);

  /* ---------- zoom con la rueda (necesita listener no pasivo) ---------- */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const alGirar = (evento) => {
      evento.preventDefault();
      const rect = svg.getBoundingClientRect();
      aplicarZoom(
        evento.deltaY < 0 ? 1 / 1.15 : 1.15,
        evento.clientX - rect.left,
        evento.clientY - rect.top,
      );
    };

    svg.addEventListener('wheel', alGirar, { passive: false });
    return () => svg.removeEventListener('wheel', alGirar);
  }, [aplicarZoom]);

  /* ---------- arrastre y pellizco ---------- */
  const posicionEnSvg = (evento) => {
    const rect = svgRef.current.getBoundingClientRect();
    return { x: evento.clientX - rect.left, y: evento.clientY - rect.top };
  };

  const alBajarPuntero = (evento) => {
    const p = posicionEnSvg(evento);
    punterosRef.current.set(evento.pointerId, p);
    try {
      svgRef.current.setPointerCapture(evento.pointerId);
    } catch {
      // El puntero ya no existe (p. ej. eventos sintéticos): se ignora.
    }

    if (punterosRef.current.size === 2) {
      const [a, b] = [...punterosRef.current.values()];
      pellizcoRef.current = {
        distancia: Math.hypot(a.x - b.x, a.y - b.y),
        medio: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      };
      arrastreRef.current = null;
    } else {
      arrastreRef.current = { desde: p, vista, movido: false };
    }
  };

  const alMoverPuntero = (evento) => {
    const p = posicionEnSvg(evento);
    if (punterosRef.current.has(evento.pointerId)) punterosRef.current.set(evento.pointerId, p);

    // Pellizco de dos dedos: zoom.
    if (punterosRef.current.size === 2 && pellizcoRef.current) {
      const [a, b] = [...punterosRef.current.values()];
      const distancia = Math.hypot(a.x - b.x, a.y - b.y);
      if (distancia > 0 && pellizcoRef.current.distancia > 0) {
        const factor = pellizcoRef.current.distancia / distancia;
        const medio = pellizcoRef.current.medio;
        aplicarZoom(factor, medio.x, medio.y);
        pellizcoRef.current.distancia = distancia;
      }
      return;
    }

    // Un dedo / botón presionado: desplazar el plano.
    if (arrastreRef.current) {
      const { desde, vista: origen } = arrastreRef.current;
      const dx = p.x - desde.x;
      const dy = p.y - desde.y;
      if (Math.hypot(dx, dy) > 3) arrastreRef.current.movido = true;
      onVista({
        upp: origen.upp,
        cx: origen.cx - dx * origen.upp,
        cy: origen.cy + dy * origen.upp,
      });
      return;
    }

    // Sin arrastre: seguimiento del cursor sobre la función activa.
    actualizarCursor(p);
  };

  const alSoltarPuntero = (evento) => {
    const arrastre = arrastreRef.current;
    punterosRef.current.delete(evento.pointerId);
    if (punterosRef.current.size < 2) pellizcoRef.current = null;
    arrastreRef.current = null;

    if (arrastre && !arrastre.movido && onClickPunto && cursor) {
      onClickPunto(cursor.x);
    }
  };

  const actualizarCursor = (p) => {
    if (!funcionActiva || !funcionActiva.visible) {
      setCursor(null);
      return;
    }
    const x = cx + (p.x - w / 2) * upp;
    const y = funcionActiva.evaluar(x);
    if (y === null) {
      setCursor(null);
      return;
    }
    const py = h / 2 - (y - cy) / upp;
    if (py < -20 || py > h + 20) {
      setCursor(null);
      return;
    }
    setCursor({ x, y, px: p.x, py });
  };

  /* ---------- trazos ---------- */
  const trazos = useMemo(() => {
    if (!w || !h) return [];
    const banda = h * 8;
    const salto = h * 4;

    return funciones.filter((f) => f.visible).map((f) => {
      let d = '';
      let anterior = null;
      for (let px = 0; px <= w; px += 1) {
        const x = cx + (px - w / 2) * upp;
        const y = f.evaluar(x);
        if (y === null) {
          anterior = null;
          continue;
        }
        let py = h / 2 - (y - cy) / upp;
        if (py < -banda) py = -banda;
        else if (py > h + banda) py = h + banda;

        if (anterior !== null && Math.abs(py - anterior) > salto) anterior = null;
        d += anterior === null ? `M${px} ${py.toFixed(2)}` : `L${px} ${py.toFixed(2)}`;
        anterior = py;
      }
      return { id: f.id, d, color: f.color, activa: funcionActiva?.id === f.id };
    });
  }, [funciones, w, h, cx, cy, upp, funcionActiva]);

  /* ---------- ejes ---------- */
  const pasoX = pasoAgradable(xMax - xMin, Math.max(3, Math.round(w / 90)));
  const pasoY = pasoAgradable(yMax - yMin, Math.max(3, Math.round(h / 70)));
  const ticksX = generarTicks(xMin, xMax, pasoX);
  const ticksY = generarTicks(yMin, yMax, pasoY);
  const menoresX = generarTicks(xMin, xMax, pasoX / 5);
  const menoresY = generarTicks(yMin, yMax, pasoY / 5);

  const ejeY = Math.min(Math.max(pxDe(0), 0), w);   // recta x = 0 en pantalla
  const ejeX = Math.min(Math.max(pyDe(0), 0), h);   // recta y = 0 en pantalla
  const etiquetaX = Math.min(Math.max(pyDe(0), 16), h - 6);
  const etiquetaY = Math.min(Math.max(pxDe(0), 26), w - 6);

  /* ---------- acciones ---------- */
  const alternarPantallaCompleta = () => {
    if (!contenedorRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else contenedorRef.current.requestFullscreen?.().catch(() => {});
  };

  const restablecer = () => onVista(vistaInicial(w));

  return (
    <div ref={contenedorRef} className="lab-lienzo">
      <svg
        ref={svgRef}
        className="lab-svg"
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        onPointerDown={alBajarPuntero}
        onPointerMove={alMoverPuntero}
        onPointerUp={alSoltarPuntero}
        onPointerCancel={alSoltarPuntero}
        onPointerLeave={() => setCursor(null)}
      >
        <rect x="0" y="0" width={w} height={h} fill="#FFFFFF" />

        {/* cuadrícula menor */}
        <g stroke="#EEF2F7" strokeWidth="1">
          {menoresX.map((v, i) => <line key={`mx${i}`} x1={pxDe(v)} y1={0} x2={pxDe(v)} y2={h} />)}
          {menoresY.map((v, i) => <line key={`my${i}`} x1={0} y1={pyDe(v)} x2={w} y2={pyDe(v)} />)}
        </g>

        {/* cuadrícula mayor */}
        <g stroke="#DCE4EF" strokeWidth="1">
          {ticksX.map((v, i) => <line key={`gx${i}`} x1={pxDe(v)} y1={0} x2={pxDe(v)} y2={h} />)}
          {ticksY.map((v, i) => <line key={`gy${i}`} x1={0} y1={pyDe(v)} x2={w} y2={pyDe(v)} />)}
        </g>

        {/* ejes */}
        <g stroke="#475569" strokeWidth="1.6">
          <line x1={0} y1={ejeX} x2={w} y2={ejeX} />
          <line x1={ejeY} y1={0} x2={ejeY} y2={h} />
        </g>

        {/* números de los ejes */}
        <g fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fill="#475569">
          {ticksX.map((v, i) => (
            v === 0 ? null : (
              <text key={`tx${i}`} x={pxDe(v)} y={etiquetaX + 14} textAnchor="middle">
                {formatearTick(v, pasoX)}
              </text>
            )
          ))}
          {ticksY.map((v, i) => (
            v === 0 ? null : (
              <text key={`ty${i}`} x={etiquetaY - 6} y={pyDe(v) + 4} textAnchor="end">
                {formatearTick(v, pasoY)}
              </text>
            )
          ))}
          <text x={etiquetaY - 6} y={etiquetaX + 14} textAnchor="end">0</text>
        </g>

        {/* rectas verticales de referencia (x = a, x = x0) */}
        {(marcadores.verticales || []).map((m, i) => (
          <g key={`v${i}`}>
            <line
              x1={pxDe(m.x)} y1={0} x2={pxDe(m.x)} y2={h}
              stroke={m.color || '#F4B400'} strokeWidth="2" strokeDasharray="7 5"
            />
            {m.etiqueta && (
              <text
                x={pxDe(m.x) + 6} y={16}
                fontSize="12" fontWeight="700" fill={m.color || '#F4B400'}
                fontFamily="'Inter', system-ui, sans-serif"
              >
                {m.etiqueta}
              </text>
            )}
          </g>
        ))}

        {/* rectas tangente / secante */}
        {(marcadores.rectas || []).map((r, i) => (
          <line
            key={`r${i}`}
            x1={0} y1={pyDe(r.m * xMin + r.b)}
            x2={w} y2={pyDe(r.m * xMax + r.b)}
            stroke={r.color || '#EF4444'} strokeWidth="2"
            strokeDasharray={r.punteada ? '7 5' : undefined}
          />
        ))}

        {/* curvas */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {trazos.map((t) => (
            <path
              key={t.id}
              d={t.d}
              stroke={t.color}
              strokeWidth={t.activa ? 2.8 : 2}
              opacity={funcionActiva && !t.activa ? 0.65 : 1}
            />
          ))}
        </g>

        {/* puntos destacados */}
        {(marcadores.puntos || []).map((p, i) => {
          const px = pxDe(p.x);
          const py = pyDe(p.y);
          if (px < -10 || px > w + 10 || py < -10 || py > h + 10) return null;
          return (
            <circle
              key={`p${i}`}
              cx={px} cy={py} r={p.r || 5}
              fill={p.hueco ? '#FFFFFF' : (p.color || '#EF4444')}
              stroke={p.color || '#EF4444'}
              strokeWidth="2"
            />
          );
        })}

        {/* seguimiento del cursor */}
        {cursor && funcionActiva && (
          <g pointerEvents="none">
            <line x1={cursor.px} y1={cursor.py} x2={cursor.px} y2={ejeX} stroke={funcionActiva.color} strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />
            <line x1={cursor.px} y1={cursor.py} x2={ejeY} y2={cursor.py} stroke={funcionActiva.color} strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />
            <circle cx={cursor.px} cy={cursor.py} r="6" fill={funcionActiva.color} stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>

      {/* lectura del punto bajo el cursor */}
      {cursor && funcionActiva && (
        <div
          className="lab-lectura"
          style={{
            left: Math.min(Math.max(cursor.px + 16, 8), Math.max(8, w - 210)),
            top: Math.min(Math.max(cursor.py + 16, 8), Math.max(8, h - 90)),
            borderColor: funcionActiva.color,
          }}
        >
          <div className="lab-lectura-titulo" style={{ color: funcionActiva.color }}>
            <Tex tex={`${funcionActiva.nombre}(x)`} />
          </div>
          <div className="lab-lectura-fila"><span>x</span><b>{formatearValor(cursor.x, 4)}</b></div>
          <div className="lab-lectura-fila"><span>y</span><b>{formatearValor(cursor.y, 4)}</b></div>
        </div>
      )}

      {/* controles flotantes */}
      <div className="lab-controles">
        <button type="button" onClick={() => aplicarZoom(1 / 1.4)} title="Acercar" aria-label="Acercar">+</button>
        <button type="button" onClick={() => aplicarZoom(1.4)} title="Alejar" aria-label="Alejar">−</button>
        <button type="button" onClick={restablecer} title="Centrar en el origen" aria-label="Centrar en el origen">⌂</button>
        <button type="button" onClick={alternarPantallaCompleta} title="Pantalla completa" aria-label="Pantalla completa">
          {pantallaCompleta ? '✕' : '⛶'}
        </button>
      </div>

      {funciones.length === 0 && (
        <div className="lab-vacio">
          Escribe una función y presiona <b>Enter</b> para graficarla.
        </div>
      )}
    </div>
  );
}
