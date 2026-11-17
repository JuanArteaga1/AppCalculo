// Única función que habla con el modelo de IA (spec-gestion-ia BR-01).
// Hoy es Gemini en plan gratuito, solo para pruebas: cambiar de proveedor
// significa cambiar este archivo y nada más. La clave nunca sale del servidor
// y al modelo solo viaja el texto de la pregunta: sin nombre, correo ni IP.

const BASE_POR_DEFECTO = "https://generativelanguage.googleapis.com/v1beta";
const MODELO_POR_DEFECTO = "gemini-2.0-flash";
const TOKENS_MAXIMOS = 2000;
const ESPERA_MAXIMA_MS = 30_000;

/** Fallo del proveedor: el controlador lo traduce y devuelve la pregunta al contador (CA-10). */
export class ErrorProveedor extends Error {
    constructor(codigo, mensaje) {
        super(mensaje);
        this.name = "ErrorProveedor";
        this.codigo = codigo;
    }
}

/**
 * Pide una respuesta al modelo.
 * @param {{ sistema: string, pregunta: string }} datos
 * @returns {Promise<string>} el texto de la respuesta
 */
export async function preguntarAlModelo({ sistema, pregunta }) {
    const clave = process.env.GEMINI_API_KEY;

    if (!clave) {
        throw new ErrorProveedor("SIN_CLAVE", "Falta GEMINI_API_KEY en el backend.");
    }

    const base = (process.env.GEMINI_URL_BASE || BASE_POR_DEFECTO).replace(/\/+$/, "");
    const modelo = process.env.IA_MODELO || MODELO_POR_DEFECTO;

    let respuesta;

    try {
        respuesta = await fetch(`${base}/models/${encodeURIComponent(modelo)}:generateContent`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": clave },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: sistema }] },
                contents: [{ role: "user", parts: [{ text: pregunta }] }],
                generationConfig: { maxOutputTokens: TOKENS_MAXIMOS },
            }),
            signal: AbortSignal.timeout(ESPERA_MAXIMA_MS),
        });
    } catch {
        throw new ErrorProveedor("SIN_RED", "No se pudo conectar con el modelo.");
    }

    if (!respuesta.ok) {
        // 429 es el límite del plan gratuito; no se registra el cuerpo: puede traer datos.
        throw new ErrorProveedor(respuesta.status === 429 ? "LIMITE_PROVEEDOR" : "RECHAZADO", `El modelo respondió ${respuesta.status}.`);
    }

    const datos = await respuesta.json().catch(() => null);
    const texto = (datos?.candidates?.[0]?.content?.parts ?? [])
        .map((parte) => parte?.text ?? "")
        .join("")
        .trim();

    if (!texto) {
        throw new ErrorProveedor("RESPUESTA_VACIA", "El modelo no devolvió texto.");
    }

    return texto;
}
