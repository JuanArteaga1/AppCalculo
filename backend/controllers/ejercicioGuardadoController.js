import mongoose from "mongoose";
import EjercicioGuardado from "../schemas/ejercicioGuardado.js";
import { errorCliente, errorSistema } from "../lib/respuestas.js";

function recortar(texto, maximo) {
    return String(texto ?? "").trim().slice(0, maximo);
}

class EjercicioGuardadoController {
    async listar(req, res) {
        try {
            const ejercicios = await EjercicioGuardado.find({ usuario: req.usuario._id })
                .sort({ updatedAt: -1, createdAt: -1 })
                .lean();

            return res.json({ ejercicios });
        } catch (error) {
            return errorSistema(res, "Listar ejercicios guardados", error);
        }
    }

    async obtener(req, res) {
        try {
            const { id } = req.params;

            if (!id || !mongoose.isValidObjectId(id)) {
                return errorCliente(res, 404, "EJERCICIO_NO_ENCONTRADO", "Ese ejercicio no está guardado.");
            }

            const ejercicio = await EjercicioGuardado.findOne({
                _id: id,
                usuario: req.usuario._id,
            }).lean();

            if (!ejercicio) {
                return errorCliente(res, 404, "EJERCICIO_NO_ENCONTRADO", "Ese ejercicio no está guardado.");
            }

            return res.json({ ejercicio });
        } catch (error) {
            return errorSistema(res, "Obtener ejercicio guardado", error);
        }
    }

    async guardar(req, res) {
        try {
            const funciones = Array.isArray(req.body?.funciones)
                ? req.body.funciones
                    .slice(0, 20)
                    .map((f, idx) => ({
                        id: Number(f?.id ?? idx + 1),
                        entrada: recortar(f?.entrada, 200),
                        color: recortar(f?.color, 20) || "#2563EB",
                        visible: f?.visible !== false,
                        nombre: recortar(f?.nombre, 20) || `f_{${idx + 1}}`,
                    }))
                    .filter((f) => f.entrada)
                : [];

            if (!funciones.length) {
                return errorCliente(res, 400, "DATOS_INVALIDOS", "Grafica al menos una función para guardarla.");
            }

            const nombre = recortar(req.body?.nombre, 100) || funciones[0].entrada || "Ejercicio de laboratorio";
            const herramienta = req.body?.herramienta === "derivada" ? "derivada" : "limite";
            const punto = recortar(req.body?.punto, 30) || "0";
            const incremento = recortar(req.body?.incremento, 30) || "0.5";
            const vista = req.body?.vista && typeof req.body.vista === "object" ? req.body.vista : null;

            const id = req.body?.id;
            if (id && mongoose.isValidObjectId(id)) {
                const existente = await EjercicioGuardado.findOne({ _id: id, usuario: req.usuario._id });
                if (existente) {
                    existente.nombre = nombre;
                    existente.funciones = funciones;
                    existente.herramienta = herramienta;
                    existente.punto = punto;
                    existente.incremento = incremento;
                    existente.vista = vista;
                    await existente.save();
                    return res.json({ ejercicio: existente });
                }
            }

            const nuevo = await EjercicioGuardado.create({
                usuario: req.usuario._id,
                nombre,
                funciones,
                herramienta,
                punto,
                incremento,
                vista,
            });

            return res.status(201).json({ ejercicio: nuevo });
        } catch (error) {
            return errorSistema(res, "Guardar ejercicio en laboratorio", error);
        }
    }

    async borrar(req, res) {
        try {
            const { id } = req.params;

            if (!id || !mongoose.isValidObjectId(id)) {
                return errorCliente(res, 404, "EJERCICIO_NO_ENCONTRADO", "Ese ejercicio no está guardado.");
            }

            const ejercicio = await EjercicioGuardado.findOneAndDelete({
                _id: id,
                usuario: req.usuario._id,
            });

            if (!ejercicio) {
                return errorCliente(res, 404, "EJERCICIO_NO_ENCONTRADO", "Ese ejercicio no está guardado.");
            }

            return res.status(204).end();
        } catch (error) {
            return errorSistema(res, "Borrar ejercicio guardado", error);
        }
    }
}

export default new EjercicioGuardadoController();
