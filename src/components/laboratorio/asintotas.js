// Extensión explícita: así el módulo también se puede importar desde Node para probarlo.
import { compilar, formatearTex, formatearValor, normalizarExpresion } from './mathUtils.js';

/**
 * Cálculo numérico de asíntotas, siguiendo el mismo camino que se hace a mano:
 *
 *   1. Horizontal:  lim f(x) cuando x → ±∞
 *   2. Vertical:    los puntos donde f no está definida y el límite se dispara
 *   3. Oblicua:     y = mx + b con m = lim f(x)/x y b = lim [f(x) − mx],
 *                   y solo se busca si por ese lado no hay horizontal
 */

/** Suficientemente grande para que el límite se estabilice sin perder precisión. */
const LEJOS = 1e6;
const DECIMALES = 4;

/** Redondea a los decimales de trabajo para que 1.000002 se lea como 1. */
function redondear(valor) {
  const factor = 10 ** DECIMALES;
  return Math.round(valor * factor) / factor;
}

/**
 * Límite de f en +∞ o −∞. Devuelve null si no converge a un número.
 * Se comprueba en dos escalas: si el valor ya no se mueve, ha convergido.
 */
function limiteEnInfinito(f, signo) {
  const lejano = f(signo * LEJOS);
  const masLejano = f(signo * LEJOS * 10);
  if (lejano === null || masLejano === null) return null;
  if (Math.abs(masLejano - lejano) > 1e-3) return null;
  return redondear(masLejano);
}

/**
 * Recíproco de la función. Donde f se dispara, g vale cero: buscar los ceros de
 * g es mucho más estable que perseguir los picos de f, que dependen de lo fino
 * que sea el muestreo y pueden colarse entre dos puntos.
 */
function reciproca(f) {
  return (x) => {
    const valor = f(x);
    if (valor === null) return 0;          // f no definida: es un polo
    if (Math.abs(valor) < 1e-300) return Infinity; // cero de f, no polo
    return 1 / valor;
  };
}

/**
 * Puntos donde la función se dispara: los ceros del recíproco.
 * Detecta tanto los polos con cambio de signo (1/(x-1)) como los que solo tocan
 * el cero sin cruzarlo (1/(x-1)^2).
 */
function buscarVerticales(f, desde = -25, hasta = 25) {
  const g = reciproca(f);
  const paso = 0.01;
  const candidatos = [];

  let xAnterior = desde;
  let anterior = g(desde);

  for (let x = desde + paso; x <= hasta; x += paso) {
    const actual = g(x);

    if (Number.isFinite(actual) && Number.isFinite(anterior)) {
      // Cruce por cero: hay un polo entre los dos puntos.
      if ((anterior < 0 && actual > 0) || (anterior > 0 && actual < 0)) {
        candidatos.push(biseccion(g, xAnterior, x));
      } else if (Math.abs(actual) < 1e-9) {
        // Toca el cero sin cruzarlo (polo de orden par).
        candidatos.push(x);
      }
    }

    xAnterior = x;
    anterior = actual;
  }

  const agrupados = [];
  for (const c of candidatos.sort((a, b) => a - b)) {
    if (!agrupados.length || Math.abs(c - agrupados[agrupados.length - 1]) > 0.05) {
      agrupados.push(c);
    }
  }

  // Confirmar que de verdad se dispara: cerca del punto |f| tiene que ser enorme.
  return agrupados
    .map((x) => redondear(x))
    .filter((x, i, lista) => lista.indexOf(x) === i)
    .filter((x) => {
      const izq = f(x - 1e-5);
      const der = f(x + 1e-5);
      const enorme = (v) => v === null || (v !== null && Math.abs(v) > 1e3);
      return enorme(izq) || enorme(der);
    });
}

/** Bisección sobre el recíproco para localizar el polo con precisión. */
function biseccion(g, a, b) {
  let izq = a;
  let der = b;
  for (let i = 0; i < 60; i++) {
    const medio = (izq + der) / 2;
    const valorMedio = g(medio);
    if (!Number.isFinite(valorMedio) || valorMedio === 0) return medio;
    if (Math.sign(valorMedio) === Math.sign(g(izq))) izq = medio;
    else der = medio;
  }
  return (izq + der) / 2;
}

/** Signo del límite lateral: hacia dónde se va la función al acercarse al punto. */
function ladoDelInfinito(f, a, direccion) {
  const valor = f(a + direccion * 1e-6);
  if (valor === null) return null;
  return valor > 0 ? '+\\infty' : '-\\infty';
}

/** Recta oblicua y = mx + b, si existe por ese lado. */
function calcularOblicua(f, signo) {
  const X = signo * LEJOS;
  const valor = f(X);
  if (valor === null) return null;

  const m = redondear(valor / X);
  if (!Number.isFinite(m) || m === 0) return null;

  const b = redondear(valor - m * X);
  if (!Number.isFinite(b)) return null;

  // Comprobación de la definición: f(x) − (mx + b) tiene que irse a cero.
  const comprobacion = f(X * 5);
  if (comprobacion === null) return null;
  if (Math.abs(comprobacion - (m * X * 5 + b)) > 1e-2) return null;

  return { m, b };
}

