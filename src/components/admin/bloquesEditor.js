import { extraerYoutubeId } from '../../data/videos';
import { MARCA_ALINEACION } from '../../lib/bloques';
import { compilar, crearFuncion } from '../laboratorio/mathUtils';

export const nuevoId = () => `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** Lo que aparece en el menú "Agregar bloque", agrupado. */
export const CATALOGO = [
  {
    grupo: 'Contenido',
    opciones: [
      ['texto', 'Texto y fórmulas'],
      ['tabla', 'Tabla'],
      ['desplegable', 'Ejemplo plegable'],
      ['video', 'Video dentro del texto'],
      ['imagen', 'Imagen'],
    ],
  },
  {
    grupo: 'Gráficas',
    opciones: [
      ['grafica-funcion', 'Gráfica estática'],
      ['tabla-limite', 'Tabla y gráfica animada'],
      ['discontinuidad', 'Discontinuidad con función real'],
      ['asintotas', 'Asíntotas interactivas'],
      ['dibujo', 'Dibujo conceptual'],
    ],
  },
  {
    grupo: 'Práctica',
    opciones: [['ejercicio', 'Ejercicio autocalificable']],
  },
];

export const DIBUJOS = {
  'grafica-conceptual': ['Límite al infinito', [['mas', 'Hacia +∞'], ['menos', 'Hacia −∞']]],
  'grafica-infinito': ['Límite infinito', [['mas', 'Crece a +∞'], ['menos', 'Decrece a −∞']]],
  'grafica-asintota': ['Asíntota', [['horizontal', 'Horizontal'], ['vertical', 'Vertical'], ['oblicua', 'Oblicua']]],
  'grafica-discontinuidad': ['Discontinuidad', [['evitable', 'Evitable'], ['salto', 'De salto'], ['infinita', 'Infinita']]],
};

const NOMBRES = {
  texto: 'Texto',
  tabla: 'Tabla',
  desplegable: 'Plegable',
  video: 'Video',
  imagen: 'Imagen',
  'grafica-funcion': 'Gráfica estática',
  'tabla-limite': 'Tabla y gráfica',
  asintotas: 'Asíntotas',
  dibujo: 'Dibujo',
  ejercicio: 'Ejercicio',
};

export const nombreBloque = (tipo) => NOMBRES[tipo] ?? tipo;

export function crearBloque(tipo) {
  const id = nuevoId();

  switch (tipo) {
    case 'tabla':
      return { id, tipo, encabezados: ['Columna 1', 'Columna 2'], filas: [['', '']] };
    case 'desplegable':
      return { id, tipo, titulo: 'Ejemplo', bloques: [{ id: nuevoId(), tipo: 'texto', texto: '' }] };
    case 'video':
      return { id, tipo, url: '', titulo: '' };
    case 'imagen':
      return { id, tipo, url: '', alt: '', pie: '' };
    case 'grafica-funcion':
      return { id, tipo, expr: 'x^2', punto: 1 };
    case 'tabla-limite':
      return { id, tipo, expr: '(x^2 - 1)/(x - 1)', punto: 1, modo: 'limite', visual: 'interactivo', relleno: '' };
    case 'discontinuidad':
      return {
        id,
        tipo: 'tabla-limite',
        expr: 'x <= 1 ? x + 1 : 4 - x',
        punto: 1,
        modo: 'laterales',
        visual: 'estatico',
        relleno: 'izquierda',
      };
    case 'asintotas':
      return { id, tipo, expr: '1/(x - 2)' };
    case 'dibujo':
      return { id, tipo, componente: 'grafica-discontinuidad', variante: 'evitable' };
    case 'ejercicio':
      return { id, tipo, enunciado: '', opciones: ['', ''], correcta: 0, explicacion: '' };
    default:
      return { id, tipo: 'texto', texto: '' };
  }
}

/** Copia con ids nuevos, también en los bloques internos. */
export function duplicarBloque(bloque) {
  const copia = { ...structuredClone(bloque), id: nuevoId() };
  if (copia.bloques) copia.bloques = copia.bloques.map(duplicarBloque);
  return copia;
}

const limpio = (texto, maximo) => {
  const t = String(texto ?? '').replace(/\s+/g, ' ').trim();
  return t.length > maximo ? `${t.slice(0, maximo)}…` : t;
};

export function resumenBloque(b) {
  switch (b.tipo) {
    case 'texto': return limpio(String(b.texto ?? '').split('\n').map((l) => l.replace(MARCA_ALINEACION, '')).join(' '), 90) || 'Sin texto';
    case 'tabla': return `${b.filas.length} filas, ${b.encabezados.length} columnas`;
    case 'desplegable': return limpio(b.titulo, 90);
    case 'video': return b.titulo || b.url || 'Sin enlace';
    case 'imagen': return b.alt || 'Sin imagen';
    case 'ejercicio': return limpio(b.enunciado, 90) || 'Sin enunciado';
    case 'dibujo': return `${DIBUJOS[b.componente]?.[0] ?? ''}: ${b.variante}`;
    case 'asintotas': return b.expr;
    default: return `${b.expr} en x = ${b.punto}`;
  }
}

export function errorExpresion(expr) {
  if (!String(expr ?? '').trim()) return 'Escribe una función.';
  if (String(expr).length > 200) return 'La función es demasiado larga.';

  try {
    compilar(expr);
    return null;
  } catch {
    return 'No se entiende la función. Usa x, ^, sin(x), log(x) y paréntesis.';
  }
}

const errorPunto = (punto) => (Number.isFinite(Number(punto)) && punto !== '' ? null : 'El punto debe ser un número.');

function errorDe(b) {
  switch (b.tipo) {
    case 'desplegable':
      if (!b.titulo.trim()) return 'Falta el título del plegable.';
      return primerError(b.bloques);
    case 'video':
      return extraerYoutubeId(b.url) ? null : 'El video necesita un enlace válido de YouTube.';
    case 'imagen':
      if (!b.url) return 'Sube la imagen.';
      return b.alt.trim() ? null : 'La imagen necesita un texto alternativo.';
    case 'grafica-funcion':
    case 'tabla-limite':
      return errorExpresion(b.expr) ?? errorPunto(b.punto);
    case 'asintotas':
      return errorExpresion(b.expr);
    case 'ejercicio':
      if (!b.enunciado.trim()) return 'Falta el enunciado del ejercicio.';
      return b.opciones.some((o) => !o.trim()) ? 'Hay una opción vacía en el ejercicio.' : null;
    default:
      return null;
  }
}

/** El laboratorio acepta más que mathjs (3x, sen(x)): se valida con su mismo código. */
export function errorFuncionLab(funcion) {
  if (!String(funcion ?? '').trim()) return 'Escribe una función.';
  const creada = crearFuncion(funcion, 0, 1);
  if (creada.ok) return null;

  // Los errores de sintaxis de mathjs vienen en inglés y no ayudan a corregir.
  return creada.error.startsWith('La función') ? creada.error : 'No se entiende la función. Usa x, ^, sen(x), log(x) y paréntesis.';
}

export function errorVideos(videos) {
  const i = videos.findIndex((v) => !extraerYoutubeId(v.url));
  return i >= 0 ? `Video ${i + 1}: el enlace no es de YouTube.` : null;
}

export function errorPracticas(practicas) {
  for (const [i, p] of practicas.entries()) {
    if (!p.titulo.trim()) return `Ejercicio ${i + 1}: falta el enunciado.`;
    const error = errorFuncionLab(p.funcion) ?? errorPunto(p.punto);
    if (error) return `Ejercicio ${i + 1}: ${error}`;
  }

  return null;
}

/** Primer problema del contenido, con el bloque donde está. */
export function primerError(bloques) {
  for (const [i, bloque] of bloques.entries()) {
    const error = errorDe(bloque);
    if (error) return `Bloque ${i + 1} (${nombreBloque(bloque.tipo)}): ${error}`;
  }

  return null;
}
