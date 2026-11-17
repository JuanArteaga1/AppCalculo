import Tema from "../../schemas/temas.js";
import ConceptoPrevio from "../../schemas/conceptosPrevios.js";
import { MODULO_CONCEPTOS_PREVIOS, filtroNoEliminados, VISIBILIDAD_PRIVADA } from "../visibilidad.js";
import { normalizar } from "./guardrails.js";

// RAG léxico del tutor (spec-gestion-ia RF-04, BR-05). Sin embeddings: busca
// palabras de la pregunta en los temas publicados y los conceptos previos, y
// manda al modelo los mejores fragmentos. Nunca lee el `borrador` de un tema.

const MAX_FRAGMENTOS = 3;
const LARGO_FRAGMENTO = 700;
const NOMBRE_MODULO = { limites: "Límites", derivadas: "Derivadas", aplicaciones: "Aplicación de la derivada" };

// Campos de un bloque que no son texto para leer.
const CAMPOS_IGNORADOS = new Set(["id", "_id", "tipo", "url", "src", "imagen", "video", "videoId", "color", "ancho", "alto", "estilo"]);

// Palabras que no distinguen un tema de otro: verbos de pedir ayuda y palabras vacías.
// «límite», «derivada» o «función» sí cuentan: dicen de qué trata la pregunta.
const VACIAS = new Set([
    "como", "cual", "cuales", "cuanto", "cuando", "donde", "porque", "para", "pero", "sobre", "entre", "desde", "hasta",
    "este", "esta", "esto", "estos", "estas", "ese", "esa", "eso", "aquel", "tiene", "tengo", "puede", "puedo", "hace", "hacer",
    "calcula", "calcular", "calculo", "resuelve", "resolver", "hallar", "halla", "encontrar", "encuentra", "explica",
    "explicame", "ayuda", "ayudame", "ejercicio", "ejercicios", "ejemplo", "ejemplos", "paso", "pasos", "favor", "gracias",
    "quiero", "necesito", "saber", "entender", "valor", "vale", "dame", "seria", "esta", "estan", "algo", "todo", "solo",
]);

const palabras = (texto) => new Set(
    normalizar(texto)
        .split(/[^a-z0-9ñ]+/)
        .filter((palabra) => palabra.length >= 4 && !VACIAS.has(palabra))
);

/** Todo el texto legible de los bloques, sin marcas de formato. */
function textoDeBloques(valor, salida = []) {
    if (typeof valor === "string") {
        salida.push(valor.replace(/\{(centro|derecha)\}/g, "").replace(/[*_#>`]+/g, ""));
    } else if (Array.isArray(valor)) {
        valor.forEach((item) => textoDeBloques(item, salida));
    } else if (valor && typeof valor === "object") {
        for (const [clave, contenido] of Object.entries(valor)) {
            if (!CAMPOS_IGNORADOS.has(clave)) textoDeBloques(contenido, salida);
        }
    }

    return salida;
}

/** Parte el texto en fragmentos de hasta ~700 caracteres, por párrafos. */
function fragmentar(texto) {
    const fragmentos = [];
    let actual = "";

    for (const parrafo of texto.split(/\n+/).map((p) => p.trim()).filter(Boolean)) {
        if (actual && actual.length + parrafo.length > LARGO_FRAGMENTO) {
            fragmentos.push(actual);
            actual = "";
        }
        actual = actual ? `${actual}\n${parrafo}` : parrafo;
    }

    if (actual) fragmentos.push(actual);
    return fragmentos.map((fragmento) => fragmento.slice(0, LARGO_FRAGMENTO * 2));
}

/** Las fuentes que el tutor puede citar: temas públicos (sin papelera) y conceptos previos publicados. */
async function cargarFuentes() {
    const [temas, conceptos] = await Promise.all([
        Tema.find({ ...filtroNoEliminados, visibilidad: { $ne: VISIBILIDAD_PRIVADA } })
            .select("modulo numero orden titulo descripcion bloques")
            .sort({ orden: 1 })
            .lean(),
        ConceptoPrevio.find({ publicado: true }).select("titulo slug contenido orden").sort({ orden: 1 }).lean(),
    ]);

    return [
        ...temas.map((tema) => ({
            fuente: {
                tipo: tema.modulo === MODULO_CONCEPTOS_PREVIOS ? "concepto" : "tema",
                modulo: tema.modulo,
                numero: tema.numero,
                titulo: tema.titulo,
            },
            texto: [tema.titulo, tema.descripcion, ...textoDeBloques(tema.bloques)].filter(Boolean).join("\n"),
        })),
        ...conceptos.map((concepto) => ({
            fuente: { tipo: "concepto", modulo: MODULO_CONCEPTOS_PREVIOS, numero: concepto.slug, titulo: concepto.titulo },
            texto: [concepto.titulo, ...textoDeBloques(concepto.contenido)].filter(Boolean).join("\n"),
        })),
    ];
}

/** Cómo se nombra una fuente ante el estudiante: «Límites 1.2 Límites laterales». */
export function nombreFuente({ tipo, modulo, numero, titulo }) {
    return tipo === "concepto" ? `Conceptos previos: ${titulo}` : `${NOMBRE_MODULO[modulo] ?? modulo} ${numero} ${titulo}`;
}

/**
 * Busca los fragmentos que más palabras comparten con la pregunta. Los del módulo
 * pedido pesan un poco más. Sin ninguna palabra en común, devuelve `fragmentos: []`
 * y el tema que más se le parece por su título (o el primero del módulo).
 */
export async function buscarFragmentos(pregunta, modulo) {
    const buscadas = palabras(pregunta);
    const fuentes = await cargarFuentes();
    const candidatos = [];

    for (const { fuente, texto } of fuentes) {
        for (const fragmento of fragmentar(texto)) {
            const propias = palabras(fragmento);
            const comunes = [...buscadas].filter((palabra) => propias.has(palabra)).length;

            if (comunes > 0) {
                candidatos.push({ fuente, texto: fragmento, puntaje: comunes + (fuente.modulo === modulo ? 0.5 : 0) });
            }
        }
    }

    candidatos.sort((a, b) => b.puntaje - a.puntaje);
    const fragmentos = candidatos.slice(0, MAX_FRAGMENTOS).map(({ fuente, texto }) => ({ fuente, texto }));

    if (fragmentos.length > 0) {
        return { fragmentos, sugerencia: fragmentos[0].fuente };
    }

    const delModulo = fuentes.filter(({ fuente }) => fuente.tipo === "tema" && fuente.modulo === modulo);
    return { fragmentos: [], sugerencia: (delModulo[0] ?? fuentes.find(({ fuente }) => fuente.tipo === "tema"))?.fuente ?? null };
}
