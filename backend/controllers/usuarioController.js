import usuariosModelo from "../models/usuarios.js";
import bcrypt from "bcryptjs";

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
                return res.status(400).json({
                    mensaje: e.message
                });
            }

            if (e.code === 11000) {
                return res.status(409).json({
                    mensaje: "Ese correo ya está registrado."
                });
            }

            console.error(e);
            return res.status(500).json({
                mensaje: "Error al crear la invitación."
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const data = await usuariosModelo.update(id, req.body);
            res.status(201).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).send(e);
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const data = await usuariosModelo.delete(id);
            res.status(206).json(data);
        } catch (e) {
            res.status(500).send(e);
        }
    }

    async getAll(req, res) {
        try {
            const data = await usuariosModelo.getAll();
            res.status(201).json(data);
        } catch (e) {
            res.status(500).send(e);
        }
    }

    async getOne(req, res) {
        try {
            const { id } = req.params;
            const data = await usuariosModelo.getOne(id);
            res.status(201).json(data);
        } catch (e) {
            res.status(500).send(e);
        }
    }


    async login(req, res) {
        try {
            const { correo, contrasena } = req.body;

            if (!correo || !contrasena) {
                return res.status(400).json({
                    mensaje: "Ingresa tu correo y contraseña."
                });
            }

            const usuario = await usuariosModelo.getByCorreo(correo);

            if (!usuario || !usuario.contrasena) {
                return res.status(401).json({
                    mensaje: "Correo o contraseña incorrectos."
                });
            }

            if (usuario.estado !== "activo") {
                return res.status(403).json({
                    mensaje: "Tu cuenta todavía no está activa."
                });
            }

            const claveValida = await bcrypt.compare(
                contrasena,
                usuario.contrasena
            );

            if (!claveValida) {
                return res.status(401).json({
                    mensaje: "Correo o contraseña incorrectos."
                });
            }

            return res.status(200).json({
                mensaje: "Usuario autenticado.",
                usuario: {
                    id: usuario._id,
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                    rol: usuario.rol
                }
            });
        } catch (error) {
            console.error("Error en login:", error);

            return res.status(500).json({
                mensaje: "Error interno del servidor."
            });
        }
    }

}

export default new usuarioController();