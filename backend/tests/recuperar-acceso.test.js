import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import Usuario from "../schemas/usuarios.js";
import Restablecimiento, { generarTokenRestablecimiento, hashToken } from "../schemas/restablecimientos.js";
import { arrancarBackend, buscarUsuario, conectarBase, crearUsuario, ingresar, limpiarYDesconectar, quienSoy } from "./apoyo.js";

// spec-recuperar-acceso. Sin SMTP: el enlace real solo viaja por correo, así
// que los tests crean su propio token para la misma cuenta.
let backend;
const NUEVA = "mi-frase-nueva-segura";

async function pedir(ruta, cuerpo) {
    const respuesta = await fetch(`${backend.base}${ruta}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
    });
    return { estado: respuesta.status, cuerpo: await respuesta.json().catch(() => null) };
}

async function tokenConocido(usuarioId, { venceEn = 72 * 3600_000, abiertoHace = null } = {}) {
    const token = generarTokenRestablecimiento();
    await Restablecimiento.create({
        usuario: usuarioId,
        tipo: "restablecer",
        tokenHash: hashToken(token),
        vence: new Date(Date.now() + venceEn),
        abiertoEn: abiertoHace === null ? null : new Date(Date.now() - abiertoHace),
    });
    return token;
}

const idDe = async (correo) => (await buscarUsuario(correo))._id;
const enlaces = async (correo) => Restablecimiento.find({ usuario: await idDe(correo), tipo: "restablecer" }).lean();

before(async () => {
    await conectarBase();
    // Sin SMTP: nunca se envía un correo a las direcciones inventadas del test.
    delete process.env.SMTP_HOST;
    backend = await arrancarBackend(5193);
});

after(async () => {
    const temporales = await Usuario.find({ correo: /^test\.login\./ }).select("_id");
    await Restablecimiento.deleteMany({ usuario: { $in: temporales.map((u) => u._id) } });
    backend?.detener();
    await limpiarYDesconectar();
});

test("CA-02: un correo activo genera un enlace de 72 horas guardado como hash, que no vuelve en la respuesta", async () => {
    const { correo } = await crearUsuario();
    const respuesta = await pedir("/usuarios/recuperar-enlace", { correo });

    assert.equal(respuesta.estado, 202);
    assert.deepEqual(Object.keys(respuesta.cuerpo), ["mensaje"]);

    const [enlace] = await enlaces(correo);
    assert.match(enlace.tokenHash, /^[a-f0-9]{64}$/);
    assert.equal(enlace.abiertoEn, null);
    const horas = (enlace.vence.getTime() - Date.now()) / 3_600_000;
    assert.ok(horas > 71.9 && horas <= 72);
});

test("CA-03: sin cuenta, inactiva o pendiente reciben la misma respuesta y ningún enlace", async () => {
    const activo = await pedir("/usuarios/recuperar-enlace", { correo: (await crearUsuario()).correo });
    const inactiva = await crearUsuario({ estado: "inactivo" });
    const pendiente = await crearUsuario({ estado: "pendiente" });

    for (const correo of [inactiva.correo, pendiente.correo, "test.login.nadie@uniautonoma.edu.co"]) {
        const respuesta = await pedir("/usuarios/recuperar-enlace", { correo });
        assert.equal(respuesta.estado, activo.estado);
        assert.deepEqual(respuesta.cuerpo, activo.cuerpo);
    }

    assert.equal((await enlaces(inactiva.correo)).length, 0);
    assert.equal((await enlaces(pendiente.correo)).length, 0);
});

test("CA-04: al abrir el enlace se guarda el primer clic y sirve 10 minutos", async () => {
    const { correo } = await crearUsuario();
    const token = await tokenConocido(await idDe(correo));

    const primera = await pedir("/usuarios/recuperar", { token });
    assert.equal(primera.estado, 200);
    const minutos = (new Date(primera.cuerpo.cierre).getTime() - Date.now()) / 60_000;
    assert.ok(minutos > 9.9 && minutos <= 10);

    // Abrirlo otra vez no reinicia el contador.
    const segunda = await pedir("/usuarios/recuperar", { token });
    assert.equal(segunda.cuerpo.abiertoEn, primera.cuerpo.abiertoEn);
});

test("CA-05: más de 10 minutos desde el clic, o más de 72 horas desde el envío, el enlace expira", async () => {
    const { correo } = await crearUsuario();
    const id = await idDe(correo);
    const abiertoHaceRato = await tokenConocido(id, { abiertoHace: 11 * 60_000 });
    const viejo = await tokenConocido(id, { venceEn: -1000 });

    for (const token of [abiertoHaceRato, viejo]) {
        const abrir = await pedir("/usuarios/recuperar", { token });
        assert.equal(abrir.estado, 400);
        assert.equal(abrir.cuerpo.descripcion, "El enlace expiró, solicita uno nuevo.");
        assert.equal((await pedir("/usuarios/restablecer", { token, contrasena: NUEVA })).estado, 400);
    }
});

test("CA-06 y BR-06: con un enlace válido la contraseña cambia, se quita el bloqueo y la anterior deja de servir", async () => {
    const { correo, clave } = await crearUsuario();
    await Usuario.updateOne({ correo }, { $set: { intentosFallidos: 3 } });
    const token = await tokenConocido(await idDe(correo));
    await pedir("/usuarios/recuperar", { token });

    const cambio = await pedir("/usuarios/restablecer", { token, contrasena: NUEVA });
    assert.equal(cambio.estado, 200);

    assert.equal((await buscarUsuario(correo)).intentosFallidos, 0);
    assert.equal((await ingresar(backend.base, correo, clave)).estado, 401);
    assert.equal((await ingresar(backend.base, correo, NUEVA)).estado, 200);
});

test("CA-08 y CA-11: un enlace usado no sirve otra vez, y pedir otro anula el anterior", async () => {
    const { correo } = await crearUsuario();
    const usado = await tokenConocido(await idDe(correo));
    assert.equal((await pedir("/usuarios/restablecer", { token: usado, contrasena: NUEVA })).estado, 200);
    assert.equal((await pedir("/usuarios/recuperar", { token: usado })).estado, 400);
    assert.equal((await pedir("/usuarios/restablecer", { token: usado, contrasena: NUEVA })).estado, 400);

    const anterior = await tokenConocido(await idDe(correo));
    assert.equal((await pedir("/usuarios/recuperar-enlace", { correo })).estado, 202);
    assert.equal((await pedir("/usuarios/recuperar", { token: anterior })).estado, 400);
    const vigentes = (await enlaces(correo)).filter((e) => !e.usado);
    assert.equal(vigentes.length, 1);
});

test("CA-09: cambiar la contraseña cierra las sesiones abiertas", async () => {
    const { correo, clave } = await crearUsuario();
    const { cookie } = await ingresar(backend.base, correo, clave);
    assert.equal((await quienSoy(backend.base, cookie)).estado, 200);

    const token = await tokenConocido(await idDe(correo));
    assert.equal((await pedir("/usuarios/restablecer", { token, contrasena: NUEVA })).estado, 200);
    assert.equal((await quienSoy(backend.base, cookie)).estado, 401);
});

test("CA-10: una contraseña corta o común se rechaza con el motivo y no gasta el enlace", async () => {
    const { correo } = await crearUsuario();
    const token = await tokenConocido(await idDe(correo));

    for (const contrasena of ["corta", "1234567890"]) {
        const respuesta = await pedir("/usuarios/restablecer", { token, contrasena });
        assert.equal(respuesta.estado, 400);
        assert.equal(respuesta.cuerpo.error, "CONTRASENA_INVALIDA");
        assert.ok(respuesta.cuerpo.descripcion);
    }

    assert.equal((await pedir("/usuarios/restablecer", { token, contrasena: NUEVA })).estado, 200);
});
