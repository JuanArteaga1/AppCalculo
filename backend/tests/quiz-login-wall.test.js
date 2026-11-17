import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "crypto";
import Evaluacion from "../schemas/evaluaciones.js";
import RespuestasQuiz from "../schemas/respuestasQuiz.js";
import { arrancarBackend, buscarUsuario, conectarBase, crearUsuario, ingresar, limpiarYDesconectar } from "./apoyo.js";

// spec-quiz-login-wall: login wall al abrir un quiz sin sesión.
let backend;
let docente;
const ids = [];

async function pedir(ruta, { metodo = "GET", cuerpo, cookie } = {}) {
    const respuesta = await fetch(`${backend.base}${ruta}`, {
        method: metodo,
        headers: { ...(cuerpo ? { "Content-Type": "application/json" } : {}), ...(cookie ? { Cookie: cookie } : {}) },
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
    return { estado: respuesta.status, cuerpo: await respuesta.json().catch(() => null) };
}

async function conSesion(rol) {
    const { correo, clave } = await crearUsuario({ rol });
    ids.push((await buscarUsuario(correo))._id);
    return (await ingresar(backend.base, correo, clave)).cookie;
}

async function quizPublicado() {
    const creado = await pedir("/evaluaciones/docente", {
        metodo: "POST",
        cookie: docente,
        cuerpo: {
            titulo: "Quiz login wall",
            modulo: "limites",
            temas: ["1.1"],
            preguntas: [
                { enunciado: "¿Uno?", opciones: ["Sí", "No"], respuestaCorrecta: 0 },
            ],
        },
    });
    assert.equal(creado.estado, 201);
    const id = creado.cuerpo.evaluacion.id;
    const manana = new Date(Date.now() + 24 * 3600_000).toISOString();
    assert.equal((await pedir(`/evaluaciones/docente/${id}/publicar`, { metodo: "POST", cookie: docente, cuerpo: { fechaLimite: manana } })).estado, 200);
    return id;
}

before(async () => {
    await conectarBase();
    backend = await arrancarBackend(5192);
    docente = await conSesion("docente");
});

after(async () => {
    await RespuestasQuiz.deleteMany({ estudiante: { $in: ids } });
    await Evaluacion.deleteMany({ docente: { $in: ids } });
    backend?.detener();
    await limpiarYDesconectar();
});

test("CA-01: usuario sin sesión abre un quiz disponible y recibe SESION_REQUERIDA", async () => {
    const id = await quizPublicado();
    const respuesta = await pedir(`/evaluaciones/estudiante/${id}`);
    assert.equal(respuesta.estado, 401);
    assert.equal(respuesta.cuerpo.error, "SESION_REQUERIDA");
});

test("CA-04: estudiante activo con sesión ve el quiz y puede responder", async () => {
    const id = await quizPublicado();
    const estudiante = await conSesion("estudiante");

    const abierto = await pedir(`/evaluaciones/estudiante/${id}`, { cookie: estudiante });
    assert.equal(abierto.estado, 200);
    assert.ok(abierto.cuerpo.evaluacion);
    assert.equal(abierto.cuerpo.evaluacion.id, id);
});

test("CA-05: registro de estudiante desde el login wall crea cuenta pendiente sin iniciar sesión", async () => {
    const correo = `test.login.${randomBytes(5).toString("hex")}@uniautonoma.edu.co`;

    const respuesta = await pedir("/usuarios/registro", {
        metodo: "POST",
        cuerpo: {
            nombre: "Estudiante Login Wall",
            correo,
            carrera: "Ingeniería de Sistemas Informáticos",
            contrasena: "claveSegura123",
            aceptarPolitica: true,
        },
    });

    assert.equal(respuesta.estado, 202);
    assert.ok(respuesta.cuerpo.mensaje);

    const usuario = await buscarUsuario(correo);
    assert.ok(usuario);
    assert.equal(usuario.estado, "pendiente");
    ids.push(usuario._id);
});

test("CA-07: quiz inexistente devuelve 404 sin pedir login", async () => {
    const respuesta = await pedir("/evaluaciones/estudiante/000000000000000000000000");
    assert.equal(respuesta.estado, 404);
    assert.equal(respuesta.cuerpo.error, "EVALUACION_NO_ENCONTRADA");
});

test("CA-08: quiz deshabilitado devuelve error de disponibilidad sin pedir login", async () => {
    const id = await quizPublicado();
    await Evaluacion.updateOne({ _id: id }, { $set: { habilitado: false } });

    const respuesta = await pedir(`/evaluaciones/estudiante/${id}`);
    assert.equal(respuesta.estado, 403);
    assert.equal(respuesta.cuerpo.error, "QUIZ_NO_DISPONIBLE");
});

test("CA-09: docente o administrador logueado recibe SIN_PERMISO al abrir un quiz", async () => {
    const id = await quizPublicado();
    const admin = await conSesion("administrador");

    const respuestaDocente = await pedir(`/evaluaciones/estudiante/${id}`, { cookie: docente });
    assert.equal(respuestaDocente.estado, 403);
    assert.equal(respuestaDocente.cuerpo.error, "SIN_PERMISO");

    const respuestaAdmin = await pedir(`/evaluaciones/estudiante/${id}`, { cookie: admin });
    assert.equal(respuestaAdmin.estado, 403);
    assert.equal(respuestaAdmin.cuerpo.error, "SIN_PERMISO");
});
