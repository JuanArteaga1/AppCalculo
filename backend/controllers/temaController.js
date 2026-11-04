import Modulo from "../schemas/modulos.js";
import Tema from "../schemas/temas.js";
import VersionTema from "../schemas/versionesTema.js";
import { errorCliente, errorSistema } from "../lib/respuestas.js";
import {
    ErrorBloque,
    validarBloques,
    validarEncabezado,
    validarPracticas,
    validarVideos,
} from "../lib/validarBloques.js";

const CAMPOS_LISTA = "modulo numero orden titulo descripcion version borrador updatedAt";

function responderError(res, error, contexto) {
    if (error instanceof ErrorBloque) {
        return errorCliente(res, 400, "CONTENIDO_INVALIDO", error.message);
    }

    return errorSistema(res, contexto, error);
}

const temaNoExiste = (res) => errorCliente(res, 404, "TEMA_NO_ENCONTRADO", "Ese tema no existe.");

async function cursoCompleto() {
    const [modulos, temas] = await Promise.all([
        Modulo.find().sort({ orden: 1 }).lean(),
        Tema.find().select(CAMPOS_LISTA).sort({ orden: 1 }).lean(),
    ]);

    return { modulos, temas };
}

const buscar = ({ modulo, numero }) => Tema.findOne({ modulo: String(modulo), numero: String(numero) });

/** Lo que edita el administrador: el borrador si lo hay; si no, lo publicado. */
function paraEditar(tema) {
    const fuente = tema.borrador ?? tema;

    return {
        modulo: tema.modulo,
        numero: tema.numero,
        titulo: fuente.titulo,
        descripcion: fuente.descripcion,
        bloques: fuente.bloques,
        videos: fuente.videos ?? tema.videos ?? [],
        practicas: fuente.practicas ?? tema.practicas ?? [],
        tieneBorrador: Boolean(tema.borrador),
        version: tema.version,
        publicadoPor: tema.publicadoPor,
        actualizado: tema.updatedAt,
    };
}

class temaController {
    /** Índice público del curso, sin el contenido de cada tema. */
    async curso(req, res) {
        try {
            const { modulos, temas } = await cursoCompleto();

            return res.json({
                modulos: modulos.map((m) => ({
                    id: m.clave,
                    titulo: m.titulo,
                    descripcion: m.descripcion,
                    icono: m.icono,
                    color: m.color,
                    temas: temas
                        .filter((t) => t.modulo === m.clave)
                        .map((t) => ({ id: t.numero, titulo: t.titulo, descripcion: t.descripcion })),
                })),
            });
        } catch (error) {
            return responderError(res, error, "No se pudo cargar el curso.");
        }
    }

    /** Tema publicado: el borrador nunca sale por esta ruta. */
    async publicado(req, res) {
        try {
            const tema = await buscar(req.params).lean();

            if (!tema) {
                return temaNoExiste(res);
            }

            return res.json({
                id: tema.numero,
                modulo: tema.modulo,
                titulo: tema.titulo,
                descripcion: tema.descripcion,
                bloques: tema.bloques,
                videos: tema.videos,
                practicas: tema.practicas ?? [],
            });
        } catch (error) {
            return responderError(res, error, "No se pudo cargar el tema.");
        }
    }

    async listaAdmin(req, res) {
        try {
            const { modulos, temas } = await cursoCompleto();

            return res.json({
                modulos: modulos.map((m) => ({
                    id: m.clave,
                    titulo: m.titulo,
                    descripcion: m.descripcion,
                    temas: temas
                        .filter((t) => t.modulo === m.clave)
                        .map((t) => ({
                            id: t.numero,
                            titulo: t.borrador?.titulo ?? t.titulo,
                            tieneBorrador: Boolean(t.borrador),
                            version: t.version,
                            actualizado: t.updatedAt,
                        })),
                })),
            });
        } catch (error) {
            return responderError(res, error, "No se pudo cargar el curso.");
        }
    }

