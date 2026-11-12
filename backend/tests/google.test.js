import test from "node:test";
import assert from "node:assert/strict";
import {
    esCorreoInstitucional,
    normalizarCorreo,
    rolParaCorreo,
    rutaSegura,
    urlAplicacion,
} from "../lib/google.js";

test("normaliza el correo antes de compararlo", () => {
    assert.equal(normalizarCorreo("  Estiven.Realpe.H@UNIAUTONOMA.EDU.CO  "), "estiven.realpe.h@uniautonoma.edu.co");
    assert.equal(normalizarCorreo(null), "");
});

test("solo acepta correos del dominio institucional", () => {
    assert.equal(esCorreoInstitucional("estudiante@uniautonoma.edu.co"), true);
    assert.equal(esCorreoInstitucional("Estudiante@Uniautonoma.edu.co"), true);
    assert.equal(esCorreoInstitucional("estudiante@gmail.com"), false);
    assert.equal(esCorreoInstitucional("estudiante@sub.uniautonoma.edu.co"), false);
    assert.equal(esCorreoInstitucional("@uniautonoma.edu.co"), false);
    assert.equal(esCorreoInstitucional("sin-arroba"), false);
});

test("Estiven entra como administrador", () => {
    assert.equal(rolParaCorreo("estiven.realpe.h@uniautonoma.edu.co"), "administrador");
    assert.equal(rolParaCorreo("estiven.realpe.h@uniautonoma.edu.co", "estudiante"), "administrador");
});

test("Juan entra como docente sin degradar a un administrador", () => {
    assert.equal(rolParaCorreo("juan.arteaga.f@uniautonoma.edu.co"), "docente");
    assert.equal(rolParaCorreo("juan.arteaga.f@uniautonoma.edu.co", "estudiante"), "docente");
    assert.equal(rolParaCorreo("juan.arteaga.f@uniautonoma.edu.co", "administrador"), "administrador");
});

test("un correo nuevo entra como estudiante y uno existente conserva su rol", () => {
    assert.equal(rolParaCorreo("otro@uniautonoma.edu.co"), "estudiante");
    assert.equal(rolParaCorreo("otro@uniautonoma.edu.co", "docente"), "docente");
    assert.equal(rolParaCorreo("otro@uniautonoma.edu.co", "administrador"), "administrador");
});

test("ADMIN_CORREOS y DOCENTE_CORREOS permiten cambiar la lista", (t) => {
    const adminPrevio = process.env.ADMIN_CORREOS;
    const docentePrevio = process.env.DOCENTE_CORREOS;

    process.env.ADMIN_CORREOS = "jefe@uniautonoma.edu.co";
    process.env.DOCENTE_CORREOS = "profe@uniautonoma.edu.co, apoyo@uniautonoma.edu.co";

    t.after(() => {
        if (adminPrevio === undefined) delete process.env.ADMIN_CORREOS;
        else process.env.ADMIN_CORREOS = adminPrevio;

        if (docentePrevio === undefined) delete process.env.DOCENTE_CORREOS;
        else process.env.DOCENTE_CORREOS = docentePrevio;
    });

    assert.equal(rolParaCorreo("jefe@uniautonoma.edu.co"), "administrador");
    assert.equal(rolParaCorreo("profe@uniautonoma.edu.co"), "docente");
    assert.equal(rolParaCorreo("apoyo@uniautonoma.edu.co"), "docente");
    assert.equal(rolParaCorreo("estiven.realpe.h@uniautonoma.edu.co"), "estudiante");
});

test("volver solo admite rutas internas", () => {
    assert.equal(rutaSegura("/calculo1/limites/1.1"), "/calculo1/limites/1.1");
    assert.equal(rutaSegura("https://ejemplo.com"), "");
    assert.equal(rutaSegura("//ejemplo.com"), "");
    assert.equal(rutaSegura(""), "");
    assert.equal(rutaSegura(null), "");
});

test("URL_APP pierde la barra final", (t) => {
    const previo = process.env.URL_APP;
    process.env.URL_APP = "https://app.uniautonoma.edu.co/";

    t.after(() => {
        if (previo === undefined) delete process.env.URL_APP;
        else process.env.URL_APP = previo;
    });

    assert.equal(urlAplicacion(), "https://app.uniautonoma.edu.co");
});
