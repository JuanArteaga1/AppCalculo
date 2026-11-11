import mongoose from "mongoose";
import Modulo from "../schemas/modulos.js";
import Tema from "../schemas/temas.js";
import Progreso from "../schemas/progreso.js";
import { errorCliente, errorSistema } from "../lib/respuestas.js";

const CAMPOS_TEMA = "modulo numero orden titulo";

async function asegurar(usuarioId) {
    return Progreso.findOneAndUpdate(
        { usuario: usuarioId },
        { $setOnInsert: { usuario: usuarioId, temas: [], ejercicios: [], videos: [], chats: [], notas: [] } },
        { new: true, upsert: true },
    );
}

function recortar(texto, maximo) {
    return String(texto ?? "").trim().slice(0, maximo);
}

class progresoController {
    async resumen(req, res) {
        try {
            const [progreso, modulos, temas] = await Promise.all([
                asegurar(req.usuario._id),
                Modulo.find().sort({ orden: 1 }).lean(),
                Tema.find().select(CAMPOS_TEMA).sort({ orden: 1 }).lean(),
            ]);

            const visitados = new Set(progreso.temas.map((t) => `${t.modulo}/${t.tema}`));
            const porModulo = modulos.map((m) => {
                const delModulo = temas.filter((t) => t.modulo === m.clave);
                const vistos = delModulo.filter((t) => visitados.has(`${t.modulo}/${t.numero}`)).length;
                const total = delModulo.length;
                const siguiente = delModulo.find((t) => !visitados.has(`${t.modulo}/${t.numero}`));

                return {
                    id: m.clave,
                    nombre: m.titulo,
                    pct: total ? Math.round((vistos / total) * 100) : 0,
                    temas: `${vistos} de ${total} temas`,
                    sigue: siguiente ? `${siguiente.numero} ${siguiente.titulo}` : (total ? "Módulo completado" : "Sin temas aún"),
                };
            });

            const ultimo = [...progreso.temas].sort(
                (a, b) => new Date(b.ultimaVisita) - new Date(a.ultimaVisita),
            )[0] ?? null;

            const notas = progreso.notas ?? [];
            const promedio = notas.length
                ? notas.reduce((suma, n) => suma + Number(n.nota || 0), 0) / notas.length
                : 0;

            return res.json({
                porModulo,
                ultimo: ultimo
                    ? {
                        modulo: ultimo.modulo,
                        tema: ultimo.tema,
                        titulo: ultimo.titulo || ultimo.tema,
                        ruta: `/calculo1/${ultimo.modulo}/${ultimo.tema}`,
                        primeraVisita: ultimo.primeraVisita,
                        ultimaVisita: ultimo.ultimaVisita,
                    }
                    : null,
                notas,
                promedio: Number(promedio.toFixed(1)),
                totalTemas: temas.length,
                temasVisitados: visitados.size,
                pctGeneral: temas.length ? Math.round((visitados.size / temas.length) * 100) : 0,
            });
        } catch (error) {
            return errorSistema(res, "Resumen de progreso", error);
        }
    }

    async registrarTema(req, res) {
        try {
            const modulo = recortar(req.body?.modulo, 40);
            const tema = recortar(req.body?.tema, 20);
            const titulo = recortar(req.body?.titulo, 120) || tema;

            if (!modulo || !tema) {
                return errorCliente(res, 400, "DATOS_INVALIDOS", "Indica el módulo y el tema.");
            }

            const progreso = await asegurar(req.usuario._id);
            const existente = progreso.temas.find((t) => t.modulo === modulo && t.tema === tema);
            const ahora = new Date();

            if (existente) {
                existente.ultimaVisita = ahora;
                if (titulo) existente.titulo = titulo;
            } else {
                progreso.temas.push({
                    modulo,
                    tema,
                    titulo,
                    primeraVisita: ahora,
                    ultimaVisita: ahora,
                });
            }

            await progreso.save();
            return res.status(204).end();
        } catch (error) {
            return errorSistema(res, "Registrar tema abierto", error);
        }
    }

    async listarEjercicios(req, res) {
        try {
            const progreso = await asegurar(req.usuario._id);
            return res.json({ ejercicios: progreso.ejercicios });
        } catch (error) {
            return errorSistema(res, "Listar ejercicios", error);
        }
    }

    async obtenerEjercicio(req, res) {
        try {
            const progreso = await asegurar(req.usuario._id);
            const ejercicio = progreso.ejercicios.id(req.params.id);

            if (!ejercicio) {
                return errorCliente(res, 404, "EJERCICIO_NO_ENCONTRADO", "Ese ejercicio no está guardado.");
            }

            return res.json({ ejercicio });
        } catch (error) {
            return errorSistema(res, "Obtener ejercicio", error);
        }
    }

