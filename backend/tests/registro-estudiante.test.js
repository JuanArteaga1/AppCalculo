import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import Usuario from "../schemas/usuarios.js";
import Restablecimiento, { generarTokenRestablecimiento, hashToken } from "../schemas/restablecimientos.js";
import { PREGRADOS } from "../lib/carreras.js";
import { enviarAvisoCuentaExistente, usarTransporte } from "../lib/correo.js";
import { arrancarBackend, buscarUsuario, conectarBase, crearUsuario, ingresar, limpiarYDesconectar } from "./apoyo.js";

// spec-login tarea C: registro del estudiante con confirmación de correo.
// Sin SMTP en los tests: el enlace real solo viaja por correo, así que para
// confirmar se crea un token conocido para la misma cuenta.
let backend;
const CLAVE = "una-clave-de-prueba-larga";
const nuevoCorreo = () => `test.login.reg${randomBytes(4).toString("hex")}@uniautonoma.edu.co`;

async function pedir(ruta, cuerpo) {
    const respuesta = await fetch(`${backend.base}${ruta}`, {
        method: cuerpo ? "POST" : "GET",
        headers: cuerpo ? { "Content-Type": "application/json" } : {},
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
    return { estado: respuesta.status, cuerpo: await respuesta.json().catch(() => null) };
}

const registrar = (datos) => pedir("/usuarios/registro", {
    nombre: "Estudiante de test",
    carrera: PREGRADOS[0],
    contrasena: CLAVE,
    aceptarPolitica: true,
    ...datos,
});

async function tokenConocido(usuarioId, venceEn = 60_000) {
    const token = generarTokenRestablecimiento();
    await Restablecimiento.create({ usuario: usuarioId, tipo: "confirmar-correo", tokenHash: hashToken(token), vence: new Date(Date.now() + venceEn) });
    return token;
}

before(async () => {
    await conectarBase();
    // Sin SMTP: nunca se envía un correo a las direcciones inventadas del test.
    delete process.env.SMTP_HOST;
    backend = await arrancarBackend(5195);
});

after(async () => {
    const temporales = await Usuario.find({ correo: /^test\.login\./ }).select("_id");
    await Restablecimiento.deleteMany({ usuario: { $in: temporales.map((u) => u._id) } });
    backend?.detener();
    await limpiarYDesconectar();
});

test("BR-11: la lista de carreras es la de la universidad", async () => {
    const { estado, cuerpo } = await pedir("/usuarios/carreras");
    assert.equal(estado, 200);
    assert.ok(cuerpo.pregrados.includes("Ingeniería de Software y Computación"));
    assert.ok(cuerpo.especializaciones.includes("Especialización en Pedagogía"));
});

test("CA-15: el registro deja la cuenta pendiente con su carrera y un enlace de 24 horas; al confirmar queda activa", async () => {
    const correo = nuevoCorreo();
    const registro = await registrar({ correo });
    assert.equal(registro.estado, 202);
    assert.ok(!("enlace" in registro.cuerpo), "el enlace no vuelve a quien se registra");

    const usuario = await Usuario.findOne({ correo }).select("+contrasena").lean();
    assert.equal(usuario.estado, "pendiente");
    assert.equal(usuario.rol, "estudiante");
    assert.equal(usuario.carrera, PREGRADOS[0]);
    assert.ok(usuario.aceptoPoliticaEn);
    assert.notEqual(usuario.contrasena, CLAVE);

    const enlace = await Restablecimiento.findOne({ usuario: usuario._id, tipo: "confirmar-correo", usado: false }).lean();
    const horas = (enlace.vence.getTime() - Date.now()) / 3_600_000;
    assert.ok(horas > 23.9 && horas <= 24);

    const token = await tokenConocido(usuario._id);
    const confirmado = await pedir("/usuarios/confirmar", { token });
    assert.equal(confirmado.estado, 200);
    assert.equal((await buscarUsuario(correo)).estado, "activo");

    // BR-12: el enlace sirve una sola vez.
    const otraVez = await pedir("/usuarios/confirmar", { token });
    assert.equal(otraVez.estado, 400);
    assert.equal(otraVez.cuerpo.error, "ENLACE_INVALIDO");

    assert.equal((await ingresar(backend.base, correo, CLAVE)).estado, 200);
});

test("CA-16: un estudiante pendiente no entra, y puede pedir otro enlace que anula el anterior", async () => {
    const correo = nuevoCorreo();
    await registrar({ correo });
    const usuario = await buscarUsuario(correo);

    const conClave = await ingresar(backend.base, correo, CLAVE);
    assert.equal(conClave.estado, 403);
    assert.equal(conClave.cuerpo.error, "CUENTA_PENDIENTE");
    assert.equal(conClave.cookie, null);

    // Sin la clave correcta no se revela que la cuenta está pendiente (BR-06).
    assert.equal((await ingresar(backend.base, correo, "otra-clave-cualquiera")).cuerpo.error, "CREDENCIALES_INVALIDAS");

    const reenvio = await pedir("/usuarios/reenviar-confirmacion", { correo });
    assert.equal(reenvio.estado, 202);
    const vigentes = await Restablecimiento.countDocuments({ usuario: usuario._id, tipo: "confirmar-correo", usado: false });
    assert.equal(vigentes, 1);
    assert.equal(await Restablecimiento.countDocuments({ usuario: usuario._id, tipo: "confirmar-correo" }), 2);
});

test("BR-12: un enlace vencido no confirma", async () => {
    const correo = nuevoCorreo();
    await registrar({ correo });
    const token = await tokenConocido((await buscarUsuario(correo))._id, -1000);

    const respuesta = await pedir("/usuarios/confirmar", { token });
    assert.equal(respuesta.estado, 400);
    assert.equal((await buscarUsuario(correo)).estado, "pendiente");
});

test("CA-18: un correo con cuenta no crea otra y recibe la misma respuesta", async () => {
    const { correo } = await crearUsuario({ rol: "estudiante" });
    const antes = await Usuario.findOne({ correo }).select("+contrasena").lean();

    const existente = await registrar({ correo });
    const nuevo = await registrar({ correo: nuevoCorreo() });
    assert.equal(existente.estado, nuevo.estado);
    assert.deepEqual(existente.cuerpo, nuevo.cuerpo);

    assert.equal(await Usuario.countDocuments({ correo }), 1);
    const despues = await Usuario.findOne({ correo }).select("+contrasena").lean();
    assert.equal(despues.contrasena, antes.contrasena);
    assert.equal(despues.estado, "activo");

    // Reenviar también responde igual exista o no.
    const sinCuenta = await pedir("/usuarios/reenviar-confirmacion", { correo: nuevoCorreo() });
    assert.equal(sinCuenta.estado, 202);
});

test("RF-03: nombre, correo institucional, carrera de la lista, contraseña válida y política son obligatorios", async () => {
    const casos = [
        [{ correo: "alguien@gmail.com" }, "CORREO_INVALIDO"],
        [{ correo: nuevoCorreo(), carrera: "Medicina" }, "CARRERA_INVALIDA"],
        [{ correo: nuevoCorreo(), contrasena: "corta" }, "CONTRASENA_INVALIDA"],
        [{ correo: nuevoCorreo(), aceptarPolitica: false }, "POLITICA_REQUERIDA"],
    ];

    for (const [datos, codigo] of casos) {
        const respuesta = await registrar(datos);
        assert.equal(respuesta.estado, 400);
        assert.equal(respuesta.cuerpo.error, codigo);
    }
});

test("CA-23: registrarse con el correo de un estudiante pendiente le envía un enlace nuevo, con la misma respuesta", async () => {
    const correo = nuevoCorreo();
    const primera = await registrar({ correo });
    const usuario = await buscarUsuario(correo);

    const segunda = await registrar({ correo, contrasena: "otra-clave-distinta-larga" });
    assert.deepEqual(segunda.cuerpo, primera.cuerpo);
    assert.equal(await Restablecimiento.countDocuments({ usuario: usuario._id, tipo: "confirmar-correo" }), 2);
    assert.equal(await Restablecimiento.countDocuments({ usuario: usuario._id, tipo: "confirmar-correo", usado: false }), 1);
    assert.equal(await Usuario.countDocuments({ correo }), 1);
});

test("CA-23: el aviso de cuenta existente lleva al ingreso, y al docente invitado le pide completar su invitación", async () => {
    const enviados = [];
    usarTransporte({ sendMail: async (mensaje) => { enviados.push(mensaje); } });

    try {
        await enviarAvisoCuentaExistente({ correo: "test.login.aviso@uniautonoma.edu.co" });
        await enviarAvisoCuentaExistente({ correo: "test.login.aviso@uniautonoma.edu.co", caso: "invitado" });
    } finally {
        usarTransporte(null);
    }

    assert.equal(enviados.length, 2);
    assert.match(enviados[0].subject, /Ya tienes una cuenta/);
    assert.match(enviados[0].text, /Recuperar acceso/);
    assert.match(enviados[0].text, /\/acceso/);
    assert.ok(!/vence en/.test(enviados[0].html));
    assert.match(enviados[1].text, /invitación de docente pendiente/);
});
