/**
 * Glosario de términos de cálculo con su página de referencia.
 *
 * En vez de escribir los hipervínculos a mano en los 31 temas, el contenido se
 * enlaza al vuelo: los temas nuevos heredan los enlaces y basta tocar un sitio
 * para cambiar un destino.
 *
 * Cada entrada lleva varias `variantes` porque el texto real dice "continua",
 * "derivable" o "tangente", no siempre el término de diccionario. Van de más
 * larga a más corta para que "límites laterales" gane a "límite".
 *
 * Todos los destinos se comprobaron con una petición real y devuelven 200.
 */
const W = 'https://es.wikipedia.org/wiki/';

export const GLOSARIO = [
  {
    clave: 'teorema del valor medio',
    variantes: ['teorema del valor medio', 'valor medio'],
    url: W + 'Teorema_del_valor_medio',
  },
  {
    clave: 'regla de la cadena',
    variantes: ['regla de la cadena'],
    url: W + 'Regla_de_la_cadena',
  },
  {
    clave: 'regla de L’Hôpital',
    variantes: ["regla de l'hôpital", "l'hôpital", 'lhopital', 'hôpital'],
    url: W + 'Regla_de_l%27H%C3%B4pital',
  },
  {
    clave: 'teorema de Rolle',
    variantes: ['teorema de rolle', 'rolle'],
    url: W + 'Teorema_de_Rolle',
  },
  {
    clave: 'derivación implícita',
    variantes: ['derivación implícita', 'derivada implícita', 'implícita'],
    url: W + 'Funci%C3%B3n_impl%C3%ADcita',
  },
  {
    clave: 'punto de inflexión',
    variantes: ['punto de inflexión', 'puntos de inflexión', 'inflexión'],
    url: W + 'Punto_de_inflexi%C3%B3n',
  },
  {
    clave: 'máximos y mínimos',
    variantes: ['máximos y mínimos', 'máximos', 'mínimos', 'máximo', 'mínimo', 'máxima', 'mínima', 'extremos', 'extremo'],
    url: W + 'Extremos_de_una_funci%C3%B3n',
  },
  {
    clave: 'razón de cambio',
    variantes: ['razones de cambio', 'razón de cambio', 'razones', 'razón'],
    url: W + 'Tasa_de_cambio',
  },
  {
    clave: 'aproximación lineal',
    variantes: ['aproximación lineal'],
    url: W + 'Aproximaci%C3%B3n_lineal',
  },
  {
    clave: 'función exponencial',
    variantes: ['función exponencial', 'funciones exponenciales', 'exponenciales', 'exponencial'],
    url: W + 'Funci%C3%B3n_exponencial',
  },
  {
    clave: 'función trigonométrica',
    variantes: ['funciones trigonométricas', 'función trigonométrica', 'trigonométricas', 'trigonométricos', 'trigonométrica'],
    url: W + 'Funci%C3%B3n_trigonom%C3%A9trica',
  },
  {
    clave: 'límites laterales',
    variantes: ['límites laterales', 'límite lateral'],
    url: W + 'L%C3%ADmite_de_una_funci%C3%B3n',
  },
  {
    clave: 'discontinuidad',
    variantes: ['discontinuidades', 'discontinuidad', 'discontinua'],
    url: W + 'Clasificaci%C3%B3n_de_discontinuidades',
  },
  {
    clave: 'indeterminación',
    variantes: ['forma indeterminada', 'indeterminaciones', 'indeterminación', 'indeterminados', 'indeterminado'],
    url: W + 'Forma_indeterminada',
  },
  {
    clave: 'recta tangente',
    variantes: ['recta tangente', 'rectas tangentes', 'tangentes', 'tangente'],
    url: W + 'Recta_tangente',
  },
  {
    clave: 'recta secante',
    variantes: ['recta secante', 'secante'],
    url: W + 'Recta_secante',
  },
  {
    clave: 'optimización',
    variantes: ['optimización', 'optimizar'],
    url: W + 'Optimizaci%C3%B3n_(matem%C3%A1tica)',
  },
  {
    clave: 'continuidad',
    variantes: ['continuidad', 'continuas', 'continua', 'continuo'],
    url: W + 'Funci%C3%B3n_continua',
  },
  {
    clave: 'concavidad',
    variantes: ['concavidad', 'cóncava', 'convexa'],
    url: W + 'Funci%C3%B3n_convexa',
  },
  {
    clave: 'diferencial',
    variantes: ['diferenciales', 'diferencial'],
    url: W + 'Diferencial_de_una_funci%C3%B3n',
  },
  {
    clave: 'derivada',
    variantes: ['derivadas', 'derivada', 'derivación', 'derivable', 'derivando', 'derivar'],
    url: W + 'Derivada',
  },
  {
    clave: 'logaritmo',
    variantes: ['logarítmicas', 'logarítmica', 'logaritmos', 'logaritmo'],
    url: W + 'Logaritmo',
  },
  {
    clave: 'asíntota',
    variantes: ['asíntotas', 'asíntota'],
    url: W + 'As%C3%ADntota',
  },
  {
    clave: 'pendiente',
    variantes: ['pendientes', 'pendiente'],
    url: W + 'Pendiente_(matem%C3%A1ticas)',
  },
  {
    clave: 'velocidad',
    variantes: ['velocidad'],
    url: W + 'Velocidad',
  },
  {
    clave: 'dominio',
    variantes: ['dominio'],
    url: W + 'Dominio_de_definici%C3%B3n',
  },
  {
    clave: 'infinito',
    variantes: ['infinito'],
    url: W + 'Infinito',
  },
  {
    clave: 'límite',
    variantes: ['límites', 'límite'],
    url: W + 'L%C3%ADmite_de_una_funci%C3%B3n',
  },
  {
    clave: 'función',
    variantes: ['funciones', 'función'],
    url: W + 'Funci%C3%B3n_matem%C3%A1tica',
  },
];

