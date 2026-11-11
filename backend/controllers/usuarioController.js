import usuariosModelo from "../models/usuarios.js";
import bcrypt from "bcryptjs";
import { errorCliente, errorSistema } from "../lib/respuestas.js";
import { abrirSesion, cerrarSesion } from "../middlewares/sesion.js";
import mongoose from "mongoose";
import Usuario from "../schemas/usuarios.js";
import Modulo from "../schemas/modulos.js";
import Invitacion, {
    hashToken as hashInvitacion,
    generarTokenInvitacion
} from "../schemas/invitaciones.js";
import Restablecimiento, {
    hashToken as hashRestablecimiento,
    generarTokenRestablecimiento
} from "../schemas/restablecimientos.js";
import { enviarAvisoCuentaExistente, enviarConfirmacionCorreo, enviarInvitacionDocente } from "../lib/correo.js";
import { motivoContrasenaInvalida } from "../lib/contrasenas.js";
import { ESPECIALIZACIONES, PREGRADOS, esCarreraValida } from "../lib/carreras.js";

const usuarioNoExiste = (res) => errorCliente(res, 404, "USUARIO_NO_ENCONTRADO", "Ese usuario no existe.");

const INTENTOS_ANTES_DE_BLOQUEO = 5;
const BLOQUEO_MS = 15 * 60 * 1000;

const credencialesInvalidas = (res) => errorCliente(res, 401, "CREDENCIALES_INVALIDAS", "Correo o contraseña incorrectos.");

/** Mensaje propio de cuenta bloqueada, con los minutos que faltan (spec-login BR-06). */
function cuentaBloqueada(res, hasta) {
    const minutos = Math.max(1, Math.ceil((hasta.getTime() - Date.now()) / 60000));

    return errorCliente(
        res,
        423,
        "CUENTA_BLOQUEADA",
        `Tu cuenta está bloqueada por demasiados intentos fallidos. Intenta de nuevo en ${minutos} ${minutos === 1 ? "minuto" : "minutos"}.`
    );
}

/** Cuenta el fallo y, al quinto seguido, bloquea la cuenta. Devuelve hasta cuándo, si la bloqueó. */
async function registrarFallo(id) {
    const usuario = await Usuario.findByIdAndUpdate(id, { $inc: { intentosFallidos: 1 } }, { new: true });

    if (usuario?.intentosFallidos < INTENTOS_ANTES_DE_BLOQUEO) {
        return null;
    }

    const hasta = new Date(Date.now() + BLOQUEO_MS);
    await Usuario.updateOne({ _id: id }, { $set: { intentosFallidos: 0, bloqueadoHasta: hasta } });
    return hasta;
}

const CONFIRMACION_MS = 24 * 60 * 60 * 1000;
const INVITACION_VENCE_MS = 72 * 60 * 60 * 1000;
const INVITACION_ABIERTA_MS = 10 * 60 * 1000;
const CORREO_INSTITUCIONAL = /^[a-zA-Z0-9._%+-]+@uniautonoma\.edu\.co$/;

/** Comprueba si una invitación sigue vigente: 72h sin abrir o 10 min tras abrir (BR-01). */
function invitacionVigente(invitacion) {
    if (!invitacion || invitacion.usado) return false;

    const ahora = Date.now();

    if (invitacion.vence.getTime() <= ahora) return false;

    if (invitacion.abiertoEn && ahora - invitacion.abiertoEn.getTime() > INVITACION_ABIERTA_MS) {
        return false;
    }

    return true;
}

// La misma respuesta exista o no el correo (spec-login BR-13).
const MENSAJE_REGISTRO = "Si el correo es válido, te llegará un enlace para confirmar tu cuenta. Revisa también la carpeta de spam.";
const MENSAJE_REENVIO = "Si tu cuenta está pendiente de confirmar, te llegará un enlace nuevo. Revisa también la carpeta de spam.";

/** Invalida los enlaces de confirmación anteriores, crea uno de 24 horas y lo envía. */
async function enviarNuevaConfirmacion(usuario) {
    await Restablecimiento.updateMany(
        { usuario: usuario._id, tipo: "confirmar-correo", usado: false },
        { $set: { usado: true } }
    );

    const token = generarTokenRestablecimiento();

    await Restablecimiento.create({
        usuario: usuario._id,
        tipo: "confirmar-correo",
        tokenHash: hashRestablecimiento(token),
        vence: new Date(Date.now() + CONFIRMACION_MS)
    });

    // El enlace nunca vuelve a quien lo pide: solo llega por correo.
    await enviarConfirmacionCorreo({ correo: usuario.correo, token });
}