/**
 * Analiza las asíntotas de una expresión.
 *
 * @param {string} expr expresión en sintaxis de mathjs
 * @returns {{ok: boolean, error?: string, horizontales, verticales, oblicua, pasos}}
 */
export function analizarAsintotas(expr) {
  let f;
  try {
    f = compilar(normalizarExpresion(expr));
  } catch (e) {
    return { ok: false, error: `No se pudo leer la función: ${e.message}` };
  }

  const kMas = limiteEnInfinito(f, +1);
  const kMenos = limiteEnInfinito(f, -1);

  const horizontales = [];
  if (kMas !== null) horizontales.push({ y: kMas, lado: '+\\infty' });
  if (kMenos !== null && kMenos !== kMas) horizontales.push({ y: kMenos, lado: '-\\infty' });

  const verticales = buscarVerticales(f).map((x) => ({
    x,
    izquierda: ladoDelInfinito(f, x, -1),
    derecha: ladoDelInfinito(f, x, +1),
  }));

  // La oblicua solo se busca si no hay horizontal: son excluyentes.
  const oblicua = horizontales.length ? null : calcularOblicua(f, +1);

  return {
    ok: true,
    horizontales,
    verticales,
    oblicua,
    pasos: construirPasos({ expr, horizontales, verticales, oblicua, f }),
  };
}

/** Los tres pasos del procedimiento, en el mismo orden que se resuelve a mano. */
function construirPasos({ expr, horizontales, verticales, oblicua, f }) {
  const pasos = [];

  // a) horizontales
  if (horizontales.length) {
    pasos.push({
      etiqueta: 'a',
      titulo: 'Asíntotas horizontales',
      tex: horizontales.map((h) => `\\lim_{x \\to ${h.lado}} f(x) = ${formatearTex(h.y)}`),
      conclusion: horizontales.length === 1
        ? `La recta y = ${formatearValor(horizontales[0].y, 4)} es una asíntota horizontal.`
        : `Hay dos asíntotas horizontales: ${horizontales.map((h) => `y = ${formatearValor(h.y, 4)}`).join(' y ')}.`,
      tipo: 'horizontal',
    });
  } else {
    pasos.push({
      etiqueta: 'a',
      titulo: 'Asíntotas horizontales',
      tex: ['\\lim_{x \\to \\infty} f(x) = \\infty'],
      conclusion: 'El límite no es un número, así que no hay asíntotas horizontales.',
      tipo: 'ninguna',
    });
  }

  // b) verticales
  if (verticales.length) {
    pasos.push({
      etiqueta: 'b',
      titulo: 'Asíntotas verticales',
      tex: verticales.map((v) => {
        const lado = v.derecha ?? v.izquierda ?? '\\infty';
        return `\\lim_{x \\to ${formatearTex(v.x)}} f(x) = ${lado}`;
      }),
      conclusion: verticales.length === 1
        ? `La recta x = ${formatearValor(verticales[0].x, 4)} es una asíntota vertical.`
        : `Las rectas ${verticales.map((v) => `x = ${formatearValor(v.x, 4)}`).join(' y ')} son asíntotas verticales.`,
      tipo: 'vertical',
    });
  } else {
    pasos.push({
      etiqueta: 'b',
      titulo: 'Asíntotas verticales',
      tex: [],
      conclusion: 'La función está definida en todos los reales: no hay asíntotas verticales.',
      tipo: 'ninguna',
    });
  }

  // c) oblicuas
  if (oblicua) {
    const signo = oblicua.b >= 0 ? '+' : '-';
    pasos.push({
      etiqueta: 'c',
      titulo: 'Asíntota oblicua',
      tex: [
        `m = \\lim_{x \\to \\infty} \\frac{f(x)}{x} = ${formatearTex(oblicua.m)}`,
        `b = \\lim_{x \\to \\infty} \\left[ f(x) - mx \\right] = ${formatearTex(oblicua.b)}`,
      ],
      conclusion: `La recta y = ${formatearValor(oblicua.m, 4)}x ${signo} ${formatearValor(Math.abs(oblicua.b), 4)} es una asíntota oblicua.`,
      tipo: 'oblicua',
    });
  } else {
    pasos.push({
      etiqueta: 'c',
      titulo: 'Asíntota oblicua',
      tex: [],
      conclusion: horizontales.length
        ? 'Como ya hay asíntota horizontal, no puede haber oblicua: son excluyentes.'
        : 'No hay asíntota oblicua.',
      tipo: 'ninguna',
    });
  }

  // Silencia el aviso de parámetro sin usar manteniendo la firma legible.
  void expr; void f;
  return pasos;
}
