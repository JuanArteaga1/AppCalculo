/**
 * Lista blanca de bloques de un tema. Lo que entra por la API se reconstruye
 * campo por campo: un tipo o un campo desconocido nunca llega a la base.
 */

const MAX_BLOQUES = 400;
const MAX_TEXTO = 40000;
const MAX_CORTO = 500;
const MAX_FILAS = 60;
const MAX_COLUMNAS = 12;
const MAX_OPCIONES = 8;
const MAX_PROFUNDIDAD = 2;

const ANCLA_YOUTUBE = /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//;
const ID_YOUTUBE = /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/;
const MAX_VIDEOS = 50;
const MAX_PRACTICAS = 50;
const IMAGEN_PROPIA = /^\/api\/archivos\/[\w-]+\.(png|jpe?g|webp)$/;

const DIBUJOS = {
    "grafica-conceptual": ["mas", "menos"],
    "grafica-infinito": ["mas", "menos"],
    "grafica-asintota": ["horizontal", "vertical", "oblicua"],
    "grafica-discontinuidad": ["evitable", "salto", "infinita"],
};

class ErrorBloque extends Error {}

function falla(mensaje) {
    throw new ErrorBloque(mensaje);
}

function texto(valor, nombre, { maximo = MAX_CORTO, obligatorio = false } = {}) {
    if (valor === undefined || valor === null) {
        valor = "";
    }

    if (typeof valor !== "string") {
        falla(`${nombre} debe ser texto.`);
    }

    if (valor.length > maximo) {
        falla(`${nombre} supera los ${maximo} caracteres.`);
    }

    if (obligatorio && !valor.trim()) {
        falla(`Completa: ${nombre.toLowerCase()}.`);
    }

    return valor;
}

/** Las expresiones son una sola línea corta: mathjs las interpreta en el navegador. */
function expresion(valor) {
    const expr = texto(valor, "La función", { maximo: 200, obligatorio: true }).trim();

    if (/[\r\n]/.test(expr)) {
        falla("La función debe ocupar una sola línea.");
    }

    return expr;
}

function numero(valor, nombre) {
    const n = Number(valor);

    if (valor === "" || valor === null || valor === undefined || !Number.isFinite(n)) {
        falla(`${nombre} debe ser un número.`);
    }

    return n;
}

function opcion(valor, permitidas, nombre) {
    if (!permitidas.includes(valor)) {
        falla(`${nombre} no tiene un valor válido.`);
    }

    return valor;
}

