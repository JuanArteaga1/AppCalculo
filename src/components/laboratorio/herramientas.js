import {
  aTex,
  analizarLimite,
  compilar,
  derivarExpr,
  formatearTex,
  tablaAproximacion,
} from './mathUtils';

/**
 * Calcula el resultado de la herramienta activa (límite o derivada) sobre una
 * función, y los marcadores que hay que dibujar en el plano.
 *
 * Es una función pura: la página la llama dentro de un useMemo y reparte el
 * resultado entre el panel lateral y el lienzo.
 */
export function calcularHerramienta({ funcion, herramienta, punto, h = 0.5 }) {
  const vacio = { resultado: null, marcadores: {} };
  if (!funcion || !herramienta) return vacio;

  const a = Number.parseFloat(punto);
  if (!Number.isFinite(a)) {
    return { resultado: { tipo: herramienta, error: 'Escribe un punto numérico válido.' }, marcadores: {} };
  }

  if (herramienta === 'limite') return calcularLimite(funcion, a);
  if (herramienta === 'derivada') return calcularDerivada(funcion, a, h);
  return vacio;
}

function calcularLimite(funcion, a) {
  const analisis = analizarLimite(funcion.evaluar, a);
  const tabla = tablaAproximacion(funcion.evaluar, a, 'limite');
  const puntoA = formatearTex(a);

  const valorTex = analisis.tipo === 'existe' || analisis.tipo === 'removible'
    ? formatearTex(analisis.valor)
    : analisis.tipo === 'infinito' ? '\\infty' : '\\text{no existe}';

  const resultado = {
    tipo: 'limite',
    analisis,
    tabla,
    texPrincipal: `\\lim_{x \\to ${puntoA}} ${funcion.tex} = ${valorTex}`,
    texIzquierda: `\\lim_{x \\to ${puntoA}^{-}} ${funcion.nombre}(x) \\approx ${formatearTex(analisis.izq)}`,
    texDerecha: `\\lim_{x \\to ${puntoA}^{+}} ${funcion.nombre}(x) \\approx ${formatearTex(analisis.der)}`,
    texEnPunto: analisis.enPunto === null
      ? `${funcion.nombre}(${puntoA}) \\text{ no está definida}`
      : `${funcion.nombre}(${puntoA}) = ${formatearTex(analisis.enPunto)}`,
  };

  const puntos = [];
  // Puntos que se acercan al objetivo por ambos lados.
  [0.6, 0.3, 0.12].forEach((offset, i) => {
    const yIzq = funcion.evaluar(a - offset);
    const yDer = funcion.evaluar(a + offset);
    if (yIzq !== null) puntos.push({ x: a - offset, y: yIzq, color: '#10B981', r: 5 - i });
    if (yDer !== null) puntos.push({ x: a + offset, y: yDer, color: '#EF4444', r: 5 - i });
  });

  const yEnA = funcion.evaluar(a);
  if (yEnA !== null) {
    puntos.push({ x: a, y: yEnA, color: '#F4B400', r: 6 });
  } else if (analisis.valor !== undefined && analisis.valor !== null) {
    // Discontinuidad removible: círculo hueco sobre el valor del límite.
    puntos.push({ x: a, y: analisis.valor, color: '#F4B400', r: 6, hueco: true });
  }

  return {
    resultado,
    marcadores: {
      verticales: [{ x: a, color: '#F4B400', etiqueta: `x = ${puntoA}` }],
      puntos,
    },
  };
}

function calcularDerivada(funcion, x0, h) {
  const dExpr = derivarExpr(funcion.expr);
  const fx0 = funcion.evaluar(x0);
  const punto0 = formatearTex(x0);

  let pendiente = null;
  let dTex = null;
  if (dExpr) {
    dTex = aTex(dExpr);
    try {
      pendiente = compilar(dExpr)(x0);
    } catch {
      pendiente = null;
    }
  }

  // Si mathjs no puede derivar, se aproxima numéricamente.
  if (pendiente === null && fx0 !== null) {
    const paso = 1e-6;
    const adelante = funcion.evaluar(x0 + paso);
    const atras = funcion.evaluar(x0 - paso);
    if (adelante !== null && atras !== null) pendiente = (adelante - atras) / (2 * paso);
  }

  const tabla = tablaAproximacion(funcion.evaluar, x0, 'derivada');
  const marcadores = { puntos: [], rectas: [], verticales: [{ x: x0, color: '#94A3B8', etiqueta: `x = ${punto0}` }] };

  if (fx0 !== null) marcadores.puntos.push({ x: x0, y: fx0, color: '#EF4444', r: 6 });

  let texTangente = null;
  if (fx0 !== null && pendiente !== null && Number.isFinite(pendiente)) {
    const b = fx0 - pendiente * x0;
    marcadores.rectas.push({ m: pendiente, b, color: '#EF4444' });
    const signo = b >= 0 ? '+' : '-';
    texTangente = `y = ${formatearTex(pendiente)}\\,x ${signo} ${formatearTex(Math.abs(b))}`;
  }

  // Recta secante con el incremento h: muestra de dónde sale la tangente.
  let texSecante = null;
  const hNum = Number.parseFloat(h);
  if (Number.isFinite(hNum) && hNum !== 0 && fx0 !== null) {
    const fxh = funcion.evaluar(x0 + hNum);
    if (fxh !== null) {
      const mSec = (fxh - fx0) / hNum;
      marcadores.rectas.push({ m: mSec, b: fx0 - mSec * x0, color: '#0EA5E9', punteada: true });
      marcadores.puntos.push({ x: x0 + hNum, y: fxh, color: '#0EA5E9', r: 5 });
      texSecante = `m_{sec} = \\frac{f(${punto0}+${formatearTex(hNum)}) - f(${punto0})}{${formatearTex(hNum)}} = ${formatearTex(mSec)}`;
    }
  }

  return {
    resultado: {
      tipo: 'derivada',
      tabla,
      derivable: Boolean(dExpr),
      texPrincipal: dTex
        ? `${funcion.nombre}'(x) = ${dTex}`
        : `${funcion.nombre}'(x) \\text{ no se pudo derivar simbólicamente}`,
      texPendiente: pendiente !== null
        ? `${funcion.nombre}'(${punto0}) = ${formatearTex(pendiente)}`
        : null,
      texTangente,
      texSecante,
      texValor: fx0 !== null
        ? `${funcion.nombre}(${punto0}) = ${formatearTex(fx0)}`
        : `${funcion.nombre}(${punto0}) \\text{ no está definida}`,
      interpretacion: pendiente === null
        ? 'No se pudo calcular la pendiente en ese punto.'
        : pendiente > 0
          ? 'La pendiente es positiva: la función crece en ese punto.'
          : pendiente < 0
            ? 'La pendiente es negativa: la función decrece en ese punto.'
            : 'La pendiente es cero: hay un punto crítico (posible máximo, mínimo o inflexión).',
    },
    marcadores,
  };
}
