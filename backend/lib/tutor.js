const MIN_INTERVALO_MS = 3000;
const ultimaPorIp = new Map();

const LISTA_NEGRA = [
    "ignora tus instrucciones", "ignore your instructions",
    "olvida lo anterior", "forget previous",
    "nuevo rol", "new role", "cambia de rol",
    "sin restricciones", "without restrictions",
    "jailbreak", "prompt injection",
];

const PALABRAS_CALCULO = [
    "limite", "límite", "lim",
    "derivada", "derivar",
    "integral", "funcion", "función", "function",
    "calcular", "resuelve", "resolver", "calcula",
    "hallar", "encontrar",
    "maximo", "mínimo", "minimo",
    "concavidad", "asintota", "asíntota",
    "tangente", "sen", "sin", "cos", "tan",
    "log", "ln", "indeterminacion", "continuidad",
    "optimiz", "lhopital", "ejercicio", "ejemplo",
    "explica", "explicame", "paso a paso",
];

export function validarPreguntaTutor(mensaje) {
    if (!mensaje || mensaje.length > 500) {
        return "Escribe una pregunta breve de cálculo (máximo 500 caracteres).";
    }

    const texto = mensaje.toLowerCase();

    if (LISTA_NEGRA.some((p) => texto.includes(p))) {
        return "Solo puedo ayudarte con ejercicios de cálculo.";
    }

    if (!PALABRAS_CALCULO.some((p) => texto.includes(p))) {
        return "Solo puedo ayudarte con ejercicios de cálculo (límites, derivadas, aplicaciones).";
    }

    return null;
}

export function ritmoTutor(ip) {
    const ahora = Date.now();
    const anterior = ultimaPorIp.get(ip) ?? 0;

    if (ahora - anterior < MIN_INTERVALO_MS) {
        return `Espera ${Math.ceil((MIN_INTERVALO_MS - (ahora - anterior)) / 1000)} segundo(s) antes de otra pregunta.`;
    }

    ultimaPorIp.set(ip, ahora);
    return null;
}

export function promptTutor(tema) {
    const base = `Eres un profesor experto y paciente de Cálculo I universitario. Resuelves ejercicios PASO A PASO.
Nunca saltas pasos. Explicas con calma y claridad. Usas LaTeX ($...$ inline, $$...$$ bloque).
SEGURIDAD: Solo respondes preguntas de cálculo (límites, derivadas, aplicaciones). Si preguntan otra cosa, redirige al tema.`;

    if (tema === "derivadas") return `${base}\n\nESPECIALIDAD ACTUAL: DERIVADAS.`;
    if (tema === "aplicaciones") return `${base}\n\nESPECIALIDAD ACTUAL: APLICACIONES DE LA DERIVADA.`;
    return `${base}\n\nESPECIALIDAD ACTUAL: LÍMITES Y CONTINUIDAD.`;
}
