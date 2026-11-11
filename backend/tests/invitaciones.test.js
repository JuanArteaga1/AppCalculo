import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Invitacion, { hashToken, generarTokenInvitacion } from "../schemas/invitaciones.js";
import Usuario from "../schemas/usuarios.js";
import {
    arrancarBackend,
    conectarBase,
    crearUsuario,
    ingresar,
    limpiarYDesconectar
} from "./apoyo.js";

const PREFIJO = "test.invitaciones.";
let backend;

function correoTest() {
    return `${PREFIJO}${Date.now()}.${Math.random().toString(36).slice(2)}@uniautonoma.edu.co`;
}

async function invitarDocente(base, cookie, correo) {
    const respuesta = await fetch(`${base}/usuarios/invitar-docente`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ correo })
    });

    return {
        estado: respuesta.status,
        cuerpo: await respuesta.json().catch(() => null)
    };
}

async function registrarDocente(base, token, nombre, contrasena) {
    const respuesta = await fetch(`${base}/usuarios/registrar-docente`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            token,
            nombre,
            contrasena,
            aceptarPolitica: true
        })
    });

    const cookie = respuesta.headers.getSetCookie().find((c) => c.startsWith("sesion="))?.split(";")[0] ?? null;

    return {
        estado: respuesta.status,
        cuerpo: await respuesta.json().catch(() => null),
        cookie
    };
}

async function validarInvitacion(base, token) {
    const respuesta = await fetch(`${base}/usuarios/invitacion/${token}`);

    return {
        estado: respuesta.status,
        cuerpo: await respuesta.json().catch(() => null)
    };
}

before(async () => {
    process.env.URL_APP = process.env.URL_APP || "http://localhost:5199";

    await conectarBase();
    backend = await arrancarBackend(5199);
});

after(async () => {
    await Usuario.deleteMany({ correo: { $regex: `^${PREFIJO.replace(/\./g, "\\.")}` } });
    await Invitacion.deleteMany({ correo: { $regex: `^${PREFIJO.replace(/\./g, "\\.")}` } });
    backend?.detener();
    await limpiarYDesconectar();
});

test("CA-02: el administrador invita a un docente y la invitación queda creada", async () => {
    const { correo: adminCorreo, clave: adminClave } = await crearUsuario({ rol: "administrador" });
    const { cookie } = await ingresar(backend.base, adminCorreo, adminClave);
    const correo = correoTest();

    const respuesta = await invitarDocente(backend.base, cookie, correo);

    assert.equal(respuesta.estado, 201);
    assert.equal(respuesta.cuerpo.usuario.correo, correo);
    assert.equal(respuesta.cuerpo.usuario.estado, "pendiente");
    assert.ok(respuesta.cuerpo.enlace);

    const invitacion = await Invitacion.findOne({ correo });
    assert.ok(invitacion);
    assert.equal(invitacion.usado, false);
    assert.ok(invitacion.vence > new Date());
});

test("CA-08: no se puede invitar un correo que ya tiene cuenta", async () => {
    const { correo: adminCorreo, clave: adminClave } = await crearUsuario({ rol: "administrador" });
    const { cookie } = await ingresar(backend.base, adminCorreo, adminClave);
    const correo = correoTest();

    await Usuario.create({ nombre: "Docente activo", correo, rol: "docente", estado: "activo" });

    const respuesta = await invitarDocente(backend.base, cookie, correo);

    assert.equal(respuesta.estado, 409);
    assert.equal(respuesta.cuerpo.error, "CORREO_DUPLICADO");
});

test("CA-03: el docente completa el registro con una invitación válida", async () => {
    const { correo: adminCorreo, clave: adminClave } = await crearUsuario({ rol: "administrador" });
    const { cookie: adminCookie } = await ingresar(backend.base, adminCorreo, adminClave);
    const correo = correoTest();

    const invitacionRespuesta = await invitarDocente(backend.base, adminCookie, correo);
    assert.equal(invitacionRespuesta.estado, 201);

    const token = new URL(invitacionRespuesta.cuerpo.enlace).hash.slice(1);
    assert.ok(token);

    const validacion = await validarInvitacion(backend.base, token);
    assert.equal(validacion.estado, 200);
    assert.equal(validacion.cuerpo.correo, correo);
    assert.ok(validacion.cuerpo.abiertoEn);

    const registro = await registrarDocente(backend.base, token, "Docente Prueba", "ClaveSegura123");

    assert.equal(registro.estado, 201);
    assert.ok(registro.cookie);
    assert.equal(registro.cuerpo.usuario.rol, "docente");

    const usuario = await Usuario.findOne({ correo }).select("+contrasena");
    assert.equal(usuario.estado, "activo");
    assert.equal(usuario.nombre, "Docente Prueba");
    assert.deepEqual(usuario.modulosAsignados, []);
    assert.ok(await bcrypt.compare("ClaveSegura123", usuario.contrasena));

    const invitacion = await Invitacion.findOne({ correo });
    assert.equal(invitacion.usado, true);
});