    async detalleAdmin(req, res) {
        try {
            const tema = await buscar(req.params);

            if (!tema) {
                return temaNoExiste(res);
            }

            return res.json(paraEditar(tema));
        } catch (error) {
            return responderError(res, error, "No se pudo cargar el tema.");
        }
    }

    async guardarBorrador(req, res) {
        try {
            const tema = await buscar(req.params);

            if (!tema) {
                return temaNoExiste(res);
            }

            tema.borrador = {
                ...validarEncabezado(req.body),
                bloques: validarBloques(req.body.bloques),
                videos: validarVideos(req.body.videos ?? []),
                practicas: validarPracticas(req.body.practicas ?? []),
            };
            await tema.save();

            return res.json(paraEditar(tema));
        } catch (error) {
            return responderError(res, error, "No se pudo guardar el borrador.");
        }
    }

    async descartarBorrador(req, res) {
        try {
            const tema = await buscar(req.params);

            if (!tema) {
                return temaNoExiste(res);
            }

            tema.borrador = null;
            await tema.save();

            return res.json(paraEditar(tema));
        } catch (error) {
            return responderError(res, error, "No se pudo descartar el borrador.");
        }
    }

    /** Publica el borrador y deja la versión anterior en el historial. */
    async publicar(req, res) {
        try {
            const tema = await buscar(req.params);

            if (!tema) {
                return temaNoExiste(res);
            }

            if (!tema.borrador) {
                return errorCliente(res, 409, "SIN_CAMBIOS", "No hay cambios para publicar.");
            }

            const { titulo, descripcion, bloques, videos, practicas } = tema.borrador;
            const limpio = {
                ...validarEncabezado({ titulo, descripcion }),
                bloques: validarBloques(bloques),
                videos: validarVideos(videos ?? tema.videos ?? []),
                practicas: validarPracticas(practicas ?? tema.practicas ?? []),
            };

            await VersionTema.create({
                tema: tema._id,
                version: tema.version,
                titulo: tema.titulo,
                descripcion: tema.descripcion,
                bloques: tema.bloques,
                videos: tema.videos ?? [],
                practicas: tema.practicas ?? [],
                publicadoPor: tema.publicadoPor,
            });

            Object.assign(tema, limpio, {
                borrador: null,
                version: tema.version + 1,
                publicadoPor: req.usuario.nombre ?? req.usuario.correo,
            });
            await tema.save();

            return res.json(paraEditar(tema));
        } catch (error) {
            return responderError(res, error, "No se pudo publicar el tema.");
        }
    }

    async versiones(req, res) {
        try {
            const tema = await buscar(req.params);

            if (!tema) {
                return temaNoExiste(res);
            }

            const versiones = await VersionTema.find({ tema: tema._id })
                .select("version titulo publicadoPor createdAt")
                .sort({ version: -1 })
                .limit(30)
                .lean();

            return res.json({ versiones });
        } catch (error) {
            return responderError(res, error, "No se pudo cargar el historial.");
        }
    }

    /** Restaurar no publica: deja la versión como borrador para revisarla antes. */
    async restaurar(req, res) {
        try {
            const tema = await buscar(req.params);

            if (!tema) {
                return temaNoExiste(res);
            }

            const version = await VersionTema.findOne({
                tema: tema._id,
                version: Number(req.params.version),
            }).lean();

            if (!version) {
                return errorCliente(res, 404, "VERSION_NO_ENCONTRADA", "Esa versión no existe.");
            }

            tema.borrador = {
                titulo: version.titulo,
                descripcion: version.descripcion,
                bloques: version.bloques,
                // Las versiones antiguas no traen estos campos: se conservan los actuales.
                videos: version.videos ?? tema.videos ?? [],
                practicas: version.practicas ?? tema.practicas ?? [],
            };
            await tema.save();

            return res.json(paraEditar(tema));
        } catch (error) {
            return responderError(res, error, "No se pudo restaurar la versión.");
        }
    }
}

export default new temaController();
