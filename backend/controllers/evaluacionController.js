import mongoose from "mongoose";
import Evaluacion from "../schemas/evaluaciones.js";
import RespuestasQuiz from "../schemas/respuestasQuiz.js";
import Modulo from "../schemas/modulos.js";
import Tema from "../schemas/temas.js";
import { errorCliente, errorSistema } from "../lib/respuestas.js";
import { esAdministrador, filtroTemasVisibles, soloTemasVisibles } from "../lib/visibilidad.js";

const esIdValido = (id) => mongoose.Types.ObjectId.isValid(id);

const errorNoEncontrado = (res) =>
    errorCliente(res, 404, "EVALUACION_NO_ENCONTRADA", "Ese quiz no existe.");

function responderError(res, error, contexto) {
    // Un índice único evita que un estudiante responda dos veces.
    if (error?.code === 11000) {
        return errorCliente(
            res,
            409,
            "QUIZ_YA_RESPONDIDO",
            "Ya respondiste este quiz."
        );
    }

    if (error instanceof mongoose.Error.ValidationError) {
        return errorCliente(
            res,
            400,
            "DATOS_INVALIDOS",
            "Revisa los datos enviados."
        );
    }

    return errorSistema(res, contexto, error);
}

/**
 * Las fechas recibidas sin zona horaria se interpretan como hora de Colombia.
 * También se aceptan fechas ISO que ya incluyan Z o un desplazamiento horario.
 */
