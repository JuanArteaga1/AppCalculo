import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "crypto";
import mongoose from "mongoose";
import Modulo from "../schemas/modulos.js";
import Tema from "../schemas/temas.js";
import VersionTema from "../schemas/versionesTema.js";
import { arrancarBackend, conectarBase, crearUsuario, ingresar, limpiarYDesconectar } from "./apoyo.js";

/**
 * Tarea 1: crear temas, visibilidad y papelera recuperable.
 * Un tema privado o en papelera debe responder 404 a estudiantes y docentes.
 */
const PUERTO = 5197;
const CLAVE_MODULO = `test.admin.${randomBytes(4).toString("hex")}`;
const NUMERO_CONCEPTOS = `test-cp-${randomBytes(3).toString("hex")}`;

let backend;
let admin;
let docente;
let estudiante;
let moduloConceptosCreado = false;

async function pedir(ruta, { metodo = "GET", cookie, cuerpo } = {}) {
    const respuesta = await fetch(`${backend.base}${ruta}`, {
        method: metodo,
        headers: {
            ...(cookie ? { Cookie: cookie } : {}),
            ...(cuerpo === undefined ? {} : { "Content-Type": "application/json" }),
        },
        ...(cuerpo === undefined ? {} : { body: JSON.stringify(cuerpo) }),
    });

    const cuerpoRespuesta = await respuesta.json().catch(() => null);
    return { estado: respuesta.status, cuerpo: cuerpoRespuesta };
}

before(async () => {
    await conectarBase();

    const [cuentaAdmin, cuentaDocente, cuentaEstudiante] = await Promise.all([
        crearUsuario({ rol: "administrador" }),
        crearUsuario({ rol: "docente" }),
        crearUsuario({ rol: "estudiante" }),
    ]);

    await Modulo.create({
        clave: CLAVE_MODULO,
        titulo: "Módulo de prueba",
        descripcion: "",
        orden: 999,
    });

    const existente = await Modulo.findOne({ clave: "conceptos-previos" });

    if (!existente) {
        await Modulo.create({
            clave: "conceptos-previos",
            titulo: "Conceptos previos",
            descripcion: "",
            orden: 999,
        });
        moduloConceptosCreado = true;
    }

    backend = await arrancarBackend(PUERTO);

    const [ingresoAdmin, ingresoDocente, ingresoEstudiante] = await Promise.all([
        ingresar(backend.base, cuentaAdmin.correo, cuentaAdmin.clave),
        ingresar(backend.base, cuentaDocente.correo, cuentaDocente.clave),
        ingresar(backend.base, cuentaEstudiante.correo, cuentaEstudiante.clave),
    ]);

    admin = ingresoAdmin.cookie;
    docente = ingresoDocente.cookie;
    estudiante = ingresoEstudiante.cookie;

    assert.ok(admin && docente && estudiante, "Las tres cuentas deben poder ingresar.");
});

after(async () => {
    if (backend) backend.detener();

    // Solo se borran los temas creados por este archivo, nunca los reales.
    const filtroPrueba = {
        $or: [
            { modulo: CLAVE_MODULO },
            { modulo: "conceptos-previos", numero: NUMERO_CONCEPTOS },
        ],
    };
    const temas = await Tema.find(filtroPrueba).select("_id").lean();
    await VersionTema.deleteMany({ tema: { $in: temas.map((tema) => tema._id) } });
    await Tema.deleteMany({ _id: { $in: temas.map((tema) => tema._id) } });
    await Modulo.deleteOne({ clave: CLAVE_MODULO });

    if (moduloConceptosCreado) {
        await Modulo.deleteOne({ clave: "conceptos-previos" });
    }

    await limpiarYDesconectar();
});

test("crear: el administrador crea un tema y nace público", async () => {
    const creado = await pedir("/admin/temas", {
        metodo: "POST",
        cookie: admin,
        cuerpo: {
            modulo: CLAVE_MODULO,
            numero: "t1",
            titulo: "Tema de prueba",
            descripcion: "Creado desde el panel",
            visibilidad: "publico",
        },
    });

    assert.equal(creado.estado, 201);
    assert.equal(creado.cuerpo.visibilidad, "publico");
    assert.equal(creado.cuerpo.eliminado, false);

    const publico = await pedir(`/temas/${CLAVE_MODULO}/t1`);
    assert.equal(publico.estado, 200);
    assert.equal(publico.cuerpo.titulo, "Tema de prueba");
});

test("crear: un docente no puede crear temas", async () => {
    const respuesta = await pedir("/admin/temas", {
        metodo: "POST",
        cookie: docente,
        cuerpo: { modulo: CLAVE_MODULO, numero: "t2", titulo: "No permitido" },
    });

    assert.equal(respuesta.estado, 403);
});

