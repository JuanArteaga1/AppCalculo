import "dotenv/config";
import { spawn } from "child_process";
import { randomBytes } from "crypto";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Usuario from "../schemas/usuarios.js";

/**
 * Apoyo para los tests: cada archivo arranca su propio backend en un puerto
 * aparte (así el límite de intentos por IP empieza en cero) y crea cuentas
 * temporales con el prefijo test.login., que se borran al terminar.
 */
const CARPETA_BACKEND = fileURLToPath(new URL("..", import.meta.url));
const PREFIJO = "test.login.";

export async function conectarBase() {
    const { USER_DB, PASS_DB, SERVER_DB } = process.env;
    await mongoose.connect(
        `mongodb+srv://${encodeURIComponent(USER_DB)}:${encodeURIComponent(PASS_DB)}@${SERVER_DB}/PlataformaEducativa` +
        "?retryWrites=true&w=majority"
    );
}

export async function limpiarYDesconectar() {
    await Usuario.deleteMany({ correo: { $regex: `^${PREFIJO.replace(".", "\\.")}` } });
    await mongoose.disconnect();
}

/** Crea una cuenta temporal y devuelve su correo y su contraseña. */
export async function crearUsuario({ rol = "estudiante", estado = "activo" } = {}) {
    const correo = `${PREFIJO}${randomBytes(5).toString("hex")}@uniautonoma.edu.co`;
    const clave = randomBytes(9).toString("base64url");
    await Usuario.create({ nombre: "Cuenta de test", correo, rol, estado, contrasena: await bcrypt.hash(clave, 4) });
    return { correo, clave };
}

export const buscarUsuario = (correo) => Usuario.findOne({ correo });

/** Arranca `node app.js` en el puerto dado y espera a que la base responda. */
export async function arrancarBackend(puerto) {
    const proceso = spawn(process.execPath, ["app.js"], {
        cwd: CARPETA_BACKEND,
        env: { ...process.env, PORT: String(puerto), LOG_PETICIONES: "false" },
        stdio: "ignore",
    });

    const base = `http://localhost:${puerto}/api`;
    for (let intento = 0; intento < 60; intento += 1) {
        try {
            if ((await fetch(`${base}/temas`)).status === 200) return { base, detener: () => proceso.kill() };
        } catch {
            // Todavía no escucha.
        }
        await new Promise((listo) => setTimeout(listo, 500));
    }

    proceso.kill();
    throw new Error(`El backend no respondió en el puerto ${puerto}.`);
}

/** POST /usuarios/login; devuelve el código, el cuerpo y la cookie de sesión. */
export async function ingresar(base, correo, contrasena) {
    const respuesta = await fetch(`${base}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
    });
    const cookie = respuesta.headers.getSetCookie().find((c) => c.startsWith("sesion="))?.split(";")[0] ?? null;
    return { estado: respuesta.status, cuerpo: await respuesta.json().catch(() => null), cookie };
}

export async function quienSoy(base, cookie) {
    const respuesta = await fetch(`${base}/usuarios/me`, { headers: cookie ? { Cookie: cookie } : {} });
    return { estado: respuesta.status, cuerpo: await respuesta.json().catch(() => null) };
}
