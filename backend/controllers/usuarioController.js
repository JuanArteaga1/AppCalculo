import usuariosModelo from "../models/usuarios.js";
import bcrypt from "bcryptjs";
import { errorCliente, errorSistema } from "../lib/respuestas.js";
import { abrirSesion, cerrarSesion } from "../middlewares/sesion.js";
import mongoose from "mongoose";
import Usuario from "../schemas/usuarios.js";
import Modulo from "../schemas/modulos.js";

const usuarioNoExiste = (res) => errorCliente(res, 404, "USUARIO_NO_ENCONTRADO", "Ese usuario no existe.");

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

            if (!usuario || !usuario.contrasena) {
                return errorCliente(res, 401, "CREDENCIALES_INVALIDAS", "Correo o contraseña incorrectos.");
            }

            if (usuario.estado !== "activo") {
                return errorCliente(res, 403, "CUENTA_INACTIVA", "Tu cuenta todavía no está activa.");
            }

            const claveValida = await bcrypt.compare(contrasena, usuario.contrasena);

            if (!claveValida) {
                return errorCliente(res, 401, "CREDENCIALES_INVALIDAS", "Correo o contraseña incorrectos.");
            }

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

}

export default new usuarioController();