/** Tope de enlaces dentro del texto: más que esto y el párrafo se vuelve azul. */
const MAXIMO_EN_TEXTO = 5;
/** Cuántas referencias se listan al final del tema. */
const MAXIMO_REFERENCIAS = 3;

/** Fórmulas y enlaces ya escritos: no se tocan. */
const INTOCABLE = /(\$\$[\s\S]*?\$\$|\$[^$\n]*\$|\[[^\]]*\]\([^)]*\))/g;

/** Líneas sin enlaces: títulos, tablas, marcadores y bloques de fórmula. */
function esLineaExcluida(linea) {
  const t = linea.trim();
  return t.startsWith('#') || t.startsWith('|') || t.startsWith('[[') || t.startsWith('$$');
}

function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function patronDe(variante) {
  return new RegExp(`(^|[^\\p{L}])(${escaparRegex(variante)})(?![\\p{L}])`, 'iu');
}

/**
 * Enlaza la primera aparición de cada término del glosario en el texto de un tema.
 *
 * Respeta lo escrito: no entra en las fórmulas ni en los enlaces que ya existen.
 * Los enlaces internos del curso (/calculo1/...) no bloquean el término, porque
 * son navegación y no bibliografía; los externos sí, para no duplicar.
 *
 * @param {string} texto contenido markdown del tema
 * @param {number} maximo tope de enlaces a insertar
 * @returns {string} el mismo texto con los enlaces añadidos
 */
export function enlazarTerminos(texto, maximo = MAXIMO_EN_TEXTO) {
  if (!texto) return texto;

  const lineas = texto.split('\n');
  const usados = new Set();
  const destinos = new Set();

  for (const linea of lineas) {
    for (const enlace of linea.match(/\[[^\]]*\]\([^)]*\)/g) || []) {
      if (!/\]\(https?:/i.test(enlace)) continue;
      for (const { clave, variantes } of GLOSARIO) {
        if (variantes.some((v) => enlace.toLowerCase().includes(v))) usados.add(clave);
      }
    }
  }

  let insertados = 0;

  for (let i = 0; i < lineas.length && insertados < maximo; i++) {
    if (esLineaExcluida(lineas[i])) continue;

    // Trozos libres en los índices pares; los impares son fórmulas o enlaces.
    const trozos = lineas[i].split(INTOCABLE);

    for (const { clave, variantes, url } of GLOSARIO) {
      if (insertados >= maximo) break;
      if (usados.has(clave) || destinos.has(url)) continue;

      let colocado = false;
      for (const variante of variantes) {
        if (colocado) break;
        const patron = patronDe(variante);
        for (let j = 0; j < trozos.length; j += 2) {
          if (!patron.test(trozos[j])) continue;
          trozos[j] = trozos[j].replace(patron, (_, antes, palabra) => `${antes}[${palabra}](${url})`);
          colocado = true;
          break;
        }
      }

      if (colocado) {
        usados.add(clave);
        destinos.add(url);
        insertados += 1;
      }
    }

    lineas[i] = trozos.join('');
  }

  return lineas.join('\n');
}

/**
 * Referencias de lectura para un tema, ordenadas por lo presente que está cada
 * concepto en él. Garantiza que todos los temas tengan enlaces, incluso los que
 * son casi todo fórmulas y apenas tienen texto donde enlazar.
 *
 * @param {{titulo?: string, descripcion?: string, contenido?: string}} tema
 * @returns {Array<{clave: string, url: string}>}
 */
export function referenciasPara(tema, maximo = MAXIMO_REFERENCIAS) {
  if (!tema) return [];
  const texto = `${tema.titulo || ''} ${tema.descripcion || ''} ${tema.contenido || ''}`.toLowerCase();

  const puntuadas = GLOSARIO.map((entrada) => {
    let puntos = 0;
    for (const variante of entrada.variantes) {
      const apariciones = texto.split(variante).length - 1;
      if (!apariciones) continue;
      // El título pesa más: define de qué va el tema.
      const enTitulo = (tema.titulo || '').toLowerCase().includes(variante) ? 5 : 0;
      puntos += apariciones + enTitulo;
    }
    return { ...entrada, puntos };
  }).filter((e) => e.puntos > 0);

  puntuadas.sort((a, b) => b.puntos - a.puntos);

  // Sin repetir destino: varias claves comparten página.
  const vistos = new Set();
  const elegidas = [];
  for (const entrada of puntuadas) {
    if (vistos.has(entrada.url)) continue;
    vistos.add(entrada.url);
    elegidas.push({ clave: entrada.clave, url: entrada.url });
    if (elegidas.length >= maximo) break;
  }
  return elegidas;
}
