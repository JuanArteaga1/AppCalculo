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
import {
    filtroNoEliminados,
    filtroTemasDelCurso,
    esTemaVisible,
    MODULO_CONCEPTOS_PREVIOS,
    VISIBILIDADES,
    VISIBILIDAD_PRIVADA,
    VISIBILIDAD_PUBLICA,
} from "../lib/visibilidad.js";
import { eliminarVideosTema, sincronizarVideosTema } from "../lib/videoteca.js";

const CAMPOS_LISTA = "modulo numero orden titulo descripcion version borrador visibilidad eliminado updatedAt";

function responderError(res, error, contexto) {
    if (error instanceof ErrorBloque) {
        return errorCliente(res, 400, "CONTENIDO_INVALIDO", error.message);
    }

    return errorSistema(res, contexto, error);
}

const temaNoExiste = (res) => errorCliente(res, 404, "TEMA_NO_ENCONTRADO", "Ese tema no existe.");

const temaEnPapelera = (res) => errorCliente(
    res,
    409,
    "TEMA_EN_PAPELERA",
    "Ese tema está en la papelera. Restáuralo para editarlo.",
);

async function cursoCompleto(filtroTemas) {
    const [modulos, temas] = await Promise.all([
        Modulo.find({ clave: { $ne: MODULO_CONCEPTOS_PREVIOS } }).sort({ orden: 1 }).lean(),
        Tema.find(filtroTemas).select(CAMPOS_LISTA).sort({ orden: 1 }).lean(),
    ]);

    return { modulos, temas };
}

