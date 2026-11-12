
import "dotenv/config";
import mongoose from "mongoose";
import { uriMongo } from "../config/uriMongo.js";
import bcrypt from "bcryptjs";
import Usuario from "../schemas/usuarios.js";

async function crearAdmin() {
    try {
        await mongoose.connect(uriMongo());

        console.log("Conexión a MongoDB establecida.");

        // Datos del administrador, definidos en .env
        const { ADMIN_NOMBRE, ADMIN_CORREO, ADMIN_PASSWORD } = process.env;

        if (!ADMIN_NOMBRE || !ADMIN_CORREO || !ADMIN_PASSWORD) {
            throw new Error(
                "Configura ADMIN_NOMBRE, ADMIN_CORREO y ADMIN_PASSWORD en .env"
            );
        }

        const correo = ADMIN_CORREO.trim().toLowerCase();

        // No duplicar administradores con el mismo correo
        const existente = await Usuario.findOne({ correo });

        if (existente) {
            console.log(
                "Ya existe una cuenta con ese correo. No se realizaron cambios."
            );
            return;
        }

        // Convertir la contraseña en un hash
        const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

        // Crear la cuenta inicial
        await Usuario.create({
            nombre: ADMIN_NOMBRE.trim(),
            correo,
            contrasena: hash,
            rol: "administrador",
            estado: "activo"
        });

        console.log("Administrador creado correctamente.");
    } catch (error) {
        console.error("No se pudo crear el administrador:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

crearAdmin();
