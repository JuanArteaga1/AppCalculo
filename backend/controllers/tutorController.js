import { errorCliente, errorSistema } from "../lib/respuestas.js";
import { ErrorProveedor, preguntarAlModelo } from "../lib/ia/proveedor.js";
import { moduloTutor, promptSistema } from "../lib/ia/promptSistema.js";
import { MENSAJE_QUIZ_ABIERTO, coincideConQuizAbierto, revisarTexto } from "../lib/ia/guardrails.js";
import { buscarFragmentos, nombreFuente } from "../lib/ia/rag.js";
import {
    claveDeUso,
    devolverPregunta,
    esperaTutor,
    horaDeReinicio,
    iaSinSesionActiva,
    reservarPregunta,
    rolDelTope,
    topeDelRol,
} from "../lib/ia/limites.js";

/**
 * Tutor con IA (spec-gestion-ia). Orden: texto → IA sin sesión → ritmo → quiz abierto
 * → fuentes de la plataforma → tope del día → modelo. Sin fuentes, responde sin llamar
 * al modelo ni gastar la pregunta. Si el modelo falla, la pregunta se devuelve.
 */
class tutorController {
    async preguntar(req, res) {
        let clave = null;
        let reservada = false;

        try {
            const mensaje = String(req.body?.mensaje ?? "").trim();
            const modulo = moduloTutor(String(req.body?.tema ?? req.body?.modulo ?? "").trim());

            const rechazo = revisarTexto(mensaje);

            if (rechazo) {
                return errorCliente(res, rechazo.estado, rechazo.codigo, rechazo.mensaje);
            }

            const rol = rolDelTope(req.usuario);
            clave = claveDeUso(req);

            // CA-02: apagada para quien no inició sesión.
            if (rol === "sinsesion" && !iaSinSesionActiva()) {
                return errorCliente(res, 401, "IA_REQUIERE_SESION", "Inicia sesión para usar el tutor de IA.");
            }

            const espera = esperaTutor(clave);

            if (espera) {
                return errorCliente(res, 429, "DEMASIADAS_PETICIONES", `Espera ${espera} segundo(s) antes de otra pregunta.`);
            }

            // CA-06: un quiz con nota abierto no se resuelve ni se insinúa.
            if (await coincideConQuizAbierto(mensaje)) {
                return errorCliente(res, 403, "QUIZ_ABIERTO", MENSAJE_QUIZ_ABIERTO);
            }

            // CA-07 y CA-08: solo con fuentes de la plataforma; sin ellas, no se inventa.
            const { fragmentos, sugerencia } = await buscarFragmentos(mensaje, modulo);

            if (fragmentos.length === 0) {
                const pista = sugerencia ? ` Te puede servir empezar por «${nombreFuente(sugerencia)}».` : "";

                return res.json({
                    respuesta: `No tengo ese contenido en la plataforma, así que no voy a inventar una respuesta.${pista}`,
                    sinContenido: true,
                    sugerencia,
                    fuentes: [],
                });
            }

            // CA-01 y CA-03: tope diario por rol, reservado de forma atómica.
            const restantes = await reservarPregunta(clave, topeDelRol(rol));

            if (restantes === null) {
                return errorCliente(
                    res,
                    429,
                    rol === "sinsesion" ? "LIMITE_SIN_SESION" : "LIMITE_DIARIO",
                    rol === "sinsesion"
                        ? `Ya hiciste tus ${topeDelRol(rol)} preguntas de hoy sin cuenta. Inicia sesión para seguir; el tope se reinicia el ${horaDeReinicio()} (hora de Colombia).`
                        : `Llegaste al tope de preguntas de hoy. Se reinicia el ${horaDeReinicio()} (hora de Colombia).`
                );
            }

            reservada = true;

            const respuesta = await preguntarAlModelo({
                sistema: promptSistema(modulo, fragmentos, nombreFuente),
                pregunta: mensaje,
            });

            return res.json({ respuesta, restantes, fuentes: fragmentos.map(({ fuente }) => fuente) });
        } catch (error) {
            // CA-10: si el modelo falló, el estudiante no pierde la pregunta.
            if (reservada) {
                await devolverPregunta(clave).catch(() => {});
            }

            if (error instanceof ErrorProveedor) {
                console.error(`Tutor IA: ${error.codigo}`);

                if (error.codigo === "SIN_CLAVE") {
                    return errorCliente(res, 503, "SIN_CLAVE_IA", "El tutor no está configurado en el servidor.");
                }

                return errorCliente(res, 502, "TUTOR_NO_DISPONIBLE", "El tutor no pudo responder ahora. No gastaste ninguna pregunta; inténtalo en un momento.");
            }

            return errorSistema(res, "Tutor IA", error);
        }
    }
}

export default new tutorController();
