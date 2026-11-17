import Evaluacion from "../../schemas/evaluaciones.js";

// Guardrails del tutor (spec-gestion-ia RF-06, BR-04 a BR-07). Todos son reglas
// simples: dejan falsos positivos y negativos, y se afinan con el uso.

export const MAX_CARACTERES = 1000;
const MIN_COINCIDENCIA = 25;

const INSTRUCCIONES_INYECTADAS = [
    "ignora tus instrucciones", "ignora las instrucciones", "ignora lo anterior", "ignora todo lo anterior",
    "ignore your instructions", "ignore previous", "ignore all previous",
    "olvida lo anterior", "olvida tus instrucciones", "forget previous", "forget your instructions",
    "nuevo rol", "new role", "cambia de rol", "actua como", "actúa como", "act as",
    "sin restricciones", "without restrictions", "jailbreak", "prompt injection",
    "system prompt", "prompt del sistema",
];

const PALABRAS_CALCULO = [
    "limite", "límite", "lim", "infinito", "tiende",
    "derivada", "derivar", "deriv", "diferencial", "integral",
    "funcion", "función", "function", "f(x)",
    "calcular", "calcula", "resuelve", "resolver", "hallar", "halla", "encontrar",
    "maximo", "máximo", "minimo", "mínimo", "concavidad", "asintota", "asíntota",
    "tangente", "pendiente", "sen(", "cos(", "tan(", "ln(", "log(", "ln ", "log ",
    "indeterminacion", "indeterminación", "continuidad", "continua", "discontinuidad",
    "optimiz", "lhopital", "l'hopital", "regla de la cadena", "teorema",
    "ejercicio", "ejemplo", "paso a paso", "x^", "x²", "dx",
];

/** Minúsculas, sin tildes y con espacios simples: para comparar textos. */
export function normalizar(texto) {
    return String(texto ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Reglas que no necesitan la base: longitud, instrucciones inyectadas y tema.
 * Devuelve `{ codigo, estado, mensaje }` si hay que rechazar, o null.
 */
export function revisarTexto(mensaje) {
    if (!mensaje) {
        return { codigo: "PREGUNTA_INVALIDA", estado: 400, mensaje: "Escribe tu pregunta de cálculo." };
    }

    if (mensaje.length > MAX_CARACTERES) {
        return {
            codigo: "PREGUNTA_LARGA",
            estado: 400,
            mensaje: `Tu pregunta tiene ${mensaje.length} caracteres; el máximo es ${MAX_CARACTERES}. Acórtala.`,
        };
    }

    const texto = normalizar(mensaje);

    if (INSTRUCCIONES_INYECTADAS.some((frase) => texto.includes(normalizar(frase)))) {
        return { codigo: "PREGUNTA_INVALIDA", estado: 400, mensaje: "Solo puedo ayudarte con ejercicios de cálculo." };
    }

    if (!PALABRAS_CALCULO.some((palabra) => texto.includes(normalizar(palabra)))) {
        return {
            codigo: "PREGUNTA_INVALIDA",
            estado: 400,
            mensaje: "Solo puedo ayudarte con ejercicios de cálculo (límites, derivadas y aplicaciones).",
        };
    }

    return null;
}

/**
 * ¿La pregunta es de un quiz con nota publicado, habilitado y que aún no cierra?
 * Compara la pregunta normalizada con cada enunciado: igual, o uno contenido en el otro
 * cuando es lo bastante largo como para no ser una coincidencia casual.
 */
export async function coincideConQuizAbierto(mensaje) {
    const pregunta = normalizar(mensaje);

    const quices = await Evaluacion.find({
        estado: "publicado",
        habilitado: true,
        fechaLimite: { $gt: new Date() },
    }).select("preguntas.enunciado").lean();

    return quices.some((quiz) =>
        (quiz.preguntas ?? []).some((item) => {
            const enunciado = normalizar(item.enunciado);

            if (!enunciado) return false;
            if (enunciado === pregunta) return true;

            const corto = enunciado.length < pregunta.length ? enunciado : pregunta;
            const largo = corto === enunciado ? pregunta : enunciado;

            return corto.length >= MIN_COINCIDENCIA && largo.includes(corto);
        })
    );
}

export const MENSAJE_QUIZ_ABIERTO =
    "Esta pregunta es de un quiz con nota que sigue abierto, y no puedo resolverla ni darte pistas. Cuando cierre podrás ver las respuestas correctas.";
