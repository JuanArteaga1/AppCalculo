import ConceptoPrevio from "../schemas/conceptosPrevios.js";
import { validarBloques, ErrorBloque } from "../lib/validarBloques.js";
import { errorCliente, errorSistema } from "../lib/respuestas.js";

const SLUG_VALIDO = /^[a-z0-9-]+$/;

const errorNoEncontrado = (res) =>
    errorCliente(res, 404, "CONCEPTO_NO_ENCONTRADO", "Este contenido no está disponible.");

function normalizarSlug(slug) {
    return typeof slug === "string" ? slug.trim().toLowerCase() : "";
}

function validarCampos({ titulo, slug, orden, contenido }) {
    const errores = [];

    if (typeof titulo !== "string" || !titulo.trim()) {
        errores.push("El título es obligatorio.");
    }

    const slugLimpio = normalizarSlug(slug);
    if (!slugLimpio) {
        errores.push("El slug es obligatorio.");
    } else if (!SLUG_VALIDO.test(slugLimpio)) {
        errores.push("El slug solo puede contener letras minúsculas, números y guiones.");
    }

    const ordenNumero = Number(orden);
    if (!Number.isFinite(ordenNumero)) {
        errores.push("El orden debe ser un número.");
    }

    if (!Array.isArray(contenido)) {
        errores.push("El contenido debe ser una lista de bloques.");
    }

    return { errores, slugLimpio, ordenNumero };
}

function datosPublicos(concepto) {
    return {
        id: concepto._id,
        titulo: concepto.titulo,
        slug: concepto.slug,
        orden: concepto.orden,
        contenido: concepto.contenido ?? [],
        publicado: concepto.publicado,
        actualizado: concepto.updatedAt,
    };
}

class ConceptosPreviosController {
    /** Listado público de conceptos previos publicados. */
    async lista(req, res) {
        try {
            const conceptos = await ConceptoPrevio.find({ publicado: true })
                .sort({ orden: 1, titulo: 1 })
                .select("titulo slug orden publicado updatedAt")
                .lean();

            return res.json({
                conceptos: conceptos.map((c) => ({
                    id: c._id,
                    titulo: c.titulo,
                    slug: c.slug,
                    orden: c.orden,
                    publicado: c.publicado,
                    actualizado: c.updatedAt,
                }))
            });
        } catch (error) {
            return errorSistema(res, "Listar conceptos previos", error);
        }
    }

    /** Detalle público de un concepto previo por slug. */
    async detalle(req, res) {
        try {
            const slug = normalizarSlug(req.params.slug);

            if (!slug) {
                return errorNoEncontrado(res);
            }

            const concepto = await ConceptoPrevio.findOne({ slug, publicado: true }).lean();

            if (!concepto) {
                return errorNoEncontrado(res);
            }

            return res.json({ concepto: datosPublicos(concepto) });
        } catch (error) {
            return errorSistema(res, "Consultar concepto previo", error);
        }
    }

    /** Listado administrativo: todos los conceptos previos. */
    async listaAdmin(req, res) {
        try {
            const conceptos = await ConceptoPrevio.find()
                .sort({ orden: 1, titulo: 1 })
                .lean();

            return res.json({
                conceptos: conceptos.map((c) => ({
                    id: c._id,
                    titulo: c.titulo,
                    slug: c.slug,
                    orden: c.orden,
                    publicado: c.publicado,
                    actualizado: c.updatedAt,
                }))
            });
        } catch (error) {
            return errorSistema(res, "Listar conceptos previos para administrador", error);
        }
    }

    /** Detalle administrativo por id. */
    async detalleAdmin(req, res) {
        try {
            const concepto = await ConceptoPrevio.findById(req.params.id).lean();

            if (!concepto) {
                return errorNoEncontrado(res);
            }

            return res.json({ concepto: datosPublicos(concepto) });
        } catch (error) {
            return errorSistema(res, "Consultar concepto previo para administrador", error);
        }
    }

