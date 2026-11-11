import { errorCliente, errorSistema } from "../lib/respuestas.js";
import { promptTutor, ritmoTutor, validarPreguntaTutor } from "../lib/tutor.js";

class tutorController {
    async preguntar(req, res) {
        try {
            const clave = process.env.OPENAI_API_KEY;

            if (!clave) {
                return errorCliente(res, 503, "SIN_CLAVE_IA", "El tutor no está configurado en el servidor.");
            }

            const mensaje = String(req.body?.mensaje ?? "").trim();
            const tema = String(req.body?.tema ?? "limites").trim() || "limites";
            const invalida = validarPreguntaTutor(mensaje);

            if (invalida) {
                return errorCliente(res, 400, "PREGUNTA_INVALIDA", invalida);
            }

            const espera = ritmoTutor(req.ip || "local");

            if (espera) {
                return errorCliente(res, 429, "DEMASIADAS_PETICIONES", espera);
            }

            const respuestaIa = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${clave}`,
                },
                body: JSON.stringify({
                    model: "o3-mini",
                    messages: [
                        { role: "system", content: promptTutor(tema) },
                        { role: "user", content: mensaje },
                    ],
                    max_completion_tokens: 2000,
                }),
            });

            if (!respuestaIa.ok) {
                return errorCliente(res, 502, "TUTOR_NO_DISPONIBLE", "El tutor no pudo responder. Inténtalo en un momento.");
            }

            const datos = await respuestaIa.json();
            const respuesta = datos.choices?.[0]?.message?.content?.trim();

            if (!respuesta) {
                return errorCliente(res, 502, "TUTOR_NO_DISPONIBLE", "La IA no devolvió una respuesta válida.");
            }

            return res.json({ respuesta });
        } catch (error) {
            return errorSistema(res, "Tutor IA", error);
        }
    }
}

export default new tutorController();
