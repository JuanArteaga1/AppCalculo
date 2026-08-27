import { parse, derivative } from 'mathjs';

/**
 * Utilidades matemáticas del laboratorio de graficación.
 *
 * El usuario escribe en notación "de teclado" (x^2, sqrt(x), pi...) y aquí se
 * traduce a algo que mathjs entiende y a LaTeX para mostrarlo en notación
 * matemática real con KaTeX.
 */

export const COLORES = [
  '#2563EB', // azul
  '#F4B400', // amarillo institucional
  '#10B981', // verde
  '#EF4444', // rojo
  '#A855F7', // morado
  '#EC4899', // rosa
  '#06B6D4', // cian
  '#F97316', // naranja
];

/** Constantes admitidas además de la variable x. */
const CONSTANTES = ['x', 'e', 'pi', 'i', 'Infinity', 'tau', 'phi'];

/** Símbolos que el teclado inserta y su equivalente para mathjs. */
const SIMBOLOS = [
  [/π/g, 'pi'],
  [/×/g, '*'],
  [/·/g, '*'],
  [/÷/g, '/'],
  [/−/g, '-'],
  [/–/g, '-'],
  [/∞/g, 'Infinity'],
  [/√\s*\(/g, 'sqrt('],
  [/\s+/g, ' '],
];

/**
 * Convierte lo que escribió el usuario en una expresión válida para mathjs.
 * - Quita el "y =" o "f(x) =" inicial.
 * - Traduce símbolos del teclado matemático.
 * - Respeta la convención del curso: ln = logaritmo natural, log = base 10.
 */
export function normalizarExpresion(entrada) {
  let expr = String(entrada ?? '').trim();
  if (!expr) return '';

  // "f(x) = x^2", "y = x^2", "g(x)= x^2" -> "x^2"
  expr = expr.replace(/^\s*[a-zA-Z]\s*\(\s*x\s*\)\s*=/, '');
  expr = expr.replace(/^\s*y\s*=/, '');

  for (const [patron, reemplazo] of SIMBOLOS) {
    expr = expr.replace(patron, reemplazo);
  }

  // Los logaritmos se marcan primero para no pisarse entre sí.
  expr = expr
    .replace(/\blog\s*10\s*\(/g, '@L10@(')
    .replace(/\blog10\s*\(/g, '@L10@(')
    .replace(/\blog2\s*\(/g, '@L2@(')
    .replace(/\bln\s*\(/g, '@LN@(')
    .replace(/\blog\s*\(/g, '@L10@(')
    .replace(/@LN@\(/g, 'log(')
    .replace(/@L10@\(/g, 'log10(')
    .replace(/@L2@\(/g, 'log2(');

  // Trigonometría en español: sen -> sin, tg -> tan.
  expr = expr
    .replace(/\bsenh\s*\(/g, 'sinh(')
    .replace(/\bsen\s*\(/g, 'sin(')
    .replace(/\btg\s*\(/g, 'tan(')
    .replace(/\barcsen\s*\(/g, 'asin(')
    .replace(/\barccos\s*\(/g, 'acos(')
    .replace(/\barctg\s*\(/g, 'atan(')
    .replace(/\barctan\s*\(/g, 'atan(');

  return expr.trim();
}

/**
 * Analiza una expresión ya normalizada.
 * @returns {{ok: true, nodo: Object} | {ok: false, error: string}}
 */
export function analizar(expr) {
  if (!expr) return { ok: false, error: 'Escribe una función.' };
  try {
    const nodo = parse(expr);
    // Los nombres de función (sin, sqrt...) también son SymbolNode, pero cuelgan
    // de un FunctionNode por la rama 'fn': esos no son variables.
    const simbolos = nodo
      .filter((n, ruta, padre) => n.isSymbolNode && !(padre?.isFunctionNode && ruta === 'fn'))
      .map((n) => n.name)
      .filter((nombre) => !CONSTANTES.includes(nombre));
    if (simbolos.length) {
      return { ok: false, error: `Variable desconocida: ${simbolos[0]}. Solo se admite x.` };
    }
    return { ok: true, nodo };
  } catch (e) {
    return { ok: false, error: `Sintaxis inválida: ${e.message}` };
  }
}

/** Devuelve el LaTeX de una expresión normalizada (o null si no se puede). */
export function aTex(expr) {
  try {
    return parse(expr).toTex({ parenthesis: 'auto', implicit: 'hide' });
  } catch {
    return null;
  }
}

/**
 * Compila la expresión a una función numérica rápida.
 * Devuelve null en cada punto donde la función no exista o no sea real.
 */
export function compilar(expr) {
  const codigo = parse(expr).compile();
  return (x) => {
    try {
      const valor = codigo.evaluate({ x });
      return typeof valor === 'number' && Number.isFinite(valor) ? valor : null;
    } catch {
      return null;
    }
  };
}

/** Derivada simbólica respecto de x; null si mathjs no puede derivarla. */
export function derivarExpr(expr) {
  try {
    return derivative(expr, 'x').toString();
  } catch {
    return null;
  }
}

/**
 * Crea la entrada de una función lista para graficar.
 * @returns {{ok: true, funcion: Object} | {ok: false, error: string}}
 */
export function crearFuncion(entrada, indiceColor = 0, indiceNombre = 1) {
  const expr = normalizarExpresion(entrada);
  const analisis = analizar(expr);
  if (!analisis.ok) return { ok: false, error: analisis.error };

  let evaluar;
  try {
    evaluar = compilar(expr);
  } catch (e) {
    return { ok: false, error: `No se pudo compilar: ${e.message}` };
  }

  // Verifica que la función devuelva algo real en al menos un punto de prueba.
  const pruebas = [0, 1, 2, -1, 0.5, 3.7];
  if (!pruebas.some((x) => evaluar(x) !== null)) {
    return { ok: false, error: 'La función no toma valores reales en el rango de prueba.' };
  }

  return {
    ok: true,
    funcion: {
      id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      entrada: String(entrada).trim(),
      expr,
      tex: aTex(expr) ?? expr,
      nombre: `f_{${indiceNombre}}`,
      color: COLORES[indiceColor % COLORES.length],
      visible: true,
      evaluar,
    },
  };
}

/**
 * Vista inicial del plano: origen centrado y unas 16 unidades de ancho.
 * `upp` = unidades matemáticas por pixel (la misma escala en ambos ejes).
 */
export function vistaInicial(ancho = 900) {
  return { cx: 0, cy: 0, upp: 16 / Math.max(320, ancho) };
}

/** Paso "redondo" (1, 2, 5 × 10ⁿ) para las marcas de los ejes. */
export function pasoAgradable(rango, objetivo = 8) {
  if (!(rango > 0) || !Number.isFinite(rango)) return 1;
  const bruto = rango / objetivo;
  const exponente = Math.floor(Math.log10(bruto));
  const base = Math.pow(10, exponente);
  const normalizado = bruto / base;
  let multiplo;
  if (normalizado < 1.5) multiplo = 1;
  else if (normalizado < 3) multiplo = 2;
  else if (normalizado < 7) multiplo = 5;
  else multiplo = 10;
  return multiplo * base;
}

/** Marcas de un eje entre min y max con un paso dado. */
export function generarTicks(min, max, paso) {
  const ticks = [];
  if (!(paso > 0)) return ticks;
  const inicio = Math.ceil(min / paso) * paso;
  // Tope de seguridad para no colgar el navegador con pasos diminutos.
  for (let v = inicio, i = 0; v <= max && i < 400; v += paso, i++) {
    ticks.push(Math.abs(v) < paso / 1e6 ? 0 : v);
  }
  return ticks;
}

/** Etiqueta corta y legible para una marca del eje. */
export function formatearTick(valor, paso) {
  if (valor === 0) return '0';
  const decimales = Math.max(0, Math.min(6, -Math.floor(Math.log10(paso))));
  if (Math.abs(valor) >= 1e5 || Math.abs(valor) < 1e-4) return valor.toExponential(1);
  return valor.toFixed(decimales);
}

/** Número legible para resultados (evita "0.30000000000000004"). */
export function formatearValor(valor, decimales = 6) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '—';
  if (!Number.isFinite(valor)) return valor > 0 ? '+∞' : '−∞';
  if (Math.abs(valor) >= 1e6 || (Math.abs(valor) < 1e-5 && valor !== 0)) {
    return valor.toExponential(3);
  }
  const texto = valor.toFixed(decimales);
  // Quita ceros sobrantes solo si hay parte decimal ("1.500000" -> "1.5", "100" -> "100").
  if (!texto.includes('.')) return texto;
  return texto.replace(/0+$/, '').replace(/\.$/, '') || '0';
}

/** Igual que formatearValor pero seguro para incrustar dentro de LaTeX. */
export function formatearTex(valor, decimales = 4) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '\\text{no definido}';
  if (!Number.isFinite(valor)) return valor > 0 ? '+\\infty' : '-\\infty';
  const texto = formatearValor(valor, decimales);
  const exponencial = texto.match(/^(-?[\d.]+)e([+-]?\d+)$/i);
  if (exponencial) return `${exponencial[1]} \\times 10^{${Number(exponencial[2])}}`;
  return texto.replace('−', '-');
}

/**
 * Tabla de aproximación por ambos lados de un punto.
 * Sirve tanto para límites (valores de f) como para derivadas (cocientes).
 */
export function tablaAproximacion(evaluar, punto, modo = 'limite') {
  const pasos = [0.5, 0.1, 0.01, 0.001, 0.0001];
  const fx = evaluar(punto);
  return pasos.map((h) => {
    const izquierda = evaluar(punto - h);
    const derecha = evaluar(punto + h);
    if (modo === 'derivada') {
      return {
        h,
        izq: izquierda !== null && fx !== null ? (fx - izquierda) / h : null,
        der: derecha !== null && fx !== null ? (derecha - fx) / h : null,
      };
    }
    return { h, izq: izquierda, der: derecha };
  });
}

/**
 * Diagnóstico numérico del límite en un punto: compara los dos laterales.
 */
export function analizarLimite(evaluar, punto) {
  const h = 1e-6;
  const izq = evaluar(punto - h);
  const der = evaluar(punto + h);
  const enPunto = evaluar(punto);

  // Magnitud creciente hacia el punto => asíntota vertical.
  const creceSinLimite = (lado) => {
    const cerca = evaluar(punto + lado * 1e-4);
    const masCerca = evaluar(punto + lado * 1e-6);
    return cerca !== null && masCerca !== null && Math.abs(masCerca) > Math.abs(cerca) * 50;
  };

  if (izq === null && der === null) {
    return { tipo: 'indefinido', mensaje: 'No se pudo evaluar la función cerca del punto.', izq, der, enPunto };
  }
  if (creceSinLimite(-1) || creceSinLimite(1)) {
    return {
      tipo: 'infinito',
      mensaje: 'La función crece sin límite: hay una asíntota vertical en ese punto.',
      izq, der, enPunto,
    };
  }
  if (izq !== null && der !== null && Math.abs(izq - der) > 1e-3) {
    return {
      tipo: 'lateralesDistintos',
      mensaje: 'Los límites laterales son distintos, así que el límite no existe.',
      izq, der, enPunto,
    };
  }
  const valor = izq ?? der;
  if (enPunto === null) {
    return {
      tipo: 'removible',
      mensaje: `El límite existe y vale ≈ ${formatearValor(valor, 4)}, pero f no está definida en el punto (discontinuidad removible).`,
      izq, der, enPunto, valor,
    };
  }
  if (Math.abs(enPunto - valor) > 1e-3) {
    return {
      tipo: 'removible',
      mensaje: `El límite es ≈ ${formatearValor(valor, 4)} pero f(${formatearValor(punto, 4)}) = ${formatearValor(enPunto, 4)}: discontinuidad evitable.`,
      izq, der, enPunto, valor,
    };
  }
  return {
    tipo: 'existe',
    mensaje: `El límite existe y vale ≈ ${formatearValor(valor, 4)}. La función es continua ahí.`,
    izq, der, enPunto, valor,
  };
}