    /** Crear un concepto previo. */
    async crear(req, res) {
        try {
            const { titulo, slug, orden, contenido, publicado } = req.body ?? {};
            const validacion = validarCampos({ titulo, slug, orden, contenido });

            if (validacion.errores.length > 0) {
                return errorCliente(res, 400, "DATOS_INVALIDOS", validacion.errores.join(" "));
            }

            let bloquesValidados;

            try {
                bloquesValidados = validarBloques(contenido ?? []);
            } catch (error) {
                if (error instanceof ErrorBloque) {
                    return errorCliente(res, 400, "BLOQUES_INVALIDOS", error.message);
                }
                throw error;
            }

            const concepto = await ConceptoPrevio.create({
                titulo: titulo.trim(),
                slug: validacion.slugLimpio,
                contenido: bloquesValidados,
                orden: validacion.ordenNumero,
                publicado: typeof publicado === "boolean" ? publicado : false,
            });

            return res.status(201).json({ concepto: datosPublicos(concepto) });
        } catch (error) {
            if (error?.code === 11000) {
                return errorCliente(res, 409, "SLUG_DUPLICADO", "Ya existe un concepto previo con ese slug.");
            }

            return errorSistema(res, "Crear concepto previo", error);
        }
    }

    /** Actualizar un concepto previo. */
    async actualizar(req, res) {
        try {
            const concepto = await ConceptoPrevio.findById(req.params.id);

            if (!concepto) {
                return errorNoEncontrado(res);
            }

            const { titulo, slug, orden, contenido, publicado } = req.body ?? {};
            const validacion = validarCampos({ titulo, slug, orden, contenido });

            if (validacion.errores.length > 0) {
                return errorCliente(res, 400, "DATOS_INVALIDOS", validacion.errores.join(" "));
            }

            let bloquesValidados;

            try {
                bloquesValidados = validarBloques(contenido ?? []);
            } catch (error) {
                if (error instanceof ErrorBloque) {
                    return errorCliente(res, 400, "BLOQUES_INVALIDOS", error.message);
                }
                throw error;
            }

            concepto.titulo = titulo.trim();
            concepto.slug = validacion.slugLimpio;
            concepto.orden = validacion.ordenNumero;
            concepto.contenido = bloquesValidados;

            if (typeof publicado === "boolean") {
                concepto.publicado = publicado;
            }

            await concepto.save();

            return res.json({ concepto: datosPublicos(concepto) });
        } catch (error) {
            if (error?.code === 11000) {
                return errorCliente(res, 409, "SLUG_DUPLICADO", "Ya existe un concepto previo con ese slug.");
            }

            return errorSistema(res, "Actualizar concepto previo", error);
        }
    }

    /** Cambiar el estado publicado de un concepto previo. */
    async cambiarPublicado(req, res) {
        try {
            if (typeof req.body?.publicado !== "boolean") {
                return errorCliente(
                    res,
                    400,
                    "ESTADO_INVALIDO",
                    "Debes indicar si el concepto previo estará publicado o no."
                );
            }

            const concepto = await ConceptoPrevio.findById(req.params.id);

            if (!concepto) {
                return errorNoEncontrado(res);
            }

            concepto.publicado = req.body.publicado;
            await concepto.save();

            return res.json({ concepto: datosPublicos(concepto) });
        } catch (error) {
            return errorSistema(res, "Cambiar publicación de concepto previo", error);
        }
    }

    /** Eliminar un concepto previo. */
    async eliminar(req, res) {
        try {
            const concepto = await ConceptoPrevio.findByIdAndDelete(req.params.id);

            if (!concepto) {
                return errorNoEncontrado(res);
            }

            return res.json({ mensaje: "Concepto previo eliminado correctamente." });
        } catch (error) {
            return errorSistema(res, "Eliminar concepto previo", error);
        }
    }
}

export default new ConceptosPreviosController();
