/**
 * Gráfica conceptual y estática de un límite infinito en x = a.
 * No es una función concreta: ilustra la definición.
 *
 * variante="mas"   → lim f(x) = +∞: la curva supera cualquier cota y = M
 * variante="menos" → lim f(x) = −∞: la curva cae por debajo de la cota y = −M
 *
 * En los dos casos se marca el intervalo (a−δ, a+δ) sobre el eje x, que es
 * donde la definición exige que la curva ya haya pasado la cota.
 */
export default function GraficaLimiteInfinito({ variante = 'mas' }) {
  const haciaArriba = variante !== 'menos';

  // Eje x en y=264 para "mas" (la curva sube) y en y=56 para "menos".
  const ejeY = haciaArriba ? 264 : 56;
  const cotaY = haciaArriba ? 120 : 200;
  const xA = 300;
  const xIzq = 236;
  const xDer = 364;

  // Dos ramas que se disparan al acercarse a x = a, como 1/(x−a)².
  const ramaIzq = haciaArriba
    ? 'M 80 250 C 170 245, 225 215, 262 90 C 270 62, 274 40, 276 26'
    : 'M 80 70 C 170 75, 225 105, 262 230 C 270 258, 274 280, 276 294';
  const ramaDer = haciaArriba
    ? 'M 520 250 C 430 245, 375 215, 338 90 C 330 62, 326 40, 324 26'
    : 'M 520 70 C 430 75, 375 105, 338 230 C 330 258, 326 280, 324 294';

  const etiquetaCota = haciaArriba ? 'y = M' : 'y = −M';
  const etiquetaLimite = haciaArriba ? '+∞' : '−∞';

  return (
    <figure style={estilos.contenedor}>
      <svg
        viewBox="0 0 560 320"
        style={estilos.svg}
        role="img"
        aria-label={`Gráfica conceptual: cuando x se acerca a a, la curva se va a ${etiquetaLimite} superando la cota ${etiquetaCota}`}
      >
        {/* Ejes */}
        <line x1="56" y1="20" x2="56" y2="300" stroke="#64628A" strokeWidth="1.5" />
        <line x1="40" y1={ejeY} x2="548" y2={ejeY} stroke="#64628A" strokeWidth="1.5" />
        <text x="36" y="26" fontSize="14" fill="#64628A" fontFamily="'Inter', sans-serif">y</text>
        <text x="540" y={ejeY + (haciaArriba ? 20 : -10)} fontSize="14" fill="#64628A" fontFamily="'Inter', sans-serif">x</text>

        {/* Intervalo (a−δ, a+δ) sobre el eje */}
        <line x1={xIzq} y1={ejeY} x2={xDer} y2={ejeY} stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
        <line x1={xIzq} y1={ejeY - 6} x2={xIzq} y2={ejeY + 6} stroke="#B45309" strokeWidth="1.5" />
        <line x1={xDer} y1={ejeY - 6} x2={xDer} y2={ejeY + 6} stroke="#B45309" strokeWidth="1.5" />
        <text x={xIzq - 26} y={ejeY + (haciaArriba ? 22 : -12)} fontSize="12" fill="#B45309" fontFamily="'Inter', sans-serif">a−δ</text>
        <text x={xDer + 4} y={ejeY + (haciaArriba ? 22 : -12)} fontSize="12" fill="#B45309" fontFamily="'Inter', sans-serif">a+δ</text>

        {/* Recta x = a */}
        <line x1={xA} y1="20" x2={xA} y2="300" stroke="#DC2626" strokeWidth="1.8" strokeDasharray="7 5" />
        <text x={xA + 7} y={haciaArriba ? 36 : 300} fontSize="13" fontWeight="700" fill="#DC2626" fontFamily="'Inter', sans-serif">x = a</text>

        {/* Cota y = ±M */}
        <line x1="56" y1={cotaY} x2="548" y2={cotaY} stroke="#059669" strokeWidth="1.8" strokeDasharray="6 5" />
        <text x="62" y={cotaY - 8} fontSize="13" fontWeight="700" fill="#047857" fontFamily="'Inter', sans-serif">{etiquetaCota}</text>

        {/* Las dos ramas de la curva */}
        <path d={ramaIzq} fill="none" stroke="#4F46E5" strokeWidth="2.6" strokeLinecap="round" />
        <path d={ramaDer} fill="none" stroke="#4F46E5" strokeWidth="2.6" strokeLinecap="round" />

        <text
          x="330"
          y={haciaArriba ? 46 : 286}
          fontSize="15"
          fontWeight="700"
          fill="#4F46E5"
          fontFamily="'Inter', sans-serif"
        >
          f(x) → {etiquetaLimite}
        </text>
      </svg>

      <figcaption style={estilos.pie}>
        Dentro de (a−δ, a+δ) la curva ya pasó la cota {etiquetaCota} y sigue{' '}
        {haciaArriba ? 'creciendo' : 'decreciendo'} sin detenerse.
      </figcaption>
    </figure>
  );
}

const estilos = {
  contenedor: {
    margin: '16px 0',
    padding: '12px 14px 10px',
    border: '1px solid #E6E5F5',
    borderRadius: '16px',
    background: '#FFFFFF',
  },
  svg: { width: '100%', height: 'auto', display: 'block' },
  pie: {
    margin: '8px 4px 0',
    fontSize: '13px',
    color: '#64628A',
    lineHeight: 1.5,
  },
};
