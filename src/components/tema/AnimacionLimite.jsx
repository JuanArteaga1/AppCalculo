import { useEffect, useMemo, useRef, useState } from 'react';
import { compilar } from '../laboratorio/mathUtils';

const ANCHO = 380;
const ALTO = 220;
const MARGEN = 24;

/** Los puntos ocupan estos milisegundos; el resto del ciclo es la pausa antes de repetir. */
const DURACION_PUNTOS_MS = 5700;
const CICLO_MS = 7000;

/** Demostración para el cliente: fija aquí, sin pasar por el editor ni por la base. */
const ANIMACIONES = {
  'limites/1.1': {
    expresion: '1/x',
    punto: 1,
    ventana: { xMin: 0, xMax: 3, yMin: 0, yMax: 4 },
    desde: 0.25,
    distancias: [0.7, 0.55, 0.42, 0.3, 0.2, 0.12, 0.06, 0.03],
    limite: 1,
    descripcion: 'Gráfica de f(x) = 1/x. Los puntos se acercan a x = 1 por la izquierda y por la derecha, sin tocarlo, y su altura se acerca a 1.',
  },
  'limites/1.2': {
    expresion: '(x-1)/(x-2)',
    punto: 2,
    ventana: { xMin: -1, xMax: 5, yMin: -8, yMax: 10 },
    distancias: [1.6, 1.2, 0.9, 0.65, 0.45, 0.3, 0.2, 0.14],
    descripcion: 'Gráfica de f(x) = (x - 1)/(x - 2) con una asíntota en x = 2. Por la izquierda los puntos bajan hacia menos infinito y por la derecha suben hacia más infinito.',
  },
};

function construirDibujo({ expresion, punto, ventana, desde, distancias }) {
  const { xMin, xMax, yMin, yMax } = ventana;
  const evaluar = compilar(expresion);
  const px = (x) => MARGEN + ((x - xMin) / (xMax - xMin)) * (ANCHO - 2 * MARGEN);
  const py = (y) => ALTO - MARGEN - ((y - yMin) / (yMax - yMin)) * (ALTO - 2 * MARGEN);
  const dentro = (y) => y !== null && y >= yMin && y <= yMax;

  const tramo = (inicio, fin) => {
    let d = '';
    let abierto = false;

    for (let i = 0; i <= 200; i += 1) {
      const x = inicio + ((fin - inicio) * i) / 200;
      const y = evaluar(x);

      if (dentro(y)) {
        d += `${abierto ? 'L' : 'M'}${px(x).toFixed(1)} ${py(y).toFixed(1)}`;
        abierto = true;
      } else {
        abierto = false;
      }
    }

    return d;
  };

  // Los dos lados van por separado: así la curva nunca cruza x = a.
  const curvaIzquierda = tramo(desde ?? xMin, punto - 0.01);
  const curvaDerecha = tramo(punto + 0.01, xMax);

  const puntos = distancias.flatMap((distancia) => [
    { lado: 'izquierda', x: punto - distancia },
    { lado: 'derecha', x: punto + distancia },
  ]).map((p) => ({ ...p, y: evaluar(p.x) })).filter((p) => dentro(p.y));

  return {
    curvaIzquierda,
    curvaDerecha,
    puntos: puntos.map((p, i) => ({
      ...p,
      cx: px(p.x),
      cy: py(p.y),
      retraso: (i * DURACION_PUNTOS_MS) / Math.max(puntos.length - 1, 1),
    })),
    px,
    py,
  };
}

/**
 * Animación de demostración de los temas 1.1 y 1.2: pinta puntos que se acercan
 * al límite. El CSS la reproduce; aquí se decide cuándo corre y cuándo se repite.
 */
export default function AnimacionLimite({ clave }) {
  const animacion = ANIMACIONES[clave];
  const dibujo = useMemo(() => construirDibujo(animacion), [animacion]);
  const cajaRef = useRef(null);
  const [enMarcha, setEnMarcha] = useState(false);
  const [ciclo, setCiclo] = useState(0);

  useEffect(() => {
    const observador = new IntersectionObserver(([entrada]) => {
      setEnMarcha(entrada.isIntersecting);
    }, { threshold: 0.4 });

    observador.observe(cajaRef.current);
    return () => observador.disconnect();
  }, []);

  // Cambiar la clave de los puntos reinicia su animación de CSS.
  useEffect(() => {
    if (!enMarcha) return undefined;

    const repetir = setInterval(() => setCiclo((n) => n + 1), CICLO_MS);
    return () => clearInterval(repetir);
  }, [enMarcha]);

  const { punto, limite, ventana, descripcion } = animacion;
  const { curvaIzquierda, curvaDerecha, puntos, px, py } = dibujo;

  return (
    <figure ref={cajaRef} className={`animacion-limite ${enMarcha ? 'en-marcha' : ''}`}>
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img" aria-label={descripcion}>
        <line className="al-eje" x1={MARGEN} x2={ANCHO - MARGEN} y1={py(0)} y2={py(0)} />
        <line className="al-eje" x1={px(0)} x2={px(0)} y1={MARGEN} y2={ALTO - MARGEN} />
        <line className="al-guia" x1={px(punto)} x2={px(punto)} y1={MARGEN} y2={ALTO - MARGEN} />
        {limite !== undefined && (
          <line className="al-guia" x1={px(0)} x2={px(ventana.xMax)} y1={py(limite)} y2={py(limite)} />
        )}

        <text className="al-marca" x={px(punto)} y={py(0) + 15} textAnchor="middle">{punto}</text>
        {limite !== undefined && (
          <text className="al-marca" x={px(0) - 7} y={py(limite) + 4} textAnchor="end">{limite}</text>
        )}

        <path className="al-curva al-izquierda" d={curvaIzquierda} />
        <path className="al-curva al-derecha" d={curvaDerecha} />

        <g key={ciclo}>
          {puntos.map((p) => (
            <circle
              key={`${p.lado}-${p.x}`}
              className={`al-punto al-${p.lado}`}
              cx={p.cx}
              cy={p.cy}
              r="5"
              style={{ '--retraso': `${p.retraso}ms` }}
            />
          ))}
        </g>
      </svg>
    </figure>
  );
}