test("visibilidad: privado responde 404 a docente y estudiante, y 200 al administrador", async () => {
    const cambio = await pedir(`/admin/temas/${CLAVE_MODULO}/t1/visibilidad`, {
        metodo: "PUT",
        cookie: admin,
        cuerpo: { visibilidad: "privado" },
    });
    assert.equal(cambio.estado, 200);
    assert.equal(cambio.cuerpo.visibilidad, "privado");

    for (const cookie of [undefined, estudiante, docente]) {
        const respuesta = await pedir(`/temas/${CLAVE_MODULO}/t1`, { cookie });
        assert.equal(respuesta.estado, 404);
        assert.equal(respuesta.cuerpo.error, "TEMA_NO_ENCONTRADO");
    }

    const comoAdmin = await pedir(`/temas/${CLAVE_MODULO}/t1`, { cookie: admin });
    assert.equal(comoAdmin.estado, 200);

    const indiceEstudiante = await pedir("/temas", { cookie: estudiante });
    const moduloEstudiante = indiceEstudiante.cuerpo.modulos.find((modulo) => modulo.id === CLAVE_MODULO);
    assert.ok(moduloEstudiante);
    assert.equal(moduloEstudiante.temas.length, 0, "El tema privado no debe listarse.");

    const indiceAdmin = await pedir("/temas", { cookie: admin });
    const moduloAdmin = indiceAdmin.cuerpo.modulos.find((modulo) => modulo.id === CLAVE_MODULO);
    assert.ok(moduloAdmin, "El administrador sí debe ver el módulo.");
    assert.equal(moduloAdmin.temas.length, 1);
});

test("papelera: mover, restaurar y eliminar definitivamente", async () => {
    await pedir(`/admin/temas/${CLAVE_MODULO}/t1/visibilidad`, {
        metodo: "PUT",
        cookie: admin,
        cuerpo: { visibilidad: "publico" },
    });

    const eliminado = await pedir(`/admin/temas/${CLAVE_MODULO}/t1`, {
        metodo: "DELETE",
        cookie: admin,
    });
    assert.equal(eliminado.estado, 200);

    const publico = await pedir(`/temas/${CLAVE_MODULO}/t1`, { cookie: estudiante });
    assert.equal(publico.estado, 404, "Un tema en papelera no debe existir para el estudiante.");

    const papelera = await pedir("/admin/temas/papelera", { cookie: admin });
    assert.equal(papelera.estado, 200);
    assert.ok(papelera.cuerpo.temas.some((tema) => tema.modulo === CLAVE_MODULO && tema.numero === "t1"));

    const restaurado = await pedir(`/admin/temas/${CLAVE_MODULO}/t1/restaurar`, {
        metodo: "POST",
        cookie: admin,
    });
    assert.equal(restaurado.estado, 200);
    assert.equal(restaurado.cuerpo.eliminado, false);

    const visibleOtraVez = await pedir(`/temas/${CLAVE_MODULO}/t1`, { cookie: estudiante });
    assert.equal(visibleOtraVez.estado, 200);

    await pedir(`/admin/temas/${CLAVE_MODULO}/t1`, { metodo: "DELETE", cookie: admin });

    const sinConfirmar = await pedir(`/admin/temas/${CLAVE_MODULO}/t1/definitivo`, {
        metodo: "DELETE",
        cookie: admin,
    });
    assert.equal(sinConfirmar.estado, 400);
    assert.equal(sinConfirmar.cuerpo.error, "CONFIRMACION_REQUERIDA");

    const definitivo = await pedir(`/admin/temas/${CLAVE_MODULO}/t1/definitivo`, {
        metodo: "DELETE",
        cookie: admin,
        cuerpo: { confirmar: true },
    });
    assert.equal(definitivo.estado, 200);

    const yaNoExiste = await pedir(`/admin/temas/${CLAVE_MODULO}/t1`, { cookie: admin });
    assert.equal(yaNoExiste.estado, 404);
});

test("conceptos previos: no aparece en el curso de Cálculo I", async () => {
    const creado = await pedir("/admin/temas", {
        metodo: "POST",
        cookie: admin,
        cuerpo: {
            modulo: "conceptos-previos",
            numero: NUMERO_CONCEPTOS,
            titulo: "Conceptos de prueba",
        },
    });
    assert.equal(creado.estado, 201);

    const curso = await pedir("/temas", { cookie: estudiante });
    assert.equal(curso.estado, 200);
    assert.equal(
        curso.cuerpo.modulos.some((modulo) => modulo.id === "conceptos-previos"),
        false,
        "El módulo especial no debe listarse en el curso.",
    );

    const panel = await pedir("/admin/temas", { cookie: admin });
    assert.ok(
        panel.cuerpo.modulos.some((modulo) => modulo.id === "conceptos-previos"),
        "El panel del administrador sí debe incluir el módulo especial.",
    );
});
