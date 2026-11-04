import { MARCA_ALINEACION } from '../../lib/bloques';
import { aTex, normalizarExpresion } from '../laboratorio/mathUtils';

/** Pestaña del teclado para escribir contenido: el laboratorio solo necesita funciones. */
export const TECLAS_CALCULO = [
  { et: 'lím', ins: 'lim(x->)', retroceder: 1, tipo: 'fn' },
  { et: 'lím⁺', ins: 'lim(x->+)', retroceder: 2, tipo: 'fn' },
  { et: 'lím⁻', ins: 'lim(x->-)', retroceder: 2, tipo: 'fn' },
  { et: '=', ins: '=', tipo: 'op' },
  { et: '≠', ins: '≠', tipo: 'op' },
  { et: '≈', ins: '≈', tipo: 'op' },
  { et: '<', ins: '<', tipo: 'op' },
  { et: '>', ins: '>', tipo: 'op' },
  { et: '≤', ins: '≤', tipo: 'op' },
  { et: '≥', ins: '≥', tipo: 'op' },
  { et: 'f(x)', ins: 'f(x)', tipo: 'var' },
  { et: 'f′(x)', ins: "f'(x)", tipo: 'var' },
];

// El > de la flecha de un límite no es un comparador.
const COMPARADOR = /(<=|>=|!=|≤|≥|≠|≈|=|<|(?<!-)>)/;
const LIMITE = /^lim\s*\(\s*([a-zA-Z])\s*->\s*(.+?)\s*\)\s*(.*)$/;
// mathjs tomaría "hola" como una variable: una palabra suelta no es una fórmula.
const PALABRA = /\b(?!tau\b|phi\b|Infinity\b)[a-zA-Z]{3,}\b(?!\s*\()/;

const TEX_COMPARADOR = {
  '<=': '\\le',
  '≤': '\\le',
  '>=': '\\ge',
  '≥': '\\ge',
  '!=': '\\neq',
  '≠': '\\neq',
  '≈': '\\approx',
  '=': '=',
  '<': '<',
  '>': '>',
};

/** mathjs escribe en inglés y con espacios sobrantes: se deja como el resto del curso. */
const pulir = (tex) => tex
  .replace(/\\mathrm\{([a-zA-Z])prima\}|([a-zA-Z])prima/g, (_, a, b) => `${a ?? b}'`)
  .replace(/\\mathrm\{([a-zA-Z])\}/g, '$1')
  .replace(/\\sin(?![a-z])/g, '\\operatorname{sen}')
  .replace(/\\tan(?![a-z])/g, '\\operatorname{tg}')
  .replace(/~\s*/g, '')
  .replace(/([{(]) /g, '$1')
  .replace(/\{([a-zA-Z0-9])\}\^/g, '$1^')
  .trim();

function ladoATex(lado) {
  const limpio = lado.trim();
  if (!limpio) return '';

  const limite = limpio.match(LIMITE);

  if (limite) {
    const [, variable, destino, cuerpo] = limite;
    const lateral = destino.match(/^(.+?)([+-])$/);
    const punto = ladoATex(lateral ? lateral[1] : destino);
    const funcion = ladoATex(cuerpo);
    if (!punto || funcion === null) return null;
    return `\\lim_{${variable} \\to ${punto}${lateral ? `^{${lateral[2]}}` : ''}} ${funcion}`.trim();
  }

  if (PALABRA.test(limpio)) return null;

  const tex = aTex(normalizarExpresion(limpio.replace(/([a-zA-Z])'/g, '$1prima')));
  return tex === null ? null : pulir(tex);
}

/** Pasa lo escrito con el teclado a LaTeX. Devuelve null si no se entiende. */
export function formulaATex(entrada) {
  const partes = String(entrada ?? '')
    .split(COMPARADOR)
    .map((parte, i) => (i % 2 === 1 ? TEX_COMPARADOR[parte] : ladoATex(parte)));

  if (partes.includes(null)) return null;
  return partes.filter(Boolean).join(' ') || null;
}

const TITULO = /^#{1,6}(?: |$)/;
// Las mismas líneas que en ContenidoTema nunca se unen a un párrafo.
const NO_ES_PARRAFO = /^(#{1,6} |[-*] |\d+\. |\||> |---|\$\$)/;

const sinMarca = (linea) => linea.trim().replace(MARCA_ALINEACION, '');
const esParrafo = (linea) => Boolean(sinMarca(linea)) && !NO_ES_PARRAFO.test(sinMarca(linea));

/** Un párrafo puede ocupar varias líneas seguidas: la marca va solo en la primera. */
const continuaParrafo = (lineas, i) => i > 0
  && esParrafo(lineas[i - 1])
  && esParrafo(lineas[i])
  && !MARCA_ALINEACION.test(lineas[i].trim());

/** Aplica un cambio a las líneas seleccionadas y conserva la selección sobre el mismo texto. */
function cambiarLineas(texto, inicio, fin, transformar) {
  const lineas = texto.split('\n');
  const ultimoCaracter = fin > inicio && texto[fin - 1] === '\n' ? fin - 1 : fin;
  const primera = texto.slice(0, inicio).split('\n').length - 1;
  const ultima = texto.slice(0, ultimoCaracter).split('\n').length - 1;
  const nuevas = transformar(lineas, primera, ultima);
  const largo = (lista, hasta) => lista.slice(0, hasta + 1).join('\n').length;

  return {
    texto: nuevas.join('\n'),
    inicio: Math.max(0, inicio + largo(nuevas, primera) - largo(lineas, primera)),
    fin: Math.max(0, fin + largo(nuevas, ultima) - largo(lineas, ultima)),
  };
}

/** alineacion: 'centro', 'derecha' o '' para volver a la izquierda. */
export const alinearTexto = (texto, inicio, fin, alineacion) => cambiarLineas(texto, inicio, fin, (lineas, primera, ultima) => {
  const marca = alineacion ? `{${alineacion}} ` : '';
  const nuevas = [...lineas];
  let desde = primera;

  while (continuaParrafo(lineas, desde)) desde -= 1;

  for (let i = desde; i <= ultima; i += 1) {
    if (sinMarca(lineas[i])) {
      if (!continuaParrafo(lineas, i)) nuevas[i] = marca + sinMarca(lineas[i]);
    } else if (primera === ultima) {
      nuevas[i] = marca;
    }
  }

  return nuevas;
});

/** nivel: '##' o '###'. Pulsar otra vez el mismo nivel quita el título. */
export const marcarTitulo = (texto, inicio, fin, nivel) => cambiarLineas(texto, inicio, fin, (lineas, primera, ultima) => (
  lineas.map((linea, i) => {
    if (i < primera || i > ultima || (primera !== ultima && !linea.trim())) return linea;

    const marca = linea.trim().match(MARCA_ALINEACION)?.[0] ?? '';
    const resto = sinMarca(linea);
    const actual = resto.match(TITULO)?.[0].trim();

    return marca + (actual === nivel ? '' : `${nivel} `) + resto.replace(TITULO, '');
  })
));

/** Paréntesis y $ cerrarían antes de tiempo el enlace o abrirían una fórmula. */
const protegerEnlace = (enlace) => enlace.replace(/[()$]/g, (c) => `%${c.charCodeAt(0).toString(16)}`);

/** Acepta rutas de la página y direcciones web. Devuelve null si no es válido. */
export function normalizarEnlace(valor) {
  const enlace = valor.trim();
  if (/^\/(?!\/)\S+$/.test(enlace)) return protegerEnlace(enlace);

  try {
    const url = new URL(/^[a-z][a-z\d+-]*:\/\//i.test(enlace) ? enlace : `https://${enlace}`);
    const valido = /^https?:$/.test(url.protocol) && url.hostname.includes('.') && !url.username;
    return valido ? protegerEnlace(url.href) : null;
  } catch {
    return null;
  }
}