async function listaAdministrador() {
    const [modulos, temas] = await Promise.all([
        Modulo.find().sort({ orden: 1 }).lean(),
        Tema.find(filtroNoEliminados).select(CAMPOS_LISTA).sort({ orden: 1 }).lean(),
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
        visibilidad: tema.visibilidad ?? VISIBILIDAD_PUBLICA,
        eliminado: Boolean(tema.eliminado),
        eliminadoEn: tema.eliminadoEn ?? null,
        version: tema.version,
        publicadoPor: tema.publicadoPor,
        actualizado: tema.updatedAt,
    };
}

function datosPapelera(tema, moduloTitulo) {
    return {
        modulo: tema.modulo,
        moduloTitulo,
        numero: tema.numero,
        titulo: tema.borrador?.titulo ?? tema.titulo,
        version: tema.version,
        eliminadoEn: tema.eliminadoEn,
        actualizado: tema.updatedAt,
    };
}

class temaController {
    /** Índice público del curso, sin el contenido de cada tema. */
    async curso(req, res) {
        try {
            const { modulos, temas } = await cursoCompleto(filtroTemasDelCurso(req.usuario));

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

            // Privado o en papelera: 404 también para docentes y anónimos.
            if (!esTemaVisible(tema, req.usuario)) {
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
            const { modulos, temas } = await listaAdministrador();

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
                            visibilidad: t.visibilidad ?? VISIBILIDAD_PUBLICA,
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

    /** Crea un tema vacío; el contenido se escribe después con el editor. */
    async crear(req, res) {
        try {
            const moduloClave = String(req.body?.modulo ?? "").trim();
            const numero = String(req.body?.numero ?? "").trim();

            if (!moduloClave) {
                return errorCliente(res, 400, "MODULO_REQUERIDO", "Selecciona el módulo del tema.");
            }

            if (!numero || numero.length > 20) {
                return errorCliente(res, 400, "NUMERO_INVALIDO", "Escribe un número de tema de hasta 20 caracteres.");
            }

            if (!(await Modulo.exists({ clave: moduloClave }))) {
                return errorCliente(res, 400, "MODULO_NO_ENCONTRADO", "Selecciona un módulo válido.");
            }

            // Un tema nuevo nace privado; el administrador lo publica cuando esté listo.
            const visibilidad = req.body?.visibilidad ?? VISIBILIDAD_PRIVADA;

            if (!VISIBILIDADES.includes(visibilidad)) {
                return errorCliente(res, 400, "VISIBILIDAD_INVALIDA", "La visibilidad debe ser pública o privada.");
            }

            const { titulo, descripcion } = validarEncabezado(req.body ?? {});
            const ultimo = await Tema.findOne({ modulo: moduloClave }).sort({ orden: -1 }).select("orden").lean();

            const tema = await Tema.create({
                modulo: moduloClave,
                numero,
                orden: (ultimo?.orden ?? -1) + 1,
                titulo,
                descripcion,
                visibilidad,
                bloques: [],
                videos: [],
                practicas: [],
            });

            return res.status(201).json(paraEditar(tema));
        } catch (error) {
            if (error?.code === 11000) {
                return errorCliente(res, 409, "TEMA_DUPLICADO", "Ya existe un tema con ese número en el módulo.");
            }

            return responderError(res, error, "No se pudo crear el tema.");
        }
    }

    async cambiarVisibilidad(req, res) {
        try {
            const tema = await buscar(req.params);

            if (!tema) {
                return temaNoExiste(res);
            }

            if (tema.eliminado) {
                return temaEnPapelera(res);
            }

            const visibilidad = req.body?.visibilidad;

            if (!VISIBILIDADES.includes(visibilidad)) {
                return errorCliente(res, 400, "VISIBILIDAD_INVALIDA", "La visibilidad debe ser pública o privada.");
            }

            tema.visibilidad = visibilidad;
            await tema.save();

            return res.json(paraEditar(tema));
        } catch (error) {
            return responderError(res, error, "No se pudo cambiar la visibilidad.");
        }
    }

    /** Mueve el tema a la papelera; no borra su contenido ni su historial. */
    async eliminar(req, res) {
        try {
            const tema = await buscar(req.params);

            if (!tema) {
                return temaNoExiste(res);
            }

            if (tema.eliminado) {
                return errorCliente(res, 409, "TEMA_EN_PAPELERA", "Ese tema ya está en la papelera.");
            }

            tema.eliminado = true;
            tema.eliminadoEn = new Date();
            await tema.save();

            return res.json({
                mensaje: "Tema movido a la papelera.",
                tema: { modulo: tema.modulo, numero: tema.numero, titulo: tema.titulo, eliminadoEn: tema.eliminadoEn },
            });
        } catch (error) {
            return responderError(res, error, "No se pudo mover el tema a la papelera.");
        }
    }

    async papelera(req, res) {
        try {
            const temas = await Tema.find({ eliminado: true })
                .select("modulo numero titulo borrador version eliminadoEn updatedAt")
                .sort({ eliminadoEn: -1 })
                .lean();

            const claves = [...new Set(temas.map((tema) => tema.modulo))];
            const modulos = await Modulo.find({ clave: { $in: claves } }).select("clave titulo").lean();
            const titulos = new Map(modulos.map((modulo) => [modulo.clave, modulo.titulo]));

            return res.json({
                temas: temas.map((tema) => datosPapelera(tema, titulos.get(tema.modulo) ?? tema.modulo)),
            });
        } catch (error) {
            return responderError(res, error, "No se pudo cargar la papelera.");
        }
    }

    async restaurarPapelera(req, res) {
        try {
            const tema = await buscar(req.params);

            if (!tema) {
                return temaNoExiste(res);
            }

            if (!tema.eliminado) {
                return errorCliente(res, 409, "TEMA_NO_ELIMINADO", "Ese tema no está en la papelera.");
            }

            tema.eliminado = false;
            tema.eliminadoEn = null;
            await tema.save();

            return res.json(paraEditar(tema));
        } catch (error) {
            return responderError(res, error, "No se pudo restaurar el tema.");
        }
    }

    /** Borrado real e irreversible: exige confirmación explícita del panel. */
    async eliminarDefinitivo(req, res) {
        try {
            const tema = await buscar(req.params);

            if (!tema) {
                return temaNoExiste(res);
            }

            if (!tema.eliminado) {
                return errorCliente(res, 409, "TEMA_NO_ELIMINADO", "Primero mueve el tema a la papelera.");
            }

            if (req.body?.confirmar !== true) {
                return errorCliente(
                    res,
                    400,
                    "CONFIRMACION_REQUERIDA",
                    "Confirma que quieres eliminar el tema definitivamente.",
                );
            }

            await VersionTema.deleteMany({ tema: tema._id });
            await Tema.deleteOne({ _id: tema._id });
            await eliminarVideosTema(tema._id);

            return res.json({ mensaje: "Tema eliminado definitivamente." });
        } catch (error) {
            return responderError(res, error, "No se pudo eliminar el tema definitivamente.");
        }
    }

    async guardarBorrador(req, res) {
        try {
            const tema = await buscar(req.params);

            if (!tema) {
                return temaNoExiste(res);
            }

            if (tema.eliminado) {
                return temaEnPapelera(res);
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

            if (tema.eliminado) {
                return temaEnPapelera(res);
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

            if (tema.eliminado) {
                return temaEnPapelera(res);
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

            try {
                await sincronizarVideosTema(tema);
            } catch (error) {
                console.error("No se pudo sincronizar la videoteca del tema", error);
            }

            return res.json(paraEditar(tema));
        } catch (error) {
            return responderError(res, error, "No se pudo publicar el tema.");
        }
    }

    /** Ejercicios de práctica tal como los ve el editor: borrador primero. */
    async practicas(req, res) {
        try {
            const [modulos, temas] = await Promise.all([
                Modulo.find().select("clave titulo orden").sort({ orden: 1 }).lean(),
                Tema.find(filtroNoEliminados)
                    .select("modulo numero orden titulo borrador practicas visibilidad")
                    .sort({ orden: 1 })
                    .lean(),
            ]);

            return res.json({
                modulos: modulos.map((modulo) => ({
                    id: modulo.clave,
                    titulo: modulo.titulo,
                    temas: temas
                        .filter((tema) => tema.modulo === modulo.clave)
                        .map((tema) => ({
                            id: tema.numero,
                            titulo: tema.borrador?.titulo ?? tema.titulo,
                            tieneBorrador: Boolean(tema.borrador),
                            visibilidad: tema.visibilidad ?? VISIBILIDAD_PUBLICA,
                            practicas: tema.borrador?.practicas ?? tema.practicas ?? [],
                        })),
                })),
            });
        } catch (error) {
            return responderError(res, error, "No se pudieron cargar los ejercicios.");
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

            if (tema.eliminado) {
                return temaEnPapelera(res);
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
