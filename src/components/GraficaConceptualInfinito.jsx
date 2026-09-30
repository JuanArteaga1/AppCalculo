/**
 * Gráfica conceptual y estática del límite cuando x tiende a infinito.
 * No corresponde a una función específica (no es f(x)=x² ni f(x)=1/x):
 * solo ilustra la definición, con la curva acercándose a la recta y = L.
 *
 * variante="mas" → x → +∞ (flecha a la derecha)
 * variante="menos" → x → −∞ (flecha a la izquierda)
 */
export default function GraficaConceptualInfinito({ variante = 'mas' }) {
  const haciaDerecha = variante !== 'menos';
  const idPunta = `punta-conceptual-${variante}`;
  // Misma curva en ambos casos; en "menos" se dibuja de derecha a izquierda
  // para que la flecha quede del lado de x → −∞.
  const trazo = haciaDerecha
    ? 'M 90 245 C 180 240, 250 200, 330 150 C 390 118, 450 112, 505 111'
    : 'M 470 245 C 380 240, 310 200, 230 150 C 170 118, 110 112, 58 111';
  const etiquetaX = haciaDerecha ? 'x → +∞' : 'x → −∞';
  const xEtiquetaX = haciaDerecha ? 452 : 66;

  return (
    <div style={estilos.contenedor}>
      <svg
        viewBox="0 0 560 320"
        style={estilos.svg}
        role="img"
        aria-label={`Gráfica conceptual del límite cuando ${etiquetaX}: la curva se acerca a la recta y = L`}
      >
        <title>{`Límite cuando ${etiquetaX}`}</title>
        <defs>
          <marker
            id={idPunta}
            markerWidth="9"
            markerHeight="9"
            refX="7"
            refY="4.5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M 0 0 L 8 4.5 L 0 9 z" fill="#4F46E5" />
          </marker>
        </defs>

        {/* Ejes */}
        <line x1="56" y1="20" x2="56" y2="282" stroke="#6B7280" strokeWidth="1.5" />
        <line x1="40" y1="264" x2="548" y2="264" stroke="#6B7280" strokeWidth="1.5" />
        <text x="46" y="30" fontSize="14" fontStyle="italic" fill="#374151">y</text>
        <text x="540" y="258" fontSize="14" fontStyle="italic" fill="#374151">x</text>

        {/* Asíntota horizontal y = L */}
        <line
          x1="56"
          y1="110"
          x2="540"
          y2="110"
          stroke="#9CA3AF"
          strokeWidth="1.5"
          strokeDasharray="7 5"
        />
        <text x="500" y="100" fontSize="14" fontStyle="italic" fill="#374151">y = L</text>

        {/* Curva conceptual con flecha hacia el infinito */}
        <path
          d={trazo}
          fill="none"
          stroke="#4F46E5"
          strokeWidth="2.5"
          markerEnd={`url(#${idPunta})`}
        />

        {/* Etiquetas */}
        <text x={xEtiquetaX} y="292" fontSize="14" fill="#374151">{etiquetaX}</text>
        <text x="296" y="142" fontSize="14" fontStyle="italic" fill="#4F46E5">f(x) → L</text>
      </svg>
    </div>
  );
}

const estilos = {
  contenedor: {
    minWidth: 0,
    maxWidth: '100%',
    margin: '12px 0',
  },
  svg: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
};
