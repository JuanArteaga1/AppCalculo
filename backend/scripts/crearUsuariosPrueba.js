import "dotenv/config";
import { randomBytes } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import mongoose from "mongoose";
import { uriMongo } from "../config/uriMongo.js";
import bcrypt from "bcryptjs";
import Usuario from "../schemas/usuarios.js";

/**
 * Crea o actualiza una cuenta activa por rol para desarrollar sin registro.
 * Las credenciales viven en usuarios-prueba.json, que git ignora: se comparten
 * con el equipo por un canal privado y nunca se imprimen en la consola.
 */
const ARCHIVO = new URL("../usuarios-prueba.json", import.meta.url);

const CUENTAS = [
    { rol: "administrador", nombre: "Administrador de prueba", correo: "prueba.administrador@uniautonoma.edu.co" },
    { rol: "docente", nombre: "Docente de prueba", correo: "prueba.docente@uniautonoma.edu.co" },
    { rol: "estudiante", nombre: "Estudiante de prueba", correo: "prueba.estudiante@uniautonoma.edu.co" },
];

/** Reutiliza las contraseñas ya generadas, así el script se puede repetir sin cambiarlas. */
function leerCredenciales() {
    if (existsSync(ARCHIVO)) {
        return JSON.parse(readFileSync(ARCHIVO, "utf8"));
    }

    const credenciales = CUENTAS.map((c) => ({ ...c, contrasena: randomBytes(12).toString("base64url") }));
    writeFileSync(ARCHIVO, `${JSON.stringify(credenciales, null, 2)}\n`);
    return credenciales;
}

/** `--borrar` quita las cuentas de prueba: hacerlo antes de pasar a producción. */
async function borrarUsuariosPrueba() {
    const { deletedCount } = await Usuario.deleteMany({ correo: { $in: CUENTAS.map((c) => c.correo) } });
    console.log(`Cuentas de prueba borradas: ${deletedCount}.`);
}

async function crearUsuariosPrueba() {
    try {
        await mongoose.connect(uriMongo());

        if (process.argv.includes("--borrar")) {
            await borrarUsuariosPrueba();
            return;
        }

        for (const { rol, nombre, correo, contrasena } of leerCredenciales()) {
            const existente = await Usuario.findOne({ correo });

            // Nunca convertir en cuenta de prueba una cuenta real de otro rol.
            if (existente && existente.rol !== rol) {
                console.log(`${correo}: ya existe con otro rol. No se cambió.`);
                continue;
            }

            await Usuario.updateOne(
                { correo },
                { $set: { nombre, rol, estado: "activo", contrasena: await bcrypt.hash(contrasena, 12) } },
                { upsert: true }
            );

            console.log(`${correo}: ${existente ? "actualizada" : "creada"} (${rol}).`);
        }

        console.log("Credenciales en backend/usuarios-prueba.json. No las subas al repositorio.");
    } catch (error) {
        console.error("No se pudieron crear los usuarios de prueba:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

crearUsuariosPrueba();