function interpretarFechaColombia(valor) {
    if (typeof valor !== "string" || !valor.trim()) {
        return null;
    }

    const fechaConZona = /(?:Z|[+-]\d{2}:\d{2})$/i.test(valor);
    const fecha = new Date(
        fechaConZona ? valor : `${valor}-05:00`
    );

    return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/**
 * Suma meses de calendario tomando como referencia la hora de Colombia.
 * Si el mes de destino tiene menos días, utiliza su último día.
 */
function sumarMesesColombia(fecha, meses) {
    const desplazamiento = 5 * 60 * 60 * 1000;
    const local = new Date(fecha.getTime() - desplazamiento);

    const anio = local.getUTCFullYear();
    const mes = local.getUTCMonth() + meses;
    const dia = local.getUTCDate();

    const hora = local.getUTCHours();
    const minuto = local.getUTCMinutes();
    const segundo = local.getUTCSeconds();
    const milisegundo = local.getUTCMilliseconds();

    const primerDiaDestino = new Date(Date.UTC(anio, mes, 1));
    const ultimoDiaDestino = new Date(
        Date.UTC(
            primerDiaDestino.getUTCFullYear(),
            primerDiaDestino.getUTCMonth() + 1,
            0
        )
    ).getUTCDate();

    const fechaDestino = new Date(Date.UTC(
        primerDiaDestino.getUTCFullYear(),
        primerDiaDestino.getUTCMonth(),
        Math.min(dia, ultimoDiaDestino),
        hora,
        minuto,
        segundo,
        milisegundo
    ));

    return new Date(fechaDestino.getTime() + desplazamiento);
}

function validarFechaLimite(valor) {
    const fecha = interpretarFechaColombia(valor);

    if (!fecha) {
        return {
            valida: false,
            mensaje: "La fecha límite no tiene un formato válido."
        };
    }

    const ahora = new Date();
    const maximo = sumarMesesColombia(ahora, 6);

    if (fecha <= ahora) {
        return {
            valida: false,
            mensaje: "La fecha límite debe ser futura."
        };
    }

    if (fecha > maximo) {
        return {
            valida: false,
            mensaje: "La fecha límite no puede superar los seis meses."
        };
    }

    return { valida: true, fecha };
}

/**
 * Convierte las preguntas recibidas en una estructura segura.
 * En borradores se permiten preguntas incompletas.
 * Al publicar, todas deben cumplir las reglas del quiz.
 */
function prepararPreguntas(preguntas, exigirCompletas = false) {
    if (!Array.isArray(preguntas)) {
        throw new Error("Las preguntas deben enviarse como una lista.");
    }

    if (exigirCompletas && preguntas.length === 0) {
        throw new Error("El quiz debe tener al menos una pregunta.");
    }

    return preguntas.map((pregunta, indice) => {
        const enunciado = typeof pregunta?.enunciado === "string"
            ? pregunta.enunciado.trim()
            : "";

        const opciones = Array.isArray(pregunta?.opciones)
            ? pregunta.opciones.map((opcion) =>
                typeof opcion === "string" ? opcion.trim() : ""
            )
            : [];

        const respuestaCorrecta = pregunta?.respuestaCorrecta;

        if (exigirCompletas) {
            if (!enunciado) {
                throw new Error(`La pregunta ${indice + 1} no tiene enunciado.`);
            }

            if (opciones.length < 2 || opciones.length > 5) {
                throw new Error(
                    `La pregunta ${indice + 1} debe tener entre 2 y 5 opciones.`
                );
            }

            if (opciones.some((opcion) => !opcion)) {
                throw new Error(
                    `La pregunta ${indice + 1} tiene opciones vacías.`
                );
            }

            if (
                !Number.isInteger(respuestaCorrecta) ||
                respuestaCorrecta < 0 ||
                respuestaCorrecta >= opciones.length
            ) {
                throw new Error(
                    `Selecciona una respuesta correcta válida para la pregunta ${indice + 1}.`
                );
            }
        } else {
            if (opciones.length > 5) {
                throw new Error(
                    `La pregunta ${indice + 1} no puede tener más de 5 opciones.`
                );
            }

            if (
                respuestaCorrecta !== null &&
                respuestaCorrecta !== undefined &&
                (
                    !Number.isInteger(respuestaCorrecta) ||
                    respuestaCorrecta < 0 ||
                    respuestaCorrecta >= opciones.length
                )
            ) {
                throw new Error(
                    `La respuesta correcta de la pregunta ${indice + 1} no es válida.`
                );
            }
        }

        return {
            ...(pregunta?._id && esIdValido(String(pregunta._id))
                ? { _id: pregunta._id }
                : {}),
            enunciado,
            opciones,
            respuestaCorrecta:
                respuestaCorrecta === undefined ? null : respuestaCorrecta
        };
    });
}

async function buscarModulo(valor) {
    if (!valor) {
        return null;
    }

    if (esIdValido(String(valor))) {
        const modulo = await Modulo.findById(valor);
        if (modulo) return modulo;
    }

    return Modulo.findOne({ clave: String(valor).trim() });
}

const MAXIMO_TEMAS = 50;

const moduloInvalido = (res) => errorCliente(
    res,
    400,
    "MODULO_NO_ENCONTRADO",
    "Selecciona uno de los módulos del curso."
);

const temasRequeridos = (res) => errorCliente(
    res,
    400,
    "TEMAS_REQUERIDOS",
    "Selecciona al menos un tema del módulo."
);

const temaInvalido = (res) => errorCliente(
    res,
    400,
    "TEMA_INVALIDO",
    "Uno de los temas no existe o no pertenece al módulo seleccionado."
);

/**
 * Busca los temas por número ("1.1") o por id, todos del módulo indicado.
 * Devuelve sus ids, o null si alguno no existe o es de otro módulo.
 * Todos los temas guardados están publicados: el borrador del administrador
 * vive dentro de cada tema y nunca se lista aparte (BR-05).
 */
async function buscarTemasDelModulo(valores, modulo, usuario) {
    const unicos = [...new Set(valores.map((valor) => String(valor).trim()))];
    const ids = unicos.filter((valor) => /^[a-fA-F0-9]{24}$/.test(valor));
    const numeros = unicos.filter((valor) => !ids.includes(valor));

    const encontrados = await Tema.find({
        modulo: modulo.clave,
        ...filtroTemasVisibles(usuario),
        $or: [{ _id: { $in: ids } }, { numero: { $in: numeros } }]
    }).select("_id numero orden").sort({ orden: 1 }).lean();

    const reconocidos = new Set(
        encontrados.flatMap((tema) => [String(tema._id), tema.numero])
    );

    if (unicos.some((valor) => !reconocidos.has(valor))) {
        return null;
    }

    return encontrados.map((tema) => tema._id);
}

/** La lista de temas recibida: un arreglo no vacío de textos (BR-04). */
function temasRecibidosValidos(valores) {
    return Array.isArray(valores)
        && valores.length > 0
        && valores.length <= MAXIMO_TEMAS
        && valores.every((valor) => typeof valor === "string" && valor.trim());
}

/**
 * Temas listos para responder: número y título, en el orden del curso.
 * Un tema privado o en papelera se oculta a docentes y estudiantes.
 */
function temasParaMostrar(temas, usuario) {
    const visibles = esAdministrador(usuario) ? (temas ?? []) : soloTemasVisibles(temas, usuario);

    return visibles
        .filter((tema) => tema && tema.numero)
        .map((tema) => ({ id: tema.numero, numero: tema.numero, titulo: tema.titulo }));
}

/**
 * Quiz de otro docente: 403 (CA-10). Inexistente: 404.
 * Lo usan las rutas que guardan; las de consulta siguen con buscarQuizDocente.
 */
async function buscarQuizParaGuardar(req, res) {
    const quiz = esIdValido(req.params.id)
        ? await Evaluacion.findById(req.params.id)
        : null;

    if (!quiz) {
        errorNoEncontrado(res);
        return null;
    }

    if (String(quiz.docente) !== String(req.usuario._id)) {
        errorCliente(res, 403, "QUIZ_AJENO", "Este quiz es de otro docente.");
        return null;
    }

    return quiz;
}

async function buscarQuizDocente(id, docenteId) {
    if (!esIdValido(id)) {
        return null;
    }

    return Evaluacion.findOne({
        _id: id,
        docente: docenteId
    });
}

// Si vence mientras responde, se acepta lo enviado en los 5 minutos siguientes
// a quien lo abrió antes de vencer (spec-estudiante BR-03).
const MARGEN_VENCIDO_MS = 5 * 60 * 1000;

/** Un registro con nota ya se respondió; sin nota, solo se abrió. */
const respondido = (registro) => registro?.nota !== null && registro?.nota !== undefined;

function puedeResponder(quiz, abiertoEn) {
    const ahora = Date.now();
    const limite = new Date(quiz.fechaLimite).getTime();

    if (ahora < limite) return true;

    return Boolean(abiertoEn)
        && new Date(abiertoEn).getTime() < limite
        && ahora <= limite + MARGEN_VENCIDO_MS;
}

const quizNoDisponible = (res, quiz) => errorCliente(
    res,
    403,
    quiz.habilitado ? "QUIZ_VENCIDO" : "QUIZ_NO_DISPONIBLE",
    quiz.habilitado
        ? "Este quiz ya venció y no recibe respuestas."
        : "Este quiz no está disponible."
);

/** Registra que el estudiante abrió el quiz; dos aperturas a la vez dejan un solo registro. */
async function registrarApertura(quizId, estudianteId) {
    const filtro = { evaluacion: quizId, estudiante: estudianteId };

    try {
        return await RespuestasQuiz.findOneAndUpdate(
            filtro,
            { $setOnInsert: { abiertoEn: new Date() } },
            { upsert: true, new: true }
        ).lean();
    } catch (error) {
        if (error?.code === 11000) return RespuestasQuiz.findOne(filtro).lean();
        throw error;
    }
}

function quizVencido(quiz) {
    return Boolean(
        quiz.fechaLimite &&
        new Date(quiz.fechaLimite).getTime() <= Date.now()
    );
}

function datosQuizDocente(quiz) {
    return {
        id: quiz._id,
        titulo: quiz.titulo,
        modulo: quiz.modulo,
        temas: quiz.temas ?? [],
        fechaLimite: quiz.fechaLimite,
        preguntas: quiz.preguntas,
        estado: quiz.estado,
        habilitado: quiz.habilitado,
        vencido: quizVencido(quiz),
        creado: quiz.createdAt,
        actualizado: quiz.updatedAt
    };
}

/**
 * Esta respuesta nunca incluye las respuestas correctas.
 * El estudiante solamente recibe enunciados y opciones.
 */
function datosQuizEstudiante(quiz, usuario) {
    return {
        id: quiz._id,
        titulo: quiz.titulo,
        modulo: quiz.modulo,
        temas: temasParaMostrar(quiz.temas, usuario),
        fechaLimite: quiz.fechaLimite,
        preguntas: quiz.preguntas.map((pregunta) => ({
            id: pregunta._id,
            enunciado: pregunta.enunciado,
            opciones: pregunta.opciones
        }))
    };
}

class evaluacionController {
    /** Crear un quiz en estado borrador. */
    async crear(req, res) {
        try {
            const {
                titulo,
                modulo: moduloValor,
                temas,
                preguntas,
                fechaLimite
            } = req.body;

            if (typeof titulo !== "string" || !titulo.trim()) {
                return errorCliente(
                    res,
                    400,
                    "TITULO_REQUERIDO",
                    "Escribe el título del quiz."
                );
            }

            const modulo = await buscarModulo(moduloValor);

            if (!modulo) {
                return moduloInvalido(res);
            }

            if (!temasRecibidosValidos(temas)) {
                return temasRequeridos(res);
            }

            const temasDelModulo = await buscarTemasDelModulo(temas, modulo, req.usuario);

            if (!temasDelModulo) {
                return temaInvalido(res);
            }

            let preguntasPreparadas;

            try {
                preguntasPreparadas = prepararPreguntas(preguntas ?? []);
            } catch (error) {
                return errorCliente(res, 400, "PREGUNTAS_INVALIDAS", error.message);
            }

            let fechaLimitePreparada = null;

            if (fechaLimite) {
                const resultadoFecha = validarFechaLimite(fechaLimite);

                if (!resultadoFecha.valida) {
                    return errorCliente(
                        res,
                        400,
                        "FECHA_LIMITE_INVALIDA",
                        resultadoFecha.mensaje
                    );
                }

                fechaLimitePreparada = resultadoFecha.fecha;
            }

            const quiz = await Evaluacion.create({
                titulo: titulo.trim(),
                docente: req.usuario._id,
                modulo: modulo._id,
                temas: temasDelModulo,
                preguntas: preguntasPreparadas,
                fechaLimite: fechaLimitePreparada,
                estado: "borrador"
            });

            return res.status(201).json({
                mensaje: "Borrador creado correctamente.",
                evaluacion: datosQuizDocente(quiz)
            });
        } catch (error) {
            return responderError(res, error, "Crear quiz");
        }
    }

    /** Listar los quices creados por el docente autenticado. */
    async listar(req, res) {
        try {
            const quices = await Evaluacion.find({
                docente: req.usuario._id
            })
                .populate("modulo", "clave titulo")
                .populate("temas", "numero titulo visibilidad eliminado")
                .sort({ createdAt: -1 })
                .lean();

            return res.json({
                evaluaciones: quices.map((quiz) => ({
                    id: quiz._id,
                    titulo: quiz.titulo,
                    modulo: quiz.modulo,
                    temas: temasParaMostrar(quiz.temas, req.usuario),
                    fechaLimite: quiz.fechaLimite,
                    estado: quiz.estado,
                    habilitado: quiz.habilitado,
                    vencido: Boolean(
                        quiz.fechaLimite &&
                        new Date(quiz.fechaLimite).getTime() <= Date.now()
                    ),
                    creado: quiz.createdAt
                }))
            });
        } catch (error) {
            return responderError(res, error, "Listar quices del docente");
        }
    }

    /** Consultar un quiz propio, incluyendo sus respuestas correctas. */
    async detalle(req, res) {
    try {
        const quiz = await buscarQuizDocente(
            req.params.id,
            req.usuario._id
        );

        if (!quiz) {
            return errorNoEncontrado(res);
        }

        await quiz.populate("temas", "numero titulo visibilidad eliminado");

        return res.json({
            evaluacion: {
                ...datosQuizDocente(quiz),
                temas: temasParaMostrar(quiz.temas, req.usuario)
            }
        });
    } catch (error) {
        return responderError(res, error, "Consultar quiz");
    }
}

    /**
     * Editar un borrador.
     * Un quiz publicado solamente permite ampliar su fecha límite.
     */
    async actualizar(req, res) {
        try {
            const quiz = await buscarQuizParaGuardar(req, res);

            if (!quiz) {
                return;
            }

            const campos = Object.keys(req.body ?? {});

            if (quiz.estado === "publicado") {
                if (
                    campos.length !== 1 ||
                    campos[0] !== "fechaLimite"
                ) {
                    return errorCliente(
                        res,
                        409,
                        "QUIZ_PUBLICADO",
                        "Un quiz publicado no permite modificar su contenido. Solo puedes ampliar la fecha límite."
                    );
                }

                const resultadoFecha = validarFechaLimite(req.body?.fechaLimite);

                if (!resultadoFecha.valida) {
                    return errorCliente(
                        res,
                        400,
                        "FECHA_LIMITE_INVALIDA",
                        resultadoFecha.mensaje
                    );
                }

                if (
                    quiz.fechaLimite &&
                    resultadoFecha.fecha <= new Date(quiz.fechaLimite)
                ) {
                    return errorCliente(
                        res,
                        400,
                        "FECHA_NO_AMPLIADA",
                        "La nueva fecha límite debe ser posterior a la actual."
                    );
                }

                quiz.fechaLimite = resultadoFecha.fecha;
                await quiz.save();

                return res.json({
                    mensaje: "Fecha límite ampliada correctamente.",
                    evaluacion: datosQuizDocente(quiz)
                });
            }

            if (quiz.estado !== "borrador") {
                return errorCliente(
                    res,
                    409,
                    "ESTADO_INVALIDO",
                    "No se puede editar este quiz."
                );
            }

            if (req.body.titulo !== undefined) {
                if (
                    typeof req.body.titulo !== "string" ||
                    !req.body.titulo.trim()
                ) {
                    return errorCliente(
                        res,
                        400,
                        "TITULO_INVALIDO",
                        "El título no puede estar vacío."
                    );
                }

                quiz.titulo = req.body.titulo.trim();
            }

            if (req.body.modulo !== undefined) {
                const modulo = await buscarModulo(req.body.modulo);

                if (!modulo) {
                    return moduloInvalido(res);
                }

                // Al cambiar de módulo, los temas anteriores dejan de valer.
                if (
                    String(modulo._id) !== String(quiz.modulo) &&
                    req.body.temas === undefined
                ) {
                    return temasRequeridos(res);
                }

                quiz.modulo = modulo._id;
            }

            const moduloActual = await Modulo.findById(quiz.modulo);

            if (!moduloActual) {
                return moduloInvalido(res);
            }

            if (req.body.temas !== undefined) {
                if (!temasRecibidosValidos(req.body.temas)) {
                    return temasRequeridos(res);
                }

                const temasDelModulo = await buscarTemasDelModulo(
                    req.body.temas,
                    moduloActual,
                    req.usuario
                );

                if (!temasDelModulo) {
                    return temaInvalido(res);
                }

                quiz.temas = temasDelModulo;
            }

            // Un borrador viejo, sin temas, debe elegirlos para guardarse (CA-08).
            if (!quiz.temas?.length) {
                return temasRequeridos(res);
            }

            if (req.body.preguntas !== undefined) {
                try {
                    quiz.preguntas = prepararPreguntas(req.body.preguntas);
                } catch (error) {
                    return errorCliente(
                        res,
                        400,
                        "PREGUNTAS_INVALIDAS",
                        error.message
                    );
                }
            }

            if (req.body.fechaLimite !== undefined) {
                if (req.body.fechaLimite === null || req.body.fechaLimite === "") {
                    quiz.fechaLimite = null;
                } else {
                    const resultadoFecha = validarFechaLimite(req.body.fechaLimite);

                    if (!resultadoFecha.valida) {
                        return errorCliente(
                            res,
                            400,
                            "FECHA_LIMITE_INVALIDA",
                            resultadoFecha.mensaje
                        );
                    }

                    quiz.fechaLimite = resultadoFecha.fecha;
                }
            }

            await quiz.save();

            return res.json({
                mensaje: "Borrador actualizado correctamente.",
                evaluacion: datosQuizDocente(quiz)
            });
        } catch (error) {
            return responderError(res, error, "Actualizar quiz");
        }
    }

    /** Publicar un borrador después de validar preguntas y fecha límite. */
    async publicar(req, res) {
        try {
            const quiz = await buscarQuizParaGuardar(req, res);

            if (!quiz) {
                return;
            }

            if (quiz.estado !== "borrador") {
                return errorCliente(
                    res,
                    409,
                    "QUIZ_NO_ES_BORRADOR",
                    "Solo se pueden publicar quices que estén en borrador."
                );
            }

            const modulo = await Modulo.findById(quiz.modulo);

            if (!modulo) {
                return moduloInvalido(res);
            }

            if (!quiz.temas?.length) {
                return temasRequeridos(res);
            }

            // Los temas guardados deben seguir siendo del módulo.
            const vigentes = await buscarTemasDelModulo(
                quiz.temas.map(String),
                modulo,
                req.usuario
            );

            if (!vigentes || vigentes.length !== quiz.temas.length) {
                return temaInvalido(res);
            }

            try {
                quiz.preguntas = prepararPreguntas(quiz.preguntas, true);
            } catch (error) {
                return errorCliente(
                    res,
                    400,
                    "PREGUNTAS_INVALIDAS",
                    error.message
                );
            }

            const resultadoFecha = validarFechaLimite(req.body?.fechaLimite);

            if (!resultadoFecha.valida) {
                return errorCliente(
                    res,
                    400,
                    "FECHA_LIMITE_INVALIDA",
                    resultadoFecha.mensaje
                );
            }

            quiz.fechaLimite = resultadoFecha.fecha;
            quiz.estado = "publicado";

            await quiz.save();

            return res.json({
                mensaje: "Quiz publicado correctamente.",
                evaluacion: datosQuizDocente(quiz)
            });
        } catch (error) {
            return responderError(res, error, "Publicar quiz");
        }
    }

    /** Eliminar un quiz solamente si ningún estudiante lo ha respondido. */
    async eliminar(req, res) {
        try {
            const quiz = await buscarQuizDocente(
                req.params.id,
                req.usuario._id
            );

            if (!quiz) {
                return errorNoEncontrado(res);
            }

            const respuestas = await RespuestasQuiz.exists({
                evaluacion: quiz._id,
                nota: { $ne: null }
            });

            if (respuestas) {
                return errorCliente(
                    res,
                    409,
                    "QUIZ_CON_RESPUESTAS",
                    "No puedes eliminar un quiz que ya tiene respuestas."
                );
            }

            await Evaluacion.deleteOne({ _id: quiz._id });
            // Quita también los registros de quienes solo lo abrieron.
            await RespuestasQuiz.deleteMany({ evaluacion: quiz._id });

            return res.json({
                mensaje: "Quiz eliminado correctamente."
            });
        } catch (error) {
            return responderError(res, error, "Eliminar quiz");
        }
    }

    /** Consultar notas y respuestas recibidas en un quiz propio. */
    async notas(req, res) {
        try {
            const quiz = await buscarQuizDocente(
                req.params.id,
                req.usuario._id
            );

            if (!quiz) {
                return errorNoEncontrado(res);
            }

            const respuestas = await RespuestasQuiz.find({
                evaluacion: quiz._id,
                nota: { $ne: null }
            })
                .populate("estudiante", "nombre correo")
                .sort({ fechaRespuesta: 1 })
                .lean();

            const notas = respuestas.map((respuesta) => ({
                estudiante: respuesta.estudiante
                    ? {
                        id: respuesta.estudiante._id,
                        nombre: respuesta.estudiante.nombre,
                        correo: respuesta.estudiante.correo
                    }
                    : null,
                fechaRespuesta: respuesta.fechaRespuesta,
                aciertos: respuesta.aciertos,
                totalPreguntas: quiz.preguntas.length,
                nota: respuesta.nota
            }));

            const promedio = notas.length
                ? Number((
                    notas.reduce((suma, respuesta) => suma + respuesta.nota, 0) /
                    notas.length
                ).toFixed(1))
                : null;

            return res.json({
                evaluacion: {
                    id: quiz._id,
                    titulo: quiz.titulo,
                    totalPreguntas: quiz.preguntas.length
                },
                cantidadRespuestas: notas.length,
                promedio,
                notas
            });
        } catch (error) {
            return responderError(res, error, "Consultar notas del quiz");
        }
    }

        /** Listar todos los quices para el panel del administrador. */
    async listarAdministrador(req, res) {
        try {
            const quices = await Evaluacion.find()
                .populate("docente", "nombre correo")
                .populate("modulo", "clave titulo")
                .populate("temas", "numero titulo visibilidad eliminado")
                .sort({ createdAt: -1 })
                .lean();

            return res.json({
                evaluaciones: quices.map((quiz) => ({
                    id: quiz._id,
                    titulo: quiz.titulo,
                    docente: quiz.docente,
                    modulo: quiz.modulo,
                    temas: temasParaMostrar(quiz.temas, req.usuario),
                    fechaLimite: quiz.fechaLimite,
                    estado: quiz.estado,
                    habilitado: quiz.habilitado,
                    vencido: Boolean(
                        quiz.fechaLimite &&
                        new Date(quiz.fechaLimite).getTime() <= Date.now()
                    ),
                    preguntas: (quiz.preguntas ?? []).map((pregunta) => ({
                        id: pregunta._id,
                        enunciado: pregunta.enunciado,
                        opciones: pregunta.opciones,
                        respuestaCorrecta: pregunta.respuestaCorrecta
                    })),
                    creado: quiz.createdAt,
                    actualizado: quiz.updatedAt
                }))
            });
        } catch (error) {
            return responderError(
                res,
                error,
                "Listar quices del administrador"
            );
        }
    }

        /** Habilitar o deshabilitar un quiz sin eliminarlo. */
    async cambiarHabilitado(req, res) {
        try {
            if (!esIdValido(req.params.id)) {
                return errorNoEncontrado(res);
            }

            if (typeof req.body?.habilitado !== "boolean") {
                return errorCliente(
                    res,
                    400,
                    "ESTADO_INVALIDO",
                    "Debes indicar si el quiz estará habilitado o deshabilitado."
                );
            }

            const quiz = await Evaluacion.findById(req.params.id);

            if (!quiz) {
                return errorNoEncontrado(res);
            }

            quiz.habilitado = req.body.habilitado;
            await quiz.save();

            return res.json({
                mensaje: quiz.habilitado
                    ? "Quiz habilitado correctamente."
                    : "Quiz deshabilitado correctamente.",
                evaluacion: {
                    id: quiz._id,
                    titulo: quiz.titulo,
                    estado: quiz.estado,
                    habilitado: quiz.habilitado,
                    vencido: quizVencido(quiz)
                }
            });
        } catch (error) {
            return responderError(
                res,
                error,
                "Cambiar disponibilidad del quiz"
            );
        }
    }

    /**
     * Quices que el estudiante abrió alguna vez por enlace o QR, con su estado:
     * pendiente, respondido (con nota), vencido o no disponible (RF-03, CA-02).
     */
    async listarEstudiante(req, res) {
        try {
            const registros = await RespuestasQuiz.find({ estudiante: req.usuario._id })
                .sort({ updatedAt: -1 })
                .populate({
                    path: "evaluacion",
                    select: "titulo modulo temas fechaLimite estado habilitado",
                    populate: [
                        { path: "modulo", select: "clave titulo" },
                        { path: "temas", select: "numero titulo visibilidad eliminado" }
                    ]
                })
                .lean();

            const evaluaciones = registros
                .filter((registro) => registro.evaluacion?.estado === "publicado")
                .map((registro) => {
                    const quiz = registro.evaluacion;
                    const hecho = respondido(registro);
                    let estado = "pendiente";

                    if (hecho) estado = "respondido";
                    else if (!quiz.habilitado) estado = "no-disponible";
                    else if (!puedeResponder(quiz, registro.abiertoEn)) estado = "vencido";

                    return {
                        id: quiz._id,
                        titulo: quiz.titulo,
                        modulo: quiz.modulo,
                        temas: temasParaMostrar(quiz.temas, req.usuario),
                        fechaLimite: quiz.fechaLimite,
                        vencido: quizVencido(quiz),
                        estado,
                        nota: hecho ? registro.nota : null,
                        fechaRespuesta: hecho ? registro.fechaRespuesta : null
                    };
                });

            return res.json({ evaluaciones });
        } catch (error) {
            return responderError(res, error, "Listar quices del estudiante");
        }
    }

    /** Obtener un quiz publicado para que lo responda un estudiante. */
    async verParaEstudiante(req, res) {
        try {
            if (!esIdValido(req.params.id)) {
                return errorNoEncontrado(res);
            }

            const quiz = await Evaluacion.findOne({
                _id: req.params.id,
                estado: "publicado"
            })
                .populate("modulo", "clave titulo")
                .populate("temas", "numero titulo visibilidad eliminado");

            if (!quiz) {
                return errorNoEncontrado(res);
            }

            const registro = await RespuestasQuiz.findOne({
                evaluacion: quiz._id,
                estudiante: req.usuario._id
            }).lean();

            if (respondido(registro)) {
                return errorCliente(
                    res,
                    409,
                    "QUIZ_YA_RESPONDIDO",
                    "Ya respondiste este quiz."
                );
            }

            if (!quiz.habilitado || !puedeResponder(quiz, registro?.abiertoEn)) {
                return quizNoDisponible(res, quiz);
            }

            // Abrirlo lo agrega a la lista del estudiante (CA-06).
            const abierto = registro ?? await registrarApertura(quiz._id, req.usuario._id);

            return res.json({
                evaluacion: {
                    ...datosQuizEstudiante(quiz, req.usuario),
                    abiertoEn: abierto?.abiertoEn ?? null
                }
            });
        } catch (error) {
            return responderError(res, error, "Mostrar quiz al estudiante");
        }
    }

    /** Recibir respuestas y calcular la nota exclusivamente en el servidor. */
    async responder(req, res) {
        try {
            if (!esIdValido(req.params.id)) {
                return errorNoEncontrado(res);
            }

            const quiz = await Evaluacion.findOne({
                _id: req.params.id,
                estado: "publicado"
            });

            if (!quiz) {
                return errorNoEncontrado(res);
            }

            const registro = await RespuestasQuiz.findOne({
                evaluacion: quiz._id,
                estudiante: req.usuario._id
            }).lean();

            if (respondido(registro)) {
                return errorCliente(
                    res,
                    409,
                    "QUIZ_YA_RESPONDIDO",
                    "Ya respondiste este quiz."
                );
            }

            // BR-03: vencido, solo dentro de los 5 minutos y si lo abrió antes.
            if (!quiz.habilitado || !puedeResponder(quiz, registro?.abiertoEn)) {
                return errorCliente(
                    res,
                    403,
                    quiz.habilitado ? "QUIZ_VENCIDO" : "QUIZ_NO_DISPONIBLE",
                    quiz.habilitado
                        ? "El quiz venció y pasaron los 5 minutos de margen: ya no recibe respuestas."
                        : "Este quiz no está disponible."
                );
            }

            const respuestasRecibidas = req.body?.respuestas;

            if (
                !Array.isArray(respuestasRecibidas) ||
                respuestasRecibidas.length !== quiz.preguntas.length
            ) {
                return errorCliente(
                    res,
                    400,
                    "RESPUESTAS_INCOMPLETAS",
                    "Debes responder todas las preguntas del quiz."
                );
            }

            const respuestasGuardadas = [];
            const preguntasRespondidas = new Set();
            let aciertos = 0;

            for (const respuesta of respuestasRecibidas) {
                const pregunta = quiz.preguntas.find(
                    (item) => String(item._id) === String(respuesta.preguntaId)
                );

                if (!pregunta) {
                    return errorCliente(
                        res,
                        400,
                        "PREGUNTA_INVALIDA",
                        "Una de las preguntas enviadas no pertenece a este quiz."
                    );
                }

                if (preguntasRespondidas.has(String(pregunta._id))) {
                    return errorCliente(
                        res,
                        400,
                        "PREGUNTA_REPETIDA",
                        "No puedes responder dos veces la misma pregunta."
                    );
                }

                if (
                    !Number.isInteger(respuesta.opcionSeleccionada) ||
                    respuesta.opcionSeleccionada < 0 ||
                    respuesta.opcionSeleccionada >= pregunta.opciones.length
                ) {
                    return errorCliente(
                        res,
                        400,
                        "OPCION_INVALIDA",
                        "Una de las opciones seleccionadas no es válida."
                    );
                }

                preguntasRespondidas.add(String(pregunta._id));

                if (
                    respuesta.opcionSeleccionada === pregunta.respuestaCorrecta
                ) {
                    aciertos++;
                }

                respuestasGuardadas.push({
                    preguntaId: pregunta._id,
                    opcionSeleccionada: respuesta.opcionSeleccionada
                });
            }

            // BR-02: nota calculada por el backend, nunca por el navegador.
            const nota = Number((
                1 + 4 * (aciertos / quiz.preguntas.length)
            ).toFixed(1));

            const ahora = new Date();
            let nuevaRespuesta;

            try {
                // Solo guarda si aún no tiene nota: dos envíos a la vez dejan uno.
                nuevaRespuesta = await RespuestasQuiz.findOneAndUpdate(
                    { evaluacion: quiz._id, estudiante: req.usuario._id, nota: null },
                    {
                        $set: { respuestas: respuestasGuardadas, aciertos, nota, fechaRespuesta: ahora },
                        $setOnInsert: { abiertoEn: ahora }
                    },
                    { upsert: true, new: true }
                );
            } catch (error) {
                if (error?.code === 11000) {
                    return errorCliente(res, 409, "QUIZ_YA_RESPONDIDO", "Ya respondiste este quiz.");
                }
                throw error;
            }

            return res.status(201).json({
                mensaje: "Respuestas enviadas correctamente.",
                resultado: {
                    id: nuevaRespuesta._id,
                    aciertos,
                    totalPreguntas: quiz.preguntas.length,
                    nota,
                    fechaRespuesta: nuevaRespuesta.fechaRespuesta
                }
            });
        } catch (error) {
            return responderError(res, error, "Enviar respuestas del quiz");
        }
    }

    /**
     * Consultar el resultado propio.
     * Las respuestas correctas solo se muestran cuando el quiz ha vencido.
     */
    async resultadoEstudiante(req, res) {
        try {
            if (!esIdValido(req.params.id)) {
                return errorNoEncontrado(res);
            }

            const quiz = await Evaluacion.findOne({
                _id: req.params.id,
                estado: "publicado"
            });

            if (!quiz) {
                return errorNoEncontrado(res);
            }

            const respuesta = await RespuestasQuiz.findOne({
                evaluacion: quiz._id,
                estudiante: req.usuario._id
            }).lean();

            if (!respondido(respuesta)) {
                return errorCliente(
                    res,
                    404,
                    "RESULTADO_NO_ENCONTRADO",
                    "Todavía no has respondido este quiz."
                );
            }

            const vencido = quizVencido(quiz);

            const resultado = {
                nota: respuesta.nota,
                aciertos: respuesta.aciertos,
                totalPreguntas: quiz.preguntas.length,
                fechaRespuesta: respuesta.fechaRespuesta
            };

            if (vencido) {
                resultado.revision = quiz.preguntas.map((pregunta) => {
                    const seleccionada = respuesta.respuestas.find(
                        (item) =>
                            String(item.preguntaId) === String(pregunta._id)
                    );

                    return {
                        preguntaId: pregunta._id,
                        enunciado: pregunta.enunciado,
                        opciones: pregunta.opciones,
                        opcionSeleccionada:
                            seleccionada?.opcionSeleccionada ?? null,
                        respuestaCorrecta: pregunta.respuestaCorrecta,
                        correcta:
                            seleccionada?.opcionSeleccionada ===
                            pregunta.respuestaCorrecta
                    };
                });
            }

            return res.json({
                evaluacion: {
                    id: quiz._id,
                    titulo: quiz.titulo,
                    fechaLimite: quiz.fechaLimite,
                    vencido
                },
                resultado
            });
        } catch (error) {
            return responderError(res, error, "Consultar resultado del estudiante");
        }
    }
}

export default new evaluacionController();