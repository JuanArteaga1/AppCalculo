import { randomUUID } from "node:crypto";
import Modulo from "../schemas/modulos.js";
import Tema from "../schemas/temas.js";
import Video from "../schemas/videos.js";
import { errorCliente, errorSistema } from "../lib/respuestas.js";
import { ErrorBloque, validarVideos } from "../lib/validarBloques.js";
import { filtroTemasVisibles } from "../lib/visibilidad.js";

class videoController {
    /** Videoteca: solo videos de temas visibles para quien consulta. */
    async lista(req, res) {
        try {
            const [modulos, temas] = await Promise.all([
                Modulo.find().select("clave titulo orden").sort({ orden: 1 }).lean(),
                Tema.find(filtroTemasVisibles(req.usuario))
                    .select("_id modulo numero titulo orden")
                    .lean(),
            ]);

            const porId = new Map(temas.map((tema) => [String(tema._id), tema]));
            const videos = await Video.find({ temaId: { $in: temas.map((tema) => tema._id) } }).lean();

            const ordenModulo = new Map(modulos.map((modulo, i) => [modulo.clave, i]));
            const ordenados = videos.sort((a, b) => (
                (ordenModulo.get(a.modulo) ?? Number.MAX_SAFE_INTEGER) - (ordenModulo.get(b.modulo) ?? Number.MAX_SAFE_INTEGER)
                || (porId.get(String(a.temaId))?.orden ?? 0) - (porId.get(String(b.temaId))?.orden ?? 0)
                || a.orden - b.orden
            ));

            const usados = new Set(videos.map((video) => video.modulo));

            return res.json({
                modulos: modulos
                    .filter((modulo) => usados.has(modulo.clave))
                    .map((modulo) => ({ id: modulo.clave, titulo: modulo.titulo })),
                videos: ordenados.map((video) => {
                    const tema = porId.get(String(video.temaId));

                    return {
                        id: String(video._id),
                        videoId: video.videoId,
                        modulo: video.modulo,
                        numero: video.numero,
                        temaTitulo: tema?.titulo ?? "",
                        titulo: video.titulo,
                        descripcion: video.descripcion,
                        youtubeId: video.youtubeId,
                        url: video.url,
                        orden: video.orden,
                    };
                }),
            });
        } catch (error) {
            return errorSistema(res, "Listar videoteca", error);
        }
    }

    /**
     * Importa un video guardado en el navegador. Se agrega al borrador del tema
     * porque el editor es la única fuente de verdad; aparece en la videoteca
     * cuando el administrador publica ese tema.
     */
    async importar(req, res) {
        try {
            const modulo = String(req.body?.modulo ?? "").trim();
            const numero = String(req.body?.tema ?? "").trim();

            if (!modulo || !numero) {
                return errorCliente(res, 400, "TEMA_REQUERIDO", "Selecciona el módulo y el tema del video.");
            }

            const tema = await Tema.findOne({ modulo, numero });

            if (!tema) {
                return errorCliente(res, 404, "TEMA_NO_ENCONTRADO", "Ese tema no existe.");
            }

            if (tema.eliminado) {
                return errorCliente(res, 409, "TEMA_EN_PAPELERA", "Ese tema está en la papelera. Restáuralo para editarlo.");
            }

            const fuente = tema.borrador ?? {
                titulo: tema.titulo,
                descripcion: tema.descripcion,
                bloques: tema.bloques,
                videos: tema.videos ?? [],
                practicas: tema.practicas ?? [],
            };

            const nuevo = {
                id: randomUUID(),
                url: String(req.body?.url ?? "").trim(),
                titulo: String(req.body?.titulo ?? "").trim() || "Video de YouTube",
                descripcion: String(req.body?.descripcion ?? "").trim(),
            };

            const videos = validarVideos([...(fuente.videos ?? []), nuevo]);
            const ultimo = videos[videos.length - 1];

            if (videos.filter((video) => video.url === ultimo.url).length > 1) {
                return errorCliente(res, 409, "VIDEO_DUPLICADO", "Ese video ya está en el tema.");
            }

            tema.borrador = {
                titulo: fuente.titulo,
                descripcion: fuente.descripcion,
                bloques: fuente.bloques,
                videos,
                practicas: fuente.practicas ?? [],
            };
            await tema.save();

            return res.status(201).json({
                mensaje: "Video agregado al borrador del tema.",
                requierePublicar: true,
                tema: {
                    modulo: tema.modulo,
                    numero: tema.numero,
                    titulo: tema.borrador.titulo,
                },
            });
        } catch (error) {
            if (error instanceof ErrorBloque) {
                return errorCliente(res, 400, "CONTENIDO_INVALIDO", error.message);
            }

            return errorSistema(res, "Importar video", error);
        }
    }
}

export default new videoController();
