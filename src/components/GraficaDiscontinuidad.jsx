/**
 * Gráfica estática de los tres tipos de discontinuidad del tema 1.9.
 * Son dibujos conceptuales: lo que importa es qué le pasa a la curva en x = a,
 * no la función exacta.
 *
 * tipo="evitable" → hueco: el límite existe, f(a) no está o está en otro sitio
 * tipo="salto"    → los dos laterales existen pero son distintos
 * tipo="infinita" → la curva se dispara a ±∞ (asíntota vertical)
 */
const COLOR_CURVA = '#4F46E5';
const COLOR_DER = '#DC2626';
const XA = 210;

const VARIANTES = {
  evitable: {
    titulo: 'Discontinuidad evitable',
    nota: 'El límite existe: basta redefinir f(a) para tapar el hueco.',
    trazos: [{ d: 'M 50 176 C 110 150, 160 122, 204 104', color: COLOR_CURVA },
             { d: 'M 216 98 C 260 80, 310 58, 368 40', color: COLOR_CURVA }],
    // Círculo vacío en la curva y, aparte, el valor suelto de f(a).
    hueco: { cx: XA, cy: 101 },
    puntoSuelto: { cx: XA, cy: 156 },
  },
  salto: {
    titulo: 'Discontinuidad de salto',
    nota: 'Los dos laterales existen pero no coinciden: el límite no existe.',
    trazos: [{ d: 'M 50 168 C 110 160, 160 152, 204 148', color: COLOR_CURVA },
             { d: 'M 216 74 C 260 70, 310 64, 368 58', color: COLOR_DER }],
    hueco: { cx: XA, cy: 147 },
    puntoLleno: { cx: XA, cy: 73, color: COLOR_DER },
  },
  infinita: {
    titulo: 'Discontinuidad infinita',
    nota: 'La curva se dispara sin límite: hay una asíntota vertical en x = a.',
    trazos: [{ d: 'M 50 180 C 120 176, 165 160, 190 96 C 197 68, 200 44, 201 28', color: COLOR_CURVA },
             { d: 'M 370 180 C 300 176, 255 160, 230 96 C 223 68, 220 44, 219 28', color: COLOR_CURVA }],
    asintota: true,
  },
};

export default function GraficaDiscontinuidad({ tipo = 'evitable' }) {
  const v = VARIANTES[tipo] || VARIANTES.evitable;

  return (
    <figure style={estilos.contenedor}>
      <svg
        viewBox="0 0 420 210"
        style={estilos.svg}
        role="img"
        aria-label={`${v.titulo} en x = a. ${v.nota}`}
      >
        {/* Ejes */}
        <line x1="40" y1="12" x2="40" y2="192" stroke="#64628A" strokeWidth="1.4" />
        <line x1="28" y1="192" x2="400" y2="192" stroke="#64628A" strokeWidth="1.4" />

        {/* Marca de x = a */}
        <line
          x1={XA}
          y1="12"
          x2={XA}
          y2="192"
          stroke={v.asintota ? COLOR_DER : '#E6E5F5'}
          strokeWidth={v.asintota ? 1.8 : 1.4}
          strokeDasharray="6 5"
        />
        <text x={XA - 8} y="206" fontSize="12" fill="#64628A" fontFamily="'Inter', sans-serif">a</text>

        {v.trazos.map((t) => (
          <path key={t.d} d={t.d} fill="none" stroke={t.color} strokeWidth="2.4" strokeLinecap="round" />
        ))}

        {v.hueco && (
          <circle cx={v.hueco.cx} cy={v.hueco.cy} r="5" fill="#FFFFFF" stroke={COLOR_CURVA} strokeWidth="2" />
        )}
        {v.puntoSuelto && (
          <circle cx={v.puntoSuelto.cx} cy={v.puntoSuelto.cy} r="5" fill={COLOR_CURVA} />
        )}
        {v.puntoLleno && (
          <circle cx={v.puntoLleno.cx} cy={v.puntoLleno.cy} r="5" fill={v.puntoLleno.color} />
        )}
      </svg>

      <figcaption style={estilos.pie}>
        <strong style={estilos.tituloPie}>{v.titulo}.</strong> {v.nota}
      </figcaption>
    </figure>
  );
}

const estilos = {
  contenedor: {
    margin: '14px 0',
    padding: '12px 14px 10px',
    border: '1px solid #E6E5F5',
    borderRadius: '14px',
    background: '#FFFFFF',
  },
  svg: { width: '100%', maxWidth: '420px', height: 'auto', display: 'block', margin: '0 auto' },
  pie: { margin: '6px 4px 0', fontSize: '13px', color: '#64628A', lineHeight: 1.5 },
  tituloPie: { color: '#3730A3', fontWeight: 700 },
};
