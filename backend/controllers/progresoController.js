import mongoose from "mongoose";
import Modulo from "../schemas/modulos.js";
import Tema from "../schemas/temas.js";
import Progreso from "../schemas/progreso.js";
import { errorCliente, errorSistema } from "../lib/respuestas.js";
import {
    filtroTemasDelCurso,
    filtroTemasVisibles,
    MODULO_CONCEPTOS_PREVIOS,
} from "../lib/visibilidad.js";
import Evaluacion from "../schemas/evaluaciones.js";
import RespuestasQuiz from "../schemas/respuestasQuiz.js";

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
                Modulo.find({ clave: { $ne: MODULO_CONCEPTOS_PREVIOS } }).sort({ orden: 1 }).lean(),
                Tema.find(filtroTemasDelCurso(req.usuario)).select(CAMPOS_TEMA).sort({ orden: 1 }).lean(),
            ]);

            // Lo que el estudiante visitó antes de que un tema pasara a privado
            // o a la papelera deja de contar.
            const clavesVisibles = new Set(temas.map((t) => `${t.modulo}/${t.numero}`));
            const visitados = new Set(
                progreso.temas
                    .map((t) => `${t.modulo}/${t.tema}`)
                    .filter((clave) => clavesVisibles.has(clave)),
            );
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

            const ultimo = [...progreso.temas]
                .filter((t) => clavesVisibles.has(`${t.modulo}/${t.tema}`))
                .sort((a, b) => new Date(b.ultimaVisita) - new Date(a.ultimaVisita))[0] ?? null;

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

        /** Consultar el progreso de los estudiantes que respondieron quices del docente. */
    async progresoEstudiantesDocente(req, res) {
        try {
            // Solo se consultan quices pertenecientes al docente autenticado.
            const quices = await Evaluacion.find({
                docente: req.usuario._id
            }).select("_id").lean();

            if (!quices.length) {
                return res.json({ estudiantes: [] });
            }

            // Identificar estudiantes que realmente respondieron esos quices.
            const respuestas = await RespuestasQuiz.find({
                evaluacion: { $in: quices.map((quiz) => quiz._id) },
                nota: { $ne: null }
            })
                .populate("estudiante", "nombre correo")
                .sort({ fechaRespuesta: -1 })
                .lean();

            const estudiantesPorId = new Map();

            for (const respuesta of respuestas) {
                const estudiante = respuesta.estudiante;

                if (!estudiante) continue;

                const id = String(estudiante._id);

                if (!estudiantesPorId.has(id)) {
                    estudiantesPorId.set(id, {
                        id,
                        nombre: estudiante.nombre ?? "",
                        correo: estudiante.correo ?? ""
                    });
                }
            }

            const estudiantes = Array.from(estudiantesPorId.values());

            if (!estudiantes.length) {
                return res.json({ estudiantes: [] });
            }

            const idsEstudiantes = estudiantes.map((estudiante) => estudiante.id);

            // Recuperar los progresos existentes sin crear documentos nuevos.
            const [progresos, modulos, temas] = await Promise.all([
                Progreso.find({
                    usuario: { $in: idsEstudiantes }
                }).lean(),

                Modulo.find({
                    clave: { $ne: MODULO_CONCEPTOS_PREVIOS }
                }).sort({ orden: 1 }).lean(),

                Tema.find(
                    filtroTemasDelCurso(req.usuario)
                ).select(CAMPOS_TEMA).sort({ orden: 1 }).lean()
            ]);

            const progresosPorUsuario = new Map(
                progresos.map((progreso) => [
                    String(progreso.usuario),
                    progreso
                ])
            );

            const estudiantesConProgreso = estudiantes.map((estudiante) => {
                const progreso = progresosPorUsuario.get(estudiante.id);

                const temasRegistrados = progreso?.temas ?? [];
                const clavesVisibles = new Set(
                    temas.map((tema) => `${tema.modulo}/${tema.numero}`)
                );

                const visitados = new Set(
                    temasRegistrados
                        .map((tema) => `${tema.modulo}/${tema.tema}`)
                        .filter((clave) => clavesVisibles.has(clave))
                );

                const porModulo = modulos.map((modulo) => {
                    const temasDelModulo = temas.filter(
                        (tema) => tema.modulo === modulo.clave
                    );

                    const vistos = temasDelModulo.filter(
                        (tema) => visitados.has(`${tema.modulo}/${tema.numero}`)
                    ).length;

                    const total = temasDelModulo.length;

                    const siguiente = temasDelModulo.find(
                        (tema) => !visitados.has(`${tema.modulo}/${tema.numero}`)
                    );

                    return {
                        id: modulo.clave,
                        nombre: modulo.titulo,
                        pct: total ? Math.round((vistos / total) * 100) : 0,
                        temas: `${vistos} de ${total} temas`,
                        sigue: siguiente
                            ? `${siguiente.numero} ${siguiente.titulo}`
                            : (total ? "Módulo completado" : "Sin temas aún")
                    };
                });

                const ultimo = [...temasRegistrados]
                    .filter((tema) =>
                        clavesVisibles.has(`${tema.modulo}/${tema.tema}`)
                    )
                    .sort(
                        (a, b) =>
                            new Date(b.ultimaVisita) - new Date(a.ultimaVisita)
                    )[0] ?? null;

                const totalTemas = temas.length;
                const temasVisitados = visitados.size;

                return {
                    ...estudiante,
                    pctGeneral: totalTemas
                        ? Math.round((temasVisitados / totalTemas) * 100)
                        : 0,
                    totalTemas,
                    temasVisitados,
                    porModulo,
                    ultimo: ultimo
                        ? {
                            modulo: ultimo.modulo,
                            tema: ultimo.tema,
                            titulo: ultimo.titulo || ultimo.tema,
                            primeraVisita: ultimo.primeraVisita,
                            ultimaVisita: ultimo.ultimaVisita
                        }
                        : null,
                    videosVistos: progreso?.videos?.length ?? 0,
                    ejerciciosGuardados: progreso?.ejercicios?.length ?? 0
                };
            });

            return res.json({
                estudiantes: estudiantesConProgreso
            });

        } catch (error) {
            return errorSistema(
                res,
                "Consultar progreso de estudiantes del docente",
                error
            );
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

            const visible = await Tema.exists({
                modulo,
                numero: tema,
                ...filtroTemasVisibles(req.usuario),
            });

            if (!visible) {
                return errorCliente(res, 404, "TEMA_NO_ENCONTRADO", "Ese tema no existe.");
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