function validarBloque(bloque, profundidad) {
    if (!bloque || typeof bloque !== "object" || Array.isArray(bloque)) {
        falla("Hay un bloque con un formato inválido.");
    }

    const id = texto(bloque.id, "El identificador", { maximo: 40 });

    switch (bloque.tipo) {
        case "texto":
            return { id, tipo: "texto", texto: texto(bloque.texto, "El texto", { maximo: MAX_TEXTO }) };

        case "tabla": {
            const fila = (celdas) => {
                if (!Array.isArray(celdas) || celdas.length > MAX_COLUMNAS) {
                    falla("Una tabla admite hasta 12 columnas.");
                }

                return celdas.map((c) => texto(c, "Una celda"));
            };

            if (!Array.isArray(bloque.filas) || bloque.filas.length > MAX_FILAS) {
                falla("Una tabla admite hasta 60 filas.");
            }

            return { id, tipo: "tabla", encabezados: fila(bloque.encabezados), filas: bloque.filas.map(fila) };
        }

        case "desplegable":
            if (profundidad >= MAX_PROFUNDIDAD) {
                falla("Un desplegable no puede tener más de dos niveles.");
            }

            return {
                id,
                tipo: "desplegable",
                titulo: texto(bloque.titulo, "El título del desplegable", { obligatorio: true }),
                bloques: validarLista(bloque.bloques, profundidad + 1),
            };

        case "video": {
            const url = texto(bloque.url, "El enlace del video", { obligatorio: true }).trim();

            if (!ANCLA_YOUTUBE.test(url)) {
                falla("El video debe ser un enlace de YouTube.");
            }

            return { id, tipo: "video", url, titulo: texto(bloque.titulo, "El título del video") };
        }

        case "grafica-funcion":
            return {
                id,
                tipo: "grafica-funcion",
                expr: expresion(bloque.expr),
                punto: numero(bloque.punto, "El punto"),
                ...(bloque.modo ? { modo: opcion(bloque.modo, ["limite", "laterales"], "El modo") } : {}),
            };

        case "tabla-limite":
            return {
                id,
                tipo: "tabla-limite",
                expr: expresion(bloque.expr),
                punto: numero(bloque.punto, "El punto"),
                modo: opcion(bloque.modo ?? "limite", ["limite", "laterales"], "El modo"),
                visual: opcion(bloque.visual ?? "interactivo", ["interactivo", "estatico"], "La presentación"),
                relleno: opcion(bloque.relleno ?? "", ["", "izquierda", "derecha"], "El extremo relleno"),
            };

        case "asintotas":
            return { id, tipo: "asintotas", expr: expresion(bloque.expr) };

        case "dibujo": {
            const variantes = DIBUJOS[bloque.componente];

            if (!variantes) {
                falla("El dibujo no es válido.");
            }

            return {
                id,
                tipo: "dibujo",
                componente: bloque.componente,
                variante: opcion(bloque.variante, variantes, "La variante"),
            };
        }

        case "ejercicio": {
            if (!Array.isArray(bloque.opciones) || bloque.opciones.length < 2 || bloque.opciones.length > MAX_OPCIONES) {
                falla("Un ejercicio necesita entre 2 y 8 opciones.");
            }

            const opciones = bloque.opciones.map((o) => texto(o, "Una opción", { obligatorio: true }));
            const correcta = numero(bloque.correcta, "La respuesta correcta");

            if (!Number.isInteger(correcta) || correcta < 0 || correcta >= opciones.length) {
                falla("Marca cuál es la respuesta correcta.");
            }

            return {
                id,
                tipo: "ejercicio",
                enunciado: texto(bloque.enunciado, "El enunciado", { maximo: 4000, obligatorio: true }),
                opciones,
                correcta,
                explicacion: texto(bloque.explicacion, "La explicación", { maximo: 4000 }),
            };
        }

        case "imagen": {
            const url = texto(bloque.url, "La imagen", { obligatorio: true });

            if (!IMAGEN_PROPIA.test(url)) {
                falla("La imagen debe subirse desde el editor.");
            }

            return {
                id,
                tipo: "imagen",
                url,
                alt: texto(bloque.alt, "El texto alternativo", { obligatorio: true }),
                pie: texto(bloque.pie, "El pie de imagen"),
            };
        }

        default:
            return falla("Hay un bloque de un tipo desconocido.");
    }
}

function validarLista(bloques, profundidad) {
    if (!Array.isArray(bloques) || bloques.length > MAX_BLOQUES) {
        falla("El contenido del tema no es válido.");
    }

    return bloques.map((b) => validarBloque(b, profundidad));
}

export function validarBloques(bloques) {
    return validarLista(bloques, 0);
}

/** Solo se guarda el ID: el enlace se reconstruye, así no entra nada más. */
function urlYoutube(valor) {
    const enlace = texto(valor, "El enlace del video", { obligatorio: true }).trim();
    const id = /^[\w-]{11}$/.test(enlace) ? enlace : enlace.match(ID_YOUTUBE)?.[1];

    if (!id) {
        falla("El video debe ser un enlace de YouTube.");
    }

    return `https://www.youtube.com/watch?v=${id}`;
}

export function validarVideos(videos) {
    if (!Array.isArray(videos) || videos.length > MAX_VIDEOS) {
        falla("Un tema admite hasta 50 videos.");
    }

    return videos.map((v) => ({
        id: texto(v?.id, "El identificador", { maximo: 40 }),
        url: urlYoutube(v?.url),
        titulo: texto(v?.titulo, "El título del video", { maximo: 200 }).trim(),
        descripcion: texto(v?.descripcion, "La descripción del video").trim(),
    }));
}

export function validarPracticas(practicas) {
    if (!Array.isArray(practicas) || practicas.length > MAX_PRACTICAS) {
        falla("Un tema admite hasta 50 ejercicios de práctica.");
    }

    return practicas.map((p) => ({
        id: texto(p?.id, "El identificador", { maximo: 40 }),
        titulo: texto(p?.titulo, "El enunciado del ejercicio", { maximo: 200, obligatorio: true }).trim(),
        funcion: expresion(p?.funcion),
        herramienta: opcion(p?.herramienta, ["limite", "derivada"], "La herramienta"),
        punto: numero(p?.punto, "El punto"),
    }));
}

export function validarEncabezado({ titulo, descripcion }) {
    return {
        titulo: texto(titulo, "El título", { maximo: 200, obligatorio: true }).trim(),
        descripcion: texto(descripcion, "La descripción", { maximo: 1000 }).trim(),
    };
}

export { ErrorBloque };
