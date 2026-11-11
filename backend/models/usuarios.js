//import dbClient from "../config/dbClient.js";
import { ObjectId } from "mongodb";
import Usuario from "../schemas/usuarios.js";
import mongoose from "mongoose";

class usuariosModelo {

    async create(usuario) {
        const correo = usuario.correo?.trim().toLowerCase();
        const rol = usuario.rol;
        const modulos = usuario.modulos;

        if (!correo) {
            throw new Error("El correo es obligatorio.");
        }

        if (!["estudiante", "docente"].includes(rol)) {
            throw new Error(
                "Solo se pueden invitar estudiantes o docentes."
            );
        }

        const datos = {
            correo,
            rol,
            estado: "pendiente"
        };

        if (rol === "docente" && Array.isArray(modulos)) {
            datos.modulosAsignados = modulos;
        }

        return await Usuario.create(datos);
    }

    async update(id, usuario) {
        /*const colUsuarios = dbClient.db.collection('usuarios');
        return await colUsuarios.updateOne({_id: new ObjectId(id)}, {$set: usuario});*/
        return await Usuario.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) });
    }

    async delete(id) {
        /*const colUsuarios = dbClient.db.collection('usuarios');
        return await colUsuarios.deleteOne({_id: new ObjectId(id)});*/
        return await Usuario.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id) });
    }

    async getAll() {
        /*const colUsuarios = dbClient.db.collection('usuarios');
        return await colUsuarios.find({}).toArray();*/
        return await Usuario.find();
    }

    async getOne(id) {
        /*const colUsuarios = dbClient.db.collection('usuarios');
        return await colUsuarios.findOne({_id: new ObjectId(id)});*/
        return await Usuario.findById(id);
    }

    async getByCorreo(correo) {
        return await Usuario.findOne({
            correo: correo.trim().toLowerCase()
        }).select("+contrasena");
    }

}

export default new usuariosModelo();