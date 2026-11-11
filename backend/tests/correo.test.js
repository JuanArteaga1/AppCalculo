import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { enviarEnlace, usarTransporte } from "../lib/correo.js";

// Sin red ni SMTP real: el envío se reemplaza por uno que guarda los mensajes.
const VARIABLES = ["SMTP_HOST", "SMTP_USUARIO", "SMTP_CLAVE", "SMTP_REMITENTE", "URL_APP"];
const copia = {};
const PARA = "test.correo@uniautonoma.edu.co";

beforeEach(() => {
    for (const nombre of VARIABLES) {
        copia[nombre] = process.env[nombre];
        delete process.env[nombre];
    }
    process.env.URL_APP = "https://educalc.test/";
});

afterEach(() => {
    usarTransporte(null);
    for (const nombre of VARIABLES) {
        if (copia[nombre] === undefined) delete process.env[nombre];
        else process.env[nombre] = copia[nombre];
    }
});

test("BR-04: sin correo configurado no se envía y queda el enlace para copiarlo", async () => {
    const resultado = await enviarEnlace("invitacion", PARA, "abc123");

    assert.equal(resultado.enviado, false);
    assert.equal(resultado.enlace, "https://educalc.test/registro#abc123");
});

test("CA-02 (envío): el correo lleva el enlace con el token fuera de la ruta", async () => {
    const enviados = [];
    usarTransporte({ sendMail: async (mensaje) => { enviados.push(mensaje); } });

    const resultado = await enviarEnlace("invitacion", PARA, "abc123");

    assert.equal(resultado.enviado, true);
    assert.equal(enviados.length, 1);
    assert.equal(enviados[0].to, PARA);
    assert.match(enviados[0].subject, /docente/);
    assert.ok(enviados[0].text.includes("https://educalc.test/registro#abc123"));
    assert.ok(enviados[0].html.includes('href="https://educalc.test/registro#abc123"'));
    assert.match(enviados[0].text, /72 horas/);
});

test("BR-04: si el envío falla no lanza y queda el enlace para copiarlo", async () => {
    usarTransporte({ sendMail: async () => { throw Object.assign(new Error("caído"), { code: "ECONNREFUSED" }); } });

    const resultado = await enviarEnlace("restablecimiento", PARA, "xyz");

    assert.equal(resultado.enviado, false);
    assert.equal(resultado.enlace, "https://educalc.test/restablecer#xyz");
});

test("Cada tipo usa su ruta y su vigencia; un tipo desconocido es un error", async () => {
    const enviados = [];
    usarTransporte({ sendMail: async (mensaje) => { enviados.push(mensaje); } });

    await enviarEnlace("confirmacion", PARA, "t");
    await enviarEnlace("restablecimiento", PARA, "t");

    assert.ok(enviados[0].text.includes("/confirmar#t"));
    assert.match(enviados[0].text, /24 horas/);
    assert.ok(enviados[1].text.includes("/restablecer#t"));
    assert.match(enviados[1].text, /1 hora/);
    await assert.rejects(enviarEnlace("otro", PARA, "t"), /desconocida/);
});