/**
 * Registro con un correo que ya tiene cuenta: la pantalla responde igual, y
 * solo el dueño recibe algo por correo (spec-login BR-13 y CA-23).
 */
async function avisarCuentaExistente(correo) {
    const usuario = await Usuario.findOne({ correo });

    if (!usuario) return;

    if (usuario.rol === "estudiante" && usuario.estado === "pendiente") {
        await enviarNuevaConfirmacion(usuario);
        return;
    }

    const invitado = usuario.rol === "docente" && usuario.estado === "pendiente";
    await enviarAvisoCuentaExistente({ correo, caso: invitado ? "invitado" : "activa" });
}

/** Un id mal formado es un error de quien pide, no del sistema. */
function responderError(res, error, contexto) {
    if (error.name === "CastError" || error.name === "BSONError") {
        return errorCliente(res, 400, "ID_INVALIDO", "El identificador no es válido.");
    }

    if (error.name === "ValidationError") {
        return errorCliente(res, 400, "DATOS_INVALIDOS", "Revisa los datos. El correo debe ser institucional.");
    }

    return errorSistema(res, contexto, error);
}

class usuarioController {
    constructor() {
    }

    async create(req, res) {
        try {
            const data = await usuariosModelo.create(req.body);
            return res.status(201).json(data);
        } catch (e) {
            if (
                e.message === "El correo es obligatorio." ||
                e.message ===
                "Solo se pueden invitar estudiantes o docentes."
            ) {
                return errorCliente(res, 400, "DATOS_INVALIDOS", e.message);
            }

            if (e.code === 11000) {
                return errorCliente(res, 409, "CORREO_DUPLICADO", "Ese correo ya está registrado.");
            }

            return responderError(res, e, "Crear invitación");
        }
    }

    async update(req, res) {
        try {
            const data = await usuariosModelo.update(req.params.id, req.body);
            return data ? res.status(200).json(data) : usuarioNoExiste(res);
        } catch (e) {
            return responderError(res, e, "Actualizar usuario");
        }
    }

    async delete(req, res) {
        try {
            const data = await usuariosModelo.delete(req.params.id);
            return data ? res.status(204).end() : usuarioNoExiste(res);
        } catch (e) {
            return responderError(res, e, "Eliminar usuario");
        }
    }

    async getAll(req, res) {
        try {
            return res.status(200).json(await usuariosModelo.getAll());
        } catch (e) {
            return responderError(res, e, "Listar usuarios");
        }
    }

    async getOne(req, res) {
        try {
            const data = await usuariosModelo.getOne(req.params.id);
            return data ? res.status(200).json(data) : usuarioNoExiste(res);
        } catch (e) {
            return responderError(res, e, "Consultar usuario");
        }
    }