    async guardarEjercicio(req, res) {
        try {
            const funciones = Array.isArray(req.body?.funciones)
                ? req.body.funciones.slice(0, 20).map((f) => ({
                    entrada: recortar(f?.entrada, 200),
                    color: recortar(f?.color, 20),
                    visible: Boolean(f?.visible),
                    nombre: recortar(f?.nombre, 20),
                })).filter((f) => f.entrada)
                : [];

            if (!funciones.length) {
                return errorCliente(res, 400, "DATOS_INVALIDOS", "Grafica al menos una función para guardarla.");
            }

            const progreso = await asegurar(req.usuario._id);
            progreso.ejercicios.push({
                nombre: recortar(req.body?.nombre, 80) || funciones[0].entrada,
                funciones,
                herramienta: recortar(req.body?.herramienta, 20) || "limite",
                punto: recortar(req.body?.punto, 20) || "0",
                incremento: recortar(req.body?.incremento, 20) || "0.5",
                vista: req.body?.vista && typeof req.body.vista === "object" ? req.body.vista : null,
            });

            await progreso.save();
            const guardado = progreso.ejercicios[progreso.ejercicios.length - 1];
            return res.status(201).json({ ejercicio: guardado });
        } catch (error) {
            return errorSistema(res, "Guardar ejercicio", error);
        }
    }

    async borrarEjercicio(req, res) {
        try {
            const progreso = await asegurar(req.usuario._id);
            const ejercicio = progreso.ejercicios.id(req.params.id);

            if (!ejercicio) {
                return errorCliente(res, 404, "EJERCICIO_NO_ENCONTRADO", "Ese ejercicio no está guardado.");
            }

            ejercicio.deleteOne();
            await progreso.save();
            return res.status(204).end();
        } catch (error) {
            return errorSistema(res, "Borrar ejercicio", error);
        }
    }

    async listarVideos(req, res) {
        try {
            const progreso = await asegurar(req.usuario._id);
            return res.json({ videos: progreso.videos });
        } catch (error) {
            return errorSistema(res, "Listar videos", error);
        }
    }

    async registrarVideo(req, res) {
        try {
            const youtubeId = recortar(req.body?.youtubeId, 20);
            if (!youtubeId) {
                return errorCliente(res, 400, "DATOS_INVALIDOS", "Falta el identificador del video.");
            }

            const progreso = await asegurar(req.usuario._id);
            const ya = progreso.videos.find((v) => v.youtubeId === youtubeId);

            if (!ya) {
                progreso.videos.push({
                    videoId: recortar(req.body?.videoId, 40),
                    youtubeId,
                    titulo: recortar(req.body?.titulo, 120) || "Video",
                    unidad: recortar(req.body?.unidad, 40),
                    vistoEn: new Date(),
                });
                await progreso.save();
            }

            return res.status(204).end();
        } catch (error) {
            return errorSistema(res, "Registrar video visto", error);
        }
    }

    async listarChats(req, res) {
        try {
            const progreso = await asegurar(req.usuario._id);
            return res.json({
                chats: [...progreso.chats].sort((a, b) => new Date(b.actualizado) - new Date(a.actualizado)),
            });
        } catch (error) {
            return errorSistema(res, "Listar chats", error);
        }
    }

    async guardarChat(req, res) {
        try {
            const mensajes = Array.isArray(req.body?.mensajes)
                ? req.body.mensajes.slice(0, 80).map((m) => ({
                    from: m?.from === "user" ? "user" : "bot",
                    text: recortar(m?.text, 4000),
                    at: new Date(),
                })).filter((m) => m.text)
                : [];

            if (!mensajes.length) {
                return errorCliente(res, 400, "DATOS_INVALIDOS", "No hay mensajes para guardar.");
            }

            const progreso = await asegurar(req.usuario._id);
            const id = req.body?.id;
            const titulo = recortar(req.body?.titulo, 80)
                || mensajes.find((m) => m.from === "user")?.text.slice(0, 60)
                || "Conversación";
            const tema = recortar(req.body?.tema, 40) || "limites";

            if (id && mongoose.isValidObjectId(id)) {
                const chat = progreso.chats.id(id);
                if (chat) {
                    chat.mensajes = mensajes;
                    chat.titulo = titulo;
                    chat.tema = tema;
                    chat.actualizado = new Date();
                    await progreso.save();
                    return res.json({ chat });
                }
            }

            progreso.chats.push({ titulo, tema, mensajes, actualizado: new Date() });
            await progreso.save();
            return res.status(201).json({ chat: progreso.chats[progreso.chats.length - 1] });
        } catch (error) {
            return errorSistema(res, "Guardar chat", error);
        }
    }
}

export default new progresoController();
