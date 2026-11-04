/**
 * Un tema es una lista de bloques. Este archivo convierte el formato antiguo
 * (Markdown con marcadores [[...]] y :::desplegable) a esa lista. Lo usan el
 * script de migración y el respaldo de la app cuando el backend no responde.
 * No importa nada de React para poder ejecutarse también en Node.
 */

/** Marca al inicio de una línea de texto que la alinea: {centro} o {derecha}. */
export const MARCA_ALINEACION = /^\{(centro|derecha)\} ?/;

const MARCADORES = [
  {
    patron: /^\[\[tabla-limite\s+expr=(.+?)\s+punto=([-\d.]+)(?:\s+modo=(\w+))?(?:\s+visual=(\w+))?(?:\s+relleno=(\w+))?\]\]$/,
    crear: ([, expr, punto, modo, visual, relleno]) => ({
      tipo: 'tabla-limite',
      expr,
      punto: Number(punto),
      modo: modo || 'limite',
      visual: visual || 'interactivo',
      relleno: relleno || '',
    }),
  },
  {
    patron: /^\[\[asintotas\s+expr=(.+?)\]\]$/,
    crear: ([, expr]) => ({ tipo: 'asintotas', expr: expr.trim() }),
  },
  {
    patron: /^\[\[grafica-limite\s+expr=(.+?)\s+punto=([-\d.]+)(?:\s+modo=(\w+))?\]\]$/,
    crear: ([, expr, punto, modo]) => ({
      tipo: 'grafica-funcion',
      expr,
      punto: Number(punto),
      ...(modo ? { modo } : {}),
    }),
  },
  {
    patron: /^\[\[grafica-infinito\s+variante=(mas|menos)\]\]$/,
    crear: ([, variante]) => ({ tipo: 'dibujo', componente: 'grafica-infinito', variante }),
  },
  {
    patron: /^\[\[grafica-asintota\s+tipo=(horizontal|vertical|oblicua)\]\]$/,
    crear: ([, variante]) => ({ tipo: 'dibujo', componente: 'grafica-asintota', variante }),
  },
  {
    patron: /^\[\[grafica\s+tipo=(salto|infinita|evitable)\]\]$/,
    crear: ([, variante]) => ({ tipo: 'dibujo', componente: 'grafica-discontinuidad', variante }),
  },
  {
    patron: /^\[\[grafica-conceptual\s+variante=(mas|menos)\]\]$/,
    crear: ([, variante]) => ({ tipo: 'dibujo', componente: 'grafica-conceptual', variante }),
  },
];

const esFilaTabla = (t) => t.startsWith('|') && t.endsWith('|');
const celdas = (fila) => fila.split('|').slice(1, -1).map((c) => c.trim());

function aLista(lineas, contador) {
  const bloques = [];
  let texto = [];

  const agregar = (bloque) => {
    contador.n += 1;
    bloques.push({ id: `b${contador.n}`, ...bloque });
  };

  const cerrarTexto = () => {
    const unido = texto.join('\n').trim();
    if (unido) agregar({ tipo: 'texto', texto: unido });
    texto = [];
  };

  for (let i = 0; i < lineas.length; i++) {
    const t = lineas[i].trim();

    const apertura = t.match(/^:::desplegable\s+(.+)$/);
    if (apertura) {
      const interior = [];
      i += 1;
      while (i < lineas.length && lineas[i].trim() !== ':::') {
        interior.push(lineas[i]);
        i += 1;
      }
      cerrarTexto();
      const id = contador.n + 1;
      contador.n = id;
      bloques.push({ id: `b${id}`, tipo: 'desplegable', titulo: apertura[1], bloques: aLista(interior, contador) });
      continue;
    }

    const marcador = MARCADORES.map(({ patron, crear }) => {
      const coincide = t.match(patron);
      return coincide ? crear(coincide) : null;
    }).find(Boolean);

    if (marcador) {
      cerrarTexto();
      agregar(marcador);
      continue;
    }

    if (esFilaTabla(t)) {
      const filas = [];
      while (i < lineas.length && esFilaTabla(lineas[i].trim())) {
        filas.push(lineas[i].trim());
        i += 1;
      }
      i -= 1;
      cerrarTexto();
      agregar({ tipo: 'tabla', encabezados: celdas(filas[0]), filas: filas.slice(2).map(celdas) });
      continue;
    }

    texto.push(lineas[i]);
  }

  cerrarTexto();
  return bloques;
}

export function contenidoABloques(contenido) {
  return aLista(String(contenido ?? '').replace(/\r\n/g, '\n').split('\n'), { n: 0 });
}