test("CA-07: no se puede usar una invitación vencida o usada", async () => {
    const { correo: adminCorreo, clave: adminClave } = await crearUsuario({ rol: "administrador" });
    const { cookie: adminCookie } = await ingresar(backend.base, adminCorreo, adminClave);
    const correo = correoTest();

    const invitacionRespuesta = await invitarDocente(backend.base, adminCookie, correo);
    assert.equal(invitacionRespuesta.estado, 201);

    const token = new URL(invitacionRespuesta.cuerpo.enlace).hash.slice(1);

    // Primero uso válido.
    await registrarDocente(backend.base, token, "Docente Usado", "ClaveSegura123");

    // Segundo intento con el mismo token.
    const segundo = await registrarDocente(backend.base, token, "Otro", "ClaveSegura123");
    assert.equal(segundo.estado, 400);
    assert.equal(segundo.cuerpo.error, "INVITACION_INVALIDA");
});

test("BR-01: la invitación vence a las 72 horas sin abrir", async () => {
    const { correo: adminCorreo, clave: adminClave } = await crearUsuario({ rol: "administrador" });
    const { cookie: adminCookie } = await ingresar(backend.base, adminCorreo, adminClave);
    const correo = correoTest();

    const invitacionRespuesta = await invitarDocente(backend.base, adminCookie, correo);
    assert.equal(invitacionRespuesta.estado, 201);

    const token = new URL(invitacionRespuesta.cuerpo.enlace).hash.slice(1);

    await Invitacion.updateOne(
        { tokenHash: hashToken(token) },
        { $set: { vence: new Date(Date.now() - 1000) } }
    );

    const validacion = await validarInvitacion(backend.base, token);
    assert.equal(validacion.estado, 400);
    assert.equal(validacion.cuerpo.error, "INVITACION_INVALIDA");
});

test("BR-01: tras abrir, el enlace solo sirve 10 minutos", async () => {
    const { correo: adminCorreo, clave: adminClave } = await crearUsuario({ rol: "administrador" });
    const { cookie: adminCookie } = await ingresar(backend.base, adminCorreo, adminClave);
    const correo = correoTest();

    const invitacionRespuesta = await invitarDocente(backend.base, adminCookie, correo);
    assert.equal(invitacionRespuesta.estado, 201);

    const token = new URL(invitacionRespuesta.cuerpo.enlace).hash.slice(1);

    const primera = await validarInvitacion(backend.base, token);
    assert.equal(primera.estado, 200);

    await Invitacion.updateOne(
        { tokenHash: hashToken(token) },
        { $set: { abiertoEn: new Date(Date.now() - 11 * 60 * 1000) } }
    );

    const vencida = await validarInvitacion(backend.base, token);
    assert.equal(vencida.estado, 400);
    assert.equal(vencida.cuerpo.error, "INVITACION_INVALIDA");

    const registro = await registrarDocente(backend.base, token, "Docente", "ClaveSegura123");
    assert.equal(registro.estado, 400);
    assert.equal(registro.cuerpo.error, "INVITACION_INVALIDA");
});

test("BR-01: reenviar una invitación invalida la anterior", async () => {
    const { correo: adminCorreo, clave: adminClave } = await crearUsuario({ rol: "administrador" });
    const { cookie: adminCookie } = await ingresar(backend.base, adminCorreo, adminClave);
    const correo = correoTest();

    const primera = await invitarDocente(backend.base, adminCookie, correo);
    assert.equal(primera.estado, 201, JSON.stringify(primera.cuerpo));
    assert.ok(primera.cuerpo.enlace, JSON.stringify(primera.cuerpo));

    const tokenAnterior = new URL(primera.cuerpo.enlace).hash.slice(1);
    assert.ok(tokenAnterior, `enlace sin token: ${primera.cuerpo.enlace}`);

    const segunda = await invitarDocente(backend.base, adminCookie, correo);
    assert.equal(segunda.estado, 201, JSON.stringify(segunda.cuerpo));

    const invitacionAnterior = await Invitacion.findOne({ tokenHash: hashToken(tokenAnterior) });
    assert.equal(invitacionAnterior.usado, true);

    const registroAnterior = await registrarDocente(backend.base, tokenAnterior, "Docente", "ClaveSegura123");
    assert.equal(registroAnterior.estado, 400);
});

test("CA-09: el registro rechaza contraseñas cortas o comunes", async () => {
    const { correo: adminCorreo, clave: adminClave } = await crearUsuario({ rol: "administrador" });
    const { cookie: adminCookie } = await ingresar(backend.base, adminCorreo, adminClave);
    const correo = correoTest();

    const invitacionRespuesta = await invitarDocente(backend.base, adminCookie, correo);
    const token = new URL(invitacionRespuesta.cuerpo.enlace).hash.slice(1);

    const corta = await registrarDocente(backend.base, token, "Docente", "corta");
    assert.equal(corta.estado, 400);
    assert.equal(corta.cuerpo.error, "CONTRASENA_INVALIDA");

    const comun = await registrarDocente(backend.base, token, "Docente", "uniautonoma1");
    assert.equal(comun.estado, 400);
    assert.equal(comun.cuerpo.error, "CONTRASENA_INVALIDA");
});