    async asignarModulos(req, res) {
        try {
            const { id } = req.params;
            const { modulos } = req.body;

            // Validar el ID del docente
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return errorCliente(
                    res,
                    400,
                    "ID_INVALIDO",
                    "El identificador del docente no es válido."
                );
            }

            // Validar que se haya enviado un arreglo
            if (!Array.isArray(modulos)) {
                return errorCliente(
                    res,
                    400,
                    "MODULOS_INVALIDOS",
                    "Debes enviar una lista de módulos."
                );
            }

            // Validar que todos los elementos sean claves de módulo válidas
            if (modulos.some((modulo) => typeof modulo !== "string" || !modulo.trim())) {
                return errorCliente(
                    res,
                    400,
                    "MODULOS_INVALIDOS",
                    "La lista contiene claves de módulos inválidas."
                );
            }

            // Limpiar y evitar módulos repetidos
            const claves = [...new Set(modulos.map((modulo) => modulo.trim()))];

            // Buscar al usuario
            const docente = await Usuario.findById(id);

            if (!docente) {
                return errorCliente(
                    res,
                    404,
                    "DOCENTE_NO_ENCONTRADO",
                    "No se encontró el usuario solicitado."
                );
            }

            // Comprobar que realmente sea docente
            if (docente.rol !== "docente") {
                return errorCliente(
                    res,
                    400,
                    "USUARIO_NO_ES_DOCENTE",
                    "Solo se pueden asignar módulos a docentes."
                );
            }

            // Comprobar que todos los módulos existan
            const modulosExistentes = await Modulo.find({
                clave: { $in: claves }
            }).select("clave");

            if (modulosExistentes.length !== claves.length) {
                return errorCliente(
                    res,
                    400,
                    "MODULO_NO_ENCONTRADO",
                    "Uno o más módulos no existen."
                );
            }

            // Guardar las asignaciones
            docente.modulosAsignados = claves;
            await docente.save();

            return res.status(200).json({
                mensaje: "Módulos asignados correctamente.",
                docente: {
                    id: docente._id,
                    nombre: docente.nombre,
                    correo: docente.correo,
                    estado: docente.estado,
                    modulosAsignados: docente.modulosAsignados
                }
            });

        } catch (error) {
            return errorSistema(res, "Asignar módulos al docente", error);
        }
    }

    async login(req, res) {
        try {
            const { correo, contrasena } = req.body ?? {};

            if (typeof correo !== "string" || typeof contrasena !== "string" || !correo || !contrasena) {
                return errorCliente(res, 400, "DATOS_INCOMPLETOS", "Ingresa tu correo y contraseña.");
            }

            const usuario = await usuariosModelo.getByCorreo(correo);

            // Mismo mensaje para correo inexistente y clave incorrecta (BR-06).
            if (!usuario || !usuario.contrasena) {
                return credencialesInvalidas(res);
            }

            if (usuario.bloqueadoHasta > new Date()) {
                return cuentaBloqueada(res, usuario.bloqueadoHasta);
            }

            if (!(await bcrypt.compare(contrasena, usuario.contrasena))) {
                const bloqueadaHasta = await registrarFallo(usuario._id);
                return bloqueadaHasta ? cuentaBloqueada(res, bloqueadaHasta) : credencialesInvalidas(res);
            }

            // El estado se informa solo a quien ya demostró conocer la contraseña.
            if (usuario.estado === "pendiente" && usuario.rol === "estudiante") {
                return errorCliente(res, 403, "CUENTA_PENDIENTE", "Confirma tu correo para activar tu cuenta. Si no te llegó el enlace, pide otro.");
            }

            if (usuario.estado !== "activo") {
                return errorCliente(res, 403, "CUENTA_INACTIVA", "Tu cuenta no está activa. Comunícate con el administrador.");
            }

            await Usuario.updateOne({ _id: usuario._id }, {
                $set: { intentosFallidos: 0, bloqueadoHasta: null, ultimoIngreso: new Date() },
                $inc: { ingresos: 1 },
            });

            abrirSesion(res, usuario);

            return res.status(200).json({
                usuario: {
                    id: usuario._id,
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                    rol: usuario.rol
                }
            });
        } catch (error) {
            return errorSistema(res, "Iniciar sesión", error);
        }
    }

    logout(req, res) {
        cerrarSesion(res);
        return res.status(204).end();
    }

    me(req, res) {
        const {
            _id,
            nombre,
            correo,
            rol,
            modulosAsignados
        } = req.usuario;

        return res.status(200).json({
            usuario: {
                id: _id,
                nombre,
                correo,
                rol,
                modulosAsignados: rol === "docente"
                    ? modulosAsignados ?? []
                    : []
            }
        });
    }

    /** Lista cerrada de carreras para el formulario de registro. */
    carreras(req, res) {
        return res.status(200).json({ pregrados: PREGRADOS, especializaciones: ESPECIALIZACIONES });
    }

    /** Registro del estudiante: cuenta pendiente hasta confirmar el correo (spec-login RF-01, RF-03). */
    async registrarEstudiante(req, res) {
        try {
            const { nombre, correo, carrera, contrasena, aceptarPolitica } = req.body ?? {};

            if (typeof nombre !== "string" || nombre.trim().length < 3 || nombre.trim().length > 120) {
                return errorCliente(res, 400, "NOMBRE_REQUERIDO", "Escribe tu nombre completo.");
            }

            const correoLimpio = typeof correo === "string" ? correo.trim().toLowerCase() : "";

            if (!CORREO_INSTITUCIONAL.test(correoLimpio)) {
                return errorCliente(res, 400, "CORREO_INVALIDO", "Usa tu correo institucional (@uniautonoma.edu.co).");
            }

            if (!esCarreraValida(carrera)) {
                return errorCliente(res, 400, "CARRERA_INVALIDA", "Elige tu carrera de la lista.");
            }

            const motivo = motivoContrasenaInvalida(contrasena);

            if (motivo) {
                return errorCliente(res, 400, "CONTRASENA_INVALIDA", motivo);
            }

            if (aceptarPolitica !== true) {
                return errorCliente(res, 400, "POLITICA_REQUERIDA", "Debes aceptar la política de tratamiento de datos.");
            }

            // Un correo con cuenta no crea otra, y la respuesta no lo delata (BR-13).
            if (await Usuario.exists({ correo: correoLimpio })) {
                await avisarCuentaExistente(correoLimpio);
                return res.status(202).json({ mensaje: MENSAJE_REGISTRO });
            }

            let usuario;

            try {
                usuario = await Usuario.create({
                    nombre: nombre.trim(),
                    correo: correoLimpio,
                    rol: "estudiante",
                    estado: "pendiente",
                    carrera,
                    contrasena: await bcrypt.hash(contrasena, 10),
                    aceptoPoliticaEn: new Date()
                });
            } catch (error) {
                // Dos registros a la vez con el mismo correo.
                if (error.code === 11000) {
                    await avisarCuentaExistente(correoLimpio);
                    return res.status(202).json({ mensaje: MENSAJE_REGISTRO });
                }
                throw error;
            }

            await enviarNuevaConfirmacion(usuario);

            return res.status(202).json({ mensaje: MENSAJE_REGISTRO });
        } catch (error) {
            return responderError(res, error, "Registrar estudiante");
        }
    }

    /** Confirma el correo con el enlace de 24 horas y activa la cuenta (BR-12). */
    async confirmarCorreo(req, res) {
        try {
            const { token } = req.body ?? {};
            const enlaceInvalido = () => errorCliente(
                res,
                400,
                "ENLACE_INVALIDO",
                "El enlace ya se usó o venció. Pide otro con tu correo."
            );

            if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
                return enlaceInvalido();
            }

            // Se marca usado en la misma operación: un enlace sirve una sola vez.
            const registro = await Restablecimiento.findOneAndUpdate(
                {
                    tokenHash: hashRestablecimiento(token),
                    tipo: "confirmar-correo",
                    usado: false,
                    vence: { $gt: new Date() }
                },
                { $set: { usado: true } }
            );

            if (!registro) {
                return enlaceInvalido();
            }

            const usuario = await Usuario.findOneAndUpdate(
                { _id: registro.usuario, rol: "estudiante", estado: "pendiente" },
                { $set: { estado: "activo" } }
            );

            if (!usuario) {
                return enlaceInvalido();
            }

            return res.status(200).json({ mensaje: "Correo confirmado. Ya puedes ingresar con tu contraseña." });
        } catch (error) {
            return responderError(res, error, "Confirmar correo");
        }
    }

    /** Pide otro enlace de confirmación; responde igual exista o no la cuenta. */
    async reenviarConfirmacion(req, res) {
        try {
            const { correo } = req.body ?? {};
            const correoLimpio = typeof correo === "string" ? correo.trim().toLowerCase() : "";

            if (!CORREO_INSTITUCIONAL.test(correoLimpio)) {
                return errorCliente(res, 400, "CORREO_INVALIDO", "Usa tu correo institucional (@uniautonoma.edu.co).");
            }

            const usuario = await Usuario.findOne({ correo: correoLimpio, rol: "estudiante", estado: "pendiente" });

            if (usuario) {
                await enviarNuevaConfirmacion(usuario);
            }

            return res.status(202).json({ mensaje: MENSAJE_REENVIO });
        } catch (error) {
            return responderError(res, error, "Reenviar confirmación");
        }
    }

    /** Valida un enlace de invitación y marca el primer abrir (BR-01). */
    async validarInvitacion(req, res) {
        try {
            const enlaceInvalido = () => errorCliente(
                res,
                400,
                "INVITACION_INVALIDA",
                "El enlace de invitación ya se usó o venció. Pídele otra al administrador."
            );

            const { token } = req.params ?? {};

            if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
                return enlaceInvalido();
            }

            const invitacion = await Invitacion.findOne({
                tokenHash: hashInvitacion(token)
            });

            if (!invitacionVigente(invitacion)) {
                return enlaceInvalido();
            }

            const ahora = new Date();

            if (!invitacion.abiertoEn) {
                invitacion.abiertoEn = ahora;
                await invitacion.save();
            }

            return res.status(200).json({
                correo: invitacion.correo,
                rol: invitacion.rol,
                vence: invitacion.vence,
                abiertoEn: invitacion.abiertoEn
            });
        } catch (error) {
            return responderError(res, error, "Validar invitación");
        }
    }

    /** Invitar a un docente. Crea usuario pendiente, token y envía correo. */
    async invitarDocente(req, res) {
        try {
            const { correo } = req.body ?? {};

            if (typeof correo !== "string" || !correo.trim()) {
                return errorCliente(res, 400, "CORREO_REQUERIDO", "Escribe el correo del docente.");
            }

            const correoLimpio = correo.trim().toLowerCase();
            const dominio = /@uniautonoma\.edu\.co$/;

            if (!dominio.test(correoLimpio)) {
                return errorCliente(res, 400, "CORREO_INVALIDO", "El correo debe ser institucional (@uniautonoma.edu.co).");
            }

            const existente = await Usuario.findOne({ correo: correoLimpio });

            if (existente && existente.estado !== "pendiente") {
                return errorCliente(res, 409, "CORREO_DUPLICADO", "Ese correo ya tiene una cuenta.");
            }

            // Invalidar invitaciones anteriores no usadas del mismo correo (BR-01).
            await Invitacion.updateMany(
                { correo: correoLimpio, usado: false },
                { $set: { usado: true } }
            );

            const usuario = existente ?? await usuariosModelo.create({
                correo: correoLimpio,
                rol: "docente"
            });

            const token = generarTokenInvitacion();
            const vence = new Date(Date.now() + 72 * 60 * 60 * 1000);

            await Invitacion.create({
                correo: correoLimpio,
                rol: "docente",
                tokenHash: hashInvitacion(token),
                vence,
                creadoPor: req.usuario._id
            });

            const { enviado, enlace } = await enviarInvitacionDocente({
                correo: correoLimpio,
                token
            });

            return res.status(201).json({
                mensaje: enviado
                    ? "Invitación enviada correctamente."
                    : "No se pudo enviar el correo, pero la invitación quedó creada.",
                usuario: {
                    id: usuario._id,
                    correo: usuario.correo,
                    estado: usuario.estado,
                    modulosAsignados: usuario.modulosAsignados
                },
                enviado,
                enlace
            });
        } catch (error) {
            return responderError(res, error, "Invitar docente");
        }
    }

    /** Completar el registro de un docente desde su invitación. */
    async registrarDocente(req, res) {
        try {
            const { token, nombre, contrasena, aceptarPolitica } = req.body ?? {};

            if (typeof token !== "string" || !token.trim()) {
                return errorCliente(res, 400, "TOKEN_REQUERIDO", "El enlace de invitación no es válido.");
            }

            if (typeof nombre !== "string" || !nombre.trim()) {
                return errorCliente(res, 400, "NOMBRE_REQUERIDO", "Escribe tu nombre completo.");
            }

            const motivo = motivoContrasenaInvalida(contrasena);

            if (motivo) {
                return errorCliente(res, 400, "CONTRASENA_INVALIDA", motivo);
            }

            if (aceptarPolitica !== true) {
                return errorCliente(res, 400, "POLITICA_REQUERIDA", "Debes aceptar la política de tratamiento de datos.");
            }

            const invitacion = await Invitacion.findOne({
                tokenHash: hashInvitacion(token)
            });

            if (!invitacionVigente(invitacion)) {
                return errorCliente(res, 400, "INVITACION_INVALIDA", "El enlace de invitación ya se usó o venció. Pídele otra al administrador.");
            }

            const usuario = await Usuario.findOne({ correo: invitacion.correo });

            if (!usuario || usuario.rol !== "docente") {
                return errorCliente(res, 400, "INVITACION_INVALIDA", "El enlace de invitación ya no es válido.");
            }

            if (usuario.estado !== "pendiente") {
                return errorCliente(res, 409, "CUENTA_YA_ACTIVA", "Esta cuenta ya fue activada. Ingresa con tu contraseña.");
            }

            usuario.nombre = nombre.trim();
            usuario.contrasena = await bcrypt.hash(contrasena, 10);
            usuario.estado = "activo";
            await usuario.save();

            invitacion.usado = true;
            await invitacion.save();

            abrirSesion(res, usuario);

            return res.status(201).json({
                mensaje: "Cuenta activada correctamente.",
                usuario: {
                    id: usuario._id,
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                    rol: usuario.rol
                }
            });
        } catch (error) {
            return responderError(res, error, "Registrar docente");
        }
    }

}

export default new usuarioController();
