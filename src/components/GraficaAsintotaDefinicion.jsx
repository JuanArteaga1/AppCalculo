/**
 * Gráfica pequeña y estática que acompaña a la definición de cada asíntota.
 * No es una función concreta: solo muestra la recta y cómo la curva se le pega.
 *
 * tipo="horizontal" → y = L    tipo="vertical" → x = a    tipo="oblicua" → y = mx + b
 *
 * Los colores son los mismos que usa el ejercicio interactivo de asíntotas,
 * para que la definición y el ejercicio se lean como lo mismo.
 */
const COLOR_CURVA = '#4F46E5';
const COLOR_VERTICAL = '#DC2626';
const COLOR_HORIZONTAL = '#059669';
const COLOR_OBLICUA = '#7C3AED';

const VARIANTES = {
  horizontal: {
    color: COLOR_HORIZONTAL,
    etiqueta: 'y = L',
    // Recta horizontal a la que la curva se acerca por la derecha.
    recta: { x1: 40, y1: 92, x2: 400, y2: 92 },
    curva: 'M 52 196 C 130 190, 190 150, 250 118 C 300 100, 350 95, 392 93',
    posEtiqueta: { x: 330, y: 80 },
    descripcion: 'la curva se acerca a la recta horizontal y = L cuando x crece',
  },
  vertical: {
    color: COLOR_VERTICAL,
    etiqueta: 'x = a',
    recta: { x1: 220, y1: 18, x2: 220, y2: 206 },
    curva: 'M 60 190 C 130 186, 176 170, 200 96 C 208 66, 212 40, 214 24',
    curva2: 'M 380 190 C 310 186, 264 170, 240 96 C 232 66, 228 40, 226 24',
    posEtiqueta: { x: 228, y: 32 },
    descripcion: 'la curva se dispara hacia el infinito al acercarse a x = a',
  },
  oblicua: {
    color: COLOR_OBLICUA,
    etiqueta: 'y = mx + b',
    recta: { x1: 48, y1: 196, x2: 400, y2: 44 },
    curva: 'M 56 176 C 130 156, 200 122, 270 90 C 320 68, 366 52, 396 42',
    posEtiqueta: { x: 286, y: 96 },
    descripcion: 'la curva se pega a una recta inclinada cuando x crece',
  },
};

export default function GraficaAsintotaDefinicion({ tipo = 'horizontal' }) {
  const v = VARIANTES[tipo] || VARIANTES.horizontal;

  return (
    <figure style={estilos.contenedor}>
      <svg
        viewBox="0 0 420 220"
        style={estilos.svg}
        role="img"
        aria-label={`Asíntota ${tipo}: ${v.descripcion}`}
      >
        {/* Ejes */}
        <line x1="40" y1="14" x2="40" y2="206" stroke="#64628A" strokeWidth="1.4" />
        <line x1="28" y1="206" x2="404" y2="206" stroke="#64628A" strokeWidth="1.4" />

        {/* La asíntota */}
        <line
          x1={v.recta.x1}
          y1={v.recta.y1}
          x2={v.recta.x2}
          y2={v.recta.y2}
          stroke={v.color}
          strokeWidth="2"
          strokeDasharray="7 5"
        />
        <text
          x={v.posEtiqueta.x}
          y={v.posEtiqueta.y}
          fontSize="13"
          fontWeight="700"
          fill={v.color}
          fontFamily="'Inter', sans-serif"
        >
          {v.etiqueta}
        </text>

        {/* La curva */}
        <path d={v.curva} fill="none" stroke={COLOR_CURVA} strokeWidth="2.4" strokeLinecap="round" />
        {v.curva2 && (
          <path d={v.curva2} fill="none" stroke={COLOR_CURVA} strokeWidth="2.4" strokeLinecap="round" />
        )}
      </svg>
    </figure>
  );
}

const estilos = {
  contenedor: {
    margin: '12px 0',
    padding: '10px 12px',
    border: '1px solid #E6E5F5',
    borderRadius: '14px',
    background: '#FFFFFF',
  },
  svg: { width: '100%', maxWidth: '420px', height: 'auto', display: 'block', margin: '0 auto' },
};
